/*
  Сервер для Telegram-бота и мини-приложения оптового каталога (Cloudflare Worker + Durable Object).
  При сборке (build.js) перед этим файлом подставляется shared.js и константа APP_HTML.

  Worker отдаёт страницу приложения и пересылает всё остальное в один Durable Object "Shop".
  Shop хранит каталог, фото, заказы и список продавцов, принимает запросы приложения и обновления от Telegram.
*/

const TG_API = 'https://api.telegram.org/bot';
const MAX_NEW_PER_USER = 5;   // сколько неподтверждённых заказов может висеть у одного клиента
const MAX_ACTIVE = 300;       // защита от переполнения: столько активных заказов на весь склад
const HIST_CAP = 150;         // сколько завершённых заказов показывать в панели
const PROD_PHOTO_MAX = 300000; // фото товара: до 300 КБ (после сжатия на телефоне обычно 50-150 КБ)
const MAX_CATS = 40;          // категорий в каталоге
const MAX_ITEMS = 300;        // товаров в каталоге
const MAX_CART_LINES = 30;    // разных товаров в одном заказе
const MAX_QTY = 500;          // штук одного товара в заказе
const PROD_BODY_MAX = 400000; // размер каталога, который принимает сервер (символов)
const MAX_STOCK = 1000000;    // предел для остатка и порога
const JR_CAP = 200;           // сколько последних движений остатков хранить в журнале
const MAX_CLIENTS = 3000;     // клиентов в базе
const MAX_ADDRS = 5;
const MAX_FAV = 100;          // товаров в избранном у одного клиента          // адресов доставки у одного клиента
const TEXT_MAX = 4000;        // сообщение Telegram до 4096 знаков, берём с запасом
const INIT_MAX_AGE = 2 * 24 * 3600; // initData старше двух суток не принимаем
const NEXT = { new: ['accepted', 'cancelled'], accepted: ['ready', 'cancelled'], ready: ['done', 'cancelled'] };

/* ---------- утилиты ---------- */
const enc = new TextEncoder();
const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(data));
}
const sha256hex = async s => toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
function safeEq(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
/* Проверяет, что байты похожи на настоящий JPEG разумного размера (читает только заголовки). */
function checkJpeg(u, lim) {
  const minW = lim.minW, minH = lim.minH, maxSide = lim.maxSide;
  const n = u.length;
  if (n < 1000 || u[0] !== 0xFF || u[1] !== 0xD8 || u[2] !== 0xFF || u[n - 2] !== 0xFF || u[n - 1] !== 0xD9) return false;
  let i = 2, w = 0, h = 0;
  while (i + 4 < n) {
    if (u[i] !== 0xFF) return false;
    const m = u[i + 1];
    if (m === 0xFF) { i++; continue; }
    if (m === 0x01 || (m >= 0xD0 && m <= 0xD8)) { i += 2; continue; }
    const len = (u[i + 2] << 8) | u[i + 3];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      if (i + 9 > n) return false;
      h = (u[i + 5] << 8) | u[i + 6];
      w = (u[i + 7] << 8) | u[i + 8];
      break;
    }
    if (m === 0xDA || len < 2) return false;
    i += 2 + len;
  }
  return !(w < minW || h < minH || w > maxSide || h > maxSide);
}
const PROD_PHOTO_LIM = { minW: 64, minH: 64, maxSide: 2000 };

const json = (obj, status) => new Response(JSON.stringify(obj), {
  status: status || 200,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const html = (body, status) => new Response(body, {
  status: status || 200,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randId(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map(x => ID_CHARS[x % ID_CHARS.length]).join('');
}
const cleanStr = (v, n, keepNl) => typeof v === 'string'
  ? v.replace(keepNl ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n)
  : '';
const clampN = (v, lo, hi, def) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; };

/* Проверка подписи данных Mini App (initData) по алгоритму Telegram. */
async function verifyInitData(initData, token) {
  if (!initData || typeof initData !== 'string' || initData.length > 4096) return { err: 'auth' };
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  if (!hash) return { err: 'auth' };
  p.delete('hash');
  const entries = [...p.entries()].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const dcs = entries.map(e => e[0] + '=' + e[1]).join('\n');
  const secret = await hmac('WebAppData', token);
  const calc = toHex(await hmac(secret, dcs));
  if (!safeEq(calc, hash.toLowerCase())) return { err: 'auth' };
  const age = Math.floor(Date.now() / 1000) - Number(p.get('auth_date') || 0);
  if (!(age >= -300 && age <= INIT_MAX_AGE)) return { err: 'expired' };
  let user = null;
  try { user = JSON.parse(p.get('user') || 'null'); } catch (e) { /* ignore */ }
  if (!user || !Number.isSafeInteger(user.id)) return { err: 'auth' };
  return { user };
}

/* ---------- настройки склада, которые присылает продавец ---------- */
function sanitizeCfg(d) {
  const out = mergeCfg(d && typeof d === 'object' ? d : null);
  const s = out.shop;
  s.name = cleanStr(s.name, 60) || DEFAULT.shop.name;
  s.phone = cleanStr(s.phone, 30);
  s.telegram = cleanStr(s.telegram, 40).replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '');
  s.address = cleanStr(s.address, 120);
  s.addressUz = cleanStr(s.addressUz, 120);
  s.delivery = s.delivery !== false;
  s.leadHours = Math.round(clampN(s.leadHours, 0, 240, 2));
  s.deliveryLeadHours = Math.round(clampN(s.deliveryLeadHours, 0, 240, 24));
  s.openFrom = Math.round(clampN(s.openFrom, 0, 22, 9));
  s.openTo = Math.round(clampN(s.openTo, 1, 23, 20));
  if (s.openTo <= s.openFrom) s.openTo = Math.min(23, s.openFrom + 1);
  s.minOrder = Math.round(clampN(s.minOrder, 0, 1e9, 0));
  s.deliveryFee = Math.round(clampN(s.deliveryFee, 0, 1e9, 0));
  s.freeDeliveryFrom = Math.round(clampN(s.freeDeliveryFrom, 0, 1e9, 0));
  return out;
}

/* ---------- каталог ---------- */
const validId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(id);
const emptyProd = () => ({ cats: [], items: [] });
function normProd(d) {
  const out = emptyProd();
  if (d && typeof d === 'object') {
    out.cats = (Array.isArray(d.cats) ? d.cats : []).filter(x => x && typeof x === 'object');
    out.items = (Array.isArray(d.items) ? d.items : []).filter(x => x && typeof x === 'object');
  }
  return out;
}
/* Чистит то, что прислал продавец. Версию фото (pv) клиент не задаёт: берём из сохранённых данных. */
function sanitizeProd(d, old) {
  const oldItems = new Map(normProd(old).items.map(i => [i.id, i]));
  const src = normProd(d);
  const cats = [], seenC = new Set();
  src.cats.slice(0, MAX_CATS).forEach(c => {
    let id = validId(c.id) ? c.id : 'c' + randId(5);
    while (seenC.has(id)) id = 'c' + randId(5);
    seenC.add(id);
    cats.push({ id, name: cleanStr(c.name, 40) || 'Без названия', uz: cleanStr(c.uz, 40) });
  });
  const items = [], seen = new Set();
  src.items.slice(0, MAX_ITEMS).forEach(o => {
    let id = validId(o.id) ? o.id : 'p' + randId(6);
    while (seen.has(id)) id = 'p' + randId(6);
    seen.add(id);
    const prev = oldItems.get(id);
    items.push({
      id,
      cat: cats.some(c => c.id === o.cat) ? o.cat : (cats[0] ? cats[0].id : ''),
      name: cleanStr(o.name, 60) || 'Без названия',
      uz: cleanStr(o.uz, 60),
      desc: cleanStr(o.desc, 300, true),
      descUz: cleanStr(o.descUz, 300, true),
      amount: Math.round(clampN(o.amount, 0, 100000, 0) * 1000) / 1000,
      unit: UNIT_IDS.includes(o.unit) ? o.unit : 'g',
      price: Math.round(clampN(o.price, 0, 1e8, 0)),
      on: o.on !== false,
      tag: o.tag === 'sale' || o.tag === 'new' ? o.tag : '',
      old: o.tag === 'sale' ? Math.round(clampN(o.old, 0, 1e8, 0)) : 0,
      pv: prev && typeof prev.pv === 'string' ? prev.pv : ''
    });
  });
  return { cats, items };
}

/* ---------- остатки ---------- */
/* Каталог для покупателей: у товаров с учётом добавляется av (сколько можно заказать, не больше 500) и lw (товара мало). */
function publicProd(prod, stk) {
  return {
    cats: prod.cats,
    items: prod.items.map(it => {
      const v = stk ? stkPublic(stk[it.id], MAX_QTY) : undefined;
      if (!v) return it;
      return Object.assign({}, it, v.lw ? { av: v.av, lw: 1 } : { av: v.av });
    })
  };
}
/* Название для журнала и сообщений: «Рис, 25 кг». */
function ruTitle(it) {
  setLang('ru');
  const w = weightLabel(it);
  return String(it.name || '') + (w ? ', ' + w : '');
}
const intIn = (v, lo, hi) => (typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi) ? v : null;

/* ---------- проверка заказа и пересчёт цены на сервере ---------- */
/* Имя, телефон, способ получения, адрес, комментарий и время. */
function validateForm(f, cfg) {
  const name = cleanStr(f.name, 60);
  const phone = cleanStr(f.phone, 25);
  const digits = phone.replace(/\D/g, '').length;
  const comment = cleanStr(f.comment, 500, true);
  if (!name || digits < 9 || digits > 15) return { err: 'bad_request' };
  const mode = f.mode === 'delivery' ? 'delivery' : 'pickup';
  let address = '';
  if (mode === 'delivery') {
    if (cfg.shop.delivery === false) return { err: 'no_delivery' };
    address = cleanStr(f.address, 200);
    if (address.length < 5) return { err: 'bad_request' };
  }
  const date = typeof f.date === 'string' ? f.date : '', time = typeof f.time === 'string' ? f.time : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { err: 'pickup' };
  // час запаса, чтобы не спорить с клиентскими часами
  const pk = pickupInfo(cfg, new Date(shopNow().getTime() - 3600000), leadFor(cfg, mode));
  if (date > pk.max || !pk.slots(date).includes(time)) return { err: 'pickup' };
  return { name, phone, comment, mode, address, pickupAt: date + 'T' + time };
}

/* Заказ: цены и названия берём только из каталога на сервере. */
function validateOrder(b, cfg, prod, stk) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.cart) || !b.form || typeof b.form !== 'object') return { err: 'bad_request' };
  if (b.cart.length < 1 || b.cart.length > MAX_CART_LINES) return { err: 'bad_request' };
  const items = [], seen = new Set();
  let total = 0, missing = false;
  for (const c of b.cart) {
    if (!c || typeof c !== 'object') return { err: 'bad_request' };
    const qty = c.qty;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY || typeof c.id !== 'string' || seen.has(c.id)) return { err: 'bad_request' };
    seen.add(c.id);
    const it = prod.items.find(x => x.id === c.id);
    if (!it || it.on === false) { missing = true; continue; }
    items.push({ id: it.id, name: it.name, uz: it.uz || '', amount: it.amount, unit: it.unit, price: it.price, qty });
    total += it.price * qty;
  }
  if (missing) return { err: 'unavailable' };
  // остатки: заказать можно не больше, чем свободно (на складе минус уже отложенное под другие заказы)
  const short = [];
  if (stk) items.forEach(it => {
    const s = stk[it.id];
    if (s && it.qty > stkAvail(s)) short.push({ id: it.id, avail: stkAvail(s) });
  });
  if (short.length) return { err: 'stock', short };
  const fm = validateForm(b.form, cfg);
  if (fm.err) return fm;
  // минимальная сумма считается по товарам, доставка к ней не прибавляется
  const min = Number(cfg.shop.minOrder) || 0;
  if (min > 0 && total < min) return { err: 'min_order', min };
  const fee = deliveryFee(cfg, fm.mode, total);
  return { items, sub: total, fee, total: total + fee, name: fm.name, phone: fm.phone, comment: fm.comment, mode: fm.mode, address: fm.address, pickupAt: fm.pickupAt };
}

const publicOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.tg; delete x.msgs; delete x.rs; return x; };
const adminOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.msgs; delete x.rs; return x; };

/* ---------- клиентская база ---------- */
const phoneOk = p => { const d = p.replace(/\D/g, '').length; return d >= 9 && d <= 15; };
const newClient = (uid, since) => ({ uid, name: '', phone: '', org: '', addrs: [], note: '', grp: '', blocked: false, since: since || new Date().toISOString(), last: '', n: 0, ds: 0, sum: 0, tg: { username: '', name: '' }, lang: '' });
/* то, что клиент видит о себе: заметка, группа и блокировка остаются у продавца */
const clientPublic = c => c ? { name: c.name, phone: c.phone, org: c.org, addrs: c.addrs } : null;
const sameAddr = (a, b) => a.toLowerCase() === b.toLowerCase();
/* Поля клиента из запроса. Приходит только то, что меняют; admin разрешает ещё заметку, группу и блокировку. */
function cleanClient(b, admin) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { err: 'bad_request' };
  const v = {};
  for (const k of ['name', 'phone', 'org']) if (b[k] !== undefined && typeof b[k] !== 'string') return { err: 'bad_request' };
  if (b.name !== undefined) v.name = cleanStr(b.name, 60);
  if (b.phone !== undefined) { v.phone = cleanStr(b.phone, 25); if (v.phone && !phoneOk(v.phone)) return { err: 'bad_phone' }; }
  if (b.org !== undefined) v.org = cleanStr(b.org, 80);
  if (b.addrs !== undefined) {
    if (!Array.isArray(b.addrs) || b.addrs.length > 30) return { err: 'bad_request' };
    const out = [];
    for (const a of b.addrs) {
      if (typeof a !== 'string') return { err: 'bad_request' };
      const x = cleanStr(a, 200);
      if (!x) continue;
      if (x.length < 5) return { err: 'bad_addr' };
      if (!out.some(y => sameAddr(x, y))) out.push(x);
    }
    if (out.length > MAX_ADDRS) return { err: 'too_many_addrs' };
    v.addrs = out;
  }
  if (admin) {
    if (b.note !== undefined) { if (typeof b.note !== 'string') return { err: 'bad_request' }; v.note = cleanStr(b.note, 500, true); }
    if (b.grp !== undefined) { if (typeof b.grp !== 'string') return { err: 'bad_request' }; v.grp = cleanStr(b.grp, 30); }
    if (b.blocked !== undefined) v.blocked = b.blocked === true;
  }
  return { v };
}
/* Строки о клиенте для карточки продавца в Telegram: группа и заметка. */
function clientLines(cl) {
  if (!cl) return '';
  const p = [];
  if (cl.grp) p.push('👥 Группа: ' + cl.grp);
  if (cl.note) p.push('📝 Заметка: ' + cl.note);
  return p.join('\n');
}

/* ---------- тексты для Telegram ---------- */
const STATUS_ICON = { new: '🆕', accepted: '🛠', ready: '✅', done: '📦', cancelled: '❌' };

function adminCard(o, shop, origin, confirm, cl) {
  setLang('ru');
  const who = o.tg && o.tg.username ? '@' + o.tg.username : 'без username';
  const cLines = clientLines(cl);
  const tail = '\n\n' + (cLines ? cLines + '\n' : '') + 'Telegram: ' + who + (o.tg && o.tg.name ? ' (' + o.tg.name + ')' : '')
    + '\nСтатус: ' + stOf(o.status, o.mode).name;
  const head = STATUS_ICON[o.status] + ' ';
  // очень длинный заказ: показываем первые позиции, чтобы итог и кнопки не потерялись
  let text = head + orderText(o, shop) + tail;
  for (let k = (o.items || []).length - 1; text.length > TEXT_MAX && k >= 1; k--) text = head + orderText(o, shop, k) + tail;
  if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 10) + '…';
  const rows = [];
  const btn = (t, d) => ({ text: t, callback_data: d });
  const del = o.mode === 'delivery';
  if (confirm) {
    rows.push([btn('Да, отменить заказ', 's:' + o.id + ':cancelled')]);
    rows.push([btn('Назад', 'b:' + o.id)]);
  } else {
    if (o.status === 'new') rows.push([btn('✅ Принять в работу', 's:' + o.id + ':accepted')]);
    if (o.status === 'accepted') rows.push([btn(del ? '📦 Готов к отправке' : '📦 Готов к выдаче', 's:' + o.id + ':ready')]);
    if (o.status === 'ready') rows.push([btn(del ? '🚚 Доставлен клиенту' : '🤝 Выдан клиенту', 's:' + o.id + ':done')]);
    if (NEXT[o.status]) rows.push([btn('❌ Отменить', 'c:' + o.id)]);
    rows.push([{ text: 'Открыть панель продавца', web_app: { url: origin + '/' } }]);
  }
  return { text, reply_markup: { inline_keyboard: rows } };
}

function customerText(o, kind, shop) {
  setLang(o.lang === 'uz' ? 'uz' : 'ru');
  const del = o.mode === 'delivery';
  const when = fmtWhen(o.pickupAt);
  const whenL = del ? L('Доставка: ', 'Yetkazib berish: ') : L('Самовывоз: ', 'Olib ketish: ');
  const addr = L(shop.address, shop.addressUz || shop.address);
  const contact = (shop.telegram ? '@' + shop.telegram : '') + (shop.phone ? (shop.telegram ? ', ' : '') + shop.phone : '');
  const place = del ? L('\nАдрес доставки: ', '\nYetkazib berish manzili: ') + o.address
    : (addr ? L('\nАдрес: ', '\nManzil: ') + addr : '');
  const name = shop.name || DEFAULT.shop.name;
  switch (kind) {
    case 'placed': return L(
      'Заказ ' + o.id + ' отправлен продавцу. Когда он подтвердит, напишем сюда.\n' + whenL + when + place + '\nК оплате при получении: ' + money(o.total),
      'Buyurtma ' + o.id + ' sotuvchiga yuborildi. U tasdiqlagach, shu yerga yozamiz.\n' + whenL + when + place + '\nOlganda toʻlanadi: ' + money(o.total));
    case 'accepted': return L(
      '🛠 Заказ ' + o.id + ' принят в работу.\n' + whenL + when + place,
      '🛠 Buyurtma ' + o.id + ' ishga qabul qilindi.\n' + whenL + when + place);
    case 'ready': return del ? L(
      '📦 Заказ ' + o.id + ' собран и скоро будет доставлен.\nОплата при получении: ' + money(o.total) + place,
      '📦 Buyurtma ' + o.id + ' yigʻildi va tez orada yetkaziladi.\nOlganda toʻlanadi: ' + money(o.total) + place) : L(
      '📦 Заказ ' + o.id + ' готов, можно забирать.\nОплата при получении: ' + money(o.total) + place,
      '📦 Buyurtma ' + o.id + ' tayyor, olib ketishingiz mumkin.\nOlganda toʻlanadi: ' + money(o.total) + place);
    case 'done': return del ? L(
      '🤝 Заказ ' + o.id + ' доставлен. Спасибо, что выбрали ' + name + '!',
      '🤝 Buyurtma ' + o.id + ' yetkazildi. ' + name + 'ni tanlaganingiz uchun rahmat!') : L(
      '🤝 Спасибо, что выбрали ' + name + '!',
      '🤝 ' + name + 'ni tanlaganingiz uchun rahmat!');
    case 'cancelled': return L(
      '❌ Заказ ' + o.id + ' отменён продавцом.' + (contact ? '\nВопросы: ' + contact : ''),
      '❌ Buyurtma ' + o.id + ' sotuvchi tomonidan bekor qilindi.' + (contact ? '\nSavollar: ' + contact : ''));
  }
  return '';
}

function welcomeText(lang, isAdmin, shop) {
  setLang(lang);
  const name = (shop && shop.name) || DEFAULT.shop.name;
  return L(
    'Здравствуйте! Это ' + name + ' 🛒\nОткройте каталог, выберите товары и оформите заказ: самовывоз или доставка. Оплата только при получении.',
    'Assalomu alaykum! Bu ' + name + ' 🛒\nKatalogni oching, mahsulotlarni tanlang va buyurtma bering: olib ketish yoki yetkazib berish. Toʻlov faqat olganda.')
    + (isAdmin ? '\n\nВы подключены как продавец: новые заказы приходят сюда, их можно принимать кнопками.' : '');
}
const openBtn = (origin, text) => ({ inline_keyboard: [[{ text, web_app: { url: origin + '/' } }]] });

/* ---------- выгрузки: Excel, сборочный лист, резервная копия ---------- */
const PICK_MAX = 100;                  // заказов в одном сборочном листе
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const BACKUP_PHOTO_BUDGET = 20000000;  // сколько байт фото кладём в резервную копию (Telegram принимает файл до 50 МБ)

/* ZIP без сжатия: хватает для xlsx и резервной копии, а кода почти нет. files: [{name, data: Uint8Array}] */
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(u) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u.length; i++) c = CRC_T[(c ^ u[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function zipStore(files) {
  const now = new Date();
  const dosT = (now.getUTCHours() << 11) | (now.getUTCMinutes() << 5) | (now.getUTCSeconds() >> 1);
  const dosD = ((Math.max(1980, now.getUTCFullYear()) - 1980) << 9) | ((now.getUTCMonth() + 1) << 5) | now.getUTCDate();
  const ents = files.map(f => ({ nm: enc.encode(f.name), d: f.data, crc: crc32(f.data) }));
  let size = 22;
  ents.forEach(e => { size += 30 + e.nm.length + e.d.length + 46 + e.nm.length; });
  const out = new Uint8Array(size), dv = new DataView(out.buffer);
  let p = 0;
  const offs = [];
  ents.forEach(e => {
    offs.push(p);
    dv.setUint32(p, 0x04034b50, true); dv.setUint16(p + 4, 20, true); dv.setUint16(p + 6, 0x0800, true); dv.setUint16(p + 8, 0, true);
    dv.setUint16(p + 10, dosT, true); dv.setUint16(p + 12, dosD, true); dv.setUint32(p + 14, e.crc, true);
    dv.setUint32(p + 18, e.d.length, true); dv.setUint32(p + 22, e.d.length, true); dv.setUint16(p + 26, e.nm.length, true); dv.setUint16(p + 28, 0, true);
    out.set(e.nm, p + 30); out.set(e.d, p + 30 + e.nm.length);
    p += 30 + e.nm.length + e.d.length;
  });
  const cd = p;
  ents.forEach((e, i) => {
    dv.setUint32(p, 0x02014b50, true); dv.setUint16(p + 4, 20, true); dv.setUint16(p + 6, 20, true); dv.setUint16(p + 8, 0x0800, true); dv.setUint16(p + 10, 0, true);
    dv.setUint16(p + 12, dosT, true); dv.setUint16(p + 14, dosD, true); dv.setUint32(p + 16, e.crc, true);
    dv.setUint32(p + 20, e.d.length, true); dv.setUint32(p + 24, e.d.length, true); dv.setUint16(p + 28, e.nm.length, true);
    dv.setUint16(p + 30, 0, true); dv.setUint16(p + 32, 0, true); dv.setUint16(p + 34, 0, true); dv.setUint16(p + 36, 0, true); dv.setUint32(p + 38, 0, true);
    dv.setUint32(p + 42, offs[i], true);
    out.set(e.nm, p + 46);
    p += 46 + e.nm.length;
  });
  dv.setUint32(p, 0x06054b50, true); dv.setUint16(p + 4, 0, true); dv.setUint16(p + 6, 0, true);
  dv.setUint16(p + 8, ents.length, true); dv.setUint16(p + 10, ents.length, true);
  dv.setUint32(p + 12, p - cd, true); dv.setUint32(p + 16, cd, true); dv.setUint16(p + 20, 0, true);
  return out;
}

/* Книга Excel (.xlsx). sheets: [{name, w: [ширины столбцов], money: [номера столбцов с суммами], rows: [[заголовки], [ячейки]…]}].
   Текст пишется как есть (inlineStr), поэтому ячейка вида «=1+1» остаётся текстом и формулой не становится. */
const xmlEsc = s => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const colName = i => { let s = ''; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s; return s; };
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
function sheetXml(sh) {
  let x = XML_HEAD + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>'
    + sh.w.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols><sheetData>';
  sh.rows.forEach((r, ri) => {
    x += '<row r="' + (ri + 1) + '">';
    r.forEach((v, ci) => {
      if (v === null || v === undefined || v === '') return;
      const ref = colName(ci) + (ri + 1);
      if (ri > 0 && typeof v === 'number' && Number.isFinite(v)) x += '<c r="' + ref + '" s="' + ((sh.money || []).includes(ci) ? 2 : 0) + '"><v>' + v + '</v></c>';
      else x += '<c r="' + ref + '"' + (ri === 0 ? ' s="1"' : '') + ' t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(v) + '</t></is></c>';
    });
    x += '</row>';
  });
  x += '</sheetData>';
  if (sh.rows.length > 1 && !sh.plain) x += '<autoFilter ref="A1:' + colName(sh.w.length - 1) + sh.rows.length + '"/>';
  return x + '</worksheet>';
}
function xlsxBuild(sheets) {
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', RN = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const files = [];
  const add = (name, text) => files.push({ name, data: enc.encode(text) });
  add('[Content_Types].xml', XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    + sheets.map((s, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')
    + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
  add('_rels/.rels', XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + RN + '/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  add('xl/workbook.xml', XML_HEAD + '<workbook xmlns="' + NS + '" xmlns:r="' + RN + '"><sheets>'
    + sheets.map((s, i) => '<sheet name="' + xmlEsc(s.name.replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets></workbook>');
  add('xl/_rels/workbook.xml.rels', XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + sheets.map((s, i) => '<Relationship Id="rId' + (i + 1) + '" Type="' + RN + '/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('')
    + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="' + RN + '/styles" Target="styles.xml"/></Relationships>');
  add('xl/styles.xml', XML_HEAD + '<styleSheet xmlns="' + NS + '"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
    + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9F0EC"/><bgColor indexed="64"/></patternFill></fill></fills>'
    + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>'
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
  sheets.forEach((s, i) => add('xl/worksheets/sheet' + (i + 1) + '.xml', sheetXml(s)));
  return zipStore(files);
}

/* Время создания заказа хранится по Гринвичу; в выгрузках показываем по часам склада. */
const shopTime = iso => { const t = Date.parse(iso); return isNaN(t) ? '' : new Date(t + SHOP_TZ * 3600000).toISOString().slice(0, 16).replace('T', ' '); };
const WD_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
/* «2026-10-30T14:00» → «30.10.2026 (пт) 14:00» */
function whenRu(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  if (!m) return String(s || '');
  return m[3] + '.' + m[2] + '.' + m[1] + ' (' + WD_RU[new Date(+m[1], +m[2] - 1, +m[3]).getDay()] + ') ' + m[4];
}

function ordersSheets(orders) {
  setLang('ru');
  const list = orders.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const rows = [['№ заказа', 'Создан', 'Статус', 'Получение', 'Когда', 'Клиент', 'Телефон', 'Организация', 'Telegram', 'Адрес доставки', 'Комментарий', 'Товары, сум', 'Доставка, сум', 'Итого, сум', 'Позиций']];
  const items = [['№ заказа', 'Статус', 'Когда', 'Клиент', 'Товар', 'Вес / объём', 'Количество', 'Цена, сум', 'Сумма, сум']];
  list.forEach(o => {
    const fee = Number(o.fee) || 0, total = Number(o.total) || 0, st = stOf(o.status, o.mode).name, when = String(o.pickupAt || '').replace('T', ' ');
    rows.push([o.id, shopTime(o.createdAt), st, o.mode === 'delivery' ? 'Доставка' : 'Самовывоз', when, o.name || '', o.phone || '', o.org || '',
      o.tg && o.tg.username ? '@' + o.tg.username : '', o.mode === 'delivery' ? (o.address || '') : '', o.comment || '', total - fee, fee, total, (o.items || []).length]);
    (o.items || []).forEach(it => items.push([o.id, st, when, o.name || '', it.name || '', weightLabel(it), Number(it.qty) || 0, Number(it.price) || 0, (Number(it.price) || 0) * (Number(it.qty) || 0)]));
  });
  return [
    { name: 'Заказы', w: [11, 17, 16, 12, 17, 22, 17, 22, 16, 34, 30, 14, 14, 14, 9], money: [11, 12, 13], rows },
    { name: 'Товары в заказах', w: [11, 16, 17, 22, 32, 13, 12, 14, 14], money: [7, 8], rows: items }
  ];
}
function clientsSheets(clients) {
  const list = clients.slice().sort((a, b) => String(b.last || b.since).localeCompare(String(a.last || a.since)));
  const rows = [['Имя', 'Телефон', 'Организация', 'Группа', 'Адреса доставки', 'Заметка', 'Заказов', 'Завершено', 'Сумма завершённых, сум', 'Клиент с', 'Последний заказ', 'Telegram', 'Язык', 'Заблокирован']];
  list.forEach(c => rows.push([c.name || '', c.phone || '', c.org || '', c.grp || '', (c.addrs || []).join(' | '), c.note || '', Number(c.n) || 0, Number(c.ds) || 0, Number(c.sum) || 0,
    shopTime(c.since), shopTime(c.last), c.tg && c.tg.username ? '@' + c.tg.username : '', c.lang === 'uz' ? 'узбекский' : c.lang === 'ru' ? 'русский' : '', c.blocked ? 'да' : '']));
  return [{ name: 'Клиенты', w: [22, 17, 22, 14, 40, 34, 9, 10, 18, 17, 17, 16, 11, 13], money: [8], rows }];
}

/* Сборочный лист: сверху общий список «что достать со склада» по выбранным заказам, дальше каждый заказ на отдельной странице.
   Бумага всегда белая и по-русски: это рабочий документ продавца, его печатают или открывают на телефоне. */
function pickHtml(orders, shop, prod, cut) {
  setLang('ru');
  const list = orders.slice().sort((a, b) => String(a.pickupAt).localeCompare(String(b.pickupAt)) || String(a.createdAt).localeCompare(String(b.createdAt)));
  const now = shopNow(), stamp = pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear() + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
  const shopName = (shop && shop.name) || DEFAULT.shop.name;
  const catIx = new Map(prod.cats.map((c, i) => [c.id, i])), itIx = new Map(prod.items.map((p, i) => [p.id, i]));
  const catOf = new Map(prod.items.map(p => [p.id, p.cat]));
  const catName = new Map(prod.cats.map(c => [c.id, c.name]));
  const tr = (cells) => '<tr>' + cells.join('') + '</tr>';
  let h = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Сборочный лист — ' + esc(shopName) + '</title><style>'
    + '@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;padding:14px;font:15px/1.4 Arial,"Helvetica Neue",sans-serif;color:#111;background:#fff}'
    + 'h1{font-size:20px;margin:0 0 2px}h2{font-size:17px;margin:0 0 6px}h3{font-size:13px;margin:14px 0 2px;color:#444;text-transform:uppercase;letter-spacing:.04em}.sub{color:#555;font-size:13px;margin-bottom:14px}'
    + 'section{margin:0 0 24px}.ord{border-top:3px solid #111;padding-top:10px}.ord+.ord,.sum+.ord{break-before:page;page-break-before:always}'
    + 'table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #bbb;padding:7px 6px;text-align:left;vertical-align:top}th{font-size:12px;color:#555;font-weight:600}'
    + 'td.c,th.c{width:34px;padding-right:0}input[type=checkbox]{width:22px;height:22px;margin:0}td.q,th.q,td.p,th.p,td.s,th.s{text-align:right;white-space:nowrap}td.q{font-size:20px;font-weight:700}'
    + 'small{display:block;color:#555;font-size:12px}tr:has(input:checked) td{color:#888;text-decoration:line-through}tfoot td{border-bottom:0;font-weight:700}'
    + '.id{font-family:"Courier New",monospace;font-size:20px;font-weight:700}.tag{display:inline-block;border:1.5px solid #111;border-radius:6px;padding:0 7px;font-size:13px;font-weight:700;margin-left:6px}'
    + '.row{margin:2px 0}.cm{margin:6px 0;padding:6px 8px;border:1.5px dashed #111;border-radius:6px;font-weight:600}.pay{margin:10px 0 0;font-size:17px}.sign{margin-top:16px;color:#444;font-size:13px}'
    + '.cut{margin:0 0 14px;padding:8px 10px;border:1.5px solid #b3261e;border-radius:6px;color:#b3261e;font-weight:600}'
    + '@media print{body{padding:0}input[type=checkbox]{appearance:none;-webkit-appearance:none;border:1.5px solid #111;border-radius:3px}}'
    + '</style></head><body><h1>Сборочный лист</h1><div class="sub">' + esc(shopName) + ' · сформирован ' + stamp + ' · заказов: ' + list.length + '</div>';
  if (cut > 0) h += '<div class="cut">В лист вошли первые ' + list.length + ' заказов, ещё ' + cut + ' не поместились. Откройте лист ещё раз с фильтром по дате.</div>';
  if (list.length > 1) {
    const agg = new Map();
    list.forEach(o => (o.items || []).forEach(it => {
      let a = agg.get(it.id);
      if (!a) { a = { id: it.id, name: it.name, w: weightLabel(it), qty: 0, n: 0 }; agg.set(it.id, a); }
      a.qty += Number(it.qty) || 0; a.n += 1;
    }));
    const rows = [...agg.values()].sort((a, b) => {
      const ca = catIx.has(catOf.get(a.id)) ? catIx.get(catOf.get(a.id)) : 1e6, cb = catIx.has(catOf.get(b.id)) ? catIx.get(catOf.get(b.id)) : 1e6;
      if (ca !== cb) return ca - cb;
      const ia = itIx.has(a.id) ? itIx.get(a.id) : 1e6, ib = itIx.has(b.id) ? itIx.get(b.id) : 1e6;
      return ia !== ib ? ia - ib : String(a.name).localeCompare(String(b.name), 'ru');
    });
    h += '<section class="sum"><h2>Всего собрать со склада</h2><table><thead>' + tr(['<th class="c"></th>', '<th>Товар</th>', '<th class="q">Всего</th>', '<th class="p">В заказах</th>']) + '</thead><tbody>';
    let lastCat;
    rows.forEach(a => {
      const cid = catOf.get(a.id), cn = catName.get(cid) || 'Другое';
      if (cn !== lastCat) { h += '<tr><td colspan="4" style="padding:10px 6px 2px;border-bottom:0"><h3 style="margin:0">' + esc(cn) + '</h3></td></tr>'; lastCat = cn; }
      h += tr(['<td class="c"><input type="checkbox"></td>', '<td>' + esc(a.name) + (a.w ? '<small>' + esc(a.w) + '</small>' : '') + '</td>', '<td class="q">' + a.qty + '</td>', '<td class="p">' + a.n + '</td>']);
    });
    h += '</tbody></table></section>';
  }
  list.forEach(o => {
    const del = o.mode === 'delivery', fee = Number(o.fee) || 0;
    h += '<section class="ord"><h2><span class="id">' + esc(o.id) + '</span><span class="tag">' + (del ? 'Доставка' : 'Самовывоз') + '</span><span class="tag">' + esc(stOf(o.status, o.mode).name) + '</span></h2>'
      + '<div class="row"><b>' + (del ? 'Доставить' : 'Выдать') + ':</b> ' + esc(whenRu(o.pickupAt)) + '</div>'
      + '<div class="row"><b>' + esc(o.name || '') + '</b>' + (o.org ? ' · ' + esc(o.org) : '') + ' · ' + esc(o.phone || '') + '</div>'
      + (del && o.address ? '<div class="row"><b>Адрес:</b> ' + esc(o.address) + '</div>' : '')
      + (o.comment ? '<div class="cm">' + esc(o.comment) + '</div>' : '')
      + '<table><thead>' + tr(['<th class="c"></th>', '<th>Товар</th>', '<th class="q">Кол-во</th>', '<th class="p">Цена</th>', '<th class="s">Сумма</th>']) + '</thead><tbody>';
    (o.items || []).forEach(it => {
      const w = weightLabel(it);
      h += tr(['<td class="c"><input type="checkbox"></td>', '<td>' + esc(it.name) + (w ? '<small>' + esc(w) + '</small>' : '') + '</td>', '<td class="q">' + (Number(it.qty) || 0) + '</td>', '<td class="p">' + num(it.price) + '</td>', '<td class="s">' + num((Number(it.price) || 0) * (Number(it.qty) || 0)) + '</td>']);
    });
    h += '</tbody><tfoot>' + (fee > 0 ? tr(['<td></td>', '<td colspan="3">Доставка</td>', '<td class="s">' + num(fee) + '</td>']) : '')
      + tr(['<td></td>', '<td colspan="3">Итого</td>', '<td class="s">' + num(o.total) + '</td>']) + '</tfoot></table>'
      + '<div class="pay">К оплате при получении: <b>' + esc(money(o.total)) + '</b></div><div class="sign">Собрал: ____________ &nbsp; Проверил: ____________</div></section>';
  });
  return h + '</body></html>';
}

/* ---------- прайс из Excel ---------- */
const XL_MAX_FILE = 1000000;   // размер файла с прайсом
const XL_MAX_XML = 8000000;    // сколько байт XML разрешаем распаковать (защита от «архива-бомбы»)
const XL_MAX_ROWS = 1500;      // строк с товарами в файле
class XlErr extends Error { constructor(why) { super(why); this.why = why; } }

async function inflateRaw(u8, limit) {
  const ds = new DecompressionStream('deflate-raw');
  const w = ds.writable.getWriter();
  w.write(u8).then(() => w.close()).catch(() => {});
  const rd = ds.readable.getReader();
  const chunks = [];
  let n = 0;
  for (;;) {
    const { done, value } = await rd.read();
    if (done) break;
    n += value.length;
    if (n > limit) { rd.cancel().catch(() => {}); throw new XlErr('too_big'); }
    chunks.push(value);
  }
  const out = new Uint8Array(n);
  let p = 0;
  chunks.forEach(c => { out.set(c, p); p += c.length; });
  return out;
}
function zipIndex(u) {
  if (u.length < 22) return null;
  const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
  let e = -1;
  for (let i = u.length - 22; i >= Math.max(0, u.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) return null;
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const out = new Map();
  for (let i = 0; i < n; i++) {
    if (p + 46 > u.length || dv.getUint32(p, true) !== 0x02014b50) return null;
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    out.set(new TextDecoder().decode(u.subarray(p + 46, p + 46 + nl)), { method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), usize: dv.getUint32(p + 24, true), off: dv.getUint32(p + 42, true) });
    p += 46 + nl + xl + cl;
  }
  return out;
}
async function zipRead(u, ent, limit) {
  if (!ent || ent.usize > limit) throw new XlErr('too_big');
  const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
  if (ent.off + 30 > u.length || dv.getUint32(ent.off, true) !== 0x04034b50) throw new XlErr('not_xlsx');
  const start = ent.off + 30 + dv.getUint16(ent.off + 26, true) + dv.getUint16(ent.off + 28, true);
  const data = u.subarray(start, start + ent.csize);
  if (ent.method === 0) return data;
  if (ent.method !== 8) throw new XlErr('not_xlsx');
  return inflateRaw(data, limit);
}
function xmlUnesc(s) {
  return String(s).replace(/&(#x[0-9a-fA-F]+|#\d+|lt|gt|amp|quot|apos);/g, (m, g) => {
    if (g === 'lt') return '<'; if (g === 'gt') return '>'; if (g === 'amp') return '&'; if (g === 'quot') return '"'; if (g === 'apos') return "'";
    try { return String.fromCodePoint(g[1] === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10)); } catch (e) { return ''; }
  });
}
const xmlTexts = body => [...body.matchAll(/<t\b[^>]*?(?:\/>|>([\s\S]*?)<\/t>)/g)].map(x => xmlUnesc(x[1] || '')).join('');
const colIndex = letters => { let n = 0; for (const ch of letters) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };

/* Первый лист книги (или лист «Каталог») → массив строк, в ячейках числа и текст. */
async function xlReadSheet(u) {
  const dec = x => new TextDecoder().decode(x);
  const idx = zipIndex(u);
  if (!idx || !idx.has('xl/workbook.xml')) throw new XlErr('not_xlsx');
  const wb = dec(await zipRead(u, idx.get('xl/workbook.xml'), XL_MAX_XML));
  const sheets = [...wb.matchAll(/<sheet\b([^>]*?)\/?>/g)].map(m => ({ name: xmlUnesc((/\bname="([^"]*)"/.exec(m[1]) || [])[1] || ''), rid: (/\br:id="([^"]*)"/.exec(m[1]) || [])[1] || '' }));
  if (!sheets.length) throw new XlErr('not_xlsx');
  const pick = sheets.find(s => s.name.trim().toLowerCase() === 'каталог') || sheets[0];
  let target = 'worksheets/sheet1.xml';
  if (idx.has('xl/_rels/workbook.xml.rels')) {
    const rels = dec(await zipRead(u, idx.get('xl/_rels/workbook.xml.rels'), XL_MAX_XML));
    for (const m of rels.matchAll(/<Relationship\b([^>]*?)\/?>/g)) {
      if ((/\bId="([^"]*)"/.exec(m[1]) || [])[1] === pick.rid) { target = (/\bTarget="([^"]*)"/.exec(m[1]) || [])[1] || target; break; }
    }
  }
  const sheetPath = target.startsWith('/') ? target.slice(1) : 'xl/' + target;
  if (!idx.has(sheetPath)) throw new XlErr('not_xlsx');
  const shared = [];
  if (idx.has('xl/sharedStrings.xml')) {
    const ss = dec(await zipRead(u, idx.get('xl/sharedStrings.xml'), XL_MAX_XML));
    for (const m of ss.matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g)) shared.push(xmlTexts((m[1] || '').replace(/<rPh\b[\s\S]*?<\/rPh>/g, '')));
  }
  const xml = dec(await zipRead(u, idx.get(sheetPath), XL_MAX_XML));
  const rows = [];
  for (const m of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const ref = /\br="([A-Z]{1,3})(\d+)"/.exec(m[1]);
    if (!ref) continue;
    const ri = Number(ref[2]) - 1, ci = colIndex(ref[1]);
    if (ri < 0 || ri > XL_MAX_ROWS + 20 || ci > 40) continue;
    const t = (/\bt="([^"]*)"/.exec(m[1]) || [])[1] || 'n', body = m[2] || '';
    let v = '';
    if (t === 'inlineStr') v = xmlTexts(body);
    else {
      const vm = /<v>([\s\S]*?)<\/v>/.exec(body);
      if (vm) {
        const raw = xmlUnesc(vm[1]);
        if (t === 's') v = shared[Number(raw)] === undefined ? '' : shared[Number(raw)];
        else if (t === 'e') v = '';
        else if (t === 'b') v = raw === '1' ? 'да' : 'нет';
        else if (t === 'str') v = raw;
        else v = Number.isFinite(Number(raw)) && raw.trim() !== '' ? Number(raw) : raw;
      }
    }
    (rows[ri] || (rows[ri] = []))[ci] = v;
  }
  return Array.from(rows, r => Array.from(r || [], c => c === undefined ? '' : c));
}

/* Названия колонок прайса: сравниваем без регистра, пробелов и знаков. */
const nk = s => String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
const XL_COLS = {
  id: ['Код', 'ID', 'Артикул'],
  cat: ['Категория'],
  name: ['Название', 'Наименование', 'Товар', 'Название товара'],
  uz: ['Название (узб.)', 'Название по-узбекски', 'Nomi'],
  desc: ['Описание'],
  descUz: ['Описание (узб.)', 'Описание по-узбекски', 'Tavsif'],
  amount: ['Вес / объём', 'Вес', 'Объём', 'Фасовка'],
  unit: ['Единица', 'Ед.', 'Ед. изм.', 'Единица измерения'],
  price: ['Цена', 'Цена, сум', 'Цена за единицу', 'Цена за единицу, сум'],
  on: ['В наличии', 'Наличие'],
  tag: ['Метка'],
  old: ['Старая цена', 'Старая цена, сум']
};
const XL_KEY = (() => { const m = new Map(); Object.keys(XL_COLS).forEach(k => XL_COLS[k].forEach(a => m.set(nk(a), k))); return m; })();
const XL_UNITS = { 'г': 'g', 'гр': 'g', 'g': 'g', 'кг': 'kg', 'kg': 'kg', 'шт': 'pc', 'dona': 'pc', 'pc': 'pc', 'мл': 'ml', 'ml': 'ml', 'л': 'l', 'l': 'l' };
const XL_YES = ['да', 'yes', '1', 'true', '+', 'есть', 'ha', 'в наличии'], XL_NO = ['нет', 'no', '0', 'false', '-', 'yoq', 'yoʻq', 'нет в наличии'];
const XL_TAGS = { 'акция': 'sale', 'aksiya': 'sale', 'sale': 'sale', 'новинка': 'new', 'yangilik': 'new', 'new': 'new' };
const xlNum = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[\s  ]/g, '').replace(',', '.');
  if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
};

/* Строки листа → список товаров прайса и список ошибок {row, msg}. Пустая ячейка — «не менять», кроме меток и старой цены. */
function xlParse(rows) {
  let hi = -1, map = null;
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const m = {};
    (rows[i] || []).forEach((c, ci) => { const k = XL_KEY.get(nk(c)); if (k && m[k] === undefined) m[k] = ci; });
    if (m.name !== undefined && m.price !== undefined) { hi = i; map = m; break; }
  }
  if (!map) throw new XlErr('no_header');
  const out = [], errors = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const cell = k => { const v = map[k] === undefined ? '' : r[map[k]]; return v === undefined || v === null ? '' : v; };
    const txt = k => { const v = cell(k); return typeof v === 'number' ? String(v) : cleanStr(v === '' ? '' : String(v), 400, true); };
    if (!r.some(c => String(c).trim() !== '')) continue;
    if (out.length + errors.length >= XL_MAX_ROWS) { errors.push({ row: i + 1, msg: 'слишком много строк, остальные пропущены' }); break; }
    const row = i + 1, x = { row };
    const bad = msg => { errors.push({ row, msg }); return null; };
    const name = txt('name');
    if (!name) { bad('нет названия'); continue; }
    if (name.length > 60) { bad('название длиннее 60 знаков'); continue; }
    x.name = name;
    const pv = cell('price');
    const price = String(pv).trim() === '' ? null : xlNum(pv);
    if (price === null || price < 0 || price > 1e8) { bad('цена должна быть числом от 0 до 100 000 000'); continue; }
    x.price = Math.round(price);
    x.id = cleanStr(txt('id'), 24);
    x.cat = cleanStr(txt('cat'), 40);
    if (x.cat.length > 40) { bad('категория длиннее 40 знаков'); continue; }
    if (map.uz !== undefined) { const v = txt('uz'); if (v) { if (v.length > 60) { bad('узбекское название длиннее 60 знаков'); continue; } x.uz = v; } }
    if (map.desc !== undefined) { const v = txt('desc'); if (v) x.desc = v.slice(0, 300); }
    if (map.descUz !== undefined) { const v = txt('descUz'); if (v) x.descUz = v.slice(0, 300); }
    if (map.amount !== undefined && String(cell('amount')).trim() !== '') {
      const a = xlNum(cell('amount'));
      if (a === null || a < 0 || a > 100000) { bad('вес или объём должен быть числом'); continue; }
      x.amount = Math.round(a * 1000) / 1000;
    }
    if (map.unit !== undefined && String(cell('unit')).trim() !== '') {
      const un = XL_UNITS[String(cell('unit')).trim().toLowerCase().replace(/\.$/, '')];
      if (!un) { bad('неизвестная единица (нужны г, кг, шт, мл или л)'); continue; }
      x.unit = un;
    }
    if (map.on !== undefined && String(cell('on')).trim() !== '') {
      const v = String(cell('on')).trim().toLowerCase();
      if (XL_YES.includes(v)) x.on = true; else if (XL_NO.includes(v)) x.on = false;
      else { bad('«В наличии»: нужно «да» или «нет»'); continue; }
    }
    if (map.tag !== undefined) {
      const v = String(cell('tag')).trim().toLowerCase();
      if (!v) x.tag = ''; else if (XL_TAGS[v]) x.tag = XL_TAGS[v]; else { bad('метка: нужно «Акция» или «Новинка»'); continue; }
    }
    if (map.old !== undefined) {
      const ov = cell('old');
      if (String(ov).trim() === '') x.old = 0;
      else { const o = xlNum(ov); if (o === null || o < 0 || o > 1e8) { bad('старая цена должна быть числом'); continue; } x.old = Math.round(o); }
    }
    out.push(x);
  }
  return { rows: out, errors };
}

/* Сравнивает прайс с каталогом. Ничего не удаляет и не трогает фото и остатки. Возвращает новый каталог и список изменений. */
function xlPlan(parsed, prod) {
  const items = prod.items.map(it => Object.assign({}, it)), cats = prod.cats.map(c => Object.assign({}, c));
  const key = s => String(s || '').trim().toLowerCase().replace(/ё/g, 'е');
  const byId = new Map(items.map(i => [i.id, i]));
  const used = new Set(), changes = [], errors = parsed.errors.slice(), newCats = [];
  let same = 0, added = 0;
  const catFor = nameRaw => {
    const nmx = nameRaw || (cats[0] ? null : 'Прочее');
    if (!nmx) return cats[0].id;
    let c = cats.find(x => key(x.name) === key(nmx));
    if (!c) {
      if (cats.length >= MAX_CATS) return null;
      c = { id: 'c' + randId(5), name: nmx, uz: '' };
      while (cats.some(x => x.id === c.id)) c.id = 'c' + randId(5);
      cats.push(c); newCats.push(c.name);
    }
    return c.id;
  };
  const catName = id => (cats.find(c => c.id === id) || {}).name || '';
  for (const r of parsed.rows) {
    let it = r.id ? byId.get(r.id) : null;
    let byCode = !!it;
    if (!it) {
      let cand = items.filter(x => key(x.name) === key(r.name));
      if (cand.length > 1) {
        cand = cand.filter(x => (r.amount === undefined || Number(x.amount) === r.amount) && (r.unit === undefined || x.unit === r.unit));
        if (cand.length !== 1) { errors.push({ row: r.row, msg: 'несколько товаров с названием «' + r.name + '»: укажите код или вес' }); continue; }
      }
      it = cand[0] || null;
    }
    if (it) {
      if (used.has(it.id)) { errors.push({ row: r.row, msg: 'товар «' + it.name + '» уже был выше в файле' }); continue; }
      used.add(it.id);
      const f = [];
      const set = (k, to, show) => { if (it[k] !== to) { f.push({ k, from: show ? show(it[k]) : it[k], to: show ? show(to) : to }); it[k] = to; } };
      if (byCode && r.name !== it.name) set('name', r.name);
      set('price', r.price);
      if (r.uz !== undefined) set('uz', r.uz);
      if (r.desc !== undefined) set('desc', r.desc);
      if (r.descUz !== undefined) set('descUz', r.descUz);
      if (r.amount !== undefined) set('amount', r.amount);
      if (r.unit !== undefined) set('unit', r.unit);
      if (r.on !== undefined) set('on', r.on);
      if (r.cat) {
        const cid = catFor(r.cat);
        if (cid === null) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_CATS + ' категорий' }); continue; }
        if (it.cat !== cid) { f.push({ k: 'cat', from: catName(it.cat), to: catName(cid) }); it.cat = cid; }
      }
      if (r.tag !== undefined) {
        set('tag', r.tag);
        const o = r.tag === 'sale' ? (r.old || 0) : 0;
        if ((Number(it.old) || 0) !== o) { f.push({ k: 'old', from: Number(it.old) || 0, to: o }); it.old = o; }
      }
      if (f.length) changes.push({ kind: 'upd', id: it.id, name: it.name, fields: f }); else same++;
    } else {
      if (items.length >= MAX_ITEMS) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_ITEMS + ' товаров' }); continue; }
      const cid = catFor(r.cat);
      if (cid === null) { errors.push({ row: r.row, msg: 'в каталоге уже ' + MAX_CATS + ' категорий' }); continue; }
      let id = 'p' + randId(6);
      while (byId.has(id)) id = 'p' + randId(6);
      const n = { id, cat: cid, name: r.name, uz: r.uz || '', desc: r.desc || '', descUz: r.descUz || '', amount: r.amount || 0, unit: r.unit || 'g', price: r.price, on: r.on !== false, tag: r.tag || '', old: r.tag === 'sale' ? (r.old || 0) : 0, pv: '' };
      items.push(n); byId.set(id, n); used.add(id);
      added++;
      changes.push({ kind: 'add', id, name: n.name, fields: [{ k: 'price', from: null, to: n.price }], cat: catName(cid) });
    }
  }
  return { prod: { cats, items }, changes, errors, same, added, updated: changes.length - added, newCats };
}

/* Каталог для выгрузки в Excel (он же образец прайса). */
function catalogSheets(prod) {
  setLang('ru');
  const catName = new Map(prod.cats.map(c => [c.id, c.name]));
  const rows = [['Код', 'Категория', 'Название', 'Название (узб.)', 'Описание', 'Описание (узб.)', 'Вес / объём', 'Единица', 'Цена, сум', 'В наличии', 'Метка', 'Старая цена, сум']];
  prod.items.forEach(p => rows.push([p.id, catName.get(p.cat) || '', p.name, p.uz || '', p.desc || '', p.descUz || '', Number(p.amount) || 0, unitName(p.unit), Number(p.price) || 0, p.on === false ? 'нет' : 'да', p.tag === 'sale' ? 'Акция' : p.tag === 'new' ? 'Новинка' : '', p.tag === 'sale' && Number(p.old) > 0 ? Number(p.old) : '']));
  const help = ['Как заполнять прайс',
    'Загрузите файл в приложении: вкладка «Каталог» → «Загрузить прайс». Перед применением бот покажет, что изменится, и вы подтвердите.',
    'Товар находится по коду. Если код пустой или не найден, по названию (и по весу, если одинаковых названий несколько). Нового товара нет в каталоге: он будет добавлен.',
    'Ничего не удаляется. Товар, которого нет в файле, остаётся в каталоге как был. Фото и остатки на складе не меняются.',
    'Пустая ячейка означает «не менять». Исключения: пустая «Метка» убирает метку, пустая «Старая цена» убирает старую цену.',
    'Обязательны только колонки «Название» и «Цена». Остальные можно удалить из файла целиком, тогда они не затрагиваются.',
    'Единица: г, кг, шт, мл или л. В наличии: да или нет. Метка: Акция или Новинка. Старая цена показывается только у акции и только если она выше цены.',
    'У новых товаров категория берётся из колонки «Категория»; если такой категории нет, она создаётся.'];
  return [{ name: 'Каталог', w: [12, 18, 34, 28, 30, 30, 12, 9, 14, 11, 11, 16], money: [8, 11], rows },
    { name: 'Как заполнять', w: [150], plain: true, rows: help.map(x => [x]) }];
}

/* ---------- страница настройки ---------- */
function setupPage(inner) {
  return html('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Настройка бота</title>'
    + '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;color:#14231F}input,button{font:inherit;padding:10px 12px;border-radius:10px;border:1.5px solid #ccc}button{background:#0F766E;color:#fff;border:0;cursor:pointer}li{margin:6px 0}.ok{color:#1F7A4D}.bad{color:#B3261E}code{background:#E7EFED;padding:2px 6px;border-radius:6px}</style></head><body>'
    + '<h1>Настройка бота</h1>' + inner + '</body></html>');
}

/* ---------- Worker ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return new Response(APP_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' } });
    }
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    return env.SHOP.get(env.SHOP.idFromName('main')).fetch(request);
  }
};

/* ---------- Durable Object ---------- */
export class Shop {
  constructor(state, env) {
    this.state = state;
    this.st = state.storage;
    this.env = env;
    this.origin = '';
  }

  /* --- хранилище --- */
  async getMany(keys) {
    const out = new Map();
    for (let i = 0; i < keys.length; i += 100) {
      const part = await this.st.get(keys.slice(i, i + 100));
      part.forEach((v, k) => out.set(k, v));
    }
    return out;
  }
  async getOrders(ids) {
    const map = await this.getMany(ids.map(id => 'o:' + id));
    return ids.map(id => map.get('o:' + id)).filter(Boolean);
  }
  async getCfg() { return mergeCfg(await this.st.get('cfg')); }
  async getClient(uid) { const c = await this.st.get('c:' + uid); return c && typeof c === 'object' ? c : null; }
  async clientsIdx() { const x = await this.st.get('cx'); return Array.isArray(x) ? x : []; }
  /* Карточка заказа для продавца вместе с группой и заметкой клиента. */
  async card(o, shop, confirm) { return adminCard(o, shop, this.origin, confirm, o.uid ? await this.getClient(o.uid) : null); }
  /* Один раз собирает базу клиентов из уже оформленных заказов (активных и в истории). Дальше база живёт сама. */
  async ensureClients() {
    if (await this.st.get('cxb')) return;
    const ids = ((await this.st.get('act')) || []).concat((await this.st.get('hist')) || []);
    const orders = (await this.getOrders(ids)).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const map = new Map();
    for (const o of orders) {
      if (!o.uid) continue;
      let c = map.get(o.uid);
      if (!c) { if (map.size >= MAX_CLIENTS) continue; c = newClient(o.uid, o.createdAt); map.set(o.uid, c); }
      // идём от старых заказов к новым: контакты берём из самого свежего
      c.name = o.name || c.name; c.phone = o.phone || c.phone; c.lang = o.lang || c.lang;
      if (o.tg) c.tg = { username: o.tg.username || '', name: o.tg.name || '' };
      if (o.mode === 'delivery' && o.address) c.addrs = [o.address].concat(c.addrs.filter(a => !sameAddr(a, o.address))).slice(0, MAX_ADDRS);
      if (o.status !== 'cancelled') c.n += 1;
      if (o.status === 'done') { c.ds += 1; c.sum += Number(o.total) || 0; }
      c.last = o.createdAt;
    }
    const upd = { cxb: 1, cx: [...map.keys()] };
    map.forEach((c, uid) => { upd['c:' + uid] = c; });
    await this.st.put(upd);
  }
  async getProd() { return normProd(await this.st.get('prod')); }
  async getStk() { const s = await this.st.get('stk'); return s && typeof s === 'object' ? s : {}; }
  async pubProd() { return publicProd(await this.getProd(), await this.getStk()); }
  /* Новые строки журнала + прежние (последние JR_CAP). Возвращает массив для записи. */
  async jrWith(rows) { return rows.concat((await this.st.get('jr')) || []).slice(0, JR_CAP); }
  /* Сколько штук товара сейчас отложено под активные заказы (нужно, когда учёт товара включают заново). */
  async reservedFor(id) {
    let r = 0;
    for (const o of await this.getOrders((await this.st.get('act')) || [])) if (o.rs && o.rs[id]) r += o.rs[id];
    return r;
  }
  /* Предупреждение продавцам: товар закончился или стало меньше порога. rows: {title,before,after,low,q,r}. */
  async stockAlert(rows) {
    setLang('ru');
    const lines = [];
    for (const x of rows) {
      if (!(x.after < x.before)) continue;
      if (x.after === 0) lines.push('🚫 ' + x.title + ': свободного остатка нет (на складе ' + x.q + ', в заказах ' + x.r + ').');
      else if (x.low > 0 && x.after <= x.low && x.before > x.low) lines.push('⚠️ ' + x.title + ': осталось ' + x.after + ' (порог ' + x.low + ').');
    }
    if (!lines.length) return;
    let text = 'Остатки на складе:\n' + lines.join('\n');
    if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 1) + '…';
    for (const aid of (await this.st.get('admins')) || []) await this.tg('sendMessage', { chat_id: aid, text });
  }
  async isAdmin(uid) { return ((await this.st.get('admins')) || []).includes(uid); }

  /* --- Telegram --- */
  async tg(method, payload) {
    if (!this.env.BOT_TOKEN) return { ok: false, description: 'BOT_TOKEN не задан' };
    try {
      const r = await fetch(TG_API + this.env.BOT_TOKEN + '/' + method, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload || {}),
        signal: AbortSignal.timeout(6000)
      });
      return await r.json();
    } catch (e) {
      return { ok: false, description: String(e && e.message || e) };
    }
  }
  editCard(m, card) {
    return this.tg('editMessageText', { chat_id: m.chat_id, message_id: m.message_id, text: card.text, reply_markup: card.reply_markup });
  }
  async webhookSecret() { return sha256hex('shop-webhook:' + this.env.BOT_TOKEN); }

  /* Отправляет файл в чат (sendDocument). Telegram принимает его только как multipart-форму. */
  async tgDoc(chatId, name, bytes, mime, caption) {
    if (!this.env.BOT_TOKEN) return { ok: false, description: 'BOT_TOKEN не задан' };
    try {
      const fd = new FormData();
      fd.append('chat_id', String(chatId));
      if (caption) fd.append('caption', caption.slice(0, 1000));
      fd.append('document', new Blob([bytes], { type: mime }), name);
      const r = await fetch(TG_API + this.env.BOT_TOKEN + '/sendDocument', { method: 'POST', body: fd, signal: AbortSignal.timeout(30000) });
      return await r.json();
    } catch (e) {
      return { ok: false, description: String(e && e.message || e) };
    }
  }

  /* --- выгрузки --- */
  /* Заказы для сборочного листа: названные по номерам или все «новые» и «в работе» (можно только на один день). */
  async pickOrders(b) {
    let orders;
    if (Array.isArray(b.ids)) {
      const ids = [...new Set(b.ids.filter(x => typeof x === 'string' && /^[A-Za-z0-9-]{1,12}$/.test(x)))].slice(0, PICK_MAX);
      orders = await this.getOrders(ids);
    } else {
      orders = (await this.getOrders((await this.st.get('act')) || [])).filter(o => o.status === 'new' || o.status === 'accepted');
      const day = typeof b.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.day) ? b.day : '';
      if (day) orders = orders.filter(o => String(o.pickupAt).slice(0, 10) === day);
    }
    orders.sort((a, c) => String(a.pickupAt).localeCompare(String(c.pickupAt)) || String(a.createdAt).localeCompare(String(c.createdAt)));
    return { orders: orders.slice(0, PICK_MAX), cut: Math.max(0, orders.length - PICK_MAX) };
  }
  async allOrders() {
    return this.getOrders(((await this.st.get('act')) || []).concat((await this.st.get('hist')) || []));
  }
  /* Резервная копия: архив с backup.json (всё, что хранит бот), фото товаров и коротким описанием. Токен и код продавца в хранилище не лежат. */
  async backupFiles() {
    await this.ensureClients();
    const prod = await this.getProd(), orders = await this.allOrders();
    const idx = await this.clientsIdx(), cmap = await this.getMany(idx.map(x => 'c:' + x));
    const withPhoto = prod.items.filter(it => it.pv);
    const photos = [];
    let used = 0;
    for (let i = 0; i < withPhoto.length; i += 20) {
      const part = withPhoto.slice(i, i + 20);
      const m = await this.getMany(part.map(it => 'p:' + it.id));
      for (const it of part) {
        const b = m.get('p:' + it.id);
        if (!b || !b.length) continue;
        const u = b instanceof Uint8Array ? b : new Uint8Array(b);
        if (used + u.length > BACKUP_PHOTO_BUDGET) continue;
        used += u.length;
        photos.push({ name: 'photos/' + it.id + '.jpg', data: u });
      }
    }
    const at = new Date().toISOString();
    const data = {
      kind: 'distro-backup', v: 1, at,
      cfg: await this.getCfg(), prod, stk: await this.getStk(), jr: (await this.st.get('jr')) || [],
      stats: (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 },
      admins: (await this.st.get('admins')) || [],
      act: (await this.st.get('act')) || [], hist: (await this.st.get('hist')) || [],
      orders: orders.map(o => { const x = Object.assign({}, o); delete x.msgs; return x; }),
      clients: idx.map(x => cmap.get('c:' + x)).filter(Boolean),
      photos: { saved: photos.length, of: withPhoto.length }
    };
    const readme = 'Резервная копия магазина «' + ((data.cfg.shop && data.cfg.shop.name) || '') + '»\r\nСоздана: ' + shopTime(at) + ' (время склада)\r\n\r\n'
      + 'backup.json — настройки, каталог, остатки, заказы, клиенты.\r\nphotos/ — фото товаров (' + photos.length + ' из ' + withPhoto.length + ').\r\n\r\n'
      + 'Файл не содержит токена бота и кода продавца. Храните его в надёжном месте: в нём телефоны и адреса клиентов.\r\n'
      + 'Чтобы вернуть данные, передайте этот файл разработчику бота.\r\n';
    return {
      files: [{ name: 'backup.json', data: enc.encode(JSON.stringify(data)) }, { name: 'README.txt', data: enc.encode(readme) }].concat(photos),
      info: { orders: orders.length, clients: data.clients.length, photos: photos.length, photosOf: withPhoto.length }
    };
  }
  /* Собирает файл выгрузки. kind: orders | clients | backup | pick. Возвращает {name, bytes, mime, caption, n} или {err}. */
  async makeExport(kind, b) {
    setLang('ru');
    const day = ymd(shopNow());
    if (kind === 'orders') {
      const orders = await this.allOrders();
      return { name: 'orders-' + day + '.xlsx', bytes: xlsxBuild(ordersSheets(orders)), mime: XLSX_MIME, n: orders.length,
        caption: 'Заказы: ' + orders.length + ' (активные и последние завершённые). Откройте в Excel.' };
    }
    if (kind === 'clients') {
      await this.ensureClients();
      const idx = await this.clientsIdx(), map = await this.getMany(idx.map(x => 'c:' + x));
      const list = idx.map(x => map.get('c:' + x)).filter(Boolean);
      return { name: 'clients-' + day + '.xlsx', bytes: xlsxBuild(clientsSheets(list)), mime: XLSX_MIME, n: list.length, caption: 'Клиенты: ' + list.length + '. Откройте в Excel.' };
    }
    if (kind === 'backup') {
      const bk = await this.backupFiles();
      return { name: 'backup-' + day + '.zip', bytes: zipStore(bk.files), mime: 'application/zip', n: bk.info.orders,
        caption: 'Резервная копия: заказов ' + bk.info.orders + ', клиентов ' + bk.info.clients + ', фото ' + bk.info.photos + (bk.info.photos < bk.info.photosOf ? ' из ' + bk.info.photosOf : '') + '. Сохраните файл в надёжном месте.' };
    }
    if (kind === 'catalog') {
      const prod = await this.getProd();
      return { name: 'catalog-' + day + '.xlsx', bytes: xlsxBuild(catalogSheets(prod)), mime: XLSX_MIME, n: prod.items.length,
        caption: 'Каталог: товаров ' + prod.items.length + '. Измените цены, сохраните файл и загрузите его в приложении: Каталог → Загрузить прайс.' };
    }
    if (kind === 'pick') {
      const p = await this.pickOrders(b || {});
      if (!p.orders.length) return { err: 'empty' };
      return { name: 'sborka-' + day + '.html', bytes: enc.encode(pickHtml(p.orders, (await this.getCfg()).shop, await this.getProd(), p.cut)), mime: 'text/html', n: p.orders.length,
        caption: 'Сборочный лист: заказов ' + p.orders.length + '. Откройте файл в браузере и нажмите Ctrl+P, чтобы распечатать.' };
    }
    return { err: 'bad_request' };
  }

  /* --- защита кода продавца от перебора --- */
  async checkCode(code) {
    if (!this.env.ADMIN_CODE) return 'nocode';
    const f = (await this.st.get('fail')) || { n: 0, until: 0 };
    if (f.until > Date.now()) return 'locked';
    const a = await sha256hex('code:' + String(code || ''));
    const b = await sha256hex('code:' + this.env.ADMIN_CODE);
    if (safeEq(a, b)) {
      if (f.n) await this.st.put('fail', { n: 0, until: 0 });
      return 'ok';
    }
    f.n += 1;
    if (f.n >= 8) { f.n = 0; f.until = Date.now() + 3600 * 1000; }
    await this.st.put('fail', f);
    return 'bad';
  }

  /* --- маршрутизация --- */
  async fetch(request) {
    const url = new URL(request.url);
    this.origin = url.origin;
    const path = url.pathname, method = request.method;
    try {
      if (path === '/webhook' && method === 'POST') return await this.webhook(request);
      if (path === '/setup') return await this.setup(request);
      if ((method === 'GET' || method === 'HEAD') && path.startsWith('/img/')) return await this.image(path.slice(5));
      if (path === '/api/config' && method === 'GET') return json({ cfg: await this.getCfg(), prod: await this.pubProd() });
      if (path.startsWith('/api/')) return await this.api(request, path, method);
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      console.error('shop error', path, e && e.stack || e);
      return json({ error: 'server' }, 500);
    }
  }

  async readBody(request, limit) {
    const text = await request.text();
    if (text.length > limit) return { err: 413 };
    try { return { body: JSON.parse(text || 'null') }; } catch (e) { return { err: 400 }; }
  }

  async api(request, path, method) {
    if (!this.env.BOT_TOKEN) return json({ error: 'no_token' }, 500);
    const au = await verifyInitData(request.headers.get('x-init-data') || '', this.env.BOT_TOKEN);
    if (au.err) return json({ error: au.err }, 401);
    const u = au.user, uid = u.id;
    const admin = await this.isAdmin(uid);

    if (path === '/api/bootstrap' && method === 'GET') {
      await this.ensureClients();
      const cl = await this.getClient(uid);
      return json({ cfg: await this.getCfg(), prod: await this.pubProd(), me: { id: uid, name: u.first_name || '', admin, profile: clientPublic(cl), blocked: !!(cl && cl.blocked), fav: await this.getFav(uid) }, orders: await this.myOrders(uid) });
    }
    if (path === '/api/profile' && method === 'PUT') {
      const r = await this.readBody(request, 6000);
      if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
      return await this.saveProfile(u, r.body);
    }
    if (path === '/api/fav' && method === 'PUT') {
      const r = await this.readBody(request, 4000);
      if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
      return await this.saveFav(uid, r.body);
    }
    if (path === '/api/my-orders' && method === 'GET') return json({ orders: await this.myOrders(uid) });

    if (path === '/api/order' && method === 'POST') {
      const r = await this.readBody(request, 20000);
      if (r.err) return json({ error: 'bad_request' }, r.err);
      return await this.placeOrder(u, r.body);
    }
    if (path === '/api/cancel' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
      return await this.cancelMine(uid, String(r.body.id || ''));
    }

    if (path.startsWith('/api/admin/')) {
      if (!admin) return json({ error: 'forbidden' }, 403);
      if (path === '/api/admin/orders' && method === 'GET') {
        const act = (await this.st.get('act')) || [], hist = (await this.st.get('hist')) || [];
        const orders = (await this.getOrders(act.concat(hist))).map(adminOrder);
        const stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
        return json({ orders, stats });
      }
      if (path === '/api/admin/status' && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const res = await this.changeStatus(String(r.body.id || ''), String(r.body.to || ''));
        if (res.err) return json({ error: res.err, order: res.order ? adminOrder(res.order) : undefined }, res.err === 'not_found' ? 404 : 409);
        if (res.changed) await this.afterChange(res.order, 'admin');
        return json({ order: adminOrder(res.order), stats: res.stats || (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 } });
      }
      if (path === '/api/admin/config' && method === 'PUT') {
        const r = await this.readBody(request, 100000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const cfg = sanitizeCfg(r.body.cfg);
        await this.st.put('cfg', cfg);
        return json({ cfg });
      }
      if (path === '/api/admin/products' && method === 'PUT') {
        const r = await this.readBody(request, PROD_BODY_MAX);
        if (r.err || !r.body) return json({ error: 'bad_request' }, r.err || 400);
        return await this.saveProd(r.body.prod);
      }
      if (path === '/api/admin/clients' && method === 'GET') {
        await this.ensureClients();
        const idx = await this.clientsIdx();
        const map = await this.getMany(idx.map(x => 'c:' + x));
        return json({ clients: idx.map(x => map.get('c:' + x)).filter(Boolean) });
      }
      const cm = path.match(/^\/api\/admin\/clients\/(\d{1,15})$/);
      if (cm) {
        const cuid = Number(cm[1]);
        await this.ensureClients();
        if (method === 'GET') {
          const c = await this.getClient(cuid);
          if (!c) return json({ error: 'not_found' }, 404);
          return json({ client: c, orders: (await this.getOrders((await this.st.get('m:' + cuid)) || [])).map(adminOrder) });
        }
        if (method === 'PUT') {
          const r = await this.readBody(request, 8000);
          if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
          const c = await this.getClient(cuid);
          if (!c) return json({ error: 'not_found' }, 404);
          const v = cleanClient(r.body, true);
          if (v.err) return json({ error: v.err }, 400);
          Object.assign(c, v.v);
          await this.st.put('c:' + cuid, c);
          return json({ client: c });
        }
        if (method === 'DELETE') {
          const idx = await this.clientsIdx();
          await this.st.put('cx', idx.filter(x => x !== cuid));
          await this.st.delete('c:' + cuid);
          return json({ ok: true });
        }
      }
      if (path === '/api/admin/pick' && method === 'POST') {
        const r = await this.readBody(request, 4000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        const p = await this.pickOrders(r.body);
        if (!p.orders.length) return json({ error: 'empty' }, 404);
        return json({ html: pickHtml(p.orders, (await this.getCfg()).shop, await this.getProd(), p.cut), n: p.orders.length, cut: p.cut });
      }
      if (path === '/api/admin/export' && method === 'POST') {
        const r = await this.readBody(request, 4000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        if (this.exporting) return json({ error: 'busy' }, 429);
        this.exporting = true;
        try {
          const f = await this.makeExport(String(r.body.kind || ''), r.body);
          if (f.err) return json({ error: f.err }, f.err === 'empty' ? 404 : 400);
          // файл уходит в личный чат продавца с ботом (номер чата совпадает с номером пользователя)
          const sent = await this.tgDoc(uid, f.name, f.bytes, f.mime, f.caption);
          if (!sent || !sent.ok) return json({ error: 'send_failed', detail: String(sent && sent.description || '').slice(0, 200) }, 502);
          return json({ ok: true, name: f.name, size: f.bytes.length, n: f.n });
        } finally { this.exporting = false; }
      }
      if (path === '/api/admin/import' && method === 'POST') return await this.importPrice(request, new URL(request.url).searchParams.get('apply') === '1');
      if (path === '/api/admin/stock' && method === 'GET') return json({ stk: await this.getStk() });
      if (path === '/api/admin/journal' && method === 'GET') return json({ jr: (await this.st.get('jr')) || [] });
      if (path === '/api/admin/stock' && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        return await this.stockOp(u, r.body);
      }
      if (path.startsWith('/api/admin/photo/') && (method === 'PUT' || method === 'DELETE')) {
        const id = path.slice('/api/admin/photo/'.length);
        if (!validId(id)) return json({ error: 'not_found' }, 404);
        if (method === 'DELETE') return await this.setPhoto(id, null);
        // фото приходит как есть, байтами (JPEG), без base64: так сервер почти ничего не считает
        if (Number(request.headers.get('content-length') || 0) > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        const bytes = new Uint8Array(await request.arrayBuffer());
        if (bytes.length > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        if (!checkJpeg(bytes, PROD_PHOTO_LIM)) return json({ error: 'bad_photo' }, 400);
        return await this.setPhoto(id, bytes);
      }
    }
    return json({ error: 'not_found' }, 404);
  }

  /* Профиль клиента: имя, телефон, организация, адреса. Заметку, группу и блокировку клиент менять не может. */
  async saveProfile(u, body) {
    await this.ensureClients();
    const v = cleanClient(body, false);
    if (v.err) return json({ error: v.err }, 400);
    const upd = {};
    let c = await this.getClient(u.id);
    if (!c) {
      const idx = await this.clientsIdx();
      if (idx.length >= MAX_CLIENTS) return json({ error: 'busy' }, 503);
      c = newClient(u.id);
      upd.cx = idx.concat([u.id]);
    }
    Object.assign(c, v.v);
    c.tg = { username: cleanStr(u.username || '', 40), name: cleanStr([u.first_name, u.last_name].filter(Boolean).join(' '), 80) };
    upd['c:' + u.id] = c;
    await this.st.put(upd);
    return json({ profile: clientPublic(c) });
  }

  /* Избранное клиента: хранится отдельно от базы клиентов, поэтому тот, кто только отмечает товары, в базе не появляется. */
  async getFav(uid) { const x = await this.st.get('f:' + uid); return Array.isArray(x) ? x : []; }
  async saveFav(uid, body) {
    if (!Array.isArray(body.ids) || body.ids.length > MAX_FAV) return json({ error: 'bad_request' }, 400);
    const have = new Set((await this.getProd()).items.map(i => i.id));
    const ids = [];
    for (const id of body.ids) {
      if (!validId(id)) return json({ error: 'bad_request' }, 400);
      if (have.has(id) && !ids.includes(id)) ids.push(id);
    }
    if (ids.length) await this.st.put('f:' + uid, ids); else await this.st.delete('f:' + uid);
    return json({ fav: ids });
  }

  async myOrders(uid) {
    const ids = (await this.st.get('m:' + uid)) || [];
    const list = await this.getOrders(ids);
    return list.map(publicOrder);
  }

  /* --- заказы --- */
  async placeOrder(u, body) {
    await this.ensureClients();
    const cl0 = await this.getClient(u.id);
    if (cl0 && cl0.blocked) return json({ error: 'blocked' }, 403);
    const cfg = await this.getCfg();
    const prod = await this.getProd();
    const stk = await this.getStk();
    const v = validateOrder(body, cfg, prod, stk);
    if (v.err) {
      const fresh = v.err === 'unavailable' || v.err === 'no_delivery' || v.err === 'stock' || v.err === 'min_order';
      return json({ error: v.err, short: v.short, min: v.min, cfg: fresh ? cfg : undefined, prod: fresh ? publicProd(prod, stk) : undefined }, fresh ? 409 : 400);
    }
    if (body.expectTotal !== undefined && Number(body.expectTotal) !== v.total) {
      return json({ error: 'price_changed', cfg, prod: publicProd(prod, stk) }, 409);
    }
    const uid = u.id;
    const ids = (await this.st.get('m:' + uid)) || [];
    const mine = await this.getOrders(ids);
    if (mine.filter(o => o.status === 'new').length >= MAX_NEW_PER_USER) return json({ error: 'too_many' }, 429);
    const act = (await this.st.get('act')) || [];
    if (act.length >= MAX_ACTIVE) return json({ error: 'busy' }, 503);

    let id;
    do { id = 'Z-' + randId(5); } while (await this.st.get('o:' + id));
    const order = {
      id, createdAt: new Date().toISOString(), status: 'new', lang: body.lang === 'uz' ? 'uz' : 'ru',
      name: v.name, phone: v.phone, mode: v.mode, address: v.address, pickupAt: v.pickupAt, comment: v.comment,
      items: v.items, total: v.total,
      uid, tg: { username: cleanStr(u.username || '', 40), name: cleanStr([u.first_name, u.last_name].filter(Boolean).join(' '), 80) },
      msgs: []
    };
    if (cl0 && cl0.org) order.org = cl0.org;
    if (v.fee > 0) { order.fee = v.fee; order.sub = v.sub; }
    ids.unshift(id); act.unshift(id);
    // откладываем товар под заказ: пока заказ не выдан и не отменён, эти штуки другим покупателям недоступны
    const upd = { ['o:' + id]: order, ['m:' + uid]: ids.slice(0, 40), act };
    const low = [];
    v.items.forEach(it => {
      const s = stk[it.id];
      if (!s) return;
      const before = stkAvail(s);
      s.r += it.qty;
      (order.rs = order.rs || {})[it.id] = it.qty;
      low.push({ title: ruTitle(it), before, after: stkAvail(s), low: s.low, q: s.q, r: s.r });
    });
    if (order.rs) upd.stk = stk;
    // клиентская база: заказ создаёт клиента, а у существующего дополняет только пустые поля и добавляет новый адрес
    let cl = cl0;
    if (!cl) {
      const idx = await this.clientsIdx();
      if (idx.length < MAX_CLIENTS) { cl = newClient(uid, order.createdAt); upd.cx = idx.concat([uid]); }
    }
    if (cl) {
      if (!cl.name) cl.name = order.name;
      if (!cl.phone) cl.phone = order.phone;
      if (order.mode === 'delivery' && order.address && cl.addrs.length < MAX_ADDRS && !cl.addrs.some(a => sameAddr(a, order.address))) cl.addrs.push(order.address);
      cl.n += 1;
      cl.last = order.createdAt;
      cl.tg = order.tg;
      cl.lang = order.lang;
      upd['c:' + uid] = cl;
    }
    await this.st.put(upd);

    // уведомления: ошибки Telegram не должны ломать приём заказа
    const sent = [];
    const card = adminCard(order, cfg.shop, this.origin, false, cl);
    for (const aid of (await this.st.get('admins')) || []) {
      const t = await this.tg('sendMessage', { chat_id: aid, text: card.text, reply_markup: card.reply_markup });
      if (t.ok && t.result) sent.push({ chat_id: aid, message_id: t.result.message_id });
    }
    if (sent.length) {
      const cur = await this.st.get('o:' + id);
      if (cur) {
        cur.msgs = (cur.msgs || []).concat(sent);
        await this.st.put('o:' + id, cur);
      }
    }
    await this.tg('sendMessage', { chat_id: uid, text: customerText(order, 'placed', cfg.shop), reply_markup: openBtn(this.origin, order.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы') });
    await this.stockAlert(low);
    return json({ order: publicOrder(order) });
  }

  /* --- каталог --- */
  async saveProd(input) { return json({ prod: await this.applyProd(input) }); }
  /* Сохраняет каталог целиком (его присылает приложение или прайс) и возвращает его в виде, который видят клиенты. */
  async applyProd(input) {
    const old = await this.getProd();
    const prod = sanitizeProd(input, old);
    const keep = new Set(prod.items.map(i => i.id));
    const gone = old.items.map(i => i.id).filter(id => !keep.has(id));
    const stk = await this.getStk();
    const upd = { prod };
    if (gone.some(id => stk[id])) { gone.forEach(id => { delete stk[id]; }); upd.stk = stk; }   // остаток удалённого товара не копим
    await this.st.put(upd);
    if (gone.length) await this.st.delete(gone.map(id => 'p:' + id));   // фото удалённых товаров не копим
    return publicProd(prod, stk);
  }
  /* Прайс из Excel: apply=false только показывает, что изменится; apply=true записывает. */
  async importPrice(request, apply) {
    if (Number(request.headers.get('content-length') || 0) > XL_MAX_FILE) return json({ error: 'bad_file', why: 'too_big' }, 413);
    const u = new Uint8Array(await request.arrayBuffer());
    if (u.length > XL_MAX_FILE) return json({ error: 'bad_file', why: 'too_big' }, 413);
    if (u.length < 100 || u[0] !== 0x50 || u[1] !== 0x4B) return json({ error: 'bad_file', why: 'not_xlsx' }, 400);
    let plan;
    try { plan = xlPlan(xlParse(await xlReadSheet(u)), await this.getProd()); }
    catch (e) {
      if (!(e instanceof XlErr)) console.error('import error', e && e.stack || e);
      return json({ error: 'bad_file', why: e instanceof XlErr ? e.why : 'not_xlsx' }, 400);
    }
    const out = {
      ok: true, applied: false,
      summary: { added: plan.added, updated: plan.updated, same: plan.same, errors: plan.errors.length, newCats: plan.newCats },
      changes: plan.changes.slice(0, 200), moreChanges: Math.max(0, plan.changes.length - 200),
      errors: plan.errors.slice(0, 50), moreErrors: Math.max(0, plan.errors.length - 50)
    };
    if (apply && plan.changes.length) { out.prod = await this.applyProd(plan.prod); out.applied = true; }
    return json(out);
  }

  /* Приход, исправление остатка, порог «мало», выключение учёта. Всё считает сервер, приложение шлёт только действие. */
  async stockOp(u, b) {
    if (!validId(b.id)) return json({ error: 'bad_request' }, 400);
    const prod = await this.getProd();
    const it = prod.items.find(x => x.id === b.id);
    if (!it) return json({ error: 'not_found' }, 404);
    const stk = await this.getStk();
    const s0 = stk[it.id];
    const row = (kind, d, q) => ({ t: new Date().toISOString(), id: it.id, name: ruTitle(it), kind, d, q, by: cleanStr(u.first_name || '', 30) });
    const rows = [], low = [];
    if (b.op === 'off') {
      if (s0) { delete stk[it.id]; rows.push(row('off', 0, s0.q)); }
    } else if (b.op === 'low') {
      const n = intIn(b.n, 0, MAX_STOCK);
      if (n === null) return json({ error: 'bad_request' }, 400);
      if (!s0) return json({ error: 'not_tracked' }, 409);
      s0.low = n;
    } else if (b.op === 'in' || b.op === 'set') {
      const n = intIn(b.n, b.op === 'in' ? 1 : 0, MAX_STOCK);
      const lw = b.low === undefined || b.low === null ? null : intIn(b.low, 0, MAX_STOCK);
      if (n === null || (b.low !== undefined && b.low !== null && lw === null)) return json({ error: 'bad_request' }, 400);
      let s = s0;
      if (!s) { s = stk[it.id] = { q: 0, r: await this.reservedFor(it.id), low: 0 }; }
      const before = stkAvail(s), q0 = s.q;
      s.q = b.op === 'in' ? Math.min(MAX_STOCK, s.q + n) : n;
      if (lw !== null) s.low = lw;
      rows.push(row(!s0 ? 'start' : b.op === 'in' ? 'in' : 'fix', s.q - q0, s.q));
      if (s0) low.push({ title: ruTitle(it), before, after: stkAvail(s), low: s.low, q: s.q, r: s.r });
    } else return json({ error: 'bad_request' }, 400);
    const upd = { stk };
    if (rows.length) upd.jr = await this.jrWith(rows);
    await this.st.put(upd);
    await this.stockAlert(low);
    return json({ stk });
  }
  async setPhoto(id, bytes) {
    const prod = await this.getProd();
    const it = prod.items.find(x => x.id === id);
    if (!it) return json({ error: 'not_found' }, 404);
    if (bytes) {
      it.pv = randId(6);
      await this.st.put({ ['p:' + id]: bytes, prod });
    } else {
      it.pv = '';
      await this.st.put('prod', prod);
      await this.st.delete('p:' + id);
    }
    return json({ pv: it.pv });
  }
  /* Фото товара: открыто всем, как обычная картинка в каталоге. Адрес с ?v= меняется вместе с фото, поэтому кэш вечный. */
  async image(id) {
    if (!validId(id)) return new Response('not found', { status: 404 });
    const bytes = await this.st.get('p:' + id);
    if (!bytes) return new Response('not found', { status: 404 });
    return new Response(bytes, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  }

  async cancelMine(uid, id) {
    const o = await this.st.get('o:' + id);
    if (!o || o.uid !== uid) return json({ error: 'not_found' }, 404);
    if (o.status !== 'new') return json({ error: 'not_cancellable', order: publicOrder(o) }, 409);
    const res = await this.changeStatus(id, 'cancelled');
    if (res.err) return json({ error: res.err }, 409);
    await this.afterChange(res.order, 'customer');
    return json({ order: publicOrder(res.order) });
  }

  /* Меняет статус без обращений к сети между чтением и записью. */
  async changeStatus(id, to) {
    await this.ensureClients();
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.status === to) return { order: o, same: true };
    if (!(NEXT[o.status] || []).includes(to)) return { err: 'bad_transition', order: o };
    o.status = to;
    o.statusAt = new Date().toISOString();
    const upd = { ['o:' + id]: o };
    let stats = null;
    if (!NEXT[to]) {
      const act = ((await this.st.get('act')) || []).filter(x => x !== id);
      const hist = ((await this.st.get('hist')) || []).filter(x => x !== id);
      hist.unshift(id);
      upd.act = act;
      upd.hist = hist.slice(0, HIST_CAP);
      stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
      if (to === 'done') { stats.doneSum += Number(o.total) || 0; stats.doneCount += 1; }
      upd.stats = stats;
      // счётчики клиента: выдача добавляет сумму, отмена убирает заказ из счёта
      const cl = o.uid ? await this.getClient(o.uid) : null;
      if (cl) {
        if (to === 'done') { cl.ds += 1; cl.sum += Number(o.total) || 0; } else cl.n = Math.max(0, cl.n - 1);
        upd['c:' + o.uid] = cl;
      }
      // отложенный товар: при отмене возвращается в свободный, при выдаче списывается со склада
      if (o.rs) {
        const stk = await this.getStk(), rows = [];
        for (const pid of Object.keys(o.rs)) {
          const s = stk[pid], qty = Number(o.rs[pid]) || 0;
          if (!s) continue;
          s.r = Math.max(0, s.r - qty);
          if (to === 'done') {
            const q0 = s.q, it = (o.items || []).find(x => x.id === pid) || { name: pid };
            s.q = Math.max(0, s.q - qty);
            rows.push({ t: o.statusAt, id: pid, name: ruTitle(it), kind: 'out', d: s.q - q0, q: s.q, ref: o.id });
          }
        }
        delete o.rs;
        upd.stk = stk;
        if (rows.length) upd.jr = await this.jrWith(rows);
      }
    }
    await this.st.put(upd);
    return { order: o, changed: true, stats: stats || undefined };
  }

  /* Обновляет карточки продавца и пишет клиенту. */
  async afterChange(o, by, extraMsg) {
    const cfg = await this.getCfg();
    const card = await this.card(o, cfg.shop, false);
    const seen = new Set(), targets = [];
    (o.msgs || []).concat(extraMsg ? [extraMsg] : []).forEach(m => {
      const k = m.chat_id + ':' + m.message_id;
      if (!seen.has(k)) { seen.add(k); targets.push(m); }
    });
    for (const m of targets) {
      await this.editCard(m, card);
    }
    if (by === 'admin') {
      const text = customerText(o, o.status, cfg.shop);
      if (text) await this.tg('sendMessage', { chat_id: o.uid, text, reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы') });
    } else if (by === 'customer') {
      for (const aid of (await this.st.get('admins')) || []) {
        await this.tg('sendMessage', { chat_id: aid, text: '❌ Клиент отменил заказ ' + o.id + ' (' + o.name + ').' });
      }
    }
  }

  /* --- webhook Telegram --- */
  async webhook(request) {
    if (!this.env.BOT_TOKEN) return new Response('no token', { status: 500 });
    const secret = await this.webhookSecret();
    if (!safeEq(request.headers.get('x-telegram-bot-api-secret-token') || '', secret)) return new Response('forbidden', { status: 403 });
    let up = null;
    try { up = await request.json(); } catch (e) { return json({ ok: true }); }
    try {
      if (up && up.message) await this.onMessage(up.message);
      else if (up && up.callback_query) await this.onCallback(up.callback_query);
    } catch (e) {
      console.error('webhook handler error', e && e.stack || e);
    }
    return json({ ok: true });
  }

  async onMessage(msg) {
    if (!msg.from || !msg.chat || msg.chat.type !== 'private') return;
    const text = String(msg.text || '').trim();
    const lang = String(msg.from.language_code || '').toLowerCase().startsWith('uz') ? 'uz' : 'ru';
    const cmd = text.split(/\s+/)[0].split('@')[0].toLowerCase();
    const chat = msg.chat.id;
    const cfg = await this.getCfg();
    const openText = lang === 'uz' ? '🛒 Katalogni ochish' : '🛒 Открыть каталог';

    if (cmd === '/admin') {
      const code = text.replace(/^\S+\s*/, '');
      if (!code) {
        const isAdm = await this.isAdmin(msg.from.id);
        await this.tg('sendMessage', { chat_id: chat, text: isAdm ? 'Вы подключены как продавец. Новые заказы приходят в этот чат.' : welcomeText(lang, false, cfg.shop), reply_markup: openBtn(this.origin, openText) });
        return;
      }
      const r = await this.checkCode(code);
      // код не должен оставаться в переписке
      await this.tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });
      if (r === 'ok') {
        const admins = (await this.st.get('admins')) || [];
        if (!admins.includes(msg.from.id)) { admins.push(msg.from.id); await this.st.put('admins', admins); }
        await this.tg('sendMessage', { chat_id: chat, text: 'Готово, вы продавец. Новые заказы будут приходить сюда с кнопками «Принять», «Готов», «Выдан». Каталог, цены и настройки меняются в приложении, вкладка «Продавец».', reply_markup: openBtn(this.origin, 'Открыть приложение') });
      } else if (r === 'locked') {
        await this.tg('sendMessage', { chat_id: chat, text: 'Слишком много неверных попыток. Попробуйте через час.' });
      } else if (r === 'nocode') {
        await this.tg('sendMessage', { chat_id: chat, text: 'На сервере не задан ADMIN_CODE.' });
      } else {
        await this.tg('sendMessage', { chat_id: chat, text: 'Неверный код.' });
      }
      return;
    }

    const isAdm = await this.isAdmin(msg.from.id);
    await this.tg('sendMessage', { chat_id: chat, text: welcomeText(lang, isAdm, cfg.shop), reply_markup: openBtn(this.origin, openText) });
  }

  async onCallback(cq) {
    const answer = (text, alert) => this.tg('answerCallbackQuery', { callback_query_id: cq.id, text: text ? String(text).slice(0, 190) : undefined, show_alert: !!alert });
    if (!cq.from || !(await this.isAdmin(cq.from.id))) return answer('Нет доступа', true);
    const parts = String(cq.data || '').split(':');
    const kind = parts[0], id = parts[1], to = parts[2];
    const o = id ? await this.st.get('o:' + id) : null;
    if (!o) return answer('Заказ не найден', true);
    const cfg = await this.getCfg();
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const edit = card => here ? this.editCard(here, card) : null;

    if (kind === 'c') { await edit(await this.card(o, cfg.shop, true)); return answer('Отменить заказ ' + id + '?'); }
    if (kind === 'b') { await edit(await this.card(o, cfg.shop, false)); return answer(''); }
    if (kind === 's') {
      const res = await this.changeStatus(id, to);
      if (res.err === 'bad_transition') {
        await edit(await this.card(res.order, cfg.shop, false));
        return answer('Статус уже другой: ' + stOf(res.order.status, res.order.mode).name, true);
      }
      if (res.err) return answer('Не получилось', true);
      await this.afterChange(res.order, res.changed ? 'admin' : null, here);
      return answer(stOf(res.order.status, res.order.mode).name);
    }
    return answer('');
  }

  /* --- страница /setup: один раз связывает бота с этим сервером --- */
  async setup(request) {
    if (request.method !== 'POST') {
      return setupPage('<p>Введите код продавца (<code>ADMIN_CODE</code>), который вы задали при установке. Страница подключит бота к этому адресу.</p>'
        + '<form method="post"><p><input type="password" name="code" autocomplete="off" autofocus required style="width:100%"></p><p><button type="submit">Подключить бота</button></p></form>');
    }
    const code = new URLSearchParams(await request.text()).get('code') || '';
    const r = await this.checkCode(code);
    if (r === 'nocode') return setupPage('<p class="bad">На сервере не задан секрет <code>ADMIN_CODE</code>. Задайте его командой <code>npx wrangler secret put ADMIN_CODE</code> и откройте страницу снова.</p>');
    if (r === 'locked') return setupPage('<p class="bad">Слишком много неверных попыток. Подождите час.</p>');
    if (r !== 'ok') return setupPage('<p class="bad">Неверный код.</p><p><a href="/setup">Попробовать ещё раз</a></p>');
    if (!this.env.BOT_TOKEN) return setupPage('<p class="bad">На сервере не задан секрет <code>BOT_TOKEN</code>. Задайте его командой <code>npx wrangler secret put BOT_TOKEN</code> и откройте страницу снова.</p>');

    const steps = [];
    const me = await this.tg('getMe', {});
    steps.push(['Токен бота', me.ok, me.ok ? '@' + me.result.username : me.description]);
    if (me.ok) {
      const hook = await this.tg('setWebhook', { url: this.origin + '/webhook', secret_token: await this.webhookSecret(), allowed_updates: ['message', 'callback_query'], max_connections: 10 });
      steps.push(['Приём сообщений бота', hook.ok, hook.ok ? 'подключён' : hook.description]);
      const menu = await this.tg('setChatMenuButton', { menu_button: { type: 'web_app', text: '🛒 Каталог', web_app: { url: this.origin + '/' } } });
      steps.push(['Кнопка меню в боте', menu.ok, menu.ok ? 'установлена' : menu.description]);
      const cmds = await this.tg('setMyCommands', { commands: [{ command: 'start', description: 'Открыть каталог' }] });
      steps.push(['Команды бота', cmds.ok, cmds.ok ? 'установлены' : cmds.description]);
    }
    const allOk = steps.every(s => s[1]);
    return setupPage('<ul>' + steps.map(s => '<li class="' + (s[1] ? 'ok' : 'bad') + '">' + (s[1] ? '✔ ' : '✘ ') + esc(s[0]) + ': ' + esc(s[2]) + '</li>').join('') + '</ul>'
      + (allOk ? '<p>Готово. Теперь откройте бота' + (me.ok ? ' <b>@' + esc(me.result.username) + '</b>' : '') + ' в Telegram и отправьте ему сообщение <code>/admin ВАШ_КОД</code>. После этого заказы будут приходить вам.</p>'
        : '<p class="bad">Не всё получилось. Проверьте токен бота и повторите.</p>'));
  }
}
