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
const MAIN = 'main';          // первый дистрибьютор: его данные лежали в хранилище ещё до появления площадки
const MAX_SHOPS = 50;         // дистрибьюторов на площадке
const MIN_CODE = 12;          // короткий код продавца не принимаем
const HUB_TITLE = 'Sarbon';
const validDid = d => typeof d === 'string' && /^[a-z0-9]{2,12}$/.test(d);
const NEXT ={ new: ['accepted', 'cancelled'], accepted: ['ready', 'cancelled'], ready: ['done', 'cancelled'] };

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
/* Фото товара: до трёх. Первое (pv) показывается на карточке в каталоге и лежит там же, где лежало единственное фото раньше (p:<товар>);
   второе и третье (pv2, pv3) лежат в p2:<товар> и p3:<товар>. Фото всегда идут подряд, без дыр: убрали первое, второе встаёт на его место. */
const PHOTOS_MAX = 3;
const photoKey = (id, n) => (n > 1 ? 'p' + n + ':' : 'p:') + id;
const photoVers = it => {
  const v = [it.pv, it.pv2, it.pv3].map(x => (typeof x === 'string' ? x : ''));
  const n = v.findIndex(x => !x);
  return n < 0 ? v : v.slice(0, n);
};

const json = (obj, status) => new Response(JSON.stringify(obj), {
  status: status || 200,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const html = (body, status) => new Response(body, {
  status: status || 200,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});
/* Запрос к Telegram Bot API. Сбой сети не бросает ошибку, а возвращается как {ok:false}. */
async function tgApi(token, method, payload) {
  if (!token) return { ok: false, description: 'BOT_TOKEN не задан' };
  try {
    const r = await fetch(TG_API + token + '/' + method, {
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
  s.discounts = cleanDiscounts(s.discounts);
  s.regions = cleanRegions(s.regions);
  s.home = cleanRegion(s.home);
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
/* Штук в блоке или коробке: 0 (нет такой упаковки) или от 2 до 500. */
const cleanPack = v => { const n = Math.round(Number(v)); return n >= 2 && n <= MAX_QTY ? n : 0; };
/* Проверка товаров. У одобренного товара метки ms нет совсем (так выглядят и все прежние товары).
   ms: 'draft' — продавец добавил, но ещё не отправил на проверку; 'wait' — ждёт проверки; 'ret' — владелец вернул с причиной mc.
   mt — когда статус менялся в последний раз, ma — когда владелец одобрил. Эти поля продавец не задаёт: берутся из сохранённых данных. */
const MOD_BAD_NAMES = ['', 'Без названия', 'Новый товар'];
const MOD_REASON_MAX = 300;
const isApproved = it => !it.ms;
const ruCount = (n, w) => { const m = n % 100, k = n % 10; return m > 10 && m < 15 ? w[2] : k === 1 ? w[0] : k > 1 && k < 5 ? w[1] : w[2]; };
const ruTovar = n => n + ' ' + ruCount(n, ['товар', 'товара', 'товаров']);
/* Что мешает отправить товар на проверку: название, цена, категория. */
function modProblems(it, cats) {
  const bad = [];
  if (MOD_BAD_NAMES.includes(String(it.name || '').trim())) bad.push('name');
  if (!(Number(it.price) > 0)) bad.push('price');
  if (!cats.some(c => c.id === it.cat)) bad.push('cat');
  return bad;
}
/* Чистит то, что прислал продавец. Версию фото (pv) клиент не задаёт: берём из сохранённых данных.
   mod: {state, at} — в каком состоянии начинают новые товары (draft, wait; у владельца ok — метки нет). */
function sanitizeProd(d, old, mod) {
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
    const price = Math.round(clampN(o.price, 0, 1e8, 0));
    items.push({
      id,
      cat: cats.some(c => c.id === o.cat) ? o.cat : (cats[0] ? cats[0].id : ''),
      name: cleanStr(o.name, 60) || 'Без названия',
      uz: cleanStr(o.uz, 60),
      desc: cleanStr(o.desc, 300, true),
      descUz: cleanStr(o.descUz, 300, true),
      amount: Math.round(clampN(o.amount, 0, 100000, 0) * 1000) / 1000,
      unit: UNIT_IDS.includes(o.unit) ? o.unit : 'g',
      price,
      tiers: cleanTiers(o.tiers, price),
      blk: cleanPack(o.blk),
      box: cleanPack(o.box),
      on: o.on !== false,
      tag: o.tag === 'sale' || o.tag === 'new' ? o.tag : '',
      old: o.tag === 'sale' ? Math.round(clampN(o.old, 0, 1e8, 0)) : 0,
      pv: prev && typeof prev.pv === 'string' ? prev.pv : '',
      pv2: prev && typeof prev.pv2 === 'string' ? prev.pv2 : '',
      pv3: prev && typeof prev.pv3 === 'string' ? prev.pv3 : ''
    });
    const it = items[items.length - 1];
    if (prev) {
      if (prev.ms) { it.ms = prev.ms; if (prev.mt) it.mt = prev.mt; if (prev.mc) it.mc = prev.mc; }
      if (prev.ma) it.ma = prev.ma;
    } else if (mod && mod.state && mod.state !== 'ok') {
      it.ms = mod.state;
      if (mod.state === 'wait') it.mt = mod.at;
    }
  });
  return { cats, items };
}

/* ---------- остатки ---------- */
/* Каталог для покупателей: у товаров с учётом добавляется av (сколько можно заказать, не больше 500) и lw (товара мало).
   Товар на проверке виден покупателю без цены (серой карточкой «На модерации»), черновики и возвращённые не видны совсем.
   admin: продавцу отдаётся всё, с метками проверки. */
function publicProd(prod, stk, admin) {
  const items = [];
  prod.items.forEach(it => {
    if (it.ms && !admin) {
      if (it.ms !== 'wait') return;
      items.push({ id: it.id, cat: it.cat, name: it.name, uz: it.uz || '', desc: it.desc, descUz: it.descUz, amount: it.amount, unit: it.unit, price: 0, tiers: [], blk: 0, box: 0, on: true, tag: '', old: 0, pv: it.pv, pv2: it.pv2, pv3: it.pv3, ms: 'wait' });
      return;
    }
    const v = stk && !it.ms ? stkPublic(stk[it.id], MAX_QTY) : undefined;
    items.push(!v ? it : Object.assign({}, it, v.lw ? { av: v.av, lw: 1 } : { av: v.av }));
  });
  return { cats: prod.cats, items };
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
  let address = '', region = '';
  if (mode === 'delivery') {
    if (cfg.shop.delivery === false) return { err: 'no_delivery' };
    // доставка только в отмеченные регионы: регион нужен, и он должен быть из списка. Самовывоз не ограничен.
    region = cleanRegion(f.region);
    if (hasZone(cfg.shop.regions)) {
      if (!region) return { err: 'region_need' };
      if (!cleanRegions(cfg.shop.regions).includes(region)) return { err: 'no_region' };
    }
    address = cleanStr(f.address, 200);
    if (address.length < 5) return { err: 'bad_request' };
  }
  const date = typeof f.date === 'string' ? f.date : '', time = typeof f.time === 'string' ? f.time : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { err: 'pickup' };
  // час запаса, чтобы не спорить с клиентскими часами
  const pk = pickupInfo(cfg, new Date(shopNow().getTime() - 3600000), leadFor(cfg, mode));
  if (date > pk.max || !pk.slots(date).includes(time)) return { err: 'pickup' };
  // точка на карте необязательна; неверную молча отбрасываем, заказ из-за неё не отклоняем
  return { name, phone, comment, mode, address, region, pickupAt: date + 'T' + time, loc: cleanLoc(f.loc) };
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
    if (!it || it.on === false || it.ms) { missing = true; continue; }   // на проверке заказать нельзя
    const price = unitPrice(it, qty);    // цена за штуку с учётом ступеней: считает только сервер
    const line = { id: it.id, name: it.name, uz: it.uz || '', amount: it.amount, unit: it.unit, price, qty };
    if (packSize(it, 'box')) line.box = packSize(it, 'box');
    if (packSize(it, 'blk')) line.blk = packSize(it, 'blk');
    items.push(line);
    total += price * qty;
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
  // минимальная сумма и порог бесплатной доставки считаются по товарам до скидки, доставка к ним не прибавляется
  const min = Number(cfg.shop.minOrder) || 0;
  if (min > 0 && total < min) return { err: 'min_order', min };
  const fee = deliveryFee(cfg, fm.mode, total);
  const dc = orderDiscount(cfg, total);
  return { items, sub: total, disc: dc.amount, dpct: dc.pct, fee, total: total - dc.amount + fee, name: fm.name, phone: fm.phone, comment: fm.comment, mode: fm.mode, address: fm.address, region: fm.region, pickupAt: fm.pickupAt, loc: fm.loc };
}

const publicOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.tg; delete x.msgs; delete x.rs; delete x.cm; delete x.cr; delete x.crAt; return x; };
const adminOrder = o => { const x = Object.assign({}, o); delete x.uid; delete x.msgs; delete x.rs; delete x.cm; return x; };

/* ---------- клиентская база ---------- */
const phoneOk = p => { const d = p.replace(/\D/g, '').length; return d >= 9 && d <= 15; };
const newClient = (uid, since) => ({ uid, name: '', phone: '', org: '', addrs: [], note: '', grp: '', blocked: false, since: since || new Date().toISOString(), last: '', n: 0, ds: 0, sum: 0, tg: { username: '', name: '' }, lang: '' });
/* то, что клиент видит о себе: заметка, группа и блокировка остаются у продавца */
const clientPublic = c => c ? { name: c.name, phone: c.phone, org: c.org, addrs: c.addrs } : null;
const sameAddr = (a, b) => a.toLowerCase() === b.toLowerCase();
/* Что дистрибьютор знает о магазине из общей базы: заказы у него, его заметка, группа и блокировка.
   cs: записи клиентов этого дистрибьютора, относящиеся к магазину (у магазина может быть несколько сотрудников со своими аккаунтами);
   bn: заметка и группа, которые дистрибьютор ведёт по номеру магазина в базе (работает и у магазина без аккаунта). */
function mineRow(bid, cs, bn) {
  const r = { bid, has: cs.length > 0, n: 0, ds: 0, sum: 0, last: '', blocked: false, note: '', grp: '', tg: '' };
  for (const c of cs) {
    r.n += Number(c.n) || 0; r.ds += Number(c.ds) || 0; r.sum += Number(c.sum) || 0;
    if (String(c.last || '') > r.last) r.last = String(c.last);
    if (c.blocked) r.blocked = true;
    if (!r.tg && c.tg && c.tg.username) r.tg = String(c.tg.username);
  }
  const src = bn || cs.find(c => c.note || c.grp) || {};
  r.note = src.note || ''; r.grp = src.grp || '';
  return r;
}
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

/* Кнопки под заказом несут номер дистрибьютора, чтобы нажатие дошло до его хранилища. У первого дистрибьютора формат прежний: так работают и старые сообщения в чате. */
const cbPrefix = did => (did && did !== MAIN ? did + ':' : '');
/* Разбор данных кнопки под заказом: «s:<заказ>:<статус>», «c:<заказ>», «b:<заказ>», «p:<заказ>:<оплата>[:<дней>]».
   У дистрибьюторов кроме первого после буквы идёт ещё его номер. Номера заказов начинаются с «Z-», а у номера дистрибьютора дефиса нет. */
function cbParse(data) {
  const parts = String(data || '').split(':');
  const kind = parts[0];
  const withDid = kind === 's' || kind === 'q' || kind === 'h' ? parts.length >= 4 : kind === 'p' ? !/^Z-/.test(parts[1] || '') : parts.length >= 3;
  const i = withDid ? 2 : 1;
  return { kind, did: withDid ? parts[1] : MAIN, id: parts[i], to: parts[i + 1], days: parts[i + 2] };
}
/* Адреса, которые открывает кнопка в Telegram: каталог дистрибьютора и его панель продавца. */
const shopUrl = (origin, did) => origin + '/' + (did ? '?d=' + did : '');
const sellerUrl = (origin, did) => origin + '/?d=' + (did || MAIN) + '&v=seller';
const courierUrl = (origin, did) => origin + '/?d=' + (did || MAIN) + '&v=courier';
function adminCard(o, shop, origin, confirm, cl, did, debt) {
  setLang('ru');
  const px = cbPrefix(did);
  const who = o.tg && o.tg.username ? '@' + o.tg.username : 'без username';
  const cLines = clientLines(cl);
  const dLine = o.status === 'cancelled' ? '' : debtLine(debt, dayOf(new Date().toISOString()));
  const tail = '\n\n' + (cLines ? cLines + '\n' : '') + (dLine ? dLine + '\n' : '') + 'Telegram: ' + who + (o.tg && o.tg.name ? ' (' + o.tg.name + ')' : '')
    + '\nСтатус: ' + stOf(o.status, o.mode).name + (o.crn ? '\n🚚 Доставщик: ' + o.crn : '') + (o.pay ? '\n' + payLine(o.pay) : '');
  const head = STATUS_ICON[o.status] + ' ';
  // очень длинный заказ: показываем первые позиции, чтобы итог и кнопки не потерялись
  const ask = confirm === 'pay' ? '\n\nКак клиент оплатил заказ? К оплате: ' + money(o.total) : confirm === 'days' ? '\n\nНа сколько дней записать долг?' : '';
  let text = head + orderText(o, shop) + tail + ask;
  for (let k = (o.items || []).length - 1; text.length > TEXT_MAX && k >= 1; k--) text = head + orderText(o, shop, k) + tail + ask;
  if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 10) + '…';
  const rows = [];
  const btn = (t, d) => ({ text: t, callback_data: d });
  const del = o.mode === 'delivery';
  if (confirm === 'pay') {
    rows.push([btn(PAY_RU.cash, 'p:' + px + o.id + ':cash'), btn(PAY_RU.card, 'p:' + px + o.id + ':card')]);
    rows.push([btn(PAY_RU.bank, 'p:' + px + o.id + ':bank'), btn(PAY_RU.credit, 'p:' + px + o.id + ':credit')]);
    rows.push([{ text: '✂️ Часть сразу, остальное в долг', web_app: { url: sellerUrl(origin, did) } }]);
    rows.push([btn('Назад', 'b:' + px + o.id)]);
  } else if (confirm === 'days') {
    rows.push([3, 7, 14, 30].map(n => btn(n + ' дн.', 'p:' + px + o.id + ':credit:' + n)));
    rows.push([btn('Назад', 's:' + px + o.id + ':done')]);
  } else if (confirm) {
    rows.push([btn('Да, отменить заказ', 's:' + px + o.id + ':cancelled')]);
    rows.push([btn('Назад', 'b:' + px + o.id)]);
  } else {
    if (o.status === 'new') rows.push([btn('✅ Принять в работу', 's:' + px + o.id + ':accepted')]);
    if (o.status === 'accepted') rows.push([btn(del ? '📦 Готов к отправке' : '📦 Готов к выдаче', 's:' + px + o.id + ':ready')]);
    if (o.status === 'ready') rows.push([btn(del ? '🚚 Доставлен клиенту' : '🤝 Выдан клиенту', 's:' + px + o.id + ':done')]);
    if (NEXT[o.status]) rows.push([btn('❌ Отменить', 'c:' + px + o.id)]);
    if (o.loc) rows.push([{ text: '📍 Яндекс.Карты', url: mapUrl('y', o.loc) }, { text: '📍 Google Maps', url: mapUrl('g', o.loc) }]);
    rows.push([{ text: 'Открыть панель продавца', web_app: { url: sellerUrl(origin, did) } }]);
  }
  return { text, reply_markup: { inline_keyboard: rows } };
}

/* Сообщение доставщику: заказ готов к доставке. state: null — свободен, 'mine' — взял этот доставщик, строка — имя того, кто уже взял. */
function courierCard(o, shop, origin, did, state) {
  setLang('ru');
  const px = cbPrefix(did);
  const when = fmtWhen(o.pickupAt);
  const head = state === 'mine' ? '🚚 Вы взяли заказ ' : state ? '✔ Заказ ' : '🚚 Готов к доставке: заказ ';
  let text = head + o.id + (state && state !== 'mine' ? ' уже взял ' + state : '')
    + '\n\n' + (o.org ? o.org + ' · ' : '') + o.name + '\nТелефон: ' + o.phone
    + '\nАдрес: ' + (o.address || '—') + '\nКогда: ' + when
    + '\nСумма: ' + money(o.total)
    + (o.comment ? '\nКомментарий: ' + o.comment : '');
  if (text.length > TEXT_MAX) text = text.slice(0, TEXT_MAX - 1) + '…';
  const rows = [];
  if (!state) rows.push([{ text: '🚚 Взял', callback_data: 'k:' + px + o.id }]);
  if (o.loc) rows.push([{ text: '📍 Яндекс.Карты', url: mapUrl('y', o.loc) }, { text: '📍 Google Maps', url: mapUrl('g', o.loc) }]);
  rows.push([{ text: 'Открыть доставку', web_app: { url: courierUrl(origin, did) } }]);
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
    case 'done': {
      const owe = o.pay && o.pay.m === 'credit' ? Math.max(0, (Number(o.total) || 0) - (Number(o.pay.paid) || 0)) : 0;
      const dueRu = owe ? '\nОплатить до ' + dmy(o.pay.due) + ': ' + money(owe) : '', dueUz = owe ? '\nToʻlov muddati ' + dmy(o.pay.due) + ': ' + money(owe) : '';
      return (del ? L(
        '🤝 Заказ ' + o.id + ' доставлен. Спасибо, что выбрали ' + name + '!' + dueRu,
        '🤝 Buyurtma ' + o.id + ' yetkazildi. ' + name + 'ni tanlaganingiz uchun rahmat!' + dueUz) : L(
        '🤝 Спасибо, что выбрали ' + name + '!' + dueRu,
        '🤝 ' + name + 'ni tanlaganingiz uchun rahmat!' + dueUz));
    }
    case 'taken': return L(
      '🚚 Заказ ' + o.id + ': доставщик ' + o.crn + ' везёт ваш заказ.' + (o.crp ? '\nТелефон: ' + o.crp : '') + '\nОплата при получении: ' + money(o.total),
      '🚚 Buyurtma ' + o.id + ': yetkazib beruvchi ' + o.crn + ' buyurtmangizni olib ketmoqda.' + (o.crp ? '\nTelefon: ' + o.crp : '') + '\nOlganda toʻlanadi: ' + money(o.total));
    case 'cancelled': return L(
      '❌ Заказ ' + o.id + ' отменён продавцом.' + (contact ? '\nВопросы: ' + contact : ''),
      '❌ Buyurtma ' + o.id + ' sotuvchi tomonidan bekor qilindi.' + (contact ? '\nSavollar: ' + contact : ''));
  }
  return '';
}

/* Приветствие на двух языках: сверху язык человека (по языку его Telegram), ниже второй.
   Многие в Узбекистане пользуются Telegram на русском или английском, но говорят по-узбекски. */
const bilingual = (lang, ru, uz) => lang === 'uz' ? uz + '\n\n' + ru : ru + '\n\n' + uz;
const SELLER_NOTE_RU = 'Вы продавец: новые заказы придут сюда.';
const SELLER_NOTE_UZ = 'Siz sotuvchisiz: yangi buyurtmalar shu yerga keladi.';
/* Приветствие (/start): сверху всегда узбекский, ниже русский, язык Telegram у человека не важен.
   Текст один и для одного дистрибьютора, и для нескольких: список дистрибьюторов клиент видит в приложении. */
function welcomeText(lang, isAdmin, shop) {
  setLang(lang);
  const name = (shop && shop.name) || DEFAULT.shop.name;
  let uz = 'Assalomu alaykum! Bu ' + name + ' 🛒\n«Katalog» tugmasini bosing, mahsulotlarni tanlang va buyurtma bering. Olib ketish yoki yetkazib berish. Toʻlovni buyurtmangizni olganda qilasiz.';
  let ru = 'Здравствуйте! Это ' + name + ' 🛒\nНажмите «Каталог», выберите товары и оформите заказ. Самовывоз или доставка. Оплата при получении заказа.';
  if (isAdmin) { uz += '\n\n' + SELLER_NOTE_UZ; ru += '\n\n' + SELLER_NOTE_RU; }
  return uz + '\n\n' + ru;
}
const openBtn = (origin, text, url) => ({ inline_keyboard: [[{ text, web_app: { url: url || origin + '/' } }]] });

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
  const rows = [['№ заказа', 'Создан', 'Статус', 'Получение', 'Когда', 'Клиент', 'Телефон', 'Организация', 'Telegram', 'Адрес доставки', 'Комментарий', 'Товары, сум', 'Скидка, сум', 'Доставка, сум', 'Итого, сум', 'Позиций', 'Оплата', 'Доставщик']];
  const items = [['№ заказа', 'Статус', 'Когда', 'Клиент', 'Товар', 'Вес / объём', 'Количество', 'В упаковках', 'Цена, сум', 'Сумма, сум']];
  list.forEach(o => {
    const fee = Number(o.fee) || 0, total = Number(o.total) || 0, disc = Number(o.disc) || 0, st = stOf(o.status, o.mode).name, when = String(o.pickupAt || '').replace('T', ' ');
    rows.push([o.id, shopTime(o.createdAt), st, o.mode === 'delivery' ? 'Доставка' : 'Самовывоз', when, o.name || '', o.phone || '', o.org || '',
      o.tg && o.tg.username ? '@' + o.tg.username : '', o.mode === 'delivery' ? (o.address || '') : '', o.comment || '', total - fee + disc, disc, fee, total, (o.items || []).length, payPlain(o.pay), o.crn || '']);
    (o.items || []).forEach(it => items.push([o.id, st, when, o.name || '', it.name || '', weightLabel(it), Number(it.qty) || 0, packText(it, it.qty), Number(it.price) || 0, (Number(it.price) || 0) * (Number(it.qty) || 0)]));
  });
  return [
    { name: 'Заказы', w: [11, 17, 16, 12, 17, 22, 17, 22, 16, 34, 30, 14, 12, 14, 14, 9, 30, 18], money: [11, 12, 13, 14], rows },
    { name: 'Товары в заказах', w: [11, 16, 17, 22, 32, 13, 12, 20, 14, 14], money: [8, 9], rows: items }
  ];
}
function clientsSheets(clients) {
  const list = clients.slice().sort((a, b) => String(b.last || b.since).localeCompare(String(a.last || a.since)));
  const rows = [['Имя', 'Телефон', 'Организация', 'Группа', 'Адреса доставки', 'Заметка', 'Заказов', 'Завершено', 'Сумма завершённых, сум', 'Клиент с', 'Последний заказ', 'Telegram', 'Язык', 'Заблокирован']];
  list.forEach(c => rows.push([c.name || '', c.phone || '', c.org || '', c.grp || '', (c.addrs || []).join(' | '), c.note || '', Number(c.n) || 0, Number(c.ds) || 0, Number(c.sum) || 0,
    shopTime(c.since), shopTime(c.last), c.tg && c.tg.username ? '@' + c.tg.username : '', c.lang === 'uz' ? 'узбекский' : c.lang === 'ru' ? 'русский' : '', c.blocked ? 'да' : '']));
  return [{ name: 'Клиенты', w: [22, 17, 22, 14, 40, 34, 9, 10, 18, 17, 17, 16, 11, 13], money: [8], rows }];
}

/* Долги в Excel. list — строки debtRow, logs — их журналы (в том же порядке). Лист «Долги» по магазинам, лист «История» по всем записям журнала. */
const CF_PLAIN = { ok: 'подтвердил', wait: 'ждём ответа', no: 'ответил «Не так»', na: 'не получил сообщение' };
function debtsSheets(list, logs) {
  setLang('ru');
  const head = [['Магазин', 'Организация', 'Телефон', 'Адрес', 'Долг, сум', 'Ближайший срок', 'Просрочено, сум', 'Дней просрочки', 'Спорных записей', 'Ждут ответа магазина', 'Последняя оплата', 'Статус']];
  const hist = [['Магазин', 'Телефон', 'Дата', 'Запись', '№ записи', '№ заказа', 'Сумма, сум', 'Способ', 'Срок оплаты', 'Ответ магазина', 'Записал', 'Комментарий', 'Отменена']];
  list.forEach((x, i) => {
    const lg = logs[i] || { rows: [] }, rows = Array.isArray(lg.rows) ? lg.rows : [];
    const voided = new Set(rows.filter(r => r.k === 'rv').map(r => r.of));
    const nm = x.name || ('ID ' + x.uid);
    const pays = rows.filter(r => r.k === 'pay' && !voided.has(r.n));
    const last = pays.length ? pays[pays.length - 1].t : '';
    const st = x.bal < 0 ? 'Аванс (магазин переплатил)' : x.days > 0 ? 'Просрочен' : x.bal > 0 ? 'Должен в срок' : 'Долга нет, есть записи без ответа';
    head.push([nm, x.org || '', x.phone || '', x.addr || '', x.bal, dmy(x.due), x.over || 0, x.days || 0, x.fl || 0, x.wt || 0, last ? shopTime(last).slice(0, 10) : '', st + (x.fl > 0 ? ' · спорные записи' : '')]);
    if (lg.base) hist.push([nm, x.phone || '', '', 'Ранние записи свёрнуты', '', '', lg.base.d, '', dmy(lg.base.due), '', '', 'Остаток по старым записям, подробностей нет', '']);
    rows.forEach(r => {
      const kind = r.k === 'ch' ? 'Выдача в долг' : r.k === 'pay' ? 'Оплата' : r.k === 'rv' ? 'Отмена записи №' + r.of : r.k === 'rs' ? 'Спор по записи №' + r.of + ' закрыт' : r.k === 'ac' ? 'Акт сверки ' + (r.f ? dmy(r.f) : 'с начала') + ' – ' + dmy(r.e) : '';
      if (!kind) return;
      hist.push([nm, x.phone || '', shopTime(r.t), kind, r.n, r.ref || '', r.k === 'rs' ? '' : r.k === 'ac' ? Number(r.cb) || 0 : Number(r.a) || 0, r.k === 'pay' ? (PAY_PLAIN[r.m] || '') : '', r.k === 'ch' ? dmy(r.due) : '',
        isCf(r) ? (CF_PLAIN[r.cf] || '') : '', r.bn || '', r.k === 'pay' ? (r.note || '') : (r.why || ''), voided.has(r.n) ? 'да' : '']);
    });
  });
  return [
    { name: 'Долги', w: [26, 22, 17, 34, 15, 15, 16, 13, 13, 16, 16, 34], money: [4, 6], rows: head },
    { name: 'История', w: [26, 17, 17, 28, 10, 12, 15, 15, 13, 22, 20, 36, 11], money: [6], rows: hist }
  ];
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
      if (!a) { a = { id: it.id, name: it.name, w: weightLabel(it), qty: 0, n: 0, pk: prod.items.find(x => x.id === it.id) || it }; agg.set(it.id, a); }
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
      h += tr(['<td class="c"><input type="checkbox"></td>', '<td>' + esc(a.name) + (a.w ? '<small>' + esc(a.w) + '</small>' : '') + '</td>', '<td class="q">' + a.qty + (packText(a.pk, a.qty) ? '<small>' + esc(packText(a.pk, a.qty)) + '</small>' : '') + '</td>', '<td class="p">' + a.n + '</td>']);
    });
    h += '</tbody></table></section>';
  }
  list.forEach(o => {
    const del = o.mode === 'delivery', fee = Number(o.fee) || 0, disc = Number(o.disc) || 0;
    h += '<section class="ord"><h2><span class="id">' + esc(o.id) + '</span><span class="tag">' + (del ? 'Доставка' : 'Самовывоз') + '</span><span class="tag">' + esc(stOf(o.status, o.mode).name) + '</span></h2>'
      + '<div class="row"><b>' + (del ? 'Доставить' : 'Выдать') + ':</b> ' + esc(whenRu(o.pickupAt)) + '</div>'
      + '<div class="row"><b>' + esc(o.name || '') + '</b>' + (o.org ? ' · ' + esc(o.org) : '') + ' · ' + esc(o.phone || '') + '</div>'
      + (del && o.address ? '<div class="row"><b>Адрес:</b> ' + esc(o.address) + '</div>' : '')
      + (o.comment ? '<div class="cm">' + esc(o.comment) + '</div>' : '')
      + '<table><thead>' + tr(['<th class="c"></th>', '<th>Товар</th>', '<th class="q">Кол-во</th>', '<th class="p">Цена</th>', '<th class="s">Сумма</th>']) + '</thead><tbody>';
    (o.items || []).forEach(it => {
      const w = weightLabel(it);
      h += tr(['<td class="c"><input type="checkbox"></td>', '<td>' + esc(it.name) + (w ? '<small>' + esc(w) + '</small>' : '') + '</td>', '<td class="q">' + (Number(it.qty) || 0) + (packText(it, it.qty) ? '<small>' + esc(packText(it, it.qty)) + '</small>' : '') + '</td>', '<td class="p">' + num(it.price) + '</td>', '<td class="s">' + num((Number(it.price) || 0) * (Number(it.qty) || 0)) + '</td>']);
    });
    h += '</tbody><tfoot>' + (disc > 0 ? tr(['<td></td>', '<td colspan="3">Скидка ' + (Number(o.dpct) || 0) + '%</td>', '<td class="s">−' + num(disc) + '</td>']) : '') + (fee > 0 ? tr(['<td></td>', '<td colspan="3">Доставка</td>', '<td class="s">' + num(fee) + '</td>']) : '')
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

/* ---------- расчёты с магазинами: способы оплаты и долги ---------- */
/* При выдаче продавец отмечает, как заплатил магазин: наличные, карта, перечисление или в долг (можно часть сразу, остаток в долг).
   По каждому магазину ведётся журнал расчётов lg:<uid>. Он только дополняется: выдача в долг (ch), оплата (pay), отмена оплаты (rv).
   d — как запись меняет долг: выдано в долг +сумма, получена оплата −сумма. Долг — сумма всех d.
   Оплаты гасят самые старые выдачи первыми, просрочка считается по непогашенной части. Заголовок lh:<uid> хранит долг и непогашенные выдачи,
   список магазинов с долгом — dbi. Записей хранится не больше LG_MAX: самые старые сворачиваются в base, журнал не растёт бесконечно. */
const PAY_M = ['cash', 'card', 'bank'];
const DEBT_ORD_MAX = 100, LG_MAX = 500, LG_FOLD = 100, LG_NOTE = 80, LG_SHOW = 100, MAX_PAY = 1e11, CREDIT_MAX_DAYS = 90, REMIND_GAP = 3600000;
const PAY_RU = { cash: '💵 Наличные', card: '💳 Карта', bank: '🏦 Перечисление', credit: '📒 В долг' };
/* Контроль денег: сколько ждём ответа магазина, сколько безналичных оплат доставщика ждут сверки, длина причины и комментария. */
const CF_LATE = 24 * 3600000, NV_MAX = 100, WHY_MIN = 3, WHY_MAX = 80, RES_MAX = 120;
/* Как назвать человека в сообщении владельцу: имя, логин и номер, чтобы не перепутать тёзок. */
const whoFull = u => (whoName(u) || 'Без имени') + (u && u.username ? ' (@' + u.username + ')' : '') + ', ID ' + (u && u.id);
const whoName = u => cleanStr([u && u.first_name, u && u.last_name].filter(Boolean).join(' ') || (u && u.username) || '', 40);

/* ---------- доставка: доставщики и касса наличных ---------- */
const MAX_COURIERS = 30, CC_KEEP = 200, CC_SHOW = 60, CINV_MS = 7 * 86400000;
const validCid = c => typeof c === 'string' && /^k[a-z0-9]{3,9}$/.test(c);
const validTok = t => typeof t === 'string' && /^[a-z0-9]{6,12}$/.test(t);
/* Доставщик с телефоном и без секретов: ссылку-приглашение продавец получает отдельно. */
/* Срок сдачи наличных, дней: 0 — до конца дня приёма, −1 — без срока. Не задан — по умолчанию в тот же день. */
const DL_DEF = 0, DL_MAX = 30;
const crDl = c => { const v = c && c.dl; return Number.isInteger(v) && v >= -1 && v <= DL_MAX ? v : DL_DEF; };
/* На сколько дней просрочена сдача наличных (0 — вовремя или срока нет). cs — когда принят самый старый несданный рубль. */
function crLate(c, now) {
  const dl = crDl(c);
  if (dl < 0 || !((Number(c && c.cash) || 0) > 0) || !c.cs) return 0;
  const a = Date.parse(dayOf(c.cs) + 'T00:00:00Z'), b = Date.parse(dayOf(new Date(now).toISOString()) + 'T00:00:00Z');
  return Math.max(0, Math.round((b - a) / 86400000) - dl);
}
/* Открытый вопрос по сдаче: продавец записал сдачу (или её отмену), доставщик ещё не сказал «Верно» и вопрос не закрыт. */
const hOpen = r => (r.k === 'out' || r.k === 'ox') && (r.cf === 'wait' || r.cf === 'no' || r.cf === 'na') && !r.hr && !r.ox;
/* Сколько записей о сдаче ждут ответа самого доставщика: ещё не ответил или сообщение не дошло. */
const crAsk = c => ((c && c.hwt) || []).length + (Number(c && c.hna) || 0);
/* Сколько записей о сдаче требуют внимания: «Не так», не дошло, или нет ответа больше суток. */
const crHf = (c, now) => (Number(c && c.hfl) || 0) + ((c && c.hwt) || []).filter(t => now - Date.parse(t) > CF_LATE).length;
/* С какого времени деньги на руках: сданные деньги закрывают самые старые поступления, поэтому остаток набирается из самых новых.
   Отменённая оплата долга убирает своё поступление. Строки кассы обрезаются: если остаток не набрался, берём самое старое известное поступление. */
function cashSince(rows, cash) {
  if (!(cash > 0)) return '';
  const vs = [];
  let need = cash, last = '';
  for (let i = rows.length - 1; i >= 0 && need > 0; i--) {
    const r = rows[i];
    if (r.k === 'rv' && r.du) { vs.push(r); continue; }
    if (r.k !== 'in') continue;
    const vi = r.du ? vs.findIndex(v => v.du === r.du && v.a === r.a) : -1;
    if (vi >= 0) { vs.splice(vi, 1); continue; }
    need -= Number(r.a) || 0; last = r.t;
  }
  if (need > 0) { const f = rows.find(r => r.k === 'in'); return f ? f.t : ''; }
  return last;
}
/* Сохраняет кассу доставщика: старые строки обрезаются (открытые вопросы по сдаче остаются), пересчитывается «с какого времени деньги на руках» и счётчики вопросов по сдаче. */
function crSave(c, lg) {
  if (lg.rows.length > CC_KEEP) { const cut = lg.rows.length - CC_KEEP; lg.rows = lg.rows.slice(0, cut).filter(hOpen).slice(-100).concat(lg.rows.slice(cut)); }
  c.cs = cashSince(lg.rows, Number(c.cash) || 0);
  c.hfl = lg.rows.filter(r => hOpen(r) && r.cf !== 'wait').length;
  c.hwt = lg.rows.filter(r => hOpen(r) && r.cf === 'wait').map(r => r.t);
  c.hna = lg.rows.filter(r => hOpen(r) && r.cf === 'na').length;
  return { ['cc:' + c.id]: lg, ['cr:' + c.id]: c };
}
const crPub = c => ({ id: c.id, name: c.name, phone: c.phone || '', joined: !!c.uid, on: c.on !== false, credit: c.credit !== false, cash: Number(c.cash) || 0, lim: Number(c.lim) || 0, nvn: (c.nv || []).length, nva: (c.nv || []).reduce((t, x) => t + (Number(x.a) || 0), 0), dl: crDl(c), cs: c.cs || '', late: crLate(c, Date.now()), hf: crHf(c, Date.now()), hw: (c.hwt || []).length, since: c.since });
/* Текст сообщения доставщику: продавец записал сдачу денег или отменил её. */
function handText(r) {
  const by = r.bn ? ' Записал: ' + r.bn + '.' : '';
  return r.k === 'ox'
    ? '↩️ Продавец отменил вашу сдачу ' + money(r.a) + '. Причина: ' + (r.why || '') + '.' + by + '\nНа руках теперь ' + money(r.left) + '.\n\nВсё верно?'
    : '📥 Продавец записал: вы сдали ' + money(r.a) + '.' + by + '\nОстаток на руках: ' + money(r.left) + '.\n\nВсё верно?';
}
const handDesc = r => (r.k === 'ox' ? 'отмена сдачи ' : 'сдача ') + money(r.a);
const PAY_PLAIN = { cash: 'Наличные', card: 'Карта', bank: 'Перечисление', credit: 'В долг' };
const dmy = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4) : '';
/* Как заплатил магазин при выдаче заказа. Не указано — наличные: так было, пока оплата при получении была единственной. null — данные неверны. */
function cleanPay(p, total, today) {
  if (p === undefined || p === null) return { m: 'cash' };
  if (typeof p !== 'object') return null;
  const m = p.m === undefined ? 'cash' : p.m;
  if (PAY_M.includes(m)) return { m };
  if (m !== 'credit') return null;
  const days = Number(p.days);
  if (!Number.isInteger(days) || days < 1 || days > CREDIT_MAX_DAYS) return null;
  const r = { m: 'credit', days, due: addDays(today, days) };
  if (p.paid !== undefined && p.paid !== null && p.paid !== '' && Number(p.paid) !== 0) {
    const paid = Number(p.paid);
    // если оплачена вся сумма, это обычная оплата, а не долг
    if (!Number.isInteger(paid) || paid < 0 || paid >= total || !PAY_M.includes(p.pm)) return null;
    r.paid = paid; r.pm = p.pm;
  }
  return r;
}
/* Долг и непогашенные выдачи по журналу. all — все записи журнала (нужны, чтобы увидеть отмены, которые лежат в хвосте). */
function lgState(rows, base, all) {
  const voided = new Set((all || rows).filter(r => r.k === 'rv').map(r => r.of));
  const net = rows.filter(r => r.k !== 'rv' && r.k !== 'rs' && r.k !== 'ac' && !voided.has(r.n));
  let bal = base ? base.d : 0, paid = base && base.d < 0 ? -base.d : 0;
  const queue = [];
  if (base && base.d > 0) queue.push({ ref: '', due: base.due || '', r: base.d });
  for (const r of net) {
    bal += r.d;
    if (r.k === 'ch') queue.push({ ref: r.ref || '', due: r.due || '', r: r.d });
    else paid -= r.d;
  }
  for (const q of queue) { const t = Math.min(q.r, paid); q.r -= t; paid -= t; }
  return { bal, open: queue.filter(q => q.r > 0) };
}
/* Когда срок и сколько просрочено на день today. */
function lgDue(open, today) {
  let over = 0, days = 0;
  const day = d => Date.parse(d + 'T00:00:00Z');
  for (const q of open || []) if (q.due && q.due < today) { over += q.r; days = Math.max(days, Math.round((day(today) - day(q.due)) / 86400000)); }
  const dues = (open || []).map(q => q.due).filter(Boolean).sort();
  return { due: dues[0] || '', over, days };
}
/* Когда записей больше LG_MAX, старые уходят в base: остаток долга по ним и самый ранний срок. */
/* Записи, которым магазин ещё не ответил (cf «wait»), отметил «не так» («no») или которые до него не дошли («na»), и которые продавец не закрыл
   и не отменил. Записи одного заказа (общий g) считаются за одну. fl — спорные, cwt — время каждой записи, ждущей ответа, first — позиция первой из них. */
function lgPend(rows) {
  const gone = new Set(), fl = new Set(), na = new Set(), cw = new Map();
  rows.forEach(r => { if (r.k === 'rv' || r.k === 'rs') gone.add(r.of); });
  let first = -1;
  rows.forEach((r, i) => {
    if (!isCf(r) || !r.cf || r.cf === 'ok' || gone.has(r.n)) return;
    if (first < 0) first = i;
    const g = r.g || r.n;
    if (r.cf === 'wait') { if (!cw.has(g) || r.t < cw.get(g)) cw.set(g, r.t); } else { fl.add(g); if (r.cf === 'na') na.add(g); }
  });
  return { fl: fl.size, na: na.size, cwt: [...cw.values()].sort().slice(0, 50), first };
}
/* Сколько записей магазина требуют внимания продавца сейчас: спорные и те, на которые магазин молчит дольше суток. */
const lgFlags = (h, now) => (h.fl || 0) + (h.cwt || []).filter(t => now - Date.parse(t) > CF_LATE).length;
function lgFold(rows, base) {
  if (rows.length <= LG_MAX) return { rows, base };
  let cut = rows.length - LG_MAX + LG_FOLD;
  // спорные записи остаются в журнале, пока он не вырос в полтора раза
  const pd = lgPend(rows);
  if (pd.first >= 0 && pd.first < cut && rows.length <= LG_MAX * 1.6) cut = pd.first;
  if (cut <= 0) return { rows, base };
  const s = lgState(rows.slice(0, cut), base, rows);
  return { rows: rows.slice(cut), base: { d: s.bal, due: s.open.map(q => q.due).filter(Boolean).sort()[0] || '' } };
}
const debtRow = (h, today) => Object.assign({ uid: h.uid, name: h.name || '', org: h.org || '', phone: h.phone || '', addr: h.addr || '', bal: h.bal, fl: lgFlags(h, Date.now()), wt: (h.cwt || []).length }, lgDue(h.open, today));
/* Оплата заказа простым текстом для Excel. */
function payPlain(pay) {
  if (!pay) return '';
  if (pay.m !== 'credit') return PAY_PLAIN[pay.m] || '';
  return (pay.paid ? PAY_PLAIN[pay.pm] + ' ' + pay.paid + ' + ' : '') + 'В долг до ' + dmy(pay.due);
}
function payLine(pay) {
  if (!pay) return '';
  if (pay.m !== 'credit') return 'Оплата: ' + PAY_RU[pay.m];
  return 'Оплата: ' + (pay.paid ? PAY_RU[pay.pm] + ' ' + money(pay.paid) + ' + ' : '') + PAY_RU.credit + ' до ' + dmy(pay.due);
}
/* Утреннее сообщение продавцу: у кого просрочен долг. late — строки debtRow только с просрочкой, самые давние первыми. */
const MORNING_ROWS = 10;
function morningText(shopName, late) {
  setLang('ru');
  const over = late.reduce((t, x) => t + (Number(x.over) || 0), 0);
  const lines = late.slice(0, MORNING_ROWS).map((x, i) => (i + 1) + '. ' + cleanStr(x.name || x.org || ('ID ' + x.uid), 40) + ': ' + money(x.over) + ', ' + x.days + ' дн.');
  return '⏰ ' + cleanStr(shopName || '', 60) + ': просрочка на сегодня\nМагазинов: ' + late.length + ', просрочено ' + money(over) + '\n\n' + lines.join('\n')
    + (late.length > MORNING_ROWS ? '\nи ещё ' + (late.length - MORNING_ROWS) : '');
}
function debtLine(h, today) {
  if (!h || !(h.bal > 0)) return '';
  const d = lgDue(h.open, today);
  return '⚠️ Долг магазина: ' + money(h.bal) + (d.days ? ', просрочка ' + d.days + ' дн.' : d.due ? ', срок ' + dmy(d.due) : '');
}
/* Напоминание магазину. ords — состав заказов {номер: заказ}; по каждому неоплаченному заказу пишем дату, товары, сумму и остаток.
   Если текст не влезает в одно сообщение Telegram, заказов и позиций показываем меньше. */
const REMIND_STEPS = [[5, 8], [3, 3], [3, 0], [1, 0]];
const PAY_NAME2 = { cash: ['наличные', 'naqd'], card: ['карта', 'karta'], bank: ['перечисление', 'oʻtkazma'] };
/* Сообщение магазину, когда продавец или доставщик записал оплату долга. h — заголовок долга после записи, a — сумма, m — способ. */
function debtPayText(h, a, m, shop) {
  setLang(h.lang === 'uz' ? 'uz' : 'ru');
  const name = shop.name || DEFAULT.shop.name, pn = PAY_NAME2[m] ? ' (' + L(PAY_NAME2[m][0], PAY_NAME2[m][1]) + ')' : '';
  const head = L('✅ ' + name + ': принята оплата ' + money(a) + pn + '.', '✅ ' + name + ': toʻlov qabul qilindi: ' + money(a) + pn + '.');
  const bal = Number(h.bal) || 0;
  const tail = bal > 0 ? L('\nОстаток долга: ', '\nQarz qoldigʻi: ') + money(bal)
    : L('\nДолг погашен, спасибо!', '\nQarz toʻlandi, rahmat!') + (bal < 0 ? L(' Переплата (аванс): ', ' Ortiqcha toʻlov (avans): ') + money(-bal) : '');
  return head + tail;
}
/* Что записано, одной строкой для продавца и доставщика. */
function rowDesc(rows) {
  const ac = rows.find(r => r.k === 'ac');
  if (ac) return 'акт сверки ' + (ac.f ? 'с ' + dmy(ac.f) + ' ' : '') + 'по ' + dmy(ac.e) + ', ' + ((Number(ac.cb) || 0) > 0 ? 'долг ' + money(ac.cb) : (Number(ac.cb) || 0) < 0 ? 'переплата ' + money(-ac.cb) : 'долга нет');
  const ch = rows.find(r => r.k === 'ch'), p = rows.find(r => r.k === 'pay');
  if (ch) return 'заказ ' + ch.ref + ' в долг на ' + money(ch.a) + (ch.due ? ' до ' + dmy(ch.due) : '') + (p ? ', сразу оплачено ' + money(p.a) : '');
  return p ? 'оплата долга ' + money(p.a) + (PAY_NAME2[p.m] ? ' (' + PAY_NAME2[p.m][0] + ')' : '') : '';
}
/* Сообщение магазину с просьбой подтвердить запись: выдачу в долг или принятую оплату. h — заголовок долга, rows — записи одного заказа или одна оплата. */
function confirmText(h, rows, shop) {
  const ch = rows.find(r => r.k === 'ch'), p = rows.find(r => r.k === 'pay'), who = (rows.find(r => r.bn) || {}).bn || '';
  let text;
  if (ch) {
    setLang(h.lang === 'uz' ? 'uz' : 'ru');
    const name = shop.name || DEFAULT.shop.name;
    text = L('📒 ' + name + ': заказ ' + ch.ref + ' выдан вам в долг на ' + money(ch.a) + (ch.due ? ' до ' + dmy(ch.due) : '') + '.',
      '📒 ' + name + ': ' + ch.ref + ' buyurtma sizga qarzga berildi: ' + money(ch.a) + (ch.due ? ', muddat ' + dmy(ch.due) : '') + '.');
    if (p) text += '\n' + L('Сразу оплачено: ', 'Darhol toʻlandi: ') + money(p.a) + (PAY_NAME2[p.m] ? ' (' + L(PAY_NAME2[p.m][0], PAY_NAME2[p.m][1]) + ')' : '') + '.';
  } else text = debtPayText(h, p.a, p.m, shop);
  setLang(h.lang === 'uz' ? 'uz' : 'ru');
  return text + (who ? '\n' + L('Принял: ', 'Qabul qildi: ') + who : '') + '\n\n' + L('Всё верно?', 'Hammasi toʻgʻrimi?');
}
/* Акт сверки: выписка по расчётам магазина за период. Магазин получает её в Telegram и отвечает «Верно» или «Не так».
   Запись об акте лежит в журнале долга (k «ac», сумма 0, долг не меняет), чтобы «Не так» попадало в спорные так же, как по обычным записям. */
const ACT_PER = ['this', 'prev', 'all'], ACT_PART = 3800, ACT_MAX_MSG = 6, ACT_ITEMS = 25;
/* Записи, на которые магазин отвечает «Верно» или «Не так»: выдача в долг, оплата и акт сверки. */
const isCf = r => r.k === 'ch' || r.k === 'pay' || r.k === 'ac';
/* Границы периода по дню today (YYYY-MM-DD): f — первый день (пусто — с начала записей), e — последний. */
function actPeriod(per, today) {
  if (per === 'all') return { f: '', e: today };
  const y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7));
  if (per === 'this') return { f: today.slice(0, 7) + '-01', e: today };
  const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1, p2 = n => (n < 10 ? '0' : '') + n;
  return { f: py + '-' + p2(pm) + '-01', e: py + '-' + p2(pm) + '-' + p2(new Date(Date.UTC(py, pm, 0)).getUTCDate()) };
}
/* Текст акта сверки по журналу lg. Возвращает { parts, f, e, ob, cb, n } или { empty }, или { long }.
   ords — состав заказов {номер: заказ}. Если текст не влезает в ACT_MAX_MSG сообщений, состав заказов убирается; если и так много — long. */
function actBuild(h, lg, per, today, ords, shop) {
  const { f, e } = actPeriod(per, today);
  const voided = new Set(lg.rows.filter(r => r.k === 'rv').map(r => r.of));
  const net = lg.rows.filter(r => (r.k === 'ch' || r.k === 'pay') && !voided.has(r.n));
  const day = r => dayOf(r.t);
  const before = f ? net.filter(r => day(r) < f) : [];
  const inside = net.filter(r => (!f || day(r) >= f) && day(r) <= e);
  const ob = (lg.base ? lg.base.d : 0) + before.reduce((t, r) => t + (Number(r.d) || 0), 0);
  const cb = ob + inside.reduce((t, r) => t + (Number(r.d) || 0), 0);
  if (!inside.length && ob === 0) return { empty: true };
  // период начинается раньше, чем помнит журнал: прежние записи свёрнуты в один остаток
  const early = !!lg.base && (!f || !lg.rows.length || f <= day(lg.rows[0]));
  const uz = h.lang === 'uz';
  setLang(uz ? 'uz' : 'ru');
  const bal = v => v < 0 ? '−' + money(-v) + L(' (переплата)', ' (ortiqcha toʻlov)') : money(v);
  const who = [h.org, h.name].filter(Boolean).map(s => cleanStr(s, 60)).join(' · ');
  const build = compact => {
    const blocks = [];
    blocks.push(L('📄 Акт сверки', '📄 Hisob-kitoblarni solishtirish dalolatnomasi') + ' — ' + cleanStr(shop.name || DEFAULT.shop.name, 60)
      + (who ? '\n' + L('Магазин: ', 'Doʻkon: ') + who : '')
      + '\n' + L('Период: ', 'Davr: ') + (f ? dmy(f) : L('с начала записей', 'yozuvlar boshidan')) + ' – ' + dmy(e));
    blocks.push((early ? L('Остаток на начало записей: ', 'Yozuvlar boshidagi qoldiq: ') : L('Остаток на ', 'Qoldiq ') + (f ? dmy(f) : L('начало', 'boshida')) + ': ') + bal(ob)
      + (early ? '\n' + L('Более ранние записи объединены в этот остаток.', 'Oldingi yozuvlar shu qoldiqqa birlashtirilgan.') : ''));
    let add = 0, paid = 0;
    for (const r of inside) {
      const a = Math.abs(Number(r.d) || 0);
      if (r.k === 'ch') {
        add += a;
        const o = r.ref ? (ords || {})[r.ref] : null;
        const items = !compact && o && Array.isArray(o.items) ? o.items : [];
        const lines = items.slice(0, ACT_ITEMS).map(it => '• ' + cleanStr(uz ? (it.uz || it.name) : it.name, 60) + (weightLabel(it) ? ' (' + weightLabel(it) + ')' : '') + ' × ' + (Number(it.qty) || 0));
        if (items.length > ACT_ITEMS) lines.push(L('…и ещё ' + (items.length - ACT_ITEMS) + ' поз.', '…yana ' + (items.length - ACT_ITEMS) + ' ta'));
        blocks.push(dmy(day(r)) + ' · ' + L('Заказ ', 'Buyurtma ') + (r.ref || '—') + (lines.length ? '\n' + lines.join('\n') : '')
          + '\n' + L('В долг: +', 'Qarzga: +') + money(a) + (r.due ? ' (' + L('срок ', 'muddat ') + dmy(r.due) + ')' : ''));
      } else {
        paid += a;
        const pn = PAY_NAME2[r.m] ? ' (' + L(PAY_NAME2[r.m][0], PAY_NAME2[r.m][1]) + ')' : '';
        blocks.push(dmy(day(r)) + ' · ' + L('Оплата', 'Toʻlov') + pn + '\n−' + money(a));
      }
    }
    if (!inside.length) blocks.push(L('За период записей нет.', 'Davr uchun yozuvlar yoʻq.'));
    else blocks.push(L('Итого за период: в долг +', 'Davr boʻyicha jami: qarzga +') + money(add) + L(', оплачено −', ', toʻlangan −') + money(paid));
    blocks.push((cb > 0 ? L('Долг на ', 'Qarz ') + dmy(e) + ': ' + money(cb) : cb < 0 ? L('Переплата (аванс) на ', 'Ortiqcha toʻlov (avans) ') + dmy(e) + ': ' + money(-cb) : L('На ', '') + dmy(e) + L(' долга нет', ' sanasida qarz yoʻq'))
      + '\n\n' + L('Всё верно?', 'Hammasi toʻgʻrimi?'));
    // сообщения: блоки подряд, пока влезает; слишком длинный блок режется
    const parts = [];
    let cur = '';
    for (let b of blocks) {
      if (b.length > ACT_PART) b = b.slice(0, ACT_PART - 1) + '…';
      if (cur && cur.length + 2 + b.length > ACT_PART) { parts.push(cur); cur = b; } else cur = cur ? cur + '\n\n' + b : b;
    }
    if (cur) parts.push(cur);
    return parts;
  };
  let parts = build(false), compact = false;
  if (parts.length > ACT_MAX_MSG) { parts = build(true); compact = true; }
  if (parts.length > ACT_MAX_MSG) return { long: true };
  const head = L('📄 Акт сверки', '📄 Dalolatnoma');
  if (parts.length > 1) parts = parts.map((p, i) => i ? head + ' · ' + (i + 1) + '/' + parts.length + '\n\n' + p : p.replace('\n', ' (1/' + parts.length + ')\n'));
  return { parts, f, e, ob, cb, n: inside.length, compact };
}
function debtRemindText(h, shop, today, ords) {
  setLang(h.lang === 'uz' ? 'uz' : 'ru');
  const d = lgDue(h.open, today);
  const name = shop.name || DEFAULT.shop.name;
  const contact = (shop.telegram ? '@' + shop.telegram : '') + (shop.phone ? (shop.telegram ? ', ' : '') + shop.phone : '');
  const late = d.days ? L(' (просрочка ' + d.days + ' дн.)', ' (' + d.days + ' kun kechikdi)') : '';
  const head = L('🔔 ' + name + ': напоминание об оплате.\nДолг по заказам: ' + money(h.bal) + (d.due ? '\nСрок оплаты: ' + dmy(d.due) + late : ''),
    '🔔 ' + name + ': toʻlov eslatmasi.\nBuyurtmalar boʻyicha qarz: ' + money(h.bal) + (d.due ? '\nToʻlov muddati: ' + dmy(d.due) + late : ''));
  const tail = contact ? L('\nВопросы: ', '\nSavollar: ') + contact : '';
  const open = (Array.isArray(h.open) ? h.open : []).filter(q => q && q.r > 0), by = ords || {};
  const block = (q, maxItems) => {
    const o = q.ref ? by[q.ref] : null;
    if (!q.ref) return L('Прежние долги: ', 'Oldingi qarzlar: ') + money(q.r);
    if (!o) return q.ref + ' · ' + L('осталось ', 'qoldi ') + money(q.r) + (q.due ? ' · ' + L('срок ', 'muddat ') + dmy(q.due) : '');
    const items = Array.isArray(o.items) ? o.items : [];
    const lines = items.slice(0, maxItems).map(it => '• ' + (L(it.name, it.uz || it.name)) + (weightLabel(it) ? ' (' + weightLabel(it) + ')' : '') + ' × ' + it.qty);
    if (items.length > maxItems) lines.push(L('…и ещё ' + (items.length - maxItems) + ' поз.', '…yana ' + (items.length - maxItems) + ' ta'));
    const paidPart = o.total > q.r ? ', ' + L('осталось ', 'qoldi ') + money(q.r) : '';
    return o.id + ' · ' + dmy(dayOf(o.at)) + '\n' + (lines.length ? lines.join('\n') + '\n' : '')
      + L('Сумма ', 'Summa ') + money(o.total) + paidPart + (q.due ? ' · ' + L('срок ', 'muddat ') + dmy(q.due) : '');
  };
  let text = head + tail;
  if (open.length) for (const [maxOrders, maxItems] of REMIND_STEPS) {
    const show = open.slice(0, maxOrders), rest = open.slice(maxOrders);
    const more = rest.length ? '\n\n' + L('…и ещё ' + rest.length + ' зак. на ' + money(rest.reduce((t, q) => t + q.r, 0)), '…yana ' + rest.length + ' ta buyurtma, ' + money(rest.reduce((t, q) => t + q.r, 0))) : '';
    text = head + '\n\n' + show.map(q => block(q, maxItems)).join('\n\n') + more + tail;
    if (text.length <= 3800) break;
  }
  return text;
}

/* ---------- отчёты ---------- */
/* Продажи копятся по дням: когда заказ становится «выдан», его сумма, товары и клиент добавляются в запись rp:<день> (день по часам склада).
   Самих заказов в панели хранится не больше 150 завершённых, поэтому отчёты берут данные не из них. Старше 400 дней записи удаляются. */
const RP_KEEP = 400;
const RP_RANGES = [7, 30, 90, 365];
const RP_COVER = 14;          // на сколько дней считаем запас в подсказке «что пора закупать»
const dayOf = iso => { const t = Date.parse(iso); return new Date((Number.isFinite(t) ? t : Date.now()) + SHOP_TZ * 3600000).toISOString().slice(0, 10); };
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const newRp = () => ({ n: 0, sum: 0, disc: 0, fee: 0, cb: 0, cm: 0, items: [], cl: [] });
/* Комиссия площадки: считается с суммы товаров после скидки, без доставки (итог заказа минус доставка), только с выданных заказов.
   В записи дня cb — эта сумма, cm — комиссия, начисленная по проценту на момент выдачи (позже процент меняют только для новых заказов). */
const COMM_DEFAULT = 2, COMM_MAX = 50;
const cleanPct = v => { const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 && n <= COMM_MAX ? Math.round(n * 100) / 100 : null; };
const commBase = r => r.cb !== undefined ? r.cb : Math.max(0, (Number(r.sum) || 0) - (Number(r.fee) || 0));
function statRange(period) {
  const today = dayOf(new Date().toISOString());
  const first = today.slice(0, 7) + '-01';
  if (period === '7d') return { period, from: addDays(today, -6), to: today };
  if (period === '30d') return { period, from: addDays(today, -29), to: today };
  if (period === 'prev') { const last = addDays(first, -1); return { period, from: last.slice(0, 7) + '-01', to: last }; }
  return { period: 'month', from: first, to: today };
}
function rpAdd(rp, o, pct, catOf) {
  const total = Number(o.total) || 0;
  if (!rp.n) rp.v = 2;   // день начат с подсчётом заказов по товарам и категориям (у записей до этого счёта поля v нет)
  if (rp.cb === undefined) rp.cb = Math.max(0, (Number(rp.sum) || 0) - (Number(rp.fee) || 0));   // запись дня, начатая до комиссии
  const base = Math.max(0, total - (Number(o.fee) || 0));
  rp.cb += base; rp.cm = (Number(rp.cm) || 0) + Math.round(base * (Number(pct) || 0) / 100);
  rp.n += 1; rp.sum += total; rp.disc += Number(o.disc) || 0; rp.fee += Number(o.fee) || 0;
  const seen = new Set(), cats = new Set();
  for (const it of o.items || []) {
    const qty = Number(it.qty) || 0;
    let x = rp.items.find(y => y.id === it.id);
    if (!x) { x = { id: String(it.id), name: cleanStr(it.name, 60), qty: 0, sum: 0 }; if (catOf) x.c = catOf(String(it.id)); rp.items.push(x); }
    x.qty += qty; x.sum += qty * (Number(it.price) || 0);
    if (rp.v === 2 && !seen.has(x.id)) { seen.add(x.id); x.n = (Number(x.n) || 0) + 1; }
    if (catOf) cats.add(x.c !== undefined ? x.c : catOf(x.id));
  }
  if (rp.v === 2 && cats.size) { rp.cn = rp.cn || {}; cats.forEach(c => { rp.cn[c] = (Number(rp.cn[c]) || 0) + 1; }); }
  if (o.uid) {
    let c = rp.cl.find(y => y.uid === o.uid);
    if (!c) { if (rp.cl.length >= 400) return; c = { uid: o.uid, name: '', org: '', n: 0, sum: 0 }; rp.cl.push(c); }
    c.name = cleanStr(o.name, 60) || c.name; c.org = cleanStr(o.org || '', 80) || c.org;
    c.n += 1; c.sum += total;
  }
}
/* Собирает отчёт за days дней, заканчивая днём today. Вход: rp — Map «день → запись», rp0 — с какого дня ведётся учёт. */
function reportBuild(o) {
  const { days, today, rp, rp0, prod, stk } = o;
  const from = addDays(today, -(days - 1));
  const series = [], months = new Map(), prods = new Map(), cls = new Map();
  const tot = { n: 0, sum: 0, disc: 0, fee: 0 };
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i), r = rp.get(d);
    series.push({ d, n: r ? r.n : 0, sum: r ? r.sum : 0 });
    if (!r) continue;
    tot.n += r.n; tot.sum += r.sum; tot.disc += r.disc; tot.fee += r.fee;
    const m = months.get(d.slice(0, 7)) || { m: d.slice(0, 7), n: 0, sum: 0 };
    m.n += r.n; m.sum += r.sum; months.set(m.m, m);
    r.items.forEach(x => { const a = prods.get(x.id) || { id: x.id, name: x.name, qty: 0, sum: 0 }; a.qty += x.qty; a.sum += x.sum; a.name = x.name || a.name; prods.set(x.id, a); });
    r.cl.forEach(c => { const a = cls.get(c.uid) || { name: c.name, org: c.org, n: 0, sum: 0 }; a.n += c.n; a.sum += c.sum; a.name = c.name || a.name; a.org = c.org || a.org; cls.set(c.uid, a); });
  }
  // прошлый период той же длины: только если учёт шёл уже тогда
  const pFrom = addDays(from, -days);
  let prev = null;
  if (rp0 && rp0 <= pFrom) {
    prev = { n: 0, sum: 0 };
    for (let i = 0; i < days; i++) { const r = rp.get(addDays(pFrom, i)); if (r) { prev.n += r.n; prev.sum += r.sum; } }
  }
  const pitem = new Map((prod ? prod.items : []).map(x => [x.id, x]));
  const prodsOut = [...prods.values()].sort((a, b) => b.sum - a.sum || b.qty - a.qty).slice(0, 20).map(x => {
    const it = pitem.get(x.id);
    return Object.assign({}, x, it ? { name: it.name, w: weightLabel(it) } : {});
  });
  const clOut = [...cls.values()].sort((a, b) => b.sum - a.sum || b.n - a.n).slice(0, 10);
  // что пора закупать: у товаров с учётом остатка считаем, на сколько дней хватит при нынешних продажах (за последние 30 дней или сколько есть)
  const span = Math.max(1, Math.round((Date.parse(today) - Date.parse(rp0 || today)) / 86400000) + 1);
  const W = Math.min(30, span), wFrom = addDays(today, -(W - 1));
  const sold = new Map();
  for (let i = 0; i < W; i++) { const r = rp.get(addDays(wFrom, i)); if (r) r.items.forEach(x => sold.set(x.id, (sold.get(x.id) || 0) + x.qty)); }
  const list = [];
  for (const it of prod ? prod.items : []) {
    const s = stk && stk[it.id];
    if (!s) continue;
    const q = sold.get(it.id) || 0;
    if (!(q > 0)) continue;
    const avail = stkAvail(s), daily = q / W, left = avail / daily;
    if (left > RP_COVER) continue;
    list.push({ id: it.id, name: it.name, w: weightLabel(it), avail, daily: Math.round(daily * 100) / 100, left: Math.round(left * 10) / 10, need: Math.max(0, Math.ceil(daily * RP_COVER - avail)) });
  }
  list.sort((a, b) => a.left - b.left);
  return {
    days, from, to: today, since: rp0 || today, span, thin: span < 7,
    tot: Object.assign(tot, { avg: tot.n ? Math.round(tot.sum / tot.n) : 0 }), prev,
    series, months: [...months.values()].sort((a, b) => a.m.localeCompare(b.m)),
    prods: prodsOut, cl: clOut, buy: { window: W, cover: RP_COVER, list: list.slice(0, 30) }
  };
}
/* Продажи за период для владельца: по товарам, по категориям, по клиентам. days — дни периода, map — «rp:<день>» → запись.
   Заказов по товару и по категории считаются только за дни с полем v (с запуска этого раздела), за прежние дни остаются штуки и суммы (partial).
   Категория продажи — та, что была у товара в день продажи (поле c записи); у записей без неё берётся нынешний каталог.
   Если такой категории в каталоге уже нет, продажа попадает в «Без категории» (name ''). */
function analyticsBuild(o) {
  const { days, map, prod } = o;
  const catOf = new Map(prod.items.map(p => [p.id, p.cat])), nameOf = new Map(prod.items.map(p => [p.id, p.name]));
  const catById = new Map(prod.cats.map(c => [c.id, c]));
  const tot = { n: 0, sum: 0 }, prods = new Map(), cats = new Map(), cls = new Map();
  let partial = false;
  const catRow = id => {
    const c = catById.get(id), key = c ? id : '';
    let a = cats.get(key);
    if (!a) { a = { name: c ? c.name : '', uz: c ? (c.uz || '') : '', n: 0, qty: 0, sum: 0 }; cats.set(key, a); }
    return a;
  };
  for (const d of days) {
    const r = map.get('rp:' + d);
    if (!r) continue;
    tot.n += Number(r.n) || 0; tot.sum += Number(r.sum) || 0;
    const counted = r.v === 2;
    if (!counted && r.n > 0) partial = true;
    for (const x of r.items || []) {
      let a = prods.get(x.id);
      if (!a) { a = { id: x.id, name: x.name, n: 0, qty: 0, sum: 0 }; prods.set(x.id, a); }
      a.qty += Number(x.qty) || 0; a.sum += Number(x.sum) || 0; a.name = nameOf.get(x.id) || x.name || a.name;
      if (counted) a.n += Number(x.n) || 0;
      const c = catRow(x.c !== undefined ? x.c : (catOf.get(x.id) || ''));
      c.qty += Number(x.qty) || 0; c.sum += Number(x.sum) || 0;
    }
    if (counted && r.cn) for (const k of Object.keys(r.cn)) catRow(k).n += Number(r.cn[k]) || 0;
    for (const c of r.cl || []) {
      let a = cls.get(c.uid);
      if (!a) { a = { uid: c.uid, name: c.name, org: c.org, n: 0, sum: 0, last: '' }; cls.set(c.uid, a); }
      a.n += Number(c.n) || 0; a.sum += Number(c.sum) || 0; a.name = c.name || a.name; a.org = c.org || a.org;
      if (d > a.last) a.last = d;
    }
  }
  const top = (m, cap) => [...m.values()].sort((a, b) => b.sum - a.sum || b.n - a.n).slice(0, cap);
  return { tot, partial, since: o.since || '', prods: top(prods, 500), cats: [...cats.values()].sort((a, b) => b.sum - a.sum), cls: top(cls, 1000) };
}
const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const ruDay = d => d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4);
const ruMonth = m => MONTHS_RU[Number(m.slice(5, 7)) - 1] + ' ' + m.slice(0, 4);
function reportSheets(r) {
  setLang('ru');
  const days = [['Дата', 'Заказов', 'Сумма, сум']].concat(r.series.map(x => [ruDay(x.d), x.n, x.sum]));
  days.push(['Итого', r.tot.n, r.tot.sum]);
  const months = [['Месяц', 'Заказов', 'Сумма, сум']].concat(r.months.map(x => [ruMonth(x.m), x.n, x.sum]));
  const prods = [['Товар', 'Вес / объём', 'Продано, шт', 'Сумма, сум']].concat(r.prods.map(x => [x.name, x.w || '', x.qty, x.sum]));
  const cl = [['Клиент', 'Организация', 'Заказов', 'Сумма, сум']].concat(r.cl.map(x => [x.name, x.org || '', x.n, x.sum]));
  const buy = [['Товар', 'Вес / объём', 'Свободно, шт', 'Продаётся в день, шт', 'Хватит на, дней', 'Докупить на ' + r.buy.cover + ' дн., шт']].concat(r.buy.list.map(x => [x.name, x.w || '', x.avail, x.daily, x.left, x.need]));
  const head = ['Отчёт за ' + ruDay(r.from) + ' — ' + ruDay(r.to), 'Учёт продаж ведётся с ' + ruDay(r.since) + '. В отчёт входят заказы со статусом «выдан» и «доставлен».',
    'Сумма товара считается по ценам в заказе, до скидки на весь заказ. Сумма заказа — то, что заплатил клиент (со скидкой и доставкой).',
    'Заказов: ' + r.tot.n + '. Сумма: ' + num(r.tot.sum) + ' сум. Скидки: ' + num(r.tot.disc) + ' сум. Доставка: ' + num(r.tot.fee) + ' сум. Средний заказ: ' + num(r.tot.avg) + ' сум.'];
  return [
    { name: 'Сводка', w: [150], plain: true, rows: head.map(x => [x]) },
    { name: 'По дням', w: [14, 11, 16], money: [2], rows: days },
    { name: 'По месяцам', w: [20, 11, 16], money: [2], rows: months },
    { name: 'Товары', w: [38, 14, 14, 16], money: [3], rows: prods },
    { name: 'Клиенты', w: [30, 26, 11, 16], money: [3], rows: cl },
    { name: 'Что закупать', w: [38, 14, 14, 20, 16, 24], rows: buy }
  ];
}

/* ---------- страница настройки ---------- */
function setupPage(inner) {
  return html('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Настройка бота</title>'
    + '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;color:#1A1A1E}input,button{font:inherit;padding:10px 12px;border-radius:10px;border:1.5px solid #ccc}button{background:#139A78;color:#fff;border:0;cursor:pointer}li{margin:6px 0}.ok{color:#1F7A4D}.bad{color:#D63A1F}code{background:#EFEEEC;padding:2px 6px;border-radius:6px}</style></head><body>'
    + '<h1>Настройка бота</h1>' + inner + '</body></html>');
}

/* ---------- связь между Worker, площадкой (Hub) и дистрибьюторами (Shop) ---------- */
const stubOf = (ns, name) => ns.get(ns.idFromName(name));
/* Служебный запрос внутри сервера: идёт напрямую в хранилище, снаружи такие адреса (/__/…) недоступны. */
async function internalCall(stub, did, path, body) {
  const r = await stub.fetch(new Request('https://internal' + path, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-did': did }, body: JSON.stringify(body || {})
  }));
  let data = null;
  try { data = await r.json(); } catch (e) { /* пустой ответ */ }
  return { ok: r.ok, status: r.status, data };
}
const hubCall = async (env, path, body) => (await internalCall(stubOf(env.HUB, 'hub'), MAIN, path, body)).data;
const shopCall = (env, did, path, body) => internalCall(stubOf(env.SHOP, did), did, path, body);
const withDid = (request, did) => {
  const h = new Headers(request.headers);
  h.set('x-did', did);
  return new Request(request, { headers: h });
};

/* ---------- Worker ---------- */
/* Worker отдаёт страницу и раздаёт запросы: бот и список дистрибьюторов идут в Hub, всё остальное — в хранилище нужного дистрибьютора
   (его номер приложение присылает в заголовке x-shop; без заголовка работает первый дистрибьютор, как до появления площадки). */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (request.method === 'GET' && (p === '/' || p === '/index.html')) {
      return new Response(APP_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' } });
    }
    if (p === '/favicon.ico') return new Response(null, { status: 204 });
    if (p === '/webhook' || p === '/api/shops' || p.startsWith('/api/hub/')) {
      if (!env.HUB) {
        // площадка не подключена (в wrangler.toml нет привязки HUB): каталог и заказы первого дистрибьютора, как раньше, и кнопки под заказами работают
        if (p === '/webhook') return stubOf(env.SHOP, MAIN).fetch(withDid(request, MAIN));
        return json({ error: 'no_hub' }, 503);
      }
      return stubOf(env.HUB, 'hub').fetch(request);
    }
    if (p === '/setup') return stubOf(env.SHOP, MAIN).fetch(withDid(request, MAIN));
    if (p.startsWith('/img/')) {
      // /img/<дистрибьютор>/<товар>; без номера дистрибьютора (старые адреса) это первый дистрибьютор
      const rest = p.slice(5).split('/');
      const did = rest.length > 1 ? rest[0] : MAIN, pid = rest[rest.length - 1];
      if (rest.length > 2 || !validDid(did)) return new Response('not found', { status: 404 });
      return stubOf(env.SHOP, did).fetch(withDid(new Request(url.origin + '/img/' + pid + url.search, request), did));
    }
    if (p.startsWith('/api/')) {
      const did = request.headers.get('x-shop') || MAIN;
      if (!validDid(did)) return json({ error: 'bad_shop' }, 400);
      return stubOf(env.SHOP, did).fetch(withDid(request, did));
    }
    return json({ error: 'not_found' }, 404);
  },
  /* Расписание из wrangler.toml (каждое утро): напоминание продавцам о просроченных долгах. */
  async scheduled(event, env, ctx) {
    const run = async () => {
      try {
        if (env.HUB) await hubCall(env, '/__/morning', {});
        else await shopCall(env, MAIN, '/__/morning', { origin: '' });
      } catch (e) { console.error('scheduled failed', e && e.message || e); }
    };
    if (ctx && ctx.waitUntil) ctx.waitUntil(run()); else await run();
  }
};

/* ---------- Durable Object ---------- */
export class Shop {
  constructor(state, env) {
    this.state = state;
    this.st = state.storage;
    this.env = env;
    this.origin = '';
    this.did = MAIN;      // номер дистрибьютора: его присылает Worker в заголовке x-did
    this.born = undefined; // хранилище создано площадкой (у первого дистрибьютора есть всегда)
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
  async card(o, shop, confirm) { return adminCard(o, shop, this.origin, confirm, o.uid ? await this.getClient(o.uid) : null, this.did, o.uid ? await this.st.get('lh:' + o.uid) : null); }
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
  /* Один раз при первом обращении: заполняет отчёты из уже завершённых заказов, которые ещё хранятся (до 150). Дальше записи копятся сами. */
  async ensureReports() {
    if (await this.st.get('rpx') !== undefined) return;
    const done = (await this.getOrders((await this.st.get('hist')) || [])).filter(o => o.status === 'done');
    const byDay = new Map(), catOf = await this.catOf();
    let first = null;
    for (const o of done) {
      const d = dayOf(o.statusAt || o.createdAt);
      let r = byDay.get(d);
      if (!r) { r = newRp(); byDay.set(d, r); }
      rpAdd(r, o, 0, catOf);
      if (!first || d < first) first = d;
    }
    const days = [...byDay.keys()].sort().slice(-RP_KEEP);
    const upd = { rpx: days, rp0: first || dayOf(new Date().toISOString()) };
    days.forEach(d => { upd['rp:' + d] = byDay.get(d); });
    await this.st.put(upd);
  }
  /* Категория товара по его номеру в нынешнем каталоге ('' — товара или категории нет). */
  async catOf() {
    const prod = await this.getProd(), cat = new Map(prod.items.map(p => [p.id, p.cat]));
    return id => cat.get(id) || '';
  }
  /* Продажи за период для раздела «Аналитика» владельца. */
  async analytics(from, to) {
    await this.ensureReports();
    const days = ((await this.st.get('rpx')) || []).filter(d => d >= from && d <= to);
    const map = await this.getMany(days.map(d => 'rp:' + d));
    return analyticsBuild({ days, map, prod: await this.getProd(), since: (await this.st.get('rp0')) || '' });
  }
  async report(days) {
    await this.ensureReports();
    days = RP_RANGES.includes(days) ? days : 30;
    const today = dayOf(new Date().toISOString());
    const idx = (await this.st.get('rpx')) || [];
    const need = addDays(today, -Math.max(2 * days, 30));
    const map = await this.getMany(idx.filter(d => d >= need).map(d => 'rp:' + d));
    const rp = new Map();
    map.forEach((v, k) => rp.set(k.slice(3), v));
    const rep = reportBuild({ days, today, rp, rp0: await this.st.get('rp0'), prod: await this.getProd(), stk: await this.getStk() });
    rep.comm = await this.commSummary();
    return rep;
  }
  /* Процент комиссии площадки: у первого дистрибьютора по умолчанию 0, у остальных его ставит площадка при создании. */
  async getPct() { const p = await this.st.get('cpct'); return typeof p === 'number' && p >= 0 && p <= COMM_MAX ? p : 0; }
  /* Выданные заказы за период (дни включительно): сколько, на какую сумму товаров, какая комиссия, сколько заказов сейчас в работе. */
  async commRange(from, to) {
    await this.ensureReports();
    const days = ((await this.st.get('rpx')) || []).filter(d => d >= from && d <= to);
    const map = await this.getMany(days.map(d => 'rp:' + d));
    const out = { pct: await this.getPct(), n: 0, base: 0, cm: 0, active: ((await this.st.get('act')) || []).length };
    map.forEach(r => { out.n += Number(r.n) || 0; out.base += commBase(r); out.cm += Number(r.cm) || 0; });
    return out;
  }
  /* Для отчётов дистрибьютора: комиссия за этот и прошлый месяц. */
  async commSummary() {
    const today = dayOf(new Date().toISOString());
    const first = today.slice(0, 7) + '-01', last = addDays(first, -1), pfirst = last.slice(0, 7) + '-01';
    const cur = await this.commRange(first, today), prev = await this.commRange(pfirst, last);
    const pick = (m, x) => ({ m, n: x.n, base: x.base, cm: x.cm });
    return { pct: cur.pct, cur: pick(first.slice(0, 7), cur), prev: pick(last.slice(0, 7), prev) };
  }
  async getProd() { return normProd(await this.st.get('prod')); }
  async getStk() { const s = await this.st.get('stk'); return s && typeof s === 'object' ? s : {}; }
  async pubProd(admin) { return publicProd(await this.getProd(), await this.getStk(), !!admin); }
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
  /* Публичный адрес /api/config читают все, но продавцу нужен каталог целиком (с черновиками): узнаём его, если Telegram-подпись приложена. */
  async adminIn(request) {
    const h = request.headers.get('x-init-data');
    if (!h || !this.env.BOT_TOKEN) return false;
    const au = await verifyInitData(h, this.env.BOT_TOKEN);
    return !au.err && await this.isAdmin(au.user.id);
  }

  /* --- Telegram --- */
  tg(method, payload) { return tgApi(this.env.BOT_TOKEN, method, payload); }
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
    // все фото всех товаров: первое как photos/<товар>.jpg, второе и третье как photos/<товар>-2.jpg и -3.jpg
    const withPhoto = [];
    prod.items.forEach(it => photoVers(it).forEach((v, i) => withPhoto.push({ id: it.id, n: i + 1 })));
    const photos = [];
    let used = 0;
    for (let i = 0; i < withPhoto.length; i += 20) {
      const part = withPhoto.slice(i, i + 20);
      const m = await this.getMany(part.map(x => photoKey(x.id, x.n)));
      for (const x of part) {
        const b = m.get(photoKey(x.id, x.n));
        if (!b || !b.length) continue;
        const u = b instanceof Uint8Array ? b : new Uint8Array(b);
        if (used + u.length > BACKUP_PHOTO_BUDGET) continue;
        used += u.length;
        photos.push({ name: 'photos/' + x.id + (x.n > 1 ? '-' + x.n : '') + '.jpg', data: u });
      }
    }
    const at = new Date().toISOString();
    const data = {
      kind: 'distro-backup', v: 1, at,
      cfg: await this.getCfg(), prod, stk: await this.getStk(), jr: (await this.st.get('jr')) || [],
      stats: (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 },
      admins: (await this.st.get('admins')) || [],
      act: (await this.st.get('act')) || [], hist: (await this.st.get('hist')) || [],
      orders: orders.map(o => { const x = Object.assign({}, o); delete x.msgs; delete x.cm; return x; }),
      clients: idx.map(x => cmap.get('c:' + x)).filter(Boolean),
      reports: await this.reportsDump(),
      debts: await this.debtsDump(),
      couriers: await this.couriersDump(),
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
  /* Доставщики и их журналы кассы для резервной копии (без ссылок-приглашений). */
  async couriersDump() {
    const list = await this.crList();
    const map = await this.getMany(list.map(c => 'cc:' + c.id));
    return list.map(c => ({ courier: Object.assign({}, c, { tok: '' }), log: map.get('cc:' + c.id) || null }));
  }
  /* Журналы расчётов магазинов с непогашенным долгом (или переплатой) для резервной копии. */
  async debtsDump() {
    const idx = (await this.st.get('dbi')) || [];
    const keys = [];
    idx.forEach(u => { keys.push('lh:' + u, 'lg:' + u); });
    const map = await this.getMany(keys);
    return idx.map(u => ({ uid: u, head: map.get('lh:' + u) || null, log: map.get('lg:' + u) || null }));
  }
  /* Записи продаж по дням для резервной копии. */
  async reportsDump() {
    await this.ensureReports();
    const idx = (await this.st.get('rpx')) || [];
    const map = await this.getMany(idx.map(d => 'rp:' + d));
    const days = {};
    idx.forEach(d => { const v = map.get('rp:' + d); if (v) days[d] = v; });
    return { since: (await this.st.get('rp0')) || '', days };
  }
  /* Собирает файл выгрузки. kind: orders | clients | backup | catalog | report | debts | pick. Возвращает {name, bytes, mime, caption, n} или {err}. */
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
    if (kind === 'report') {
      const r = await this.report(Number(b && b.days));
      return { name: 'report-' + day + '.xlsx', bytes: xlsxBuild(reportSheets(r)), mime: XLSX_MIME, n: r.tot.n,
        caption: 'Отчёт за ' + r.days + ' дн.: заказов ' + r.tot.n + ', сумма ' + num(r.tot.sum) + ' сум. Откройте в Excel.' };
    }
    if (kind === 'debts') {
      // f: all — все записи, over — просроченные, fl — спорные
      const f = b && ['all', 'over', 'fl'].includes(b.f) ? b.f : 'all';
      const dl = await this.debtList();
      const list = dl.debtors.filter(x => f === 'all' || (f === 'over' ? x.bal > 0 && x.days > 0 : x.fl > 0));
      if (!list.length) return { err: 'empty' };
      const map = await this.getMany(list.map(x => 'lg:' + x.uid));
      const owe = list.filter(x => x.bal > 0);
      return { name: 'debts-' + day + '.xlsx', bytes: xlsxBuild(debtsSheets(list, list.map(x => map.get('lg:' + x.uid) || null))), mime: XLSX_MIME, n: list.length,
        caption: 'Долги (' + (f === 'over' ? 'просроченные' : f === 'fl' ? 'спорные' : 'все') + '): магазинов ' + list.length + ', должны ' + num(owe.reduce((t, x) => t + x.bal, 0)) + ' сум, просрочено ' + num(owe.reduce((t, x) => t + x.over, 0)) + ' сум. Откройте в Excel.' };
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
    const did = request.headers.get('x-did') || MAIN;
    this.did = validDid(did) ? did : MAIN;
    try {
      // служебные запросы площадки (Hub): снаружи до них не добраться, Worker такие пути не пропускает
      if (path.startsWith('/__/')) return await this.internal(request, path);
      // хранилище, которое площадка не создавала, ничего не отдаёт (так нельзя «наплодить» пустых дистрибьюторов)
      if (this.did !== MAIN && !(await this.isBorn())) return json({ error: 'no_shop' }, 404);
      if (path === '/webhook' && method === 'POST') return await this.webhook(request);
      if (path === '/setup') return await this.setup(request);
      if ((method === 'GET' || method === 'HEAD') && path.startsWith('/img/')) return await this.image(path.slice(5), new URL(request.url).searchParams.get('n'));
      if (path === '/api/config' && method === 'GET') return json({ cfg: await this.getCfg(), prod: await this.pubProd(await this.adminIn(request)), off: await this.isOff() });
      if (path.startsWith('/api/')) return await this.api(request, path, method);
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      console.error('shop error', path, e && e.stack || e);
      return json({ error: 'server' }, 500);
    }
  }

  async isBorn() {
    if (this.born === undefined) this.born = !!(await this.st.get('born'));
    return this.born;
  }
  async isOff() { return !!(await this.st.get('off')); }

  /* --- связь с площадкой --- */
  /* Краткая карточка дистрибьютора для списка: название, сколько товаров, категории, есть ли доставка. */
  async summary() {
    const cfg = await this.getCfg(), prod = await this.getProd();
    const ok = prod.items.filter(isApproved);   // в списке дистрибьюторов считаются только одобренные товары
    const cats = prod.cats.filter(c => ok.some(p => p.cat === c.id)).slice(0, 6).map(c => ({ name: c.name, uz: c.uz || '' }));
    return {
      name: cfg.shop.name || DEFAULT.shop.name, items: ok.length, wait: prod.items.filter(i => i.ms === 'wait').length, cats,
      delivery: cfg.shop.delivery !== false, minOrder: Number(cfg.shop.minOrder) || 0,
      regions: cleanRegions(cfg.shop.regions), home: cleanRegion(cfg.shop.home)
    };
  }
  /* Сообщает площадке о новом названии и составе каталога. Сбой не мешает продавцу: список обновится при следующем изменении. */
  async hubSync() {
    if (!this.env.HUB) return;
    try { await hubCall(this.env, '/__/sync', { did: this.did, summary: await this.summary() }); }
    catch (e) { console.error('hub sync failed', e && e.message || e); }
  }
  async hubOrdered(uid, prof) {
    if (!this.env.HUB) return;
    try { await hubCall(this.env, '/__/ordered', { did: this.did, uid, prof }); }
    catch (e) { console.error('hub ordered failed', e && e.message || e); }
  }
  async internal(request, path) {
    if (request.method !== 'POST') return json({ error: 'not_found' }, 404);
    // фото от владельца приходит байтами, остальное — JSON
    const raw = path === '/__/mod-photo';
    const r = raw ? { body: {} } : await this.readBody(request, 8000);
    const b = r.body && typeof r.body === 'object' ? r.body : {};
    if (path === '/__/init') {
      // площадка создаёт дистрибьютора: помечаем хранилище и ставим название
      const cfg = await this.getCfg();
      cfg.shop.name = cleanStr(b.name, 60) || DEFAULT.shop.name;
      const upd = { born: 1, cfg: sanitizeCfg(cfg) };
      const pct = b.pct === undefined ? null : cleanPct(b.pct);
      if (pct !== null) upd.cpct = pct;
      await this.st.put(upd);
      this.born = true;
      return json({ ok: true });
    }
    if (path === '/__/wipe') {
      // дистрибьютор удалён: хранилище очищается целиком (товары, фото, заказы, клиенты, настройки); у первого дистрибьютора так нельзя
      if (this.did === MAIN) return json({ error: 'forbidden' }, 403);
      await this.st.deleteAll();
      this.born = false;
      return json({ ok: true });
    }
    if (this.did !== MAIN && !(await this.isBorn())) return json({ error: 'no_shop' }, 404);
    if (path === '/__/mod-photo') return await this.modPhoto(request);
    if (path === '/__/summary') return json(await this.summary());
    if (path === '/__/clients') {
      // клиенты этого дистрибьютора: площадка один раз переносит их в общую базу магазинов
      await this.ensureClients();
      const idx = await this.clientsIdx(), map = await this.getMany(idx.map(x => 'c:' + x));
      return json({ clients: idx.map(x => map.get('c:' + x)).filter(Boolean).map(c => ({ uid: c.uid, name: c.name, phone: c.phone, org: c.org, addr: (c.addrs || [])[0] || '' })) });
    }
    if (path === '/__/mine') return json({ rows: await this.mineRows(b.items) });
    if (path === '/__/mine-ids') return json({ uids: await this.mineIds() });
    if (path === '/__/mine-set') return await this.mineSet(b);
    if (path === '/__/mine-orders') return json({ orders: await this.mineOrders(b.uids) });
    if (path === '/__/stats') return json(await this.commRange(String(b.from || ''), String(b.to || '')));
    if (path === '/__/analytics') {
      const ymd = /^\d{4}-\d\d-\d\d$/;
      if (!ymd.test(String(b.from)) || !ymd.test(String(b.to))) return json({ error: 'bad_request' }, 400);
      return json(await this.analytics(b.from, b.to));
    }
    if (path === '/__/cpct') {
      const pct = cleanPct(b.pct);
      if (pct === null) return json({ error: 'bad_pct' }, 400);
      await this.st.put('cpct', pct);
      return json({ ok: true, pct });
    }
    if (path === '/__/mod-list') return json(await this.modList(b.seg === 'ret' || b.seg === 'ok' ? b.seg : 'wait'));
    if (path === '/__/mod-approve') return await this.modApprove(b);
    if (path === '/__/mod-return') return await this.modReturn(b);
    if (path === '/__/mod-edit') return await this.modEdit(b);
    if (path === '/__/admins') return json({ admins: (await this.st.get('admins')) || [] });
    if (path === '/__/morning') return json(await this.morning(b.origin));
    if (path === '/__/admin-add') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      const admins = (await this.st.get('admins')) || [];
      if (!admins.includes(uid)) { admins.push(uid); await this.st.put('admins', admins); }
      return json({ ok: true, admins });
    }
    if (path === '/__/admin-clear') {
      const admins = (await this.st.get('admins')) || [];
      await this.st.put('admins', []);
      return json({ ok: true, removed: admins });
    }
    if (path === '/__/courier-of') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      const c = await this.courierOf(uid);
      return json({ courier: c ? { id: c.id, name: c.name } : null });
    }
    // вход доставщика по ссылке-приглашению: «/start c_<дистрибьютор>_<ключ>» разбирает площадка
    if (path === '/__/courier-join') {
      const uid = Number(b.uid), tok = String(b.token || '');
      if (!Number.isSafeInteger(uid) || !validTok(tok)) return json({ error: 'bad_request' }, 400);
      const id = await this.st.get('ct:' + tok), c = id ? await this.crGet(id) : null;
      if (!c) {
        const me = await this.courierOf(uid);      // ссылку нажали второй раз: уже вошёл, ничего не меняем
        return me ? json({ ok: true, courier: { id: me.id, name: me.name }, again: true }) : json({ error: 'bad_token' }, 404);
      }
      if (Date.now() - (Number(c.tokAt) || 0) > CINV_MS) return json({ error: 'expired' }, 410);
      const mine = await this.st.get('cru:' + uid);
      if (mine && mine !== c.id) return json({ error: 'already' }, 409);
      const upd = {}, del = ['ct:' + tok];
      if (c.uid && c.uid !== uid) del.push('cru:' + c.uid);       // новая ссылка передала место другому человеку
      c.uid = uid; c.tok = ''; c.tokAt = 0; c.on = true;
      upd['cr:' + c.id] = c; upd['cru:' + uid] = c.id;
      await this.st.put(upd);
      await this.st.delete(del);
      return json({ ok: true, courier: { id: c.id, name: c.name } });
    }
    if (path === '/__/off') { if (b.off) await this.st.put('off', 1); else await this.st.delete('off'); return json({ ok: true }); }
    if (path === '/__/my-debt') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      return json({ debt: await this.myDebt(uid, !!b.full) });
    }
    if (path === '/__/my-confirm') {
      const uid = Number(b.uid), n = Number(b.n);
      if (!Number.isSafeInteger(uid) || !Number.isInteger(n)) return json({ error: 'bad_request' }, 400);
      const res = await this.confirmRow(uid, n, !!b.ok);
      if (res.err) return json({ error: res.err }, res.err === 'not_found' ? 404 : 409);
      if (res.changed && !b.ok) await this.disputeNotify(uid, res.rows, res.hdr);
      return json({ ok: true, debt: await this.myDebt(uid, true) });
    }
    if (path === '/__/disputes') return json({ items: await this.disputes() });
    if (path === '/__/resolve' && b.cid) {
      const c = validCid(b.cid) ? await this.crGet(b.cid) : null;
      if (!c || !b.by || !Number.isSafeInteger(Number(b.by.id))) return json({ error: c ? 'bad_request' : 'not_found' }, c ? 400 : 404);
      return await this.handAct(c, 'resolve', { n: b.n, note: b.note }, { id: Number(b.by.id), first_name: String(b.by.first_name || ''), last_name: String(b.by.last_name || ''), username: String(b.by.username || '') });
    }
    if (path === '/__/resolve') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid) || !b.by || !Number.isSafeInteger(Number(b.by.id))) return json({ error: 'bad_request' }, 400);
      return await this.debtAct(uid, 'resolve', { n: b.n, note: b.note }, { id: Number(b.by.id), first_name: String(b.by.first_name || ''), last_name: String(b.by.last_name || ''), username: String(b.by.username || '') });
    }
    if (path === '/__/my-orders') {
      const uid = Number(b.uid);
      if (!Number.isSafeInteger(uid)) return json({ error: 'bad_request' }, 400);
      return json({ orders: await this.myOrders(uid) });
    }
    return json({ error: 'not_found' }, 404);
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

    if (path.startsWith('/api/courier/')) {
      const cour = await this.courierOf(uid);
      if (!cour) return json({ error: 'forbidden' }, 403);
      return await this.courierApi(request, path, method, u, cour);
    }
    if (path === '/api/bootstrap' && method === 'GET') {
      await this.ensureClients();
      const cl = await this.getClient(uid);
      return json({ did: this.did, off: await this.isOff(), cfg: await this.getCfg(), prod: await this.pubProd(admin), me: { id: uid, name: u.first_name || '', admin, courier: await this.courierMe(uid), profile: clientPublic(cl), blocked: !!(cl && cl.blocked), fav: await this.getFav(uid) }, orders: await this.myOrders(uid) });
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
        const raw = await this.getOrders(act.concat(hist));
        const orders = raw.map(adminOrder);
        // у заказов в работе показываем долг магазина: продавец видит его до выдачи
        const live = raw.map((o, i) => [o, i]).filter(([o]) => o.uid && NEXT[o.status]);
        if (live.length) {
          const heads = await this.getMany([...new Set(live.map(([o]) => o.uid))].map(u => 'lh:' + u));
          const today = dayOf(new Date().toISOString());
          live.forEach(([o, i]) => {
            const h = heads.get('lh:' + o.uid);
            if (h && h.bal > 0) { const d = lgDue(h.open, today); orders[i].debt = { bal: h.bal, over: d.over, days: d.days, due: d.due }; }
          });
        }
        const stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
        return json({ orders, stats });
      }
      if (path === '/api/admin/status' && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const res = await this.changeStatus(String(r.body.id || ''), String(r.body.to || ''), r.body.pay, null, { id: uid, name: whoName(u) });
        if (res.err) return json({ error: res.err, order: res.order ? adminOrder(res.order) : undefined }, res.err === 'not_found' ? 404 : res.err === 'bad_pay' ? 400 : 409);
        if (res.changed) { await this.afterChange(res.order, 'admin'); if (res.ask) await this.askConfirm(res.ask.uid, res.ask.n); }
        return json({ order: adminOrder(res.order), stats: res.stats || (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 } });
      }
      if (path === '/api/admin/config' && method === 'PUT') {
        const r = await this.readBody(request, 100000);
        if (r.err || !r.body) return json({ error: 'bad_request' }, 400);
        const cfg = sanitizeCfg(r.body.cfg);
        await this.st.put('cfg', cfg);
        await this.hubSync();
        return json({ cfg });
      }
      if (path === '/api/admin/products' && method === 'PUT') {
        const r = await this.readBody(request, PROD_BODY_MAX);
        if (r.err || !r.body) return json({ error: 'bad_request' }, r.err || 400);
        return await this.saveProd(r.body.prod, uid);
      }
      if (path === '/api/admin/submit' && method === 'POST') {
        const r = await this.readBody(request, 6000);
        if (r.err) return json({ error: 'bad_request' }, 400);
        return await this.modSubmit(r.body && typeof r.body === 'object' ? r.body : {});
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
          const dh = await this.st.get('lh:' + cuid);
          if (dh && (dh.bal !== 0 || (dh.fl || 0) > 0 || (dh.cwt || []).length)) return json({ error: 'has_debt' }, 409);
          const idx = await this.clientsIdx();
          await this.st.put('cx', idx.filter(x => x !== cuid));
          await this.st.delete('c:' + cuid);
          return json({ ok: true });
        }
      }
      if (path === '/api/admin/couriers' || path.startsWith('/api/admin/couriers/')) return await this.adminCouriers(request, path, method, uid, u);
      if (path === '/api/admin/debts' && method === 'GET') return json(await this.debtList());
      if (path === '/api/admin/debts/morning' && method === 'POST') {
        const r = await this.readBody(request, 500);
        if (r.err || !r.body || typeof r.body.on !== 'boolean') return json({ error: 'bad_request' }, 400);
        if (r.body.on) await this.st.delete('mrn'); else await this.st.put('mrn', 0);
        return json({ ok: true, morning: r.body.on });
      }
      if (path === '/api/admin/disputes' && method === 'GET') return json({ items: await this.disputes() });
      const dm = path.match(/^\/api\/admin\/debts\/(\d{1,15})(?:\/(pay|void|remind|resolve|act))?$/);
      if (dm) {
        const duid = Number(dm[1]);
        if (!dm[2] && method === 'GET') return await this.debtOne(duid);
        if (dm[2] && method === 'POST') {
          const r = await this.readBody(request, 2000);
          if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
          return await this.debtAct(duid, dm[2], r.body, u);
        }
      }
      if (path === '/api/admin/report' && method === 'GET') {
        return json({ report: await this.report(Number(new URL(request.url).searchParams.get('days'))) });
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
      if (path === '/api/admin/import' && method === 'POST') return await this.importPrice(request, new URL(request.url).searchParams.get('apply') === '1', uid);
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
        // ?n=1..3 — какое по счёту фото; без n это первое (так работало, пока фото было одно)
        const rawN = new URL(request.url).searchParams.get('n');
        const n = rawN === null ? 1 : Number(rawN);
        if (!Number.isInteger(n) || n < 1 || n > PHOTOS_MAX) return json({ error: 'bad_slot' }, 400);
        if (method === 'DELETE') return await this.setPhoto(id, null, n);
        // фото приходит как есть, байтами (JPEG), без base64: так сервер почти ничего не считает
        if (Number(request.headers.get('content-length') || 0) > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        const bytes = new Uint8Array(await request.arrayBuffer());
        if (bytes.length > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
        if (!checkJpeg(bytes, PROD_PHOTO_LIM)) return json({ error: 'bad_photo' }, 400);
        return await this.setPhoto(id, bytes, n);
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
    await this.hubProfile(u.id, c);
    return json({ profile: clientPublic(c) });
  }
  /* Магазин заполнил профиль: он попадает в общую базу и без заказа (если там его ещё нет). */
  async hubProfile(uid, c) {
    if (!this.env.HUB) return;
    const name = cleanStr(c.org, 60) || cleanStr(c.name, 60);
    if (name.length < 2 || !phoneOk(String(c.phone || ''))) return;
    try { await hubCall(this.env, '/__/profile', { did: this.did, uid, prof: { name: c.name, phone: c.phone, org: c.org, addr: (c.addrs || [])[0] || '' } }); }
    catch (e) { console.error('hub profile failed', e && e.message || e); }
  }

  /* --- клиенты в общей базе: данные дистрибьютора о магазине (площадка спрашивает их только у самого дистрибьютора) ---
     Заметка и группа лежат по номеру магазина в базе (bn:<номер>), поэтому их можно вести и у магазина, который ещё не заходил в приложение.
     Если у магазина есть запись клиента c:<uid>, заметка и группа дублируются и туда: так они попадают в карточку заказа в Telegram.
     Блокировка живёт только в c:<uid>: она нужна при оформлении заказа. */
  mineUids(x) { return (Array.isArray(x && x.uids) ? x.uids : []).slice(0, 10).map(Number).filter(Number.isSafeInteger); }
  async mineRows(items) {
    await this.ensureClients();
    const list = (Array.isArray(items) ? items : []).slice(0, 60).filter(x => x && typeof x.bid === 'string' && /^b[a-z0-9]{4,12}$/.test(x.bid));
    const uids = [...new Set(list.flatMap(x => this.mineUids(x)))];
    const cm = await this.getMany(uids.map(u => 'c:' + u));
    const bm = await this.getMany(list.map(x => 'bn:' + x.bid));
    return list.map(x => mineRow(x.bid, this.mineUids(x).map(u => cm.get('c:' + u)).filter(Boolean), bm.get('bn:' + x.bid)));
  }
  /* Номера клиентов, которые заказывали у этого дистрибьютора (не считая отменённых). */
  async mineIds() {
    await this.ensureClients();
    const idx = await this.clientsIdx(), map = await this.getMany(idx.map(x => 'c:' + x));
    return idx.filter(x => { const c = map.get('c:' + x); return c && c.n > 0; });
  }
  async mineSet(b) {
    await this.ensureClients();
    const bid = typeof b.bid === 'string' && /^b[a-z0-9]{4,12}$/.test(b.bid) ? b.bid : '';
    if (!bid) return json({ error: 'bad_request' }, 400);
    const uids = this.mineUids(b);
    const v = cleanClient({ note: b.note, grp: b.grp, blocked: b.blocked }, true);
    if (v.err) return json({ error: v.err }, 400);
    const cs = (await Promise.all(uids.map(u => this.getClient(u)))).filter(Boolean);
    if (v.v.blocked !== undefined && !cs.length) return json({ error: 'no_client' }, 409);
    const upd = {};
    if (v.v.note !== undefined || v.v.grp !== undefined) {
      const bn = (await this.st.get('bn:' + bid)) || { note: '', grp: '' };
      if (v.v.note !== undefined) bn.note = v.v.note;
      if (v.v.grp !== undefined) bn.grp = v.v.grp;
      upd['bn:' + bid] = bn;
    }
    for (const c of cs) { Object.assign(c, v.v); upd['c:' + c.uid] = c; }
    if (Object.keys(upd).length) await this.st.put(upd);
    return json({ row: (await this.mineRows([{ bid, uids }]))[0] });
  }
  /* Последние заказы магазина у этого дистрибьютора. */
  async mineOrders(uids) {
    const ids = [];
    for (const u of this.mineUids({ uids })) for (const id of (await this.st.get('m:' + u)) || []) if (!ids.includes(id)) ids.push(id);
    const orders = await this.getOrders(ids);
    return orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30).map(adminOrder);
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
    if (await this.isOff()) return json({ error: 'shop_off' }, 403);
    await this.ensureClients();
    const cl0 = await this.getClient(u.id);
    if (cl0 && cl0.blocked) return json({ error: 'blocked' }, 403);
    const cfg = await this.getCfg();
    const prod = await this.getProd();
    const stk = await this.getStk();
    const v = validateOrder(body, cfg, prod, stk);
    if (v.err) {
      const fresh = v.err === 'unavailable' || v.err === 'no_delivery' || v.err === 'no_region' || v.err === 'region_need' || v.err === 'stock' || v.err === 'min_order';
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
    if (v.mode === 'delivery' && v.region) order.region = v.region;
    if (v.loc) order.loc = v.loc;   // только в заказе: в базу магазинов точка попадает после подтверждения агентом
    if (v.fee > 0 || v.disc > 0) order.sub = v.sub;
    if (v.disc > 0) { order.disc = v.disc; order.dpct = v.dpct; }
    if (v.fee > 0) order.fee = v.fee;
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
    await this.hubOrdered(uid, { name: order.name, phone: order.phone, org: order.org || '', addr: order.mode === 'delivery' ? order.address : '', terr: cleanStr(body.form.terr, 12), loc: order.loc });

    // уведомления: ошибки Telegram не должны ломать приём заказа
    const sent = [];
    const card = adminCard(order, cfg.shop, this.origin, false, cl, this.did, await this.st.get('lh:' + uid));
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
    await this.tg('sendMessage', { chat_id: uid, text: customerText(order, 'placed', cfg.shop), reply_markup: openBtn(this.origin, order.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
    await this.stockAlert(low);
    return json({ order: publicOrder(order) });
  }

  /* --- каталог --- */
  async saveProd(input, uid) { return json({ prod: await this.applyProd(input, uid) }); }
  /* Владелец площадки? Без площадки (одиночный магазин) продавец и есть владелец. */
  async isOwnerUid(uid) {
    if (!this.env.HUB) return true;
    try { const r = await hubCall(this.env, '/__/is-owner', { uid }); return !!(r && r.owner); } catch (e) { return false; }
  }
  /* Сохраняет каталог целиком (его присылает приложение или прайс) и возвращает его продавцу с метками проверки.
     Новые товары продавца начинаются черновиками (из прайса — сразу «ждёт проверки»), у владельца — сразу одобренными. */
  async applyProd(input, uid, newState) {
    const old = await this.getProd();
    const oldIds = new Set(old.items.map(i => i.id));
    const hasNew = normProd(input).items.some(o => !(validId(o.id) && oldIds.has(o.id)));
    const mod = hasNew && !(await this.isOwnerUid(uid)) ? { state: newState || 'draft', at: new Date().toISOString() } : null;
    const prod = sanitizeProd(input, old, mod);
    const keep = new Set(prod.items.map(i => i.id));
    const gone = old.items.map(i => i.id).filter(id => !keep.has(id));
    const stk = await this.getStk();
    const upd = { prod };
    if (gone.some(id => stk[id])) { gone.forEach(id => { delete stk[id]; }); upd.stk = stk; }   // остаток удалённого товара не копим
    await this.st.put(upd);
    if (gone.length) await this.st.delete(gone.flatMap(id => [1, 2, 3].map(n => photoKey(id, n))));   // фото удалённых товаров не копим
    await this.hubSync();
    if (mod && mod.state === 'wait') {
      const fresh = prod.items.filter(i => i.ms === 'wait' && !oldIds.has(i.id));
      if (fresh.length) await this.modNotifyOwner(fresh.length);
    }
    return publicProd(prod, stk, true);
  }
  /* Продавец отправляет новые (или возвращённые) товары на проверку. ids — какие; без них — все черновики и возвращённые.
     Нужны название, цена и категория: у остальных в ответе bad (что исправить), они остаются как были. */
  async modSubmit(b) {
    const prod = await this.getProd();
    const want = Array.isArray(b.ids) ? new Set(b.ids.filter(validId)) : null;
    const sent = [], bad = [], now = new Date().toISOString();
    for (const it of prod.items) {
      if ((it.ms !== 'draft' && it.ms !== 'ret') || (want && !want.has(it.id))) continue;
      const why = modProblems(it, prod.cats);
      if (why.length) { bad.push({ id: it.id, why }); continue; }
      it.ms = 'wait'; it.mt = now; delete it.mc;
      sent.push(it);
    }
    if (!sent.length) return json({ error: 'nothing', bad }, 400);
    await this.st.put('prod', prod);
    await this.hubSync();
    await this.modNotifyOwner(sent.length);
    return json({ prod: publicProd(prod, await this.getStk(), true), sent: sent.length, bad });
  }
  /* Один раз на отправку: владельцу уходит «Дистрибьютор: на проверке N товаров» с кнопкой в раздел проверки. */
  async modNotifyOwner(n) {
    if (!this.env.HUB || !(n > 0)) return;
    try { await hubCall(this.env, '/__/mod-notify', { did: this.did, n, origin: this.origin }); }
    catch (e) { console.error('mod notify failed', e && e.message || e); }
  }
  /* Сообщение продавцам этого дистрибьютора (одобрили или вернули). */
  async modTellSellers(text, origin) {
    const url = /^https:\/\/(?!internal)/.test(origin || '') ? origin : '';
    for (const aid of (await this.st.get('admins')) || []) {
      try { await this.tg('sendMessage', Object.assign({ chat_id: aid, text }, url ? { reply_markup: openBtn(url, 'Открыть товары', sellerUrl(url, this.did)) } : {})); }
      catch (e) { console.error('mod tell failed', e && e.message || e); }
    }
  }
  /* Владелец: список товаров по статусам. seg: wait, ret или ok (одобренные через проверку). Ответ — вместе с числами по всем трём. */
  async modList(seg) {
    const prod = await this.getProd();
    const cat = new Map(prod.cats.map(c => [c.id, c]));
    const counts = { wait: 0, ret: 0, ok: 0 };
    prod.items.forEach(i => { if (i.ms === 'wait') counts.wait++; else if (i.ms === 'ret') counts.ret++; else if (!i.ms && i.ma) counts.ok++; });
    const pick = i => seg === 'ok' ? (!i.ms && i.ma) : i.ms === seg;
    const rows = prod.items.filter(pick).sort((a, b) => String(b.ma || b.mt || '').localeCompare(String(a.ma || a.mt || ''))).slice(0, 150)
      .map(i => Object.assign({}, i, { catName: (cat.get(i.cat) || {}).name || '', catUz: (cat.get(i.cat) || {}).uz || '' }));
    return { items: rows, counts, name: (await this.getCfg()).shop.name || '', cats: prod.cats };
  }
  async modApprove(b) {
    const prod = await this.getProd(), ids = new Set((Array.isArray(b.ids) ? b.ids : []).filter(validId));
    const done = [], now = new Date().toISOString();
    for (const it of prod.items) {
      if (!ids.has(it.id) || (it.ms !== 'wait' && it.ms !== 'ret')) continue;
      delete it.ms; delete it.mt; delete it.mc; it.ma = now;
      done.push(it);
    }
    if (done.length) {
      await this.st.put('prod', prod);
      await this.hubSync();
      const names = done.slice(0, 8).map(i => '• ' + i.name).join('\n') + (done.length > 8 ? '\n… и ещё ' + (done.length - 8) : '');
      await this.modTellSellers(done.length === 1 ? '✅ Товар «' + done[0].name + '» одобрен и появился в каталоге.' : '✅ Одобрено: ' + ruTovar(done.length) + '. Они появились в каталоге.\n' + names, b.origin);
    }
    return json({ ok: true, n: done.length });
  }
  async modReturn(b) {
    const reason = cleanStr(b.reason, MOD_REASON_MAX, true);
    if (!validId(b.id) || !reason) return json({ error: 'bad_request' }, 400);
    const prod = await this.getProd(), it = prod.items.find(x => x.id === b.id);
    if (!it) return json({ error: 'not_found' }, 404);
    if (it.ms !== 'wait' && it.ms !== 'ret') return json({ error: 'not_pending' }, 409);
    it.ms = 'ret'; it.mt = new Date().toISOString(); it.mc = reason; delete it.ma;
    await this.st.put('prod', prod);
    await this.hubSync();
    await this.modTellSellers('↩️ Товар «' + it.name + '» возвращён на доработку.\nЧто исправить: ' + reason + '\nОткройте «Продавец» → «Каталог», исправьте и отправьте снова.', b.origin);
    return json({ ok: true });
  }
  /* Владелец правит товар сам (текст, цена, упаковка); статус проверки при этом не меняется. */
  async modEdit(b) {
    if (!validId(b.id) || !b.item || typeof b.item !== 'object') return json({ error: 'bad_request' }, 400);
    const old = await this.getProd();
    if (!old.items.some(x => x.id === b.id)) return json({ error: 'not_found' }, 404);
    const F = ['name', 'uz', 'desc', 'descUz', 'cat', 'amount', 'unit', 'price', 'tiers', 'blk', 'box', 'tag', 'old'];
    const patch = {};
    F.forEach(k => { if (b.item[k] !== undefined) patch[k] = b.item[k]; });
    const prod = sanitizeProd({ cats: old.cats, items: old.items.map(x => x.id === b.id ? Object.assign({}, x, patch) : x) }, old);
    await this.st.put('prod', prod);
    await this.hubSync();
    return json({ item: prod.items.find(x => x.id === b.id) });
  }
  /* Фото товара от владельца (через площадку): то же, что у продавца, с теми же проверками. del=1 — убрать. */
  async modPhoto(request) {
    const q = new URL(request.url).searchParams, id = q.get('id') || '', n = Number(q.get('n') || 1);
    if (!validId(id)) return json({ error: 'not_found' }, 404);
    if (!Number.isInteger(n) || n < 1 || n > PHOTOS_MAX) return json({ error: 'bad_slot' }, 400);
    if (q.get('del') === '1') return await this.setPhoto(id, null, n);
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.length > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
    if (!checkJpeg(bytes, PROD_PHOTO_LIM)) return json({ error: 'bad_photo' }, 400);
    return await this.setPhoto(id, bytes, n);
  }
  /* Прайс из Excel: apply=false только показывает, что изменится; apply=true записывает. */
  async importPrice(request, apply, uid) {
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
    if (apply && plan.changes.length) { out.prod = await this.applyProd(plan.prod, uid, 'wait'); out.applied = true; }   // новые строки прайса сразу идут на проверку
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
      // количество можно прислать в упаковках: u = 'box' (коробки) или 'blk' (блоки), n — их число; на склад идут штуки
      let nIn = b.n;
      if (b.u !== undefined && b.u !== null && b.u !== 'pc') {
        const size = b.u === 'box' || b.u === 'blk' ? packSize(it, b.u) : 0;
        if (!size) return json({ error: 'no_pack' }, 400);
        if (typeof b.n !== 'number' || !Number.isInteger(b.n) || b.n < 0 || b.n > MAX_STOCK) return json({ error: 'bad_request' }, 400);
        nIn = b.n * size;
      }
      const n = intIn(nIn, b.op === 'in' ? 1 : 0, MAX_STOCK);
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
  /* Кладёт фото под номером n (замена или добавление в конец) или убирает его, а следующие сдвигает на одно место вперёд.
     Номер больше «сколько есть + 1» нельзя: фото идут подряд. Ответ: версии всех трёх мест (пустая строка, если места нет). */
  async setPhoto(id, bytes, n) {
    n = n || 1;
    const prod = await this.getProd();
    const it = prod.items.find(x => x.id === id);
    if (!it) return json({ error: 'not_found' }, 404);
    const vers = photoVers(it);
    const put = {}, del = [];
    if (bytes) {
      if (n > vers.length + 1) return json({ error: 'bad_slot' }, 400);
      vers[n - 1] = randId(6);
      put[photoKey(id, n)] = bytes;
    } else if (n <= vers.length) {
      for (let i = n; i < vers.length; i++) {
        // фото i+1 переезжает на место i, под новой версией, чтобы адрес в кэше не совпал ни с каким прежним
        put[photoKey(id, i)] = await this.st.get(photoKey(id, i + 1));
        vers[i - 1] = randId(6);
      }
      del.push(photoKey(id, vers.length));
      vers.length--;
    }
    it.pv = vers[0] || ''; it.pv2 = vers[1] || ''; it.pv3 = vers[2] || '';
    await this.st.put(Object.assign(put, { prod }));
    if (del.length) await this.st.delete(del);
    return json({ pv: it.pv, pv2: it.pv2, pv3: it.pv3 });
  }
  /* Фото товара: открыто всем, как обычная картинка в каталоге. Адрес с ?v= меняется вместе с фото, поэтому кэш вечный.
     ?n=2 и ?n=3 — второе и третье фото; без n это первое. */
  async image(id, n) {
    if (!validId(id)) return new Response('not found', { status: 404 });
    const k = Number(n);
    const bytes = await this.st.get(photoKey(id, Number.isInteger(k) && k >= 1 && k <= PHOTOS_MAX ? k : 1));
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
  async changeStatus(id, to, pay, cour, by) {
    await this.ensureClients();
    await this.ensureReports();
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.status === to) return { order: o, same: true };
    if (!(NEXT[o.status] || []).includes(to)) return { err: 'bad_transition', order: o };
    // доставщик закрывает только свой заказ на доставку
    if (cour && (o.mode !== 'delivery' || o.cr !== cour.id || to !== 'done')) return { err: 'not_yours', order: o };
    const nowIso = new Date().toISOString();
    const payRec = to === 'done' ? cleanPay(pay, Number(o.total) || 0, dayOf(nowIso)) : null;
    if (to === 'done' && !payRec) return { err: 'bad_pay', order: o };
    o.status = to;
    o.statusAt = nowIso;
    const upd = { ['o:' + id]: o };
    let stats = null, ask = null;
    if (!NEXT[to]) {
      const act = ((await this.st.get('act')) || []).filter(x => x !== id);
      const hist = ((await this.st.get('hist')) || []).filter(x => x !== id);
      hist.unshift(id);
      upd.act = act;
      upd.hist = hist.slice(0, HIST_CAP);
      stats = (await this.st.get('stats')) || { doneSum: 0, doneCount: 0 };
      if (to === 'done') { stats.doneSum += Number(o.total) || 0; stats.doneCount += 1; }
      upd.stats = stats;
      // отчёты: выданный заказ добавляется в запись своего дня
      if (to === 'done') {
        const day = dayOf(o.statusAt);
        const rp = (await this.st.get('rp:' + day)) || newRp();
        rpAdd(rp, o, await this.getPct(), await this.catOf());
        upd['rp:' + day] = rp;
        const idx = (await this.st.get('rpx')) || [];
        if (!idx.includes(day)) {
          idx.push(day); idx.sort();
          const drop = idx.splice(0, Math.max(0, idx.length - RP_KEEP));
          if (drop.length) await this.st.delete(drop.map(d => 'rp:' + d));
          upd.rpx = idx;
        }
      }
      // оплата: как заплатил магазин; выдача в долг (и часть, оплаченная сразу) попадает в журнал расчётов
      if (to === 'done') {
        o.pay = payRec;
        const total = Number(o.total) || 0;
        if (payRec.m === 'credit' && o.uid && total > 0) {
          // кто записал; магазин подтверждает запись в Telegram (cf «wait»)
          const mk = r => Object.assign(r, { by: by ? by.id : 0, bn: by ? by.name : '', cf: 'wait' }, cour ? { cid: cour.id } : {});
          const adds = [mk({ k: 'ch', d: total, a: total, ref: o.id, due: payRec.due })];
          if (payRec.paid) adds.push(mk({ k: 'pay', d: -payRec.paid, a: payRec.paid, m: payRec.pm, ref: o.id }));
          if (cour && payRec.paid && payRec.pm !== 'cash') adds[1].vr = 'wait';
          const snap = {};
          if (o.name) snap.name = o.name;
          if (o.org) snap.org = o.org;
          if (o.phone) snap.phone = o.phone;
          if (o.mode === 'delivery' && o.address) snap.addr = o.address;
          if (o.lang) snap.lang = o.lang;
          const lr = await this.lgAdd(o.uid, adds, snap);
          Object.assign(upd, lr.put);
          ask = { uid: o.uid, n: lr.ns[0], pn: payRec.paid && cour && payRec.pm !== 'cash' ? lr.ns[1] : 0 };
        }
        // наличные, которые доставщик принял у клиента, оседают в его кассе до сдачи продавцу
        if (cour) {
          const cashIn = payRec.m === 'cash' ? total : payRec.m === 'credit' && payRec.pm === 'cash' ? (payRec.paid || 0) : 0;
          // карта и перечисление не попадают в наличные доставщика: они ждут сверки продавцом с банком
          const nvIn = payRec.m === 'card' || payRec.m === 'bank' ? total : payRec.m === 'credit' && payRec.paid && payRec.pm !== 'cash' ? payRec.paid : 0;
          const c = cashIn > 0 || nvIn > 0 ? await this.crGet(cour.id) : null;
          if (c && cashIn > 0) Object.assign(upd, await this.crAdd(c, [{ k: 'in', d: cashIn, a: cashIn, o: o.id, nm: o.name || '' }]));
          else if (c) {
            const nm = payRec.m === 'credit' ? payRec.pm : payRec.m;
            this.nvAdd(c, Object.assign({ k: 'o', a: nvIn, m: nm, o: o.id, nm: o.name || '' }, ask && ask.pn ? { uid: o.uid, n: ask.pn } : {}));
            Object.assign(upd, await this.crAdd(c, [{ k: 'nv', d: 0, a: nvIn, m: nm, o: o.id, nm: o.name || '' }]));
          }
        }
      }
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
    return { order: o, changed: true, stats: stats || undefined, ask: ask || undefined };
  }

  /* --- доставка: доставщики, «Взял», касса наличных --- */
  async crList() {
    const idx = (await this.st.get('crx')) || [];
    const map = await this.getMany(idx.map(i => 'cr:' + i));
    return idx.map(i => map.get('cr:' + i)).filter(Boolean);
  }
  async crGet(id) { const c = validCid(id) ? await this.st.get('cr:' + id) : null; return c && typeof c === 'object' ? c : null; }
  /* Доставщик по номеру в Telegram: только тот, кто вошёл по ссылке и не отключён. */
  async courierOf(uid) {
    const id = await this.st.get('cru:' + uid);
    const c = id ? await this.crGet(id) : null;
    return c && c.uid === uid && c.on !== false ? c : null;
  }
  async botUser() {
    if (!this.botun) {
      this.botun = (await this.st.get('botun')) || '';
      if (!this.botun) {
        const me = await this.tg('getMe', {});
        if (me.ok && me.result && me.result.username) { this.botun = String(me.result.username); await this.st.put('botun', this.botun); }
      }
    }
    return this.botun;
  }
  async courierMe(uid) { const c = await this.courierOf(uid); return c ? { id: c.id, name: c.name, credit: c.credit !== false } : null; }
  async crOut(c) {
    const o = crPub(c);
    const fresh = c.tok && Date.now() - (Number(c.tokAt) || 0) < CINV_MS;
    const b = fresh ? await this.botUser() : '';
    o.link = fresh && b ? 'https://t.me/' + b + '?start=c_' + this.did + '_' + c.tok : '';
    return o;
  }
  async crDetail(c) {
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [] };
    return { courier: await this.crOut(c), rows: this.crRows(lg), nv: (c.nv || []).slice().reverse() };
  }
  /* Строки кассы для показа, новые сверху: последние CC_SHOW и все открытые вопросы по сдаче. Закрытие вопроса и отмена сдачи приклеены к своей строке. */
  crRows(lg) {
    const now = Date.now(), all = lg.rows;
    const hr = new Map(all.filter(r => r.k === 'hr').map(r => [r.of, r])), ox = new Map(all.filter(r => r.k === 'ox').map(r => [r.of, r]));
    return all.slice(0, -CC_SHOW).filter(hOpen).concat(all.slice(-CC_SHOW)).filter(r => r.k !== 'hr').map(r => {
      const x = Object.assign({}, r);
      if (r.k === 'out' || r.k === 'ox') {
        if (hOpen(r) && r.cf === 'wait' && now - Date.parse(r.t) > CF_LATE) x.late = true;
        const h = hr.get(r.n), v = ox.get(r.n);
        if (h) x.rsl = { bn: h.bn || '', why: h.why || '', t: h.t };
        if (v) { x.vwhy = v.why || ''; x.vbn = v.bn || ''; }
      }
      return x;
    }).reverse();
  }
  /* Касса доставщика целиком: то, что видит он сам. */
  async courierCash(c) {
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [] };
    return { cash: Number(c.cash) || 0, lim: Number(c.lim) || 0, dl: crDl(c), cs: c.cs || '', late: crLate(c, Date.now()), hf: crHf(c, Date.now()), ask: crAsk(c), rows: this.crRows(lg), nv: (c.nv || []).slice().reverse() };
  }
  /* Дописывает строки в кассу доставщика и меняет остаток. Сам ничего не сохраняет: вызывающий кладёт put вместе со своими правками. */
  async crAdd(c, adds) {
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [], seq: 0 };
    const now = new Date().toISOString();
    adds.forEach(a => { lg.seq += 1; lg.rows.push(Object.assign({ n: lg.seq, t: now }, a)); c.cash = (Number(c.cash) || 0) + a.d; });
    return crSave(c, lg);
  }
  /* Что видит доставщик: заказы на доставку, готовые к выезду (свободные и свои), и свои выданные сегодня. */
  async courierOrders(cour) {
    const act = (await this.st.get('act')) || [], hist = ((await this.st.get('hist')) || []).slice(0, 60);
    const del = (await this.getOrders(act)).filter(o => o.mode === 'delivery');
    const today = dayOf(new Date().toISOString());
    const done = (await this.getOrders(hist)).filter(o => o.status === 'done' && o.mode === 'delivery' && o.cr === cour.id && dayOf(o.statusAt) === today);
    const list = del.filter(o => o.status === 'ready').concat(done);
    const heads = await this.getMany([...new Set(list.map(o => o.uid).filter(Boolean))].map(u => 'lh:' + u));
    const orders = list.map(o => {
      const x = this.cview(o, cour);
      const h = o.status === 'ready' && o.uid ? heads.get('lh:' + o.uid) : null;
      if (h && h.bal > 0) { const d = lgDue(h.open, today); x.debt = { bal: h.bal, over: d.over, days: d.days, due: d.due, uid: o.uid }; }
      return x;
    });
    return { orders, soon: del.filter(o => o.status === 'accepted').length, cash: Number(cour.cash) || 0, lim: Number(cour.lim) || 0, nvn: (cour.nv || []).length, dl: crDl(cour), late: crLate(cour, Date.now()), hf: crHf(cour, Date.now()), ask: crAsk(cour) };
  }
  cview(o, cour) { const x = adminOrder(o); x.mine = o.cr === cour.id; return x; }
  async courierTake(cour, id) {
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.mode !== 'delivery' || o.status !== 'ready') return { err: 'bad_transition', order: o };
    if (o.cr === cour.id) return { order: o, same: true };
    if (o.cr) return { err: 'taken', order: o };
    // наличных на руках больше лимита или не сверено слишком много безнала: сначала сдать деньги
    if (cour.lim > 0 && (Number(cour.cash) || 0) >= cour.lim) return { err: 'cash_limit', order: o, cash: Number(cour.cash) || 0, lim: cour.lim };
    if ((cour.nv || []).length >= NV_MAX) return { err: 'nv_full', order: o };
    // деньги не сданы в срок: сначала сдать
    const late = crLate(cour, Date.now());
    if (late > 0) return { err: 'cash_late', order: o, cash: Number(cour.cash) || 0, late };
    o.cr = cour.id; o.crn = cour.name; o.crAt = new Date().toISOString();
    if (cour.phone) o.crp = cour.phone;
    await this.st.put('o:' + id, o);
    return { order: o, changed: true };
  }
  async courierRelease(cour, id) {
    const o = await this.st.get('o:' + id);
    if (!o) return { err: 'not_found' };
    if (o.cr !== cour.id || o.status !== 'ready') return { err: 'not_yours', order: o };
    delete o.cr; delete o.crn; delete o.crAt; delete o.crp;
    await this.st.put('o:' + id, o);
    return { order: o, changed: true };
  }
  /* Заказ взяли: карточки продавцов и сообщения других доставщиков обновляются, клиент узнаёт, кто везёт. */
  async afterTake(o) {
    const cfg = await this.getCfg();
    await this.afterChange(o, null);
    for (const m of o.cm || []) {
      const card = courierCard(o, cfg.shop, this.origin, this.did, m.cid === o.cr ? 'mine' : o.crn);
      await this.editCard(m, card);
    }
    await this.tg('sendMessage', { chat_id: o.uid, text: customerText(o, 'taken', cfg.shop), reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
  }
  /* Заказ вернули в свободные: сообщения доставщиков снова с кнопкой «Взял», продавцы видят, что доставщика нет. */
  async afterRelease(o, byId) {
    const cfg = await this.getCfg();
    await this.afterChange(o, null);
    for (const m of o.cm || []) await this.editCard(m, courierCard(o, cfg.shop, this.origin, this.did, null));
    await this.notifyCouriers(o, cfg, byId, true);
  }
  /* Готовый заказ на доставку приходит всем доставщикам с кнопкой «Взял»; номера сообщений запоминаются, чтобы потом обновить. */
  async notifyCouriers(o, cfg, except, again) {
    const list = (await this.crList()).filter(c => c.uid && c.on !== false && c.id !== except);
    if (!list.length) return;
    const sent = [];
    for (const c of list) {
      if (again && (o.cm || []).some(m => m.cid === c.id)) continue;   // у него сообщение уже есть и обновлено
      const card = courierCard(o, cfg.shop, this.origin, this.did, null);
      const t = await this.tg('sendMessage', { chat_id: c.uid, text: card.text, reply_markup: card.reply_markup });
      if (t.ok && t.result) sent.push({ chat_id: c.uid, message_id: t.result.message_id, cid: c.id });
    }
    if (sent.length) {
      const cur = await this.st.get('o:' + o.id);
      if (cur) { cur.cm = (cur.cm || []).concat(sent); await this.st.put('o:' + o.id, cur); }
    }
  }
  /* Нажатие «Взял» под сообщением в чате доставщика. */
  async onCourierCb(cq, p, answer) {
    const cour = cq.from ? await this.courierOf(cq.from.id) : null;
    if (!cour) return answer('Нет доступа', true);
    const cfg = await this.getCfg();
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const res = await this.courierTake(cour, p.id);
    if (res.err === 'not_found') return answer('Заказ не найден', true);
    if (res.err === 'taken') {
      if (here) await this.editCard(here, courierCard(res.order, cfg.shop, this.origin, this.did, res.order.crn));
      return answer('Заказ уже взял ' + res.order.crn, true);
    }
    if (res.err === 'cash_limit') return answer('Сначала сдайте деньги продавцу: на руках ' + money(res.cash) + ', лимит ' + money(res.lim), true);
    if (res.err === 'nv_full') return answer('Сначала покажите продавцу оплаты картой и переводом на сверку', true);
    if (res.err === 'cash_late') return answer('Сначала сдайте деньги продавцу: на руках ' + money(res.cash) + ', просрочка ' + res.late + ' дн.', true);
    if (res.err) return answer('Этот заказ уже не ждёт доставки', true);
    if (res.changed) await this.afterTake(res.order);
    else if (here) await this.editCard(here, courierCard(res.order, cfg.shop, this.origin, this.did, 'mine'));
    return answer('Вы взяли заказ ' + p.id);
  }
  /* API доставщика: заказы, «Взял», выдача с оплатой, должники, касса. */
  async courierApi(request, path, method, u, cour) {
    const uid = u.id;
    if (path === '/api/courier/orders' && method === 'GET') return json(await this.courierOrders(cour));
    if (path === '/api/courier/cash' && method === 'GET') return json(await this.courierCash(cour));
    // ответ доставщика в приложении на «Продавец записал сдачу»: то же, что кнопки в Telegram
    if (path === '/api/courier/confirm' && method === 'POST') {
      const r = await this.readBody(request, 500);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const n = Number(r.body.n), res = Number.isInteger(n) ? await this.handConfirm(cour, n, !!r.body.ok) : { err: 'not_found' };
      if (res.err) return json({ error: res.err }, res.err === 'not_found' ? 404 : 409);
      if (res.changed && !r.body.ok) await this.handDisputeNotify(cour, res.row);
      return json(await this.courierCash(cour));
    }
    if (path === '/api/courier/debts' && method === 'GET') return json(await this.debtList());
    const dm = path.match(/^\/api\/courier\/debts\/(\d{1,15})(?:\/(pay|remind))?$/);
    if (dm) {
      const duid = Number(dm[1]);
      if (!dm[2] && method === 'GET') return await this.debtOne(duid);
      if (dm[2] && method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        return await this.debtAct(duid, dm[2], r.body, u, cour);
      }
    }
    const om = path.match(/^\/api\/courier\/(take|release|done)$/);
    if (om && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const id = String(r.body.id || '');
      if (om[1] === 'take') {
        const res = await this.courierTake(cour, id);
        if (res.err) return json({ error: res.err, order: res.order ? this.cview(res.order, cour) : undefined, cash: res.cash, lim: res.lim, late: res.late }, res.err === 'not_found' ? 404 : 409);
        if (res.changed) await this.afterTake(res.order);
        return json({ order: this.cview(res.order, cour) });
      }
      if (om[1] === 'release') {
        const res = await this.courierRelease(cour, id);
        if (res.err) return json({ error: res.err, order: res.order ? this.cview(res.order, cour) : undefined }, res.err === 'not_found' ? 404 : 409);
        await this.afterRelease(res.order, cour.id);
        return json({ order: this.cview(res.order, cour) });
      }
      const pay = r.body.pay;
      if (pay && typeof pay === 'object' && pay.m === 'credit' && cour.credit === false) return json({ error: 'no_credit' }, 403);
      const res = await this.changeStatus(id, 'done', pay, cour, { id: uid, name: whoName(u) });
      if (!res.err && res.same && res.order.cr !== cour.id) res.err = 'not_yours';
      if (res.err) return json({ error: res.err, order: res.order ? this.cview(res.order, cour) : undefined }, res.err === 'not_found' ? 404 : res.err === 'bad_pay' ? 400 : res.err === 'not_yours' ? 403 : 409);
      if (res.changed) { await this.afterChange(res.order, 'admin'); if (res.ask) await this.askConfirm(res.ask.uid, res.ask.n); }
      const c = await this.crGet(cour.id);
      return json({ order: this.cview(res.order, cour), cash: c ? Number(c.cash) || 0 : 0 });
    }
    return json({ error: 'not_found' }, 404);
  }
  /* Управление доставщиками (продавец): список, приглашение ссылкой, правка, сдача денег, удаление. */
  async adminCouriers(request, path, method, uid, u) {
    if (path === '/api/admin/couriers') {
      if (method === 'GET') return json({ couriers: await Promise.all((await this.crList()).map(c => this.crOut(c))) });
      if (method === 'POST') {
        const r = await this.readBody(request, 2000);
        if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
        const name = cleanStr(r.body.name, 40), phone = cleanStr(r.body.phone || '', 25);
        if (name.length < 2) return json({ error: 'bad_name' }, 400);
        if (phone && !phoneOk(phone)) return json({ error: 'bad_phone' }, 400);
        const idx = (await this.st.get('crx')) || [];
        if (idx.length >= MAX_COURIERS) return json({ error: 'too_many' }, 409);
        let id;
        do { id = 'k' + randId(5).toLowerCase(); } while (idx.includes(id));
        const c = { id, name, phone, uid: 0, on: true, credit: true, cash: 0, since: new Date().toISOString(), tok: randId(8).toLowerCase(), tokAt: Date.now() };
        await this.st.put({ ['cr:' + id]: c, crx: idx.concat([id]), ['ct:' + c.tok]: id });
        return json({ courier: await this.crOut(c) });
      }
      return json({ error: 'not_found' }, 404);
    }
    const m = path.match(/^\/api\/admin\/couriers\/(k[a-z0-9]{3,9})(?:\/(link|handover|verify|hresolve|hvoid))?$/);
    if (!m) return json({ error: 'not_found' }, 404);
    const c = await this.crGet(m[1]), sub = m[2];
    if (!c) return json({ error: 'not_found' }, 404);
    if (!sub && method === 'GET') return json(await this.crDetail(c));
    if (!sub && method === 'PUT') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const b = r.body;
      if (b.name !== undefined) { c.name = cleanStr(b.name, 40); if (c.name.length < 2) return json({ error: 'bad_name' }, 400); }
      if (b.phone !== undefined) { c.phone = cleanStr(b.phone, 25); if (c.phone && !phoneOk(c.phone)) return json({ error: 'bad_phone' }, 400); }
      if (b.credit !== undefined) c.credit = b.credit !== false;
      if (b.on !== undefined) c.on = b.on !== false;
      if (b.lim !== undefined) {
        const lim = b.lim === null || b.lim === '' ? 0 : Number(b.lim);
        if (!Number.isInteger(lim) || lim < 0 || lim > MAX_PAY) return json({ error: 'bad_lim' }, 400);
        c.lim = lim;
      }
      if (b.dl !== undefined) {
        if (typeof b.dl !== 'number' || !Number.isInteger(b.dl) || b.dl < -1 || b.dl > DL_MAX) return json({ error: 'bad_dl' }, 400);
        c.dl = b.dl;
      }
      await this.st.put('cr:' + c.id, c);
      return json(await this.crDetail(c));
    }
    if (!sub && method === 'DELETE') {
      if ((Number(c.cash) || 0) !== 0) return json({ error: 'has_cash', cash: Number(c.cash) || 0 }, 409);
      if ((c.nv || []).length) return json({ error: 'has_nv', n: c.nv.length }, 409);
      if (crHf(c, Date.now()) > 0 || (c.hwt || []).length) return json({ error: 'has_hq' }, 409);
      const upd = {}, del = ['cr:' + c.id, 'cc:' + c.id];
      if (c.uid) del.push('cru:' + c.uid);
      if (c.tok) del.push('ct:' + c.tok);
      // заказы, которые он вёз, снова свободны
      for (const o of await this.getOrders((await this.st.get('act')) || [])) {
        if (o.cr === c.id) { delete o.cr; delete o.crn; delete o.crAt; delete o.crp; upd['o:' + o.id] = o; }
      }
      upd.crx = ((await this.st.get('crx')) || []).filter(x => x !== c.id);
      await this.st.put(upd);
      await this.st.delete(del);
      return json({ ok: true });
    }
    if (sub === 'link' && method === 'POST') {
      if (c.tok) await this.st.delete('ct:' + c.tok);
      c.tok = randId(8).toLowerCase(); c.tokAt = Date.now();
      await this.st.put({ ['cr:' + c.id]: c, ['ct:' + c.tok]: c.id });
      return json({ courier: await this.crOut(c) });
    }
    // «Деньги пришли»: продавец сверил оплату картой или переводом, принятую доставщиком, с банком
    if (sub === 'verify' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const e = (c.nv || []).find(x => x.id === Number(r.body.id));
      if (!e) return json({ error: 'not_found' }, 404);
      c.nv = c.nv.filter(x => x !== e);
      const put = await this.crAdd(c, [{ k: 'vr', d: 0, a: e.a, m: e.m, du: e.uid, o: e.o, nm: e.nm, by: uid }]);
      if (e.uid && e.n) {
        const { lg, lh } = await this.lgLoad(e.uid), row = lg.rows.find(x => x.n === e.n);
        if (row && lh) { row.vr = 'ok'; row.vrt = new Date().toISOString(); row.vb = whoName(u); Object.assign(put, (await this.lgSave(e.uid, lg, lh)).put); }
      }
      await this.st.put(put);
      return json(await this.crDetail(c));
    }
    if (sub === 'handover' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const amount = Number(r.body.amount);
      if (!Number.isInteger(amount) || amount < 1 || amount > (Number(c.cash) || 0)) return json({ error: 'bad_amount', cash: Number(c.cash) || 0 }, 400);
      // доставщик подтверждает сдачу в Telegram; без привязки к Telegram подтверждать некому
      const row = { k: 'out', d: -amount, a: amount, by: uid, bn: whoName(u), left: (Number(c.cash) || 0) - amount };
      if (c.uid) row.cf = 'wait';
      const put = await this.crAdd(c, [row]);
      await this.st.put(put);
      if (c.uid) await this.askHandover(c.id, put['cc:' + c.id].seq);
      return json(await this.crDetail(await this.crGet(c.id)));
    }
    if ((sub === 'hresolve' || sub === 'hvoid') && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      return await this.handAct(c, sub === 'hvoid' ? 'void' : 'resolve', r.body, u);
    }
    return json({ error: 'not_found' }, 404);
  }

  /* --- журнал расчётов с магазинами (долги) --- */
  async lgLoad(uid) {
    const lg = await this.st.get('lg:' + uid), lh = await this.st.get('lh:' + uid);
    return { lg: lg && Array.isArray(lg.rows) ? lg : { rows: [], base: null, seq: 0 }, lh: lh && typeof lh === 'object' ? lh : null };
  }
  /* Дописывает записи в журнал магазина и считает новый заголовок. Сам ничего не сохраняет: вызывающий кладёт put одной операцией вместе со своими правками. */
  async lgAdd(uid, adds, snap) {
    const { lg, lh } = await this.lgLoad(uid);
    const now = new Date().toISOString(), ns = [];
    adds.forEach(a => { lg.seq += 1; ns.push(lg.seq); lg.rows.push(Object.assign({ n: lg.seq, t: now }, a)); });
    // записи одного заказа подтверждаются магазином вместе
    if (ns.length > 1) lg.rows.slice(-ns.length).forEach(r => { r.g = ns[0]; });
    const res = await this.lgSave(uid, lg, lh, snap, now);
    res.ns = ns;
    return res;
  }
  /* Пересчитывает заголовок долга и список должников по журналу. now — время новой записи; без него заголовок только пересчитывается (подтверждение, закрытие спора). */
  async lgSave(uid, lg, lh, snap, now) {
    const f = lgFold(lg.rows, lg.base);
    lg.rows = f.rows; lg.base = f.base;
    const st = lgState(lg.rows, lg.base), pd = lgPend(lg.rows);
    const hdr = Object.assign({ uid, name: '', org: '', phone: '', lang: '', rem: 0 }, lh || {}, snap || {}, { bal: st.bal, open: st.open, fl: pd.fl, na: pd.na, cwt: pd.cwt, upd: now || (lh && lh.upd) || new Date().toISOString() });
    const idx = (await this.st.get('dbi')) || [];
    const has = idx.includes(uid), need = st.bal !== 0 || pd.fl > 0 || pd.cwt.length > 0;
    const put = { ['lg:' + uid]: lg, ['lh:' + uid]: hdr };
    if (need && !has) put.dbi = idx.concat([uid]);
    else if (!need && has) put.dbi = idx.filter(x => x !== uid);
    return { put, hdr };
  }
  /* Список магазинов с долгом: просроченные сверху, потом по ближайшему сроку. Переплата (аванс) уходит в конец. */
  async debtList() {
    const idx = (await this.st.get('dbi')) || [];
    const map = await this.getMany(idx.map(u => 'lh:' + u));
    const today = dayOf(new Date().toISOString());
    const list = idx.map(u => map.get('lh:' + u)).filter(h => h && (h.bal !== 0 || lgFlags(h, Date.now()) > 0 || (h.cwt || []).length)).map(h => debtRow(h, today));
    list.sort((a, b) => ((b.fl > 0) - (a.fl > 0)) || ((a.bal < 0) - (b.bal < 0)) || (b.days - a.days) || (a.due || '9').localeCompare(b.due || '9') || b.bal - a.bal);
    const owing = list.filter(x => x.bal > 0);
    return { debtors: list, total: owing.reduce((t, x) => t + x.bal, 0), overdue: owing.reduce((t, x) => t + x.over, 0), n: owing.length, late: owing.filter(x => x.days > 0).length, fl: list.reduce((t, x) => t + x.fl, 0), morning: (await this.st.get('mrn')) !== 0 };
  }
  /* Утреннее напоминание продавцам. Вызывается площадкой по расписанию. Молчит, если выключено, уже было сегодня или просрочки нет. */
  async morning(origin) {
    if (!this.env.BOT_TOKEN) return { sent: 0, why: 'no_token' };
    if (/^https:\/\/(?!internal)/.test(origin || '')) this.origin = origin;
    if ((await this.st.get('mrn')) === 0) return { sent: 0, why: 'off' };
    const day = dayOf(new Date().toISOString());
    if ((await this.st.get('mrd')) === day) return { sent: 0, why: 'done' };
    const dl = await this.debtList();
    const late = dl.debtors.filter(x => x.bal > 0 && x.days > 0).sort((a, b) => b.days - a.days || b.over - a.over);
    if (!late.length) return { sent: 0, why: 'none' };
    await this.st.put('mrd', day);      // отметка до отправки: повторный запуск в тот же день не задвоит сообщения
    const text = morningText((await this.getCfg()).shop.name, late);
    const markup = this.origin ? openBtn(this.origin, 'Долги', sellerUrl(this.origin, this.did)) : undefined;
    let sent = 0;
    for (const aid of (await this.st.get('admins')) || []) {
      try { const r = await this.tg('sendMessage', Object.assign({ chat_id: aid, text }, markup ? { reply_markup: markup } : {})); if (r && r.ok) sent++; }
      catch (e) { console.error('morning failed', e && e.message || e); }
    }
    return { sent, n: late.length };
  }
  /* Состав заказов, по которым числится долг. Берётся из самих заказов; если заказа уже нет, номер остаётся без состава. */
  async debtOrders(refs) {
    const ids = [...new Set(refs.filter(r => typeof r === 'string' && /^Z-[A-Z0-9]{3,12}$/.test(r)))].slice(0, DEBT_ORD_MAX);
    const map = await this.getMany(ids.map(r => 'o:' + r));
    const out = {};
    ids.forEach(r => {
      const o = map.get('o:' + r);
      if (!o || typeof o !== 'object') return;
      out[r] = { id: r, at: o.createdAt, total: Number(o.total) || 0, fee: Number(o.fee) || 0, disc: Number(o.disc) || 0, sub: Number(o.sub) || 0, items: Array.isArray(o.items) ? o.items : [] };
    });
    return out;
  }
  async debtOne(uid) {
    const { lg, lh } = await this.lgLoad(uid);
    if (!lh) return json({ error: 'not_found' }, 404);
    const voided = new Set(lg.rows.filter(r => r.k === 'rv').map(r => r.of));
    const rsl = new Map(lg.rows.filter(r => r.k === 'rs').map(r => [r.of, r]));
    const now = Date.now();
    const rows = lg.rows.filter(r => r.k !== 'rs').slice(-LG_SHOW).reverse().map(r => {
      const x = voided.has(r.n) ? Object.assign({}, r, { void: true }) : Object.assign({}, r);
      const z = rsl.get(r.n);
      if (z) x.rsl = { bn: z.bn || '', why: z.why || '', t: z.t };
      else if (r.cf === 'wait' && !x.void && now - Date.parse(r.t) > CF_LATE) x.late = true;
      return x;
    });
    const ords = await this.debtOrders((lh.open || []).map(q => q.ref).concat(rows.filter(r => r.k === 'ch').map(r => r.ref)));
    return json({ debt: Object.assign(debtRow(lh, dayOf(new Date().toISOString())), { open: lh.open, rows, ords, more: lg.rows.length > LG_SHOW || !!lg.base, rem: lh.rem || 0 }) });
  }
  /* То, что видит сам магазин в «Мой долг»: без заметок продавца и служебных полей. Без full только суммы и сроки. Нет долга — null. */
  async myDebt(uid, full) {
    const { lg, lh } = await this.lgLoad(uid);
    const ask = lh ? (lh.cwt || []).length + (lh.fl || 0) : 0;
    if (!lh || (!(lh.bal > 0) && !ask)) return null;
    const d = debtRow(lh, dayOf(new Date().toISOString()));
    const out = { bal: Math.max(0, d.bal), due: d.due, over: d.over, days: d.days, ask: (lh.cwt || []).length + (lh.na || 0) };
    if (!full) return out;
    const voided = new Map(lg.rows.filter(r => r.k === 'rv').map(r => [r.of, r]));
    const rsl = new Map(lg.rows.filter(r => r.k === 'rs').map(r => [r.of, r]));
    const rows = lg.rows.filter(r => r.k !== 'rv' && r.k !== 'rs').slice(-LG_SHOW).reverse().map(r => {
      const x = { n: r.n, g: r.g || r.n, t: r.t, k: r.k, a: r.a };
      if (r.k === 'pay') { x.m = r.m; if (voided.has(r.n)) { x.void = true; x.vwhy = voided.get(r.n).why || ''; } }
      else if (r.k === 'ac') { x.f = r.f || ''; x.e = r.e || ''; x.cb = Number(r.cb) || 0; }
      else { x.ref = r.ref || ''; x.due = r.due || ''; }
      if (r.cf) { x.cf = r.cf; x.bn = r.bn || ''; }
      const z = rsl.get(r.n);
      if (z) x.rsl = { bn: z.bn || '', why: z.why || '' };
      return x;
    });
    const open = Array.isArray(lh.open) ? lh.open : [];
    const shop = (await this.getCfg()).shop;
    return Object.assign(out, {
      open, rows, more: lg.rows.length > LG_SHOW || !!lg.base,
      ords: await this.debtOrders(open.map(q => q.ref).concat(rows.filter(r => r.k === 'ch').map(r => r.ref))),
      contact: { telegram: shop.telegram || '', phone: shop.phone || '' }
    });
  }
  /* Все продавцы дистрибьютора получают короткое сообщение с кнопкой в приложение. */
  async notifyAdmins(text, label) {
    if (!this.env.BOT_TOKEN) return;
    for (const aid of (await this.st.get('admins')) || []) {
      try { await this.tg('sendMessage', { chat_id: aid, text, reply_markup: openBtn(this.origin, label || 'Долги', sellerUrl(this.origin, this.did)) }); }
      catch (e) { console.error('admin notify failed', e && e.message || e); }
    }
  }
  /* Магазин просят подтвердить запись: выдачу в долг или принятую оплату. n — номер записи (или первой записи заказа).
     Не удалось отправить в Telegram — запись сразу помечается «магазин не получил», продавец видит её среди спорных. */
  async askConfirm(uid, n) {
    if (!this.env.BOT_TOKEN) return;
    try {
      const { lg, lh } = await this.lgLoad(uid);
      const rows = lg.rows.filter(r => (r.g || r.n) === n && (r.k === 'ch' || r.k === 'pay'));
      if (!rows.length || !lh) return;
      const text = confirmText(lh, rows, (await this.getCfg()).shop), px = cbPrefix(this.did), uz = lh.lang === 'uz';
      const kb = openBtn(this.origin, uz ? 'Mening qarzim' : 'Мой долг', this.origin + '/?v=debt').inline_keyboard;
      const r = await this.tg('sendMessage', { chat_id: uid, text, reply_markup: { inline_keyboard: [[
        { text: uz ? '✅ Toʻgʻri' : '✅ Верно', callback_data: 'q:' + px + n + ':y' }, { text: uz ? '❌ Notoʻgʻri' : '❌ Не так', callback_data: 'q:' + px + n + ':n' }
      ]].concat(kb) } });
      if (r && r.ok) return;
      const cur = await this.lgLoad(uid), now = new Date().toISOString();
      let hit = false;
      cur.lg.rows.forEach(x => { if ((x.g || x.n) === n && x.cf === 'wait') { x.cf = 'na'; x.cft = now; hit = true; } });
      if (hit) await this.st.put((await this.lgSave(uid, cur.lg, cur.lh)).put);
    } catch (e) { console.error('confirm ask failed', e && e.message || e); }
  }
  /* Магазин ответил на вопрос «Всё верно?». ok — «Верно», иначе «Не так». «Верно» окончательно; «Не так» магазин ещё может изменить на «Верно». */
  async confirmRow(uid, n, ok) {
    const { lg, lh } = await this.lgLoad(uid);
    const grp = lh ? lg.rows.filter(r => (r.g || r.n) === n && isCf(r) && r.cf) : [];
    if (!grp.length) return { err: 'not_found' };
    const has = (k, r) => lg.rows.some(z => z.k === k && z.of === r.n);
    const live = grp.filter(r => !has('rv', r));
    if (!live.length) return { err: 'void', hdr: lh };
    if (live.some(r => r.cf === 'ok')) return { err: 'final', hdr: lh, rows: live };
    if (!ok && live.some(r => has('rs', r))) return { err: 'resolved', hdr: lh };
    const to = ok ? 'ok' : 'no';
    let hdr = lh;
    const changed = live.some(r => r.cf !== to);
    if (changed) {
      const now = new Date().toISOString();
      live.forEach(r => { r.cf = to; r.cft = now; });
      const sv = await this.lgSave(uid, lg, lh);
      await this.st.put(sv.put);
      hdr = sv.hdr;
    }
    return { rows: live, hdr, changed };
  }
  /* Магазин отметил запись «Не так»: продавцы и доставщик, который её принял, узнают сразу. */
  async disputeNotify(uid, rows, hdr) {
    if (!this.env.BOT_TOKEN) return;
    const who = hdr.name || hdr.org || 'Магазин', bn = (rows.find(r => r.bn) || {}).bn || '';
    const text = '⚠️ ' + who + ' отметил запись «Не так»: ' + rowDesc(rows) + (bn ? '. Записал: ' + bn : '') + '.';
    await this.notifyAdmins(text + '\nОткройте «Долги» и разберитесь с магазином.');
    const cid = (rows.find(r => r.cid) || {}).cid, c = cid ? await this.crGet(cid) : null;
    if (c && c.uid) {
      try { await this.tg('sendMessage', { chat_id: c.uid, text }); } catch (e) { console.error('dispute courier notify failed', e && e.message || e); }
    }
  }
  /* Что видит сам магазин при ответе «Верно» или «Не так»: текст сообщения и кнопки после ответа. */
  confirmEdit(text, hdr, to, px, n) {
    setLang(hdr.lang === 'uz' ? 'uz' : 'ru');
    const base = String(text || '').replace(/\n\n(✅|❌) [^\n]*$/, '');
    const kb = openBtn(this.origin, L('Мой долг', 'Mening qarzim'), this.origin + '/?v=debt').inline_keyboard;
    if (to === 'ok') return { text: base + '\n\n' + L('✅ Вы подтвердили. Спасибо!', '✅ Tasdiqladingiz. Rahmat!'), reply_markup: { inline_keyboard: kb } };
    return { text: base + '\n\n' + L('❌ Вы отметили «Не так». Продавец увидит это.', '❌ «Notoʻgʻri» deb belgiladingiz. Sotuvchi buni koʻradi.'),
      reply_markup: { inline_keyboard: [[{ text: L('✅ Всё-таки верно', '✅ Baribir toʻgʻri'), callback_data: 'q:' + px + n + ':y' }]].concat(kb) } };
  }
  /* Нажатие «Верно» / «Не так» под сообщением магазину. Отвечать может только сам магазин. */
  async onConfirmCb(cq, p, answer) {
    const uid = cq.from && cq.from.id, n = Number(p.id);
    if (!uid || !Number.isInteger(n) || (p.to !== 'y' && p.to !== 'n')) return answer('');
    const ok = p.to === 'y';
    const res = await this.confirmRow(uid, n, ok);
    if (res.err === 'not_found') return answer('Запись не найдена', true);
    const hdr = res.hdr || {};
    setLang(hdr.lang === 'uz' ? 'uz' : 'ru');
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const px = cbPrefix(this.did);
    if (res.err === 'void') return answer(L('Эта запись уже отменена продавцом', 'Bu yozuv sotuvchi tomonidan bekor qilingan'), true);
    if (res.err === 'resolved') return answer(L('Продавец уже закрыл этот вопрос. Если не согласны, напишите ему.', 'Sotuvchi bu masalani yopgan. Rozi boʻlmasangiz, unga yozing.'), true);
    if (res.err === 'final') {
      if (here) await this.editCard(here, this.confirmEdit(cq.message.text, hdr, 'ok', px, n));
      return answer(L('Вы уже подтвердили эту запись', 'Bu yozuvni allaqachon tasdiqlagansiz'), true);
    }
    if (here) await this.editCard(here, this.confirmEdit(cq.message.text, hdr, ok ? 'ok' : 'no', px, n));
    if (res.changed && !ok) await this.disputeNotify(uid, res.rows, hdr);
    return answer(ok ? L('Спасибо, подтверждено', 'Rahmat, tasdiqlandi') : L('Отмечено «Не так». Продавец увидит.', '«Notoʻgʻri» deb belgilandi'));
  }
  /* Спорные записи: магазин ответил «Не так», сообщение не дошло или магазин молчит больше суток. Не закрытые и не отменённые. */
  async disputes() {
    const idx = (await this.st.get('dbi')) || [], now = Date.now();
    const map = await this.getMany(idx.map(u => 'lh:' + u));
    const cand = idx.map(u => map.get('lh:' + u)).filter(h => h && lgFlags(h, now) > 0).slice(0, 60);
    const out = [];
    for (const h of cand) {
      const { lg } = await this.lgLoad(h.uid);
      const gone = new Set(lg.rows.filter(r => r.k === 'rv' || r.k === 'rs').map(r => r.of)), seen = new Set();
      for (const r of lg.rows) {
        if (!isCf(r) || !r.cf || r.cf === 'ok' || gone.has(r.n)) continue;
        if (r.cf === 'wait' && now - Date.parse(r.t) <= CF_LATE) continue;
        const g = r.g || r.n;
        if (seen.has(g)) continue;
        seen.add(g);
        out.push(Object.assign({ uid: h.uid, name: h.name || '', org: h.org || '', phone: h.phone || '', n: r.n, k: r.k, a: r.a, m: r.m || '', ref: r.ref || '', t: r.t, bn: r.bn || '', cf: r.cf === 'wait' ? 'late' : r.cf, cft: r.cft || '' }, r.k === 'ac' ? { f: r.f || '', e: r.e || '', cb: Number(r.cb) || 0 } : {}));
      }
    }
    // сдача денег доставщиками: вопросы без ответа и доставщики с просроченной сдачей
    for (const c of await this.crList()) {
      const late = crLate(c, now);
      if (late > 0) out.push({ h: 2, cid: c.id, cn: c.name, late, a: Number(c.cash) || 0, t: c.cs });
      if (crHf(c, now) < 1) continue;
      const lg = (await this.st.get('cc:' + c.id)) || { rows: [] };
      for (const r of lg.rows) {
        if (!hOpen(r) || (r.cf === 'wait' && now - Date.parse(r.t) <= CF_LATE)) continue;
        out.push({ h: 1, cid: c.id, cn: c.name, n: r.n, k: r.k, a: r.a, t: r.t, bn: r.bn || '', why: r.why || '', cf: r.cf === 'wait' ? 'late' : r.cf, cft: r.cft || '' });
      }
    }
    out.sort((a, b) => String(b.t).localeCompare(String(a.t)));
    return out.slice(0, 100);
  }
  /* Доставщика просят подтвердить запись продавца о сдаче денег (или об отмене сдачи). Не дошло в Telegram — запись сразу «доставщик не получил». */
  async askHandover(cid, n) {
    if (!this.env.BOT_TOKEN) return;
    try {
      const c = await this.crGet(cid), lg = c ? await this.st.get('cc:' + cid) : null;
      const row = lg && lg.rows.find(r => r.n === n && (r.k === 'out' || r.k === 'ox'));
      if (!c || !c.uid || !row || row.cf !== 'wait') return;
      const px = cbPrefix(this.did);
      const r = await this.tg('sendMessage', { chat_id: c.uid, text: handText(row), reply_markup: { inline_keyboard: [[
        { text: '✅ Верно', callback_data: 'h:' + px + n + ':y' }, { text: '❌ Не так', callback_data: 'h:' + px + n + ':n' }
      ]].concat(openBtn(this.origin, 'Моя касса', courierUrl(this.origin, this.did)).inline_keyboard) } });
      if (r && r.ok) return;
      row.cf = 'na'; row.cft = new Date().toISOString();
      await this.st.put(crSave(c, lg));
    } catch (e) { console.error('handover ask failed', e && e.message || e); }
  }
  /* Доставщик ответил «Верно» / «Не так». «Верно» окончательно; «Не так» он ещё может изменить на «Верно». */
  async handConfirm(c, n, ok) {
    const lg = await this.st.get('cc:' + c.id), row = lg && lg.rows.find(r => r.n === n && (r.k === 'out' || r.k === 'ox') && r.cf);
    if (!row) return { err: 'not_found' };
    if (row.ox) return { err: 'void' };
    if (row.cf === 'ok') return { err: 'final', row };
    if (!ok && row.hr) return { err: 'resolved', row };
    const to = ok ? 'ok' : 'no', changed = row.cf !== to;
    if (changed) { row.cf = to; row.cft = new Date().toISOString(); await this.st.put(crSave(c, lg)); }
    return { row, changed };
  }
  /* Что видит сам доставщик после ответа: текст сообщения и кнопки. */
  handEdit(text, to, px, n) {
    const base = String(text || '').replace(/\n\n(✅|❌) [^\n]*$/, '');
    const kb = openBtn(this.origin, 'Моя касса', courierUrl(this.origin, this.did)).inline_keyboard;
    if (to === 'ok') return { text: base + '\n\n✅ Вы подтвердили. Спасибо!', reply_markup: { inline_keyboard: kb } };
    return { text: base + '\n\n❌ Вы отметили «Не так». Продавец увидит это.', reply_markup: { inline_keyboard: [[{ text: '✅ Всё-таки верно', callback_data: 'h:' + px + n + ':y' }]].concat(kb) } };
  }
  /* Доставщик отметил сдачу «Не так»: продавцы узнают сразу. */
  async handDisputeNotify(c, row) {
    await this.notifyAdmins('⚠️ Доставщик ' + c.name + ' отметил «Не так»: ' + handDesc(row) + (row.bn ? '. Записал: ' + row.bn : '') + '.\nОткройте «Доставка» и разберитесь с доставщиком.', 'Доставка');
  }
  /* Нажатие «Верно» / «Не так» под сообщением доставщику. Отвечать может только сам доставщик. */
  async onHandCb(cq, p, answer) {
    const uid = cq.from && cq.from.id, n = Number(p.id);
    if (!uid || !Number.isInteger(n) || (p.to !== 'y' && p.to !== 'n')) return answer('');
    const id = await this.st.get('cru:' + uid), c = id ? await this.crGet(id) : null;
    if (!c || c.uid !== uid) return answer('Нет доступа', true);
    const ok = p.to === 'y', res = await this.handConfirm(c, n, ok);
    if (res.err === 'not_found') return answer('Запись не найдена', true);
    if (res.err === 'void') return answer('Эта запись уже отменена продавцом', true);
    if (res.err === 'resolved') return answer('Продавец уже закрыл этот вопрос. Если не согласны, напишите ему.', true);
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const px = cbPrefix(this.did);
    if (res.err === 'final') {
      if (here) await this.editCard(here, this.handEdit(cq.message.text, 'ok', px, n));
      return answer('Вы уже подтвердили эту запись', true);
    }
    if (here) await this.editCard(here, this.handEdit(cq.message.text, ok ? 'ok' : 'no', px, n));
    if (res.changed && !ok) await this.handDisputeNotify(c, res.row);
    return answer(ok ? 'Спасибо, подтверждено' : 'Отмечено «Не так». Продавец увидит.');
  }
  /* Сдача денег доставщиком: закрыть спорную запись с комментарием или отменить запись о сдаче с причиной. u — Telegram-пользователь продавца или владельца. */
  async handAct(c, act, body, u) {
    const by = u.id, bn = whoName(u), n = Number(body.n), now = new Date().toISOString();
    const lg = (await this.st.get('cc:' + c.id)) || { rows: [], seq: 0 };
    const row = lg.rows.find(r => r.n === n && (r.k === 'out' || r.k === 'ox'));
    if (!row) return json({ error: 'not_found' }, 404);
    if (act === 'resolve') {
      const note = cleanStr(body.note || '', RES_MAX);
      if (note.length < WHY_MIN) return json({ error: 'bad_note' }, 400);
      if (!row.cf || row.cf === 'ok') return json({ error: 'not_found' }, 404);
      if (row.hr || row.ox) return json({ error: 'already' }, 409);
      if (row.cf === 'wait' && Date.now() - Date.parse(row.t) <= CF_LATE) return json({ error: 'not_flagged' }, 409);
      lg.seq += 1; row.hr = lg.seq;
      lg.rows.push({ n: lg.seq, t: now, k: 'hr', d: 0, a: 0, of: n, by, bn, why: note });
      await this.st.put(crSave(c, lg));
      if (c.uid && this.env.BOT_TOKEN) {
        try { await this.tg('sendMessage', { chat_id: c.uid, text: 'ℹ️ Продавец закрыл вопрос по записи: ' + handDesc(row) + '.\nКомментарий: ' + note, reply_markup: openBtn(this.origin, 'Моя касса', courierUrl(this.origin, this.did)) }); }
        catch (e) { console.error('hand resolve notify failed', e && e.message || e); }
      }
      return json(await this.crDetail(await this.crGet(c.id)));
    }
    // отмена записи о сдаче: только сама сдача, один раз, с причиной; деньги снова числятся на руках у доставщика
    if (row.k !== 'out') return json({ error: 'not_found' }, 404);
    if (row.ox) return json({ error: 'already' }, 409);
    const why = cleanStr(body.reason || '', WHY_MAX);
    if (why.length < WHY_MIN) return json({ error: 'bad_reason' }, 400);
    const left = (Number(c.cash) || 0) + row.a;
    lg.seq += 1; row.ox = lg.seq;
    lg.rows.push(Object.assign({ n: lg.seq, t: now, k: 'ox', d: row.a, a: row.a, of: n, by, bn, why, left }, c.uid ? { cf: 'wait' } : {}));
    c.cash = left;
    await this.st.put(crSave(c, lg));
    if (c.uid) await this.askHandover(c.id, lg.seq);
    return json(await this.crDetail(await this.crGet(c.id)));
  }
  nvAdd(c, e) { c.nvs = (Number(c.nvs) || 0) + 1; c.nv = (c.nv || []).concat([Object.assign({ id: c.nvs, t: new Date().toISOString() }, e)]); }
  /* Приём оплаты, отмена записи об оплате, закрытие спорной записи и напоминание магазину. u — пользователь Telegram, который это делает. */
  async debtAct(uid, act, body, u, cour) {
    const by = u.id, bn = whoName(u);
    const { lg, lh } = await this.lgLoad(uid);
    if (!lh) return json({ error: 'not_found' }, 404);
    const who = lh.name || lh.org || '';
    if (act === 'remind') {
      if (!(lh.bal > 0)) return json({ error: 'no_debt' }, 409);
      if (Date.now() - (Number(lh.rem) || 0) < REMIND_GAP) return json({ error: 'too_soon' }, 429);
      if (!this.env.BOT_TOKEN) return json({ error: 'server' }, 500);
      const r = await this.tg('sendMessage', { chat_id: uid, text: debtRemindText(lh, (await this.getCfg()).shop, dayOf(new Date().toISOString()), await this.debtOrders((lh.open || []).slice(0, 12).map(q => q.ref))), reply_markup: openBtn(this.origin, lh.lang === 'uz' ? 'Mening qarzim' : 'Мой долг', this.origin + '/?v=debt') });
      if (!r.ok) return json({ error: 'tg_failed' }, 502);
      lh.rem = Date.now();
      await this.st.put('lh:' + uid, lh);
      return json({ ok: true, rem: lh.rem });
    }
    if (act === 'act') {
      if (cour) return json({ error: 'forbidden' }, 403);
      if (!ACT_PER.includes(body.period)) return json({ error: 'bad_request' }, 400);
      if (!this.env.BOT_TOKEN) return json({ error: 'server' }, 500);
      const lastAct = lg.rows.filter(r => r.k === 'ac').pop();
      if (lastAct && Date.now() - Date.parse(lastAct.t) < REMIND_GAP) return json({ error: 'too_soon' }, 429);
      const ords = await this.debtOrders(lg.rows.filter(r => r.k === 'ch').map(r => r.ref)), shop = (await this.getCfg()).shop;
      // дальше без пауз: журнал читается заново, акт собирается и записывается одной операцией
      const cur = await this.lgLoad(uid);
      const built = actBuild(cur.lh, cur.lg, body.period, dayOf(new Date().toISOString()), ords, shop);
      if (built.empty) return json({ error: 'empty' }, 404);
      if (built.long) return json({ error: 'too_long' }, 413);
      // прежний акт, на который магазин не ответил, заменяется новым; ответивший остаётся в истории
      cur.lg.rows = cur.lg.rows.filter(r => !(r.k === 'ac' && (r.cf === 'wait' || r.cf === 'na')));
      const now = new Date().toISOString();
      cur.lg.seq += 1;
      const n = cur.lg.seq;
      cur.lg.rows.push({ n, t: now, k: 'ac', d: 0, a: 0, by, bn, cf: 'wait', pr: body.period, f: built.f, e: built.e, ob: built.ob, cb: built.cb });
      await this.st.put((await this.lgSave(uid, cur.lg, cur.lh, null, now)).put);
      const px = cbPrefix(this.did), uz = cur.lh.lang === 'uz';
      let sent = true;
      for (let i = 0; i < built.parts.length && sent; i++) {
        const msg = { chat_id: uid, text: built.parts[i] };
        if (i === built.parts.length - 1) msg.reply_markup = { inline_keyboard: [[
          { text: uz ? '✅ Toʻgʻri' : '✅ Верно', callback_data: 'q:' + px + n + ':y' }, { text: uz ? '❌ Notoʻgʻri' : '❌ Не так', callback_data: 'q:' + px + n + ':n' }
        ]].concat(openBtn(this.origin, uz ? 'Mening qarzim' : 'Мой долг', this.origin + '/?v=debt').inline_keyboard) };
        try { const r = await this.tg('sendMessage', msg); sent = !!(r && r.ok); } catch (e) { console.error('act send failed', e && e.message || e); sent = false; }
      }
      if (!sent) {
        // магазин акт не получил: запись в журнале не нужна, продавцу ответ об ошибке
        const fresh = await this.lgLoad(uid);
        fresh.lg.rows = fresh.lg.rows.filter(r => r.n !== n);
        await this.st.put((await this.lgSave(uid, fresh.lg, fresh.lh)).put);
        return json({ error: 'tg_failed' }, 502);
      }
      return await this.debtOne(uid);
    }
    if (act === 'pay') {
      const amount = Number(body.amount);
      if (!Number.isInteger(amount) || amount < 1 || amount > MAX_PAY || !PAY_M.includes(body.m)) return json({ error: 'bad_request' }, 400);
      if (cour) {
        // доставщик с лимитом наличных не берёт новые наличные, пока не сдаст деньги; безналичные оплаты ждут сверки продавцом
        if (body.m === 'cash' && cour.lim > 0 && (Number(cour.cash) || 0) >= cour.lim) return json({ error: 'cash_limit', cash: Number(cour.cash) || 0, lim: cour.lim }, 409);
        if (body.m === 'cash' && crLate(cour, Date.now()) > 0) return json({ error: 'cash_late', cash: Number(cour.cash) || 0, late: crLate(cour, Date.now()) }, 409);
        if (body.m !== 'cash' && (cour.nv || []).length >= NV_MAX) return json({ error: 'nv_full' }, 409);
      }
      const row = { k: 'pay', d: -amount, a: amount, m: body.m, by, bn, note: cleanStr(body.note || '', LG_NOTE), cf: 'wait' };
      if (cour) { row.cid = cour.id; if (body.m !== 'cash') row.vr = 'wait'; }
      const res = await this.lgAdd(uid, [row]);
      if (cour) {
        if (body.m === 'cash') Object.assign(res.put, await this.crAdd(cour, [{ k: 'in', d: amount, a: amount, du: uid, nm: who }]));
        else { this.nvAdd(cour, { k: 'd', a: amount, m: body.m, nm: who, uid, n: res.ns[0] }); Object.assign(res.put, await this.crAdd(cour, [{ k: 'nv', d: 0, a: amount, m: body.m, du: uid, nm: who }])); }
      }
      await this.st.put(res.put);
      await this.askConfirm(uid, res.ns[0]);
      if (cour) await this.notifyAdmins('💰 Доставщик ' + cour.name + ' принял оплату долга: ' + (who || 'магазин') + ', ' + money(amount) + ' (' + PAY_NAME2[body.m][0] + ').');
      return await this.debtOne(uid);
    }
    if (cour) return json({ error: 'forbidden' }, 403);
    const n = Number(body.n), row = lg.rows.find(r => r.n === n);
    if (act === 'resolve') {
      const note = cleanStr(body.note || '', RES_MAX);
      if (note.length < WHY_MIN) return json({ error: 'bad_note' }, 400);
      if (!row || !isCf(row) || !row.cf || row.cf === 'ok') return json({ error: 'not_found' }, 404);
      const closed = r => lg.rows.some(z => (z.k === 'rv' || z.k === 'rs') && z.of === r.n);
      if (closed(row)) return json({ error: 'already' }, 409);
      if (row.cf === 'wait' && Date.now() - Date.parse(row.t) <= CF_LATE) return json({ error: 'not_flagged' }, 409);
      const grp = lg.rows.filter(r => (r.g || r.n) === (row.g || row.n) && isCf(r) && r.cf && r.cf !== 'ok' && !closed(r));
      const res = await this.lgAdd(uid, grp.map(r => ({ k: 'rs', of: r.n, d: 0, a: 0, by, bn, why: note })));
      await this.st.put(res.put);
      if (this.env.BOT_TOKEN) {
        try {
          setLang(lh.lang === 'uz' ? 'uz' : 'ru');
          await this.tg('sendMessage', { chat_id: uid, text: L('ℹ️ Продавец закрыл вопрос по записи: ', 'ℹ️ Sotuvchi yozuv boʻyicha masalani yopdi: ') + rowDesc(grp) + '.\n' + L('Комментарий: ', 'Izoh: ') + note, reply_markup: openBtn(this.origin, L('Мой долг', 'Mening qarzim'), this.origin + '/?v=debt') });
        } catch (e) { console.error('resolve notify failed', e && e.message || e); }
      }
      return await this.debtOne(uid);
    }
    // отменить можно только запись об оплате, и один раз, с причиной; ошибочную выдачу в долг гасят оплатой
    if (!row || row.k !== 'pay') return json({ error: 'not_found' }, 404);
    if (lg.rows.some(r => r.k === 'rv' && r.of === n)) return json({ error: 'already' }, 409);
    const why = cleanStr(body.reason || '', WHY_MAX);
    if (why.length < WHY_MIN) return json({ error: 'bad_reason' }, 400);
    const res = await this.lgAdd(uid, [{ k: 'rv', of: n, d: -row.d, a: row.a, by, bn, why }]);
    // наличные, принятые доставщиком, возвращаются из его кассы; неподтверждённый безнал уходит из списка сверки
    const c = row.cid ? await this.crGet(row.cid) : null;
    if (c && row.m === 'cash') Object.assign(res.put, await this.crAdd(c, [{ k: 'rv', d: -row.a, a: row.a, du: uid, nm: who }]));
    else if (c && (c.nv || []).some(x => x.uid === uid && x.n === n)) {
      c.nv = c.nv.filter(x => !(x.uid === uid && x.n === n));
      Object.assign(res.put, await this.crAdd(c, [{ k: 'nx', d: 0, a: row.a, m: row.m, du: uid, nm: who }]));
    }
    await this.st.put(res.put);
    if (this.env.BOT_TOKEN) {
      try {
        setLang(lh.lang === 'uz' ? 'uz' : 'ru');
        await this.tg('sendMessage', { chat_id: uid, text: L('❌ Запись об оплате ' + money(row.a) + ' отменена продавцом.\nПричина: ' + why, '❌ ' + money(row.a) + ' toʻlov yozuvi sotuvchi tomonidan bekor qilindi.\nSabab: ' + why), reply_markup: openBtn(this.origin, L('Мой долг', 'Mening qarzim'), this.origin + '/?v=debt') });
        if (c && c.uid) await this.tg('sendMessage', { chat_id: c.uid, text: '❌ Продавец отменил принятую вами оплату: ' + (who || 'магазин') + ', ' + money(row.a) + '.\nПричина: ' + why });
      } catch (e) { console.error('void notify failed', e && e.message || e); }
    }
    return await this.debtOne(uid);
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
      if (text) await this.tg('sendMessage', { chat_id: o.uid, text, reply_markup: openBtn(this.origin, o.lang === 'uz' ? 'Buyurtmalarim' : 'Мои заказы', this.origin + '/?v=mine') });
      if (o.status === 'ready' && o.mode === 'delivery' && !o.cr) await this.notifyCouriers(o, cfg);
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
      // сообщения («/start», «/admin КОД») разбирает площадка (Hub), сюда доходят только нажатия кнопок под заказами
      if (up && up.callback_query) await this.onCallback(up.callback_query);
    } catch (e) {
      console.error('webhook handler error', e && e.stack || e);
    }
    return json({ ok: true });
  }

  async onCallback(cq) {
    const answer = (text, alert) => this.tg('answerCallbackQuery', { callback_query_id: cq.id, text: text ? String(text).slice(0, 190) : undefined, show_alert: !!alert });
    const parsed = cbParse(cq.data);
    if (parsed.kind === 'k') return await this.onCourierCb(cq, parsed, answer);
    if (parsed.kind === 'q') return await this.onConfirmCb(cq, parsed, answer);
    if (parsed.kind === 'h') return await this.onHandCb(cq, parsed, answer);
    if (!cq.from || !(await this.isAdmin(cq.from.id))) return answer('Нет доступа', true);
    const { kind, id, to, days } = parsed;
    const o = id ? await this.st.get('o:' + id) : null;
    if (!o) return answer('Заказ не найден', true);
    const cfg = await this.getCfg();
    const here = cq.message && cq.message.chat ? { chat_id: cq.message.chat.id, message_id: cq.message.message_id } : null;
    const edit = card => here ? this.editCard(here, card) : null;

    if (kind === 'c') { await edit(await this.card(o, cfg.shop, true)); return answer('Отменить заказ ' + id + '?'); }
    if (kind === 'b') { await edit(await this.card(o, cfg.shop, false)); return answer(''); }
    // «Выдан клиенту» сначала спрашивает, как оплатил клиент (нажатия в старых сообщениях тоже придут сюда)
    if (kind === 's' && to === 'done' && o.status === 'ready') { await edit(await this.card(o, cfg.shop, 'pay')); return answer('Как оплатил клиент?'); }
    if (kind === 'p' && to === 'credit' && !days && o.status === 'ready') { await edit(await this.card(o, cfg.shop, 'days')); return answer('На сколько дней в долг?'); }
    if (kind === 's' || kind === 'p') {
      const pay = kind === 'p' ? (to === 'credit' ? { m: 'credit', days: Number(days) } : { m: to }) : undefined;
      const res = await this.changeStatus(id, kind === 'p' ? 'done' : to, pay, null, { id: cq.from.id, name: whoName(cq.from) });
      if (res.err === 'bad_pay') return answer('Не получилось: проверьте способ оплаты', true);
      if (res.err === 'bad_transition') {
        await edit(await this.card(res.order, cfg.shop, false));
        return answer('Статус уже другой: ' + stOf(res.order.status, res.order.mode).name, true);
      }
      if (res.err) return answer('Не получилось', true);
      await this.afterChange(res.order, res.changed ? 'admin' : null, here);
      if (res.changed && res.ask) await this.askConfirm(res.ask.uid, res.ask.n);
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
      // площадка дистрибьюторов: реестр создаётся при первом обращении, имя бота нужно для ссылок на каталоги
      try {
        await hubCall(this.env, '/__/bot', { username: me.result.username });
        const hub = await hubCall(this.env, '/__/ensure', {});
        steps.push(['Площадка дистрибьюторов', !!(hub && hub.ok), hub && hub.ok ? 'готова, дистрибьюторов: ' + hub.shops : 'не отвечает']);
      } catch (e) {
        steps.push(['Площадка дистрибьюторов', false, 'не подключена: проверьте wrangler.toml (привязка HUB) и опубликуйте приложение заново']);
      }
    }
    const allOk = steps.every(s => s[1]);
    return setupPage('<ul>' + steps.map(s => '<li class="' + (s[1] ? 'ok' : 'bad') + '">' + (s[1] ? '✔ ' : '✘ ') + esc(s[0]) + ': ' + esc(s[2]) + '</li>').join('') + '</ul>'
      + (allOk ? '<p>Готово. Теперь откройте бота' + (me.ok ? ' <b>@' + esc(me.result.username) + '</b>' : '') + ' в Telegram и отправьте ему сообщение <code>/admin ВАШ_КОД</code>. После этого заказы будут приходить вам.</p>'
        : '<p class="bad">Не всё получилось. Проверьте токен бота и повторите.</p>'));
  }
}

/* ---------- Площадка: реестр дистрибьюторов, их коды, вход продавцов, заказы клиента по всем компаниям ---------- */
const newRec = (id, name, hash, sum) => ({
  id, name: cleanStr(name, 60) || DEFAULT.shop.name, on: true, hash: hash || '', since: new Date().toISOString(), sellers: 0,
  items: sum && Number(sum.items) || 0, wait: sum && Number(sum.wait) || 0, cats: sum && Array.isArray(sum.cats) ? sum.cats : [], delivery: !sum || sum.delivery !== false, minOrder: sum && Number(sum.minOrder) || 0,
  regions: cleanRegions(sum && sum.regions), home: cleanRegion(sum && sum.home)
});
/* Что видит клиент в списке. Код и служебные поля не уходят. */
const pubRec = r => ({ id: r.id, name: r.name, items: r.items, cats: r.cats, delivery: r.delivery, minOrder: r.minOrder, regions: cleanRegions(r.regions), home: cleanRegion(r.home) });
const newCode = () => randId(4) + '-' + randId(4) + '-' + randId(4);

/* ---------- База магазинов: территории, агенты, записи ---------- */
const MAX_BASE = 5000, MAX_TERR = 100, MAX_AGENTS = 100, BASE_PAGE = 50;
const PEOPLE_GAP = 600000, PEOPLE_MAX = 1000;
const BASE_STATUS = ['new', 'talk', 'refuse'];
/* Ключ для поиска повторов: последние 9 цифр номера (код страны, пробелы и скобки не мешают). */
const phoneKey = p => { const d = String(p || '').replace(/\D/g, ''); return d.length > 9 ? d.slice(-9) : d; };
/* Второй ключ повтора: то же название по тому же адресу (без регистра, пробелов и знаков). Без адреса ключа нет. */
const nameKey = (name, addr) => {
  const n = String(name || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''), a = String(addr || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  return n && a ? (n + '|' + a).slice(0, 200) : '';
};
const validAid = a => typeof a === 'string' && /^a[a-z0-9]{3,10}$/.test(a);
const validBid = b => typeof b === 'string' && /^b[a-z0-9]{4,12}$/.test(b);
const validTid = t => typeof t === 'string' && /^t[a-z0-9]{2,8}$/.test(t);
/* Запись магазина для того, кто смотрит: владелец и агент видят всё, дистрибьютор только то, что нужно для звонка и доставки. */
/* Точка магазина: loc — сохранённая (поставил агент или владелец, либо принята от клиента), cloc — то, что прислал клиент в заказе и ждёт подтверждения.
   Дистрибьютор видит только сохранённую точку. */
const locOut = l => l ? { lat: l.lat, lng: l.lng, by: l.by || '' } : null;
const baseOwn = b => { const o = { id: b.id, name: b.name, phone: b.phone, addr: b.addr, terr: b.terr, st: b.st, note: b.note, agent: b.agent, app: !!b.uid, chk: !!b.chk, src: b.src }; if (b.loc) o.loc = locOut(b.loc); if (b.cloc) o.cloc = { lat: b.cloc.lat, lng: b.cloc.lng }; return o; };
const basePub = b => { const o = { id: b.id, name: b.name, phone: b.phone, addr: b.addr, terr: b.terr, app: !!b.uid }; if (b.loc) o.loc = { lat: b.loc.lat, lng: b.loc.lng }; return o; };
/* Клиент прислал точку в заказе: запоминаем как предложение. Если она рядом с уже сохранённой (до 50 м), ничего не меняем. Возвращает, изменилась ли запись. */
function setClientLoc(rec, loc, now) {
  const l = cleanLoc(loc);
  if (!l) return false;
  if (rec.loc && distKm(rec.loc, l) < 0.05) { if (!rec.cloc) return false; delete rec.cloc; return true; }
  if (rec.cloc && distKm(rec.cloc, l) < 0.005) return false;
  rec.cloc = { lat: l.lat, lng: l.lng, t: now };
  return true;
}
const lowName = (a, b) => { const x = a.name.toLowerCase(), y = b.name.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; };

export class Hub {
  constructor(state, env) {
    this.st = state.storage;
    this.env = env;
    this.origin = '';
    this.ready = false;
  }
  tg(method, payload) { return tgApi(this.env.BOT_TOKEN, method, payload); }
  webhookSecret() { return sha256hex('shop-webhook:' + this.env.BOT_TOKEN); }

  /* --- реестр --- */
  /* Один раз при первом обращении: первый дистрибьютор (то, что бот хранил до площадки) вносится в реестр, а его продавцы становятся владельцами. */
  async ensure() {
    if (this.ready) return;
    if (!(await this.st.get('init'))) {
      const sum = (await shopCall(this.env, MAIN, '/__/summary')).data || {};
      const adm = (await shopCall(this.env, MAIN, '/__/admins')).data;
      const admins = adm && Array.isArray(adm.admins) ? adm.admins.filter(Number.isSafeInteger) : [];
      const rec = newRec(MAIN, sum.name, '', sum);
      rec.sellers = admins.length;
      const upd = { init: 1, dx: [MAIN], ['d:' + MAIN]: rec, owners: admins };
      admins.forEach(uid => { upd['adm:' + uid] = [MAIN]; });
      await this.st.put(upd);
    }
    this.ready = true;
  }
  async getRec(did) { const r = await this.st.get('d:' + did); return r && typeof r === 'object' ? r : null; }
  async allRecs() {
    const idx = (await this.st.get('dx')) || [];
    const map = await this.st.get(idx.map(x => 'd:' + x));
    return idx.map(x => map.get('d:' + x)).filter(Boolean);
  }
  async owners() { const o = await this.st.get('owners'); return Array.isArray(o) ? o : []; }
  async sellsOf(uid) { const a = await this.st.get('adm:' + uid); return Array.isArray(a) ? a : []; }
  async title() { return (await this.st.get('title')) || HUB_TITLE; }
  async botName() {
    let b = await this.st.get('bot');
    if (!b) {
      const me = await this.tg('getMe', {});
      if (me.ok && me.result && me.result.username) { b = String(me.result.username); await this.st.put('bot', b); }
    }
    return b || '';
  }
  async link(did) { const b = await this.botName(); return b ? 'https://t.me/' + b + '?start=d_' + did : ''; }
  /* Запись дистрибьютора для владельца: всё, кроме хэша кода. */
  async ownerRec(r) { return Object.assign(pubRec(r), { on: r.on, sellers: r.sellers, since: r.since, own: !!r.hash, link: await this.link(r.id) }); }

  /* --- вход продавцов по коду --- */
  /* Код продавца ищется среди кода владельца (ADMIN_CODE) и кодов дистрибьюторов. Ошибки считаются по человеку: 8 подряд закрывают ввод на час. */
  async tryCode(code, uid) {
    if (!this.env.ADMIN_CODE) return { r: 'nocode' };
    const f = (await this.st.get('fail:' + uid)) || { n: 0, until: 0 };
    if (f.until > Date.now()) return { r: 'locked' };
    const h = await sha256hex('code:' + String(code || ''));
    let did = '', owner = false;
    if (safeEq(h, await sha256hex('code:' + this.env.ADMIN_CODE))) { did = MAIN; owner = true; }
    for (const rec of await this.allRecs()) if (rec.hash && safeEq(h, rec.hash) && !did) did = rec.id;
    if (!did) {
      f.n += 1;
      if (f.n >= 8) { f.n = 0; f.until = Date.now() + 3600 * 1000; }
      await this.st.put('fail:' + uid, f);
      return { r: 'bad' };
    }
    if (f.n || f.until) await this.st.delete('fail:' + uid);
    const had = (await this.sellsOf(uid)).includes(did), hadOwner = (await this.owners()).includes(uid);
    const res = await shopCall(this.env, did, '/__/admin-add', { uid });
    if (!res.ok || !res.data) return { r: 'error' };
    await this.setSeller(uid, did, true, res.data.admins);
    if (owner) {
      const own = await this.owners();
      if (!own.includes(uid)) { own.push(uid); await this.st.put('owners', own); }
    }
    // fresh: этот человек вошёл по коду впервые (стал продавцом или владельцем), а не повторил команду
    return { r: 'ok', did, owner, fresh: !had || (owner && !hadOwner) };
  }
  /* Запоминает, у каких дистрибьюторов человек продавец, и сколько продавцов у дистрибьютора. */
  async setSeller(uid, did, on, admins) {
    const list = await this.sellsOf(uid);
    const has = list.includes(did);
    if (on && !has) await this.st.put('adm:' + uid, list.concat([did]));
    if (!on && has) { const rest = list.filter(x => x !== did); if (rest.length) await this.st.put('adm:' + uid, rest); else await this.st.delete('adm:' + uid); }
    const rec = await this.getRec(did);
    if (rec && Array.isArray(admins)) { rec.sellers = admins.length; await this.st.put('d:' + did, rec); }
  }

  /* --- маршрутизация --- */
  async fetch(request) {
    const url = new URL(request.url);
    this.origin = url.origin;
    const path = url.pathname, method = request.method;
    try {
      // адрес сайта нужен рассылкам по расписанию: там нет запроса, из которого его можно взять
      if (!this.originSaved && /^https:\/\/(?!internal)/.test(this.origin)) {
        this.originSaved = true;
        if ((await this.st.get('origin')) !== this.origin) await this.st.put('origin', this.origin);
      }
      if (path === '/webhook' && method === 'POST') return await this.webhook(request);
      await this.ensure();
      if (path.startsWith('/__/')) return await this.internal(request, path);
      if (path === '/api/shops' && method === 'GET') return await this.publicList(request);
      if (path.startsWith('/api/hub/')) return await this.api(request, path, method);
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      console.error('hub error', path, e && e.stack || e);
      return json({ error: 'server' }, 500);
    }
  }
  async readBody(request, limit) {
    const text = await request.text();
    if (text.length > limit) return { err: 413 };
    try { return { body: JSON.parse(text || 'null') }; } catch (e) { return { err: 400 }; }
  }

  /* Запросы от дистрибьюторов: новое название и каталог, новый заказ клиента. */
  async internal(request, path) {
    if (request.method !== 'POST') return json({ error: 'not_found' }, 404);
    const r = await this.readBody(request, 20000);
    const b = r.body && typeof r.body === 'object' ? r.body : {};
    if (path === '/__/ensure') return json({ ok: true, shops: ((await this.st.get('dx')) || []).length });
    if (path === '/__/morning') {
      // запуск по расписанию: каждому включённому дистрибьютору напоминание о просрочке
      await this.ensure();
      const origin = (await this.st.get('origin')) || '';
      let sent = 0, shops = 0;
      for (const rec of await this.allRecs()) {
        if (!rec.on) continue;
        try { const r = await shopCall(this.env, rec.id, '/__/morning', { origin }); shops++; sent += (r.data && r.data.sent) || 0; }
        catch (e) { console.error('morning shop failed', rec.id, e && e.message || e); }
      }
      return json({ ok: true, shops, sent });
    }
    if (path === '/__/bot') { if (typeof b.username === 'string' && /^[A-Za-z0-9_]{3,64}$/.test(b.username)) await this.st.put('bot', b.username); return json({ ok: true }); }
    if (path === '/__/sync') {
      const rec = validDid(b.did) ? await this.getRec(b.did) : null;
      if (!rec || !b.summary || typeof b.summary !== 'object') return json({ ok: false });
      const s = b.summary;
      rec.name = cleanStr(s.name, 60) || rec.name;
      rec.items = Math.max(0, Math.min(MAX_ITEMS, Math.round(Number(s.items) || 0)));
      rec.wait = Math.max(0, Math.min(MAX_ITEMS, Math.round(Number(s.wait) || 0)));
      rec.cats = (Array.isArray(s.cats) ? s.cats : []).slice(0, 6).map(c => ({ name: cleanStr(c && c.name, 40), uz: cleanStr(c && c.uz, 40) })).filter(c => c.name);
      rec.delivery = s.delivery !== false;
      rec.minOrder = Math.max(0, Math.round(Number(s.minOrder) || 0));
      rec.regions = cleanRegions(s.regions);
      rec.home = cleanRegion(s.home);
      await this.st.put('d:' + rec.id, rec);
      return json({ ok: true });
    }
    if (path === '/__/is-owner') return json({ owner: (await this.owners()).includes(Number(b.uid)) });
    if (path === '/__/mod-notify') {
      // продавец отправил товары на проверку: владельцам уходит одно сообщение на отправку
      const n = Math.round(Number(b.n));
      if (!validDid(b.did) || !(n > 0)) return json({ ok: false });
      const rec = await this.getRec(b.did), origin = /^https:\/\/(?!internal)/.test(b.origin || '') ? b.origin : '';
      const text = (rec ? rec.name : b.did) + ': на проверке ' + ruTovar(n);
      for (const oid of await this.owners()) {
        try { await this.tg('sendMessage', Object.assign({ chat_id: oid, text }, origin ? { reply_markup: openBtn(origin, 'Проверить', origin + '/?v=review') } : {})); }
        catch (e) { console.error('mod notify send failed', e && e.message || e); }
      }
      return json({ ok: true });
    }
    if (path === '/__/ordered') {
      const uid = Number(b.uid);
      if (!validDid(b.did) || !Number.isSafeInteger(uid)) return json({ ok: false });
      const list = await this.userShops(uid, b.did);
      if (!list.includes(b.did)) await this.st.put('u:' + uid, list.concat([b.did]));
      // магазин оформил заказ: если его ещё нет в общей базе, он добавляется с данными из заказа
      try { await this.baseTouch(uid, b.prof); } catch (e) { console.error('base touch failed', e && e.message || e); }
      return json({ ok: true });
    }
    if (path === '/__/profile') {
      // магазин заполнил профиль у дистрибьютора: заносим в общую базу, если его там ещё нет
      const uid = Number(b.uid);
      if (!validDid(b.did) || !Number.isSafeInteger(uid)) return json({ ok: false });
      try { await this.baseTouch(uid, b.prof, 'profile'); } catch (e) { console.error('base touch failed', e && e.message || e); }
      return json({ ok: true });
    }
    return json({ error: 'not_found' }, 404);
  }
  /* У каких дистрибьюторов у человека есть заказы. Кто заказывал до площадки, найдётся у первого: это проверяется один раз. */
  async userShops(uid, skip) {
    const have = await this.st.get('u:' + uid);
    if (Array.isArray(have)) return have;
    let list = [];
    if (skip !== MAIN) {
      const r = await shopCall(this.env, MAIN, '/__/my-orders', { uid });
      if (r.data && Array.isArray(r.data.orders) && r.data.orders.length) list = [MAIN];
    }
    await this.st.put('u:' + uid, list);
    return list;
  }

  /* --- территории, агенты, база магазинов --- */
  async terrs() { const t = await this.st.get('terr'); return Array.isArray(t) ? t : []; }
  async allAgents() {
    const idx = (await this.st.get('ax')) || [];
    if (!idx.length) return [];
    const map = await this.st.get(idx.map(x => 'a:' + x));
    return idx.map(x => map.get('a:' + x)).filter(Boolean);
  }
  /* Агент, который вошёл по коду с этого аккаунта. Новый код отключает прежний аккаунт. */
  async agentOf(uid) {
    const aid = await this.st.get('agu:' + uid);
    const a = aid ? await this.st.get('a:' + aid) : null;
    return a && a.on && a.uid === uid ? a : null;
  }
  async agentLink(id) { const b = await this.botName(); return b ? 'https://t.me/' + b + '?start=a_' + id : ''; }
  /* Реестр людей: кто открывал приложение или писал боту (имя, логин, первый и последний заход). Роли здесь не хранятся: они считаются при показе списка.
     Запись обновляется не чаще раза в 10 минут на человека, чтобы каждый запрос не писал в хранилище. */
  async touchPerson(u) {
    try {
      if (!u || !Number.isInteger(u.id) || u.id <= 0) return;
      const now = Date.now();
      if (!this.pseen) this.pseen = new Map();
      if (now - (this.pseen.get(u.id) || 0) < PEOPLE_GAP) return;
      if (this.pseen.size > 5000) this.pseen.clear();
      this.pseen.set(u.id, now);
      const nm = whoName(u), un = cleanStr(u.username || '', 40), iso = new Date(now).toISOString();
      const cur = await this.st.get('pp:' + u.id);
      if (cur && cur.nm === nm && cur.un === un && now - Date.parse(cur.last) < PEOPLE_GAP) return;
      await this.st.put('pp:' + u.id, { id: u.id, nm, un, first: cur && cur.first ? cur.first : iso, last: iso });
    } catch (e) { console.error('touchPerson failed', e && e.message || e); }
  }
  /* Список для владельца: все, кто заходил, плюс держатели ролей, которых ещё не видели после появления списка. Самые свежие первыми. */
  async peopleSeen() {
    const rec = new Map();
    const row = (id) => { let r = rec.get(id); if (!r) { r = { id, nm: '', un: '', first: '', last: '', roles: [], shop: null }; rec.set(id, r); } return r; };
    for (const v of (await this.st.list({ prefix: 'pp:' })).values()) if (v && v.id) Object.assign(row(v.id), { nm: v.nm || '', un: v.un || '', first: v.first || '', last: v.last || '' });
    const recs = new Map((await this.allRecs()).map(r => [r.id, r.name]));
    const uidOf = k => Number(String(k).slice(String(k).indexOf(':') + 1));
    for (const id of await this.owners()) row(id).roles.push({ r: 'owner' });
    for (const [k, list] of (await this.st.list({ prefix: 'adm:' })).entries()) for (const did of Array.isArray(list) ? list : []) row(uidOf(k)).roles.push({ r: 'seller', n: recs.get(did) || did });
    for (const [k, list] of (await this.st.list({ prefix: 'dls:' })).entries()) for (const did of Array.isArray(list) ? list : []) if (recs.has(did)) row(uidOf(k)).roles.push({ r: 'courier', n: recs.get(did) });
    const ags = new Map((await this.allAgents()).map(a => [a.id, a]));
    for (const a of ags.values()) if (a.on && a.uid) row(a.uid).roles.push({ r: 'agent', n: a.name });
    for (const b of (await this.st.list({ prefix: 'b:' })).values()) if (b && b.uid) row(b.uid).shop = { name: b.name || '', phone: b.phone || '' };
    const all = [...rec.values()].filter(x => Number.isInteger(x.id) && x.id > 0);
    all.sort((a, b) => String(b.last).localeCompare(String(a.last)) || a.id - b.id);
    return { people: all.slice(0, PEOPLE_MAX), total: all.length, max: PEOPLE_MAX };
  }
  /* Сообщение всем владельцам площадки (кроме самого человека, если он владелец). */
  async notifyOwners(text, exceptUid) {
    if (!this.env.BOT_TOKEN) return;
    for (const o of await this.owners()) {
      if (o === exceptUid) continue;
      try { await this.tg('sendMessage', { chat_id: o, text }); } catch (e) { console.error('owner notify failed', e && e.message || e); }
    }
  }
  async baseRole(uid) {
    if ((await this.owners()).includes(uid)) return { r: 'owner' };
    const ag = await this.agentOf(uid);
    if (ag) return { r: 'agent', ag };
    if ((await this.sellsOf(uid)).length) return { r: 'dist' };
    return null;
  }
  /* Агент видит и правит свои магазины, магазины своих территорий и магазины без территории (их добавили сами по заказу). */
  inScope(ag, b) { return b.agent === ag.id || !b.terr || (ag.terr || []).includes(b.terr); }
  async newBid() {
    let id;
    do { id = 'b' + randId(7).toLowerCase(); } while (await this.st.get('b:' + id));
    return id;
  }
  /* Нет ли уже такого магазина: по телефону или по названию с тем же адресом. except: запись, которую правим. */
  async findDup(phone, name, addr, except) {
    const ids = [await this.st.get('bp:' + phoneKey(phone))];
    const k = nameKey(name, addr);
    if (k) ids.push(await this.st.get('bk:' + k));
    for (const id of ids) if (id && id !== except) { const e = await this.st.get('b:' + id); if (e) return e; }
    return null;
  }
  /* Ключи поиска повторов записи: что положить и что убрать при смене телефона, названия или адреса. */
  idxOf(b) { const o = { ['bp:' + phoneKey(b.phone)]: b.id }, k = nameKey(b.name, b.addr); if (k) o['bk:' + k] = b.id; return o; }
  /* Магазин оформил заказ. Есть в базе — ничего не меняем (данные могла проверить агент); нет — добавляем из заказа, агент потом проверит. */
  async baseTouch(uid, p, src) {
    if (!p || typeof p !== 'object' || !Number.isSafeInteger(uid)) return;
    // территорию называет сам магазин в заказе; принимаем только из списка владельца
    const tid = cleanStr(p.terr, 12), terr = tid && (await this.terrs()).some(t => t.id === tid) ? tid : '';
    const have = await this.st.get('bu:' + uid);
    const hv = have ? await this.st.get('b:' + have) : null;
    if (hv) {
      // запись уже есть: пустую территорию дополняем, уже выбранную (в том числе агентом) не меняем
      const now = new Date().toISOString();
      let ch = false;
      if (!hv.terr && terr) { hv.terr = terr; hv.upd = now; ch = true; }
      if (setClientLoc(hv, p.loc, now)) ch = true;
      if (ch) await this.st.put('b:' + hv.id, hv);
      return;
    }
    const name = cleanStr(p.org, 60) || cleanStr(p.name, 60), phone = cleanStr(p.phone, 25), addr = cleanStr(p.addr, 200);
    if (name.length < 2 || !phoneOk(phone)) return;
    const ex = await this.findDup(phone, name, addr, '');
    const now = new Date().toISOString();
    if (ex) {
      // уже есть (внёс агент или другой сотрудник магазина): привязываем человека к записи
      const upd = { ['bu:' + uid]: ex.id };
      if (!ex.uid) { ex.uid = uid; upd['b:' + ex.id] = ex; }
      if (!ex.terr && terr) { ex.terr = terr; ex.upd = now; upd['b:' + ex.id] = ex; }
      if (setClientLoc(ex, p.loc, now)) upd['b:' + ex.id] = ex;
      await this.st.put(upd);
      return;
    }
    const n = (await this.st.get('bn')) || 0;
    if (n >= MAX_BASE) return;
    const id = await this.newBid();
    const ref = await this.st.get('ref:' + uid);
    const agent = validAid(ref) && (await this.st.get('a:' + ref)) ? ref : '';
    const rec = { id, name, phone, addr, terr, st: 'new', note: '', agent, uid, chk: false, ver: 0, src: src || 'order', created: now, upd: now };
    setClientLoc(rec, p.loc, now);
    await this.st.put(Object.assign({ ['b:' + id]: rec, ['bu:' + uid]: id, bn: n + 1 }, this.idxOf(rec)));
  }
  /* Поля записи из запроса: проверяет только присланные. role решает, какие территории можно выбрать. */
  async baseFields(b, role) {
    const v = {}, has = k => b[k] !== undefined;
    for (const k of ['name', 'phone', 'addr', 'terr', 'st', 'note', 'agent']) if (has(k) && typeof b[k] !== 'string') return { err: 'bad_request' };
    if (has('name')) { v.name = cleanStr(b.name, 60); if (v.name.length < 2) return { err: 'bad_name' }; }
    if (has('phone')) { v.phone = cleanStr(b.phone, 25); if (!phoneOk(v.phone)) return { err: 'bad_phone' }; }
    if (has('addr')) v.addr = cleanStr(b.addr, 200);
    if (has('note')) v.note = cleanStr(b.note, 500, true);
    if (has('st')) { if (!BASE_STATUS.includes(b.st)) return { err: 'bad_request' }; v.st = b.st; }
    if (has('terr')) {
      const terrs = await this.terrs();
      if (b.terr === '') { if (terrs.length && role.r === 'agent') return { err: 'need_terr' }; v.terr = ''; }
      else {
        if (!terrs.some(t => t.id === b.terr)) return { err: 'bad_terr' };
        if (role.r === 'agent' && (role.ag.terr || []).length && !role.ag.terr.includes(b.terr)) return { err: 'bad_terr' };
        v.terr = b.terr;
      }
    }
    if (has('agent') && role.r === 'owner') {
      if (b.agent && !(await this.st.get('a:' + b.agent))) return { err: 'bad_agent' };
      v.agent = b.agent;
    }
    return { v };
  }
  dupJson(e, role) {
    return json({ error: 'dup', exists: { name: e.name, terr: e.terr, mine: role.r === 'owner' || (role.ag && e.agent === role.ag.id) } }, 409);
  }
  /* Что делать с точкой: b.loc {lat,lng} — поставить; b.loc === null — убрать; b.accept === true — принять точку, присланную клиентом.
     by — кто поставил: owner, agent или client (принята от клиента). */
  locChange(role, rec, b, now) {
    if (!b || typeof b !== 'object') return {};
    if (b.accept === true) {
      if (!rec.cloc) return { err: 'no_client_loc' };
      return { accepted: { lat: rec.cloc.lat, lng: rec.cloc.lng, t: now, by: 'client' } };
    }
    if (b.loc === undefined) return {};
    if (b.loc === null) return { clear: true };
    const l = cleanLoc(b.loc);
    if (!l) return { err: 'bad_loc' };
    return { set: { lat: l.lat, lng: l.lng, t: now, by: role.r === 'owner' ? 'owner' : 'agent' } };
  }
  async baseCreate(role, b) {
    const f = await this.baseFields(Object.assign({ terr: '' }, b), role);
    if (f.err) return json({ error: f.err }, 400);
    const v = f.v;
    if (!v.name) return json({ error: 'bad_name' }, 400);
    if (!v.phone) return json({ error: 'bad_phone' }, 400);
    const n = (await this.st.get('bn')) || 0;
    if (n >= MAX_BASE) return json({ error: 'too_many' }, 409);
    const dup = await this.findDup(v.phone, v.name, v.addr || '', '');
    if (dup) return this.dupJson(dup, role);
    const now = new Date().toISOString(), id = await this.newBid();
    const rec = { id, name: v.name, phone: v.phone, addr: v.addr || '', terr: v.terr || '', st: v.st || 'new', note: v.note || '', agent: role.r === 'agent' ? role.ag.id : (v.agent || ''), uid: 0, chk: true, ver: 1, src: 'agent', created: now, upd: now };
    const lc = this.locChange(role, {}, b, now);
    if (lc.err) return json({ error: lc.err }, 400);
    if (lc.set) rec.loc = lc.set;
    await this.st.put(Object.assign({ ['b:' + id]: rec, bn: n + 1 }, this.idxOf(rec)));
    return json({ item: baseOwn(rec) });
  }
  async baseUpdate(role, id, b) {
    const rec = await this.st.get('b:' + id);
    if (!rec) return json({ error: 'not_found' }, 404);
    if (role.r === 'agent' && !this.inScope(role.ag, rec)) return json({ error: 'forbidden' }, 403);
    const f = await this.baseFields(b, role);
    if (f.err) return json({ error: f.err }, 400);
    const v = f.v, next = Object.assign({}, rec, v);
    const dup = await this.findDup(next.phone, next.name, next.addr, rec.id);
    if (dup) return this.dupJson(dup, role);
    // точка магазина: только владелец и агент (эта запись — его зона); клиент и дистрибьютор её не меняют
    const lc = this.locChange(role, rec, b, new Date().toISOString());
    if (lc.err) return json({ error: lc.err }, lc.err === 'no_client_loc' ? 409 : 400);
    if (lc.set) { next.loc = lc.set; delete next.cloc; }
    else if (lc.clear) { delete next.loc; }
    if (lc.accepted) { next.loc = lc.accepted; delete next.cloc; }
    const upd = {}, del = [];
    const was = this.idxOf(rec), now = this.idxOf(next);
    Object.keys(was).forEach(k => { if (!(k in now)) del.push(k); });
    // телефон или название исправлены: магазин получит исправление в форме заказа один раз (ver)
    if ((v.name !== undefined && v.name !== rec.name) || (v.phone !== undefined && v.phone !== rec.phone)) next.ver = (Number(rec.ver) || 0) + 1;
    // правит агент или владелец: данные проверены; магазин без территории и агента закрепляется за агентом
    next.chk = true;
    if (role.r === 'agent' && !next.agent) next.agent = role.ag.id;
    next.upd = new Date().toISOString();
    await this.st.put(Object.assign({ ['b:' + id]: next }, now, upd));
    if (del.length) await this.st.delete(del);
    return json({ item: baseOwn(next) });
  }
  async baseDelete(role, id) {
    const rec = await this.st.get('b:' + id);
    if (!rec) return json({ error: 'not_found' }, 404);
    // агент убирает только свои записи без привязки к приложению: магазин, который уже заказывал, остаётся в базе
    if (role.r === 'agent' && (!this.inScope(role.ag, rec) || rec.uid)) return json({ error: 'forbidden' }, 403);
    const del = ['b:' + id].concat(Object.keys(this.idxOf(rec)));
    if (rec.uid) del.push('bu:' + rec.uid);
    await this.st.delete(del);
    await this.st.put('bn', Math.max(0, ((await this.st.get('bn')) || 1) - 1));
    return json({ ok: true });
  }
  /* Список для экрана «База»: владелец видит всё, агент свою зону, дистрибьютор всех, кроме отказавшихся (без заметок и статусов).
     Фильтры (кроме района и поиска только у владельца и агента): f — статус (new, chk «не проверен», talk, app «в приложении», refuse),
     ag — агент (только владелец; «-» без агента), sort=new — сначала новые. Счётчики по районам считаются уже с учётом статуса, агента и поиска. */
  async baseList(role, url, uid) {
    const sp = url.searchParams;
    const terr = String(sp.get('terr') || '').slice(0, 12), f = String(sp.get('f') || '');
    const ag = role.r === 'owner' ? String(sp.get('ag') || '').slice(0, 12) : '';
    const byNew = sp.get('sort') === 'new';
    const here = sp.get('sort') === 'near' ? cleanLoc({ lat: sp.get('lat'), lng: sp.get('lng') }) : null;
    const q = String(sp.get('q') || '').trim().toLowerCase().slice(0, 40);
    const off = Math.max(0, Math.min(MAX_BASE, parseInt(sp.get('off') || '0', 10) || 0));
    const all = [...(await this.st.list({ prefix: 'b:' })).values()];
    let scope = all;
    if (role.r === 'agent') scope = all.filter(b => this.inScope(role.ag, b));
    else if (role.r === 'dist') scope = all.filter(b => b.st !== 'refuse');
    const qd = q.replace(/\D/g, '');
    const full = role.r !== 'dist';
    const stOk = b => !full || !f || (f === 'chk' ? !b.chk : f === 'app' ? !!b.uid : b.st === f);
    const agOk = b => !ag || (ag === '-' ? !b.agent : b.agent === ag);
    const qOk = b => !q || b.name.toLowerCase().includes(q) || (b.addr || '').toLowerCase().includes(q) || (qd.length >= 3 && String(b.phone).replace(/\D/g, '').includes(qd));
    // «Мои клиенты»: те, кто заказывал у дистрибьютора (у владельца: у любого дистрибьютора)
    const sh = role.r === 'agent' ? '' : await this.mineShop(uid, sp.get('sh'));
    let mine = null;
    if (sp.get('mine') === '1' && role.r !== 'agent') mine = await this.mineBids(role, sh);
    const pre = scope.filter(b => stOk(b) && agOk(b) && qOk(b) && (!mine || mine.has(b.id)));
    const counts = {};
    pre.forEach(b => { const k = b.terr || ''; counts[k] = (counts[k] || 0) + 1; });
    const rows = pre.filter(b => !terr || (terr === '-' ? !b.terr : b.terr === terr));
    // «Ближайшие»: сначала магазины с точкой по расстоянию от того, кто смотрит, потом остальные по названию
    const dist = new Map();
    if (here) rows.forEach(b => { if (b.loc) dist.set(b.id, distKm(here, b.loc)); });
    if (here) rows.sort((x, y) => (dist.has(x.id) ? 0 : 1) - (dist.has(y.id) ? 0 : 1) || (dist.get(x.id) || 0) - (dist.get(y.id) || 0) || lowName(x, y));
    else rows.sort(byNew ? (x, y) => String(y.created || '').localeCompare(String(x.created || '')) || lowName(x, y) : lowName);
    const out = {
      role: role.r, total: rows.length, all: scope.length, counts, more: off + BASE_PAGE < rows.length,
      items: rows.slice(off, off + BASE_PAGE).map(b => { const o = (full ? baseOwn : basePub)(b); if (dist.has(b.id)) o.d = Math.round(dist.get(b.id) * 10) / 10; return o; }),
      terrs: (await this.terrs()).map(t => ({ id: t.id, name: t.name }))
    };
    if (role.r !== 'agent') {
      // данные клиента: у дистрибьютора только его, у владельца заказы у всех дистрибьюторов
      const ext = await this.mineAttach(role, sh, out.items.map(o => all.find(b => b.id === o.id)).filter(Boolean));
      out.items.forEach(o => { const e = ext.get(o.id); if (e) { if (e.m) o.m = e.m; if (e.my) o.my = e.my; } });
      out.sh = sh;
    }
    if (full) out.unchk = scope.filter(b => !b.chk).length;
    if (role.r === 'agent') out.mine = role.ag.terr || [];
    if (role.r === 'owner') out.agents = (await this.allAgents()).map(a => ({ id: a.id, name: a.name }));
    return json(out);
  }
  /* --- данные клиента для дистрибьютора и владельца ---
     Номер аккаунта (uid) наружу не выходит: площадка сама переводит номер магазина в номера аккаунтов и спрашивает дистрибьютора. */
  /* От чьего имени человек смотрит клиентов: только магазин (дистрибьютор), где он продавец. */
  async mineShop(uid, sh) {
    const sells = await this.sellsOf(uid);
    return validDid(sh) && sells.includes(sh) ? sh : (sells[0] || '');
  }
  /* Соответствие «номер магазина в базе» ↔ «номера аккаунтов». */
  async uidMap() {
    const bidOf = new Map(), uidsOf = new Map();
    (await this.st.list({ prefix: 'bu:' })).forEach((bid, k) => {
      const u = Number(k.slice(3));
      bidOf.set(u, bid);
      const a = uidsOf.get(bid) || [];
      a.push(u);
      uidsOf.set(bid, a);
    });
    return { bidOf, uidsOf };
  }
  /* Номера записей базы, которые заказывали у дистрибьютора sh (у владельца у любого). */
  async mineBids(role, sh) {
    const targets = role.r === 'owner' ? (await this.allRecs()).map(r => r.id) : (sh ? [sh] : []);
    const um = await this.uidMap();
    const out = new Set();
    const res = await Promise.all(targets.map(d => shopCall(this.env, d, '/__/mine-ids', {})));
    res.forEach(r => (r.ok && r.data && Array.isArray(r.data.uids) ? r.data.uids : []).forEach(u => { const bid = um.bidOf.get(Number(u)); if (bid) out.add(bid); }));
    return out;
  }
  /* Для записей базы: m (заказы) и my (заметка, группа, блокировка у дистрибьютора sh). */
  async mineAttach(role, sh, recs, um) {
    const out = new Map();
    if (!recs.length) return out;
    um = um || await this.uidMap();
    const items = recs.map(b => ({ bid: b.id, uids: [...new Set([...(um.uidsOf.get(b.id) || []), ...(b.uid ? [b.uid] : [])])].slice(0, 10) }));
    const owner = role.r === 'owner';
    const recsAll = owner ? await this.allRecs() : [];
    const targets = owner ? recsAll.map(r => r.id) : (sh ? [sh] : []);
    const res = await Promise.all(targets.map(async d => ({ d, r: await shopCall(this.env, d, '/__/mine', { items }) })));
    const name = new Map(recsAll.map(r => [r.id, r.name]));
    recs.forEach(b => {
      const m = { n: 0, ds: 0, sum: 0, last: '' }, by = [];
      let my = null;
      res.forEach(x => {
        const row = x.r.ok && x.r.data && Array.isArray(x.r.data.rows) ? x.r.data.rows.find(w => w.bid === b.id) : null;
        if (!row) return;
        m.n += row.n; m.ds += row.ds; m.sum += row.sum;
        if (row.last > m.last) m.last = row.last;
        if (row.n > 0) by.push({ did: x.d, name: name.get(x.d) || '', n: row.n, sum: row.sum });
        if (x.d === sh) my = { has: row.has, note: row.note, grp: row.grp, blocked: row.blocked, tg: row.tg };
      });
      const e = {};
      if (m.n > 0) { e.m = m; if (owner) e.m.by = by; }
      if (my && (my.has || my.note || my.grp || my.blocked)) e.my = my;
      out.set(b.id, e);
    });
    return out;
  }
  /* Карточка магазина у дистрибьютора: заказы и история (GET), заметка, группа, блокировка (PUT). */
  async baseMine(role, uid, bid, method, request) {
    if (role.r === 'agent') return json({ error: 'forbidden' }, 403);
    const rec = await this.st.get('b:' + bid);
    if (!rec || (role.r === 'dist' && rec.st === 'refuse')) return json({ error: 'not_found' }, 404);
    const um = await this.uidMap();
    const uids = [...new Set([...(um.uidsOf.get(bid) || []), ...(rec.uid ? [rec.uid] : [])])].slice(0, 10);
    if (method === 'GET') {
      const sh = await this.mineShop(uid, new URL(request.url).searchParams.get('sh'));
      const ext = (await this.mineAttach(role, sh, [rec], um)).get(bid) || {};
      const recsAll = await this.allRecs();
      const targets = role.r === 'owner' ? recsAll.map(r => r.id) : (sh ? [sh] : []);
      const res = await Promise.all(targets.map(async d => ({ d, r: await shopCall(this.env, d, '/__/mine-orders', { uids }) })));
      const name = new Map(recsAll.map(r => [r.id, r.name]));
      const orders = [];
      res.forEach(x => (x.r.ok && x.r.data && Array.isArray(x.r.data.orders) ? x.r.data.orders : []).forEach(o => orders.push(Object.assign(o, { did: x.d, shopName: name.get(x.d) || '' }))));
      orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return json({ sh, m: ext.m || null, my: ext.my || null, orders: orders.slice(0, 30) });
    }
    const rd = await this.readBody(request, 3000);
    if (rd.err || !rd.body || typeof rd.body !== 'object') return json({ error: 'bad_request' }, 400);
    const sells = await this.sellsOf(uid);
    const sh = validDid(rd.body.sh) && sells.includes(rd.body.sh) ? rd.body.sh : '';
    if (!sh) return json({ error: 'forbidden' }, 403);
    const r = await shopCall(this.env, sh, '/__/mine-set', { bid, uids, note: rd.body.note, grp: rd.body.grp, blocked: rd.body.blocked });
    if (!r.ok) return json({ error: (r.data && r.data.error) || 'bad_request' }, r.status || 400);
    const row = r.data.row;
    return json({ my: { has: row.has, note: row.note, grp: row.grp, blocked: row.blocked, tg: row.tg } });
  }
  /* Для владельца: территории и агенты со счётчиками. */
  async peopleState() {
    const rows = [...(await this.st.list({ prefix: 'b:' })).values()];
    const byT = {}, byA = {};
    rows.forEach(b => { byT[b.terr || ''] = (byT[b.terr || ''] || 0) + 1; byA[b.agent || ''] = (byA[b.agent || ''] || 0) + 1; });
    const terr = (await this.terrs()).map(t => ({ id: t.id, name: t.name, n: byT[t.id] || 0 }));
    const agents = await Promise.all((await this.allAgents()).map(async a => ({ id: a.id, name: a.name, on: a.on, since: a.since, terr: a.terr || [], used: !!a.uid, n: byA[a.id] || 0, link: await this.agentLink(a.id) })));
    return { terr, agents, free: byT[''] || 0, total: rows.length, max: { terr: MAX_TERR, agents: MAX_AGENTS, base: MAX_BASE } };
  }
  async addTerr(names) {
    const terrs = await this.terrs();
    const have = new Set(terrs.map(t => t.name.toLowerCase()));
    let added = 0;
    for (const raw of names.slice(0, 20)) {
      const name = cleanStr(raw, 40);
      if (name.length < 2 || have.has(name.toLowerCase()) || terrs.length >= MAX_TERR) continue;
      let id;
      do { id = 't' + randId(4).toLowerCase(); } while (terrs.some(t => t.id === id));
      terrs.push({ id, name });
      have.add(name.toLowerCase());
      added++;
    }
    if (added) await this.st.put('terr', terrs);
    return added;
  }
  async adminPeople(request, path, method) {
    if (path === '/api/hub/admin/people' && method === 'GET') return json(await this.peopleState());
    if (path === '/api/hub/admin/people/list' && method === 'GET') return json(await this.peopleSeen());
    if (path === '/api/hub/admin/terr' && method === 'POST') {
      const r = await this.readBody(request, 4000);
      const names = r.body && Array.isArray(r.body.names) ? r.body.names.filter(x => typeof x === 'string') : null;
      if (r.err || !names || !names.length) return json({ error: 'bad_name' }, 400);
      const added = await this.addTerr(names);
      if (!added) return json({ error: (await this.terrs()).length >= MAX_TERR ? 'too_many' : 'terr_dup' }, 409);
      return json(await this.peopleState());
    }
    const tm = path.match(/^\/api\/hub\/admin\/terr\/(t[a-z0-9]{2,8})$/);
    if (tm) {
      const terrs = await this.terrs(), t = terrs.find(x => x.id === tm[1]);
      if (!t) return json({ error: 'not_found' }, 404);
      if (method === 'PUT') {
        const r = await this.readBody(request, 1000);
        const name = r.body && typeof r.body === 'object' ? cleanStr(r.body.name, 40) : '';
        if (r.err || name.length < 2) return json({ error: 'bad_name' }, 400);
        if (terrs.some(x => x.id !== t.id && x.name.toLowerCase() === name.toLowerCase())) return json({ error: 'terr_dup' }, 409);
        t.name = name;
        await this.st.put('terr', terrs);
        return json(await this.peopleState());
      }
      if (method === 'DELETE') {
        if ([...(await this.st.list({ prefix: 'b:' })).values()].some(b => b.terr === t.id)) return json({ error: 'terr_used' }, 409);
        await this.st.put('terr', terrs.filter(x => x.id !== t.id));
        for (const a of await this.allAgents()) if ((a.terr || []).includes(t.id)) { a.terr = a.terr.filter(x => x !== t.id); await this.st.put('a:' + a.id, a); }
        return json(await this.peopleState());
      }
    }
    if (path === '/api/hub/admin/agents' && method === 'POST') {
      const r = await this.readBody(request, 3000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      const name = cleanStr(r.body.name, 60);
      if (name.length < 2) return json({ error: 'bad_name' }, 400);
      const idx = (await this.st.get('ax')) || [];
      if (idx.length >= MAX_AGENTS) return json({ error: 'too_many' }, 409);
      const c = await this.pickCode(r.body.code);
      if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
      const valid = new Set((await this.terrs()).map(t => t.id));
      const terr = (Array.isArray(r.body.terr) ? r.body.terr : []).filter(x => valid.has(x)).filter((x, i, a) => a.indexOf(x) === i);
      let id;
      do { id = 'a' + randId(5).toLowerCase(); } while (idx.includes(id));
      await this.st.put({ ['a:' + id]: { id, name, on: true, hash: c.hash, since: new Date().toISOString(), uid: 0, terr }, ax: idx.concat([id]) });
      return json(Object.assign(await this.peopleState(), { code: c.code, agentId: id }));
    }
    const am = path.match(/^\/api\/hub\/admin\/agents\/(a[a-z0-9]{3,10})(\/code)?$/);
    if (am) {
      const a = await this.st.get('a:' + am[1]);
      if (!a) return json({ error: 'not_found' }, 404);
      const r = await this.readBody(request, 3000);
      if (r.err) return json({ error: 'bad_request' }, 400);
      const b = r.body && typeof r.body === 'object' ? r.body : {};
      if (am[2] && method === 'POST') {
        const c = await this.pickCode(b.code, a.id);
        if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
        if (a.uid) await this.st.delete('agu:' + a.uid);   // прежний аккаунт теряет доступ
        a.hash = c.hash; a.uid = 0;
        await this.st.put('a:' + a.id, a);
        return json(Object.assign(await this.peopleState(), { code: c.code, agentId: a.id }));
      }
      if (!am[2] && method === 'DELETE') {
        // агент удаляется совсем: доступ закрывается, его магазины остаются в базе без агента
        if (a.uid) await this.st.delete('agu:' + a.uid);
        const upd = {}, now = new Date().toISOString();
        (await this.st.list({ prefix: 'b:' })).forEach(rec => { if (rec.agent === a.id) { rec.agent = ''; rec.ver = (Number(rec.ver) || 0) + 1; rec.upd = now; upd['b:' + rec.id] = rec; } });
        if (Object.keys(upd).length) await this.st.put(upd);
        await this.st.put('ax', ((await this.st.get('ax')) || []).filter(x => x !== a.id));
        await this.st.delete('a:' + a.id);
        return json(await this.peopleState());
      }
      if (!am[2] && method === 'PUT') {
        if (typeof b.on === 'boolean') a.on = b.on;
        if (b.name !== undefined) { const n = cleanStr(b.name, 60); if (n.length < 2) return json({ error: 'bad_name' }, 400); a.name = n; }
        if (b.terr !== undefined) {
          if (!Array.isArray(b.terr)) return json({ error: 'bad_request' }, 400);
          const valid = new Set((await this.terrs()).map(t => t.id));
          a.terr = b.terr.filter(x => valid.has(x)).filter((x, i, arr) => arr.indexOf(x) === i);
        }
        await this.st.put('a:' + a.id, a);
        return json(await this.peopleState());
      }
    }
    if (path === '/api/hub/admin/base/import' && method === 'POST') return json(Object.assign(await this.importClients(), { state: await this.peopleState() }));
    return null;
  }
  /* Один раз (и безопасно повторно) переносит клиентов всех дистрибьюторов в общую базу. Кто уже есть (по телефону или названию с адресом), не добавляется, а привязывается. */
  async importClients() {
    const byPhone = await this.st.list({ prefix: 'bp:' }), byName = await this.st.list({ prefix: 'bk:' }), byUid = await this.st.list({ prefix: 'bu:' });
    let n = (await this.st.get('bn')) || 0, added = 0, linked = 0, skipped = 0;
    const now = new Date().toISOString(), upd = {}, touched = new Map();
    for (const shop of await this.allRecs()) {
      const r = await shopCall(this.env, shop.id, '/__/clients', {});
      for (const c of (r.data && Array.isArray(r.data.clients) ? r.data.clients : [])) {
        const uid = Number(c.uid);
        const name = cleanStr(c.org, 60) || cleanStr(c.name, 60), phone = cleanStr(c.phone, 25), addr = cleanStr(c.addr, 200);
        if (!Number.isSafeInteger(uid) || byUid.has('bu:' + uid) || name.length < 2 || !phoneOk(phone)) { skipped++; continue; }
        const k = nameKey(name, addr);
        const ex = byPhone.get('bp:' + phoneKey(phone)) || (k && byName.get('bk:' + k)) || '';
        if (ex) {
          byUid.set('bu:' + uid, ex); upd['bu:' + uid] = ex;
          const rec = touched.get(ex) || await this.st.get('b:' + ex);
          if (rec && !rec.uid) { rec.uid = uid; touched.set(ex, rec); }
          linked++;
          continue;
        }
        if (n >= MAX_BASE) { skipped++; continue; }
        let id;
        do { id = 'b' + randId(7).toLowerCase(); } while (upd['b:' + id]);
        const rec = { id, name, phone, addr, terr: '', st: 'new', note: '', agent: '', uid, chk: false, ver: 0, src: 'import', created: now, upd: now };
        upd['b:' + id] = rec; upd['bu:' + uid] = id; upd['bp:' + phoneKey(phone)] = id;
        byPhone.set('bp:' + phoneKey(phone), id); byUid.set('bu:' + uid, id);
        if (k) { upd['bk:' + k] = id; byName.set('bk:' + k, id); }
        n++; added++;
      }
    }
    touched.forEach((rec, id) => { upd['b:' + id] = rec; });
    upd.bn = n;
    const keys = Object.keys(upd);
    for (let i = 0; i < keys.length; i += 100) { const part = {}; keys.slice(i, i + 100).forEach(k => { part[k] = upd[k]; }); await this.st.put(part); }
    return { added, linked, skipped };
  }
  /* Вход агента по коду. Ошибки считаются в том же счётчике, что и у /admin. */
  async tryAgentCode(code, uid) {
    const f = (await this.st.get('fail:' + uid)) || { n: 0, until: 0 };
    if (f.until > Date.now()) return { r: 'locked' };
    const h = await sha256hex('code:' + String(code || ''));
    let ag = null;
    for (const a of await this.allAgents()) if (a.hash && safeEq(h, a.hash) && !ag) ag = a;
    if (!ag || !ag.on) {
      f.n += 1;
      if (f.n >= 8) { f.n = 0; f.until = Date.now() + 3600 * 1000; }
      await this.st.put('fail:' + uid, f);
      return { r: 'bad' };
    }
    if (f.n || f.until) await this.st.delete('fail:' + uid);
    const prev = ag.uid && ag.uid !== uid ? ag.uid : 0, fresh = ag.uid !== uid;
    if (prev) await this.st.delete('agu:' + prev);
    ag.uid = uid;
    await this.st.put({ ['a:' + ag.id]: ag, ['agu:' + uid]: ag.id });
    return { r: 'ok', ag, fresh, prev };
  }

  /* --- приложение --- */
  async auth(request) {
    if (!this.env.BOT_TOKEN) return { err: 'no_token' };
    return verifyInitData(request.headers.get('x-init-data') || '', this.env.BOT_TOKEN);
  }
  /* Главный экран: дистрибьюторы, у которых есть товары и которые не отключены. Без входа через Telegram виден только список. */
  async publicList(request) {
    const recs = (await this.allRecs()).filter(r => r.on && r.items > 0);
    const terrs = (await this.terrs()).map(t => ({ id: t.id, name: t.name }));
    const out = { title: await this.title(), shops: recs.map(pubRec), terrs };
    const au = await this.auth(request);
    if (au.user) {
      await this.touchPerson(au.user);
      const sells = await this.sellsOf(au.user.id);
      const all = await this.allRecs();
      const mine = sells.map(id => all.find(r => r.id === id)).filter(Boolean);
      out.me = {
        id: au.user.id, owner: (await this.owners()).includes(au.user.id), region: cleanRegion(await this.st.get('reg:' + au.user.id)),
        // ссылка на каталог нужна продавцу, чтобы раздать её клиентам
        sells: await Promise.all(mine.map(async r => ({ id: r.id, name: r.name, link: await this.link(r.id) })))
      };
      // у владельца на вкладке «Проверка» горит число товаров, которые ждут решения
      if (out.me.owner) out.me.modN = all.reduce((n, r) => n + (Number(r.wait) || 0), 0);
      // доставщик: у каких дистрибьюторов человек возит заказы (запись сверяется с хранилищем, снятые и удалённые пропадают)
      const dl = (await this.st.get('dls:' + au.user.id)) || [];
      if (dl.length) {
        const alive = [], keep = [];
        for (const did of dl) {
          const rec = all.find(r => r.id === did);
          if (!rec) continue;
          const r = await shopCall(this.env, did, '/__/courier-of', { uid: au.user.id });
          if (r.ok && r.data && r.data.courier === null) continue;     // доставщиком больше не является
          keep.push(did);
          if (r.ok && r.data && r.data.courier) alive.push({ id: did, name: rec.name });
        }
        if (keep.length !== dl.length) { if (keep.length) await this.st.put('dls:' + au.user.id, keep); else await this.st.delete('dls:' + au.user.id); }
        if (alive.length) out.me.delivers = alive;
      }
      const ag = await this.agentOf(au.user.id);
      if (ag) out.me.agent = { id: ag.id, name: ag.name, terr: ag.terr || [], link: await this.agentLink(ag.id) };
      // данные магазина из общей базы: форма заказа подставляется сама, на любом телефоне и у любого дистрибьютора
      const bid = await this.st.get('bu:' + au.user.id), br = bid ? await this.st.get('b:' + bid) : null;
      if (br) out.me.card = { name: br.name, phone: br.phone, addr: br.addr || '', terr: terrs.some(t => t.id === br.terr) ? br.terr : '', ver: Number(br.ver) || 0 };
    }
    return json(out);
  }
  async api(request, path, method) {
    const au = await this.auth(request);
    if (au.err) return json({ error: au.err }, au.err === 'no_token' ? 500 : 401);
    await this.touchPerson(au.user);
    const uid = au.user.id;

    if (path === '/api/hub/orders' && method === 'GET') {
      const all = await this.allRecs();
      const list = (await this.userShops(uid)).filter(did => all.some(x => x.id === did));   // удалённые дистрибьюторы пропускаются
      const got = await Promise.all(list.map(async did => {
        const r = await shopCall(this.env, did, '/__/my-orders', { uid });
        const rec = all.find(x => x.id === did);
        return ((r.data && r.data.orders) || []).map(o => Object.assign({}, o, { did, shopName: rec ? rec.name : did }));
      }));
      const orders = [].concat(...got).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return json({ orders });
    }

    // долг магазина по всем дистрибьюторам, у которых он заказывал; full=1 добавляет заказы, оплаты и контакты
    if (path === '/api/hub/debts' && method === 'GET') {
      const full = new URL(request.url).searchParams.get('full') === '1';
      const all = await this.allRecs();
      const list = (await this.userShops(uid)).filter(did => all.some(x => x.id === did));
      const got = await Promise.all(list.map(async did => {
        const r = await shopCall(this.env, did, '/__/my-debt', { uid, full });
        const rec = all.find(x => x.id === did), d = r.data && r.data.debt;
        return d ? Object.assign({}, d, { did, shopName: rec ? rec.name : did }) : null;
      }));
      const debts = got.filter(Boolean).sort((a, b) => (b.over > 0) - (a.over > 0) || b.bal - a.bal);
      return json({ debts, n: debts.length, total: debts.reduce((t, d) => t + d.bal, 0), over: debts.reduce((t, d) => t + d.over, 0), late: debts.filter(d => d.days > 0).length, ask: debts.reduce((t, d) => t + (d.ask || 0), 0) });
    }

    // магазин отвечает «Верно» / «Не так» на запись о выдаче в долг или оплате
    if (path === '/api/hub/debts/confirm' && method === 'POST') {
      const r = await this.readBody(request, 500);
      const b = r.body && typeof r.body === 'object' ? r.body : null;
      if (r.err || !b || !validDid(b.did) || !Number.isInteger(Number(b.n)) || typeof b.ok !== 'boolean') return json({ error: 'bad_request' }, 400);
      if (!(await this.userShops(uid)).includes(b.did) || !(await this.getRec(b.did))) return json({ error: 'not_found' }, 404);
      const sc = await shopCall(this.env, b.did, '/__/my-confirm', { uid, n: Number(b.n), ok: b.ok });
      if (!sc.ok) return json({ error: (sc.data && sc.data.error) || 'server' }, sc.status || 500);
      return json({ debt: sc.data.debt ? Object.assign({}, sc.data.debt, { did: b.did, shopName: (await this.getRec(b.did)).name }) : null });
    }

    // регион магазина: запоминается, чтобы на другом телефоне список был тем же
    if (path === '/api/hub/region' && method === 'PUT') {
      const r = await this.readBody(request, 500);
      const reg = r.body && typeof r.body === 'object' ? r.body.region : undefined;
      if (r.err || (reg !== '' && !cleanRegion(reg))) return json({ error: 'bad_request' }, 400);
      if (reg) await this.st.put('reg:' + uid, reg); else await this.st.delete('reg:' + uid);
      return json({ region: reg });
    }

    // база магазинов: смотрят владелец, агенты и дистрибьюторы; правят владелец и агенты
    if (path === '/api/hub/base' || path.startsWith('/api/hub/base/')) {
      const role = await this.baseRole(uid);
      if (!role) return json({ error: 'forbidden' }, 403);
      if (path === '/api/hub/base' && method === 'GET') return await this.baseList(role, new URL(request.url), uid);
      const mm = path.match(/^\/api\/hub\/base\/(b[a-z0-9]{4,12})\/mine$/);
      if (mm && (method === 'GET' || method === 'PUT')) return await this.baseMine(role, uid, mm[1], method, request);
      if (role.r === 'dist') return json({ error: 'forbidden' }, 403);
      const rd = await this.readBody(request, 3000);
      if (path === '/api/hub/base' && method === 'POST') {
        if (rd.err || !rd.body || typeof rd.body !== 'object') return json({ error: 'bad_request' }, 400);
        return await this.baseCreate(role, rd.body);
      }
      const bm = path.match(/^\/api\/hub\/base\/(b[a-z0-9]{4,12})$/);
      if (bm && method === 'PUT') {
        if (rd.err || !rd.body || typeof rd.body !== 'object') return json({ error: 'bad_request' }, 400);
        return await this.baseUpdate(role, bm[1], rd.body);
      }
      if (bm && method === 'DELETE') return await this.baseDelete(role, bm[1]);
      return json({ error: 'not_found' }, 404);
    }

    // дальше только владелец площадки
    if (!path.startsWith('/api/hub/admin/')) return json({ error: 'not_found' }, 404);
    if (!(await this.owners()).includes(uid)) return json({ error: 'forbidden' }, 403);
    if (path.startsWith('/api/hub/admin/mod')) return await this.adminMod(request, path, method);
    if (path.startsWith('/api/hub/admin/people') || path.startsWith('/api/hub/admin/terr') || path.startsWith('/api/hub/admin/agents') || path === '/api/hub/admin/base/import') {
      const res = await this.adminPeople(request, path, method);
      if (res) return res;
    }
    if (path === '/api/hub/admin/shops' && method === 'GET') {
      const recs = await this.allRecs();
      return json({ title: await this.title(), max: MAX_SHOPS, shops: await Promise.all(recs.map(r => this.ownerRec(r))) });
    }
    if (path === '/api/hub/admin/shops' && method === 'POST') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body !== 'object') return json({ error: 'bad_request' }, 400);
      return await this.createShop(r.body);
    }
    if (path === '/api/hub/admin/title' && method === 'PUT') {
      const r = await this.readBody(request, 2000);
      if (r.err || !r.body || typeof r.body.title !== 'string') return json({ error: 'bad_request' }, 400);
      const t = cleanStr(r.body.title, 60) || HUB_TITLE;
      await this.st.put('title', t);
      return json({ title: t });
    }
    // спорные записи по всем дистрибьюторам: владелец видит, где магазин и продавец не сошлись
    if (path === '/api/hub/admin/disputes' && method === 'GET') {
      const recs = await this.allRecs();
      const got = await Promise.all(recs.map(async rec => {
        const r = await shopCall(this.env, rec.id, '/__/disputes', {});
        return ((r.data && r.data.items) || []).map(x => Object.assign({}, x, { did: rec.id, shopName: rec.name }));
      }));
      return json({ items: [].concat(...got).sort((a, b) => String(b.t).localeCompare(String(a.t))).slice(0, 200) });
    }
    if (path === '/api/hub/admin/disputes/resolve' && method === 'POST') {
      const r = await this.readBody(request, 1000);
      const b = r.body && typeof r.body === 'object' ? r.body : null;
      const isH = !!b && validCid(b.cid);
      if (r.err || !b || !validDid(b.did) || (!isH && !Number.isSafeInteger(Number(b.uid))) || !Number.isInteger(Number(b.n))) return json({ error: 'bad_request' }, 400);
      if (!(await this.getRec(b.did))) return json({ error: 'not_found' }, 404);
      const sc = await shopCall(this.env, b.did, '/__/resolve', isH ? { cid: b.cid, n: Number(b.n), note: b.note, by: au.user } : { uid: Number(b.uid), n: Number(b.n), note: b.note, by: au.user });
      return json(sc.data || { error: 'server' }, sc.status || 500);
    }
    if (path === '/api/hub/admin/analytics' && method === 'GET') return await this.adminAnalytics(new URL(request.url));
    if (path === '/api/hub/admin/stats' && method === 'GET') {
      const rg = statRange(new URL(request.url).searchParams.get('period') || 'month');
      const recs = await this.allRecs();
      const rows = await Promise.all(recs.map(async rec => {
        const r = await shopCall(this.env, rec.id, '/__/stats', { from: rg.from, to: rg.to });
        const d = r.ok && r.data ? r.data : null;
        return { id: rec.id, name: rec.name, on: rec.on, pct: d ? d.pct : 0, n: d ? d.n : 0, base: d ? d.base : 0, cm: d ? d.cm : 0, active: d ? d.active : 0, err: !d };
      }));
      const total = rows.reduce((t, x) => ({ n: t.n + x.n, base: t.base + x.base, cm: t.cm + x.cm, active: t.active + x.active }), { n: 0, base: 0, cm: 0, active: 0 });
      return json({ period: rg.period, from: rg.from, to: rg.to, rows, total });
    }
    const m = path.match(/^\/api\/hub\/admin\/shops\/([a-z0-9]{2,12})(\/code)?$/);
    if (m) {
      const rec = await this.getRec(m[1]);
      if (!rec) return json({ error: 'not_found' }, 404);
      if (!m[2] && method === 'DELETE') return await this.deleteShop(rec);
      const r = await this.readBody(request, 2000);
      if (r.err) return json({ error: 'bad_request' }, 400);
      if (m[2] && method === 'POST') return await this.resetCode(rec, r.body || {});
      if (!m[2] && method === 'PUT') {
        const b = r.body && typeof r.body === 'object' ? r.body : {};
        const hasOn = typeof b.on === 'boolean', hasPct = b.pct !== undefined;
        if (!hasOn && !hasPct) return json({ error: 'bad_request' }, 400);
        let pct;
        if (hasPct) {
          pct = cleanPct(b.pct);
          if (pct === null) return json({ error: 'bad_pct' }, 400);
          const sp = await shopCall(this.env, rec.id, '/__/cpct', { pct });
          if (!sp.ok) return json({ error: 'server' }, 500);
        }
        if (hasOn) {
          rec.on = b.on;
          await this.st.put('d:' + rec.id, rec);
          await shopCall(this.env, rec.id, '/__/off', { off: !rec.on });
        }
        return json(Object.assign({ shop: await this.ownerRec(rec) }, hasPct ? { pct } : {}));
      }
    }
    return json({ error: 'not_found' }, 404);
  }
  /* Аналитика продаж, владелец: только выданные заказы за период (7/30/90/365 дней), по всем дистрибьюторам или по одному (?sh=).
     Категории сводятся по названию, магазины по записи базы (номера аккаунтов наружу не уходят). */
  async adminAnalytics(url) {
    const sp = url.searchParams, d = Number(sp.get('days'));
    const days = RP_RANGES.includes(d) ? d : 30;
    const to = dayOf(new Date().toISOString()), from = addDays(to, -(days - 1));
    const recs = await this.allRecs();
    const sh = recs.some(r => r.id === sp.get('sh')) ? sp.get('sh') : '';
    const res = await Promise.all((sh ? recs.filter(r => r.id === sh) : recs).map(async r => ({ r, x: await shopCall(this.env, r.id, '/__/analytics', { from, to }) })));
    const um = await this.uidMap();
    const tot = { n: 0, sum: 0, shops: 0 }, cats = new Map(), prods = [], stores = new Map();
    let partial = false, failed = 0, since = '';
    for (const { r, x } of res) {
      const a = x.ok && x.data && x.data.tot ? x.data : null;
      if (!a) { failed++; continue; }
      tot.n += a.tot.n; tot.sum += a.tot.sum;
      if (a.tot.n > 0) tot.shops++;
      if (a.partial) partial = true;
      if (a.since && (!since || a.since < since)) since = a.since;
      for (const c of a.cats) {
        const key = String(c.name || '').trim().toLowerCase();
        const e = cats.get(key) || { name: c.name, uz: c.uz || '', n: 0, qty: 0, sum: 0 };
        e.n += c.n; e.qty += c.qty; e.sum += c.sum; if (!e.uz && c.uz) e.uz = c.uz;
        cats.set(key, e);
      }
      for (const p of a.prods) prods.push({ name: p.name, shop: r.id, shopName: r.name, n: p.n, qty: p.qty, sum: p.sum });
      for (const c of a.cls) {
        const bid = um.bidOf.get(Number(c.uid)), key = bid || 'u' + c.uid;
        const e = stores.get(key) || { bid, name: c.name || '', org: c.org || '', n: 0, sum: 0, shops: new Set(), last: '' };
        e.n += c.n; e.sum += c.sum; e.shops.add(r.id); if (c.last > e.last) e.last = c.last;
        stores.set(key, e);
      }
    }
    const bids = [...new Set([...stores.values()].map(e => e.bid).filter(Boolean))], nm = new Map();
    for (let i = 0; i < bids.length; i += 100) {
      const got = await this.st.get(bids.slice(i, i + 100).map(b => 'b:' + b));
      got.forEach(rec => { if (rec && rec.name) nm.set(rec.id, rec.name); });
    }
    const storesOut = [...stores.values()].map(e => ({ name: nm.get(e.bid) || e.name, n: e.n, sum: e.sum, nd: e.shops.size, last: e.last }))
      .sort((a, b) => b.sum - a.sum || b.n - a.n);
    prods.sort((a, b) => b.sum - a.sum || b.n - a.n);
    return json({
      days, from, to, sh, since, partial, failed,
      shops: recs.map(r => ({ id: r.id, name: r.name })),
      tot: Object.assign(tot, { stores: storesOut.length }),
      cats: [...cats.values()].sort((a, b) => b.sum - a.sum),
      prods: prods.slice(0, 300), nprods: prods.length,
      stores: storesOut.slice(0, 300), nstores: storesOut.length
    });
  }
  /* Проверка товаров, владелец: список со всех дистрибьюторов, одобрить, вернуть с причиной, поправить, фото. */
  async adminMod(request, path, method) {
    const url = new URL(request.url), origin = url.origin, sp = url.searchParams;
    const recs = await this.allRecs();
    if (path === '/api/hub/admin/mod' && method === 'GET') {
      const seg = sp.get('seg') === 'ret' || sp.get('seg') === 'ok' ? sp.get('seg') : 'wait';
      const got = await Promise.all(recs.map(async r => { const x = await shopCall(this.env, r.id, '/__/mod-list', { seg }); return { r, d: x.ok && x.data ? x.data : null }; }));
      const items = [], counts = { wait: 0, ret: 0, ok: 0 }, shops = [];
      got.forEach(({ r, d }) => {
        if (!d) return;
        const dn = d.name || r.name;
        counts.wait += d.counts.wait; counts.ret += d.counts.ret; counts.ok += d.counts.ok;
        if (d.items.length) shops.push({ id: r.id, name: dn, n: d.items.length, cats: d.cats || [] });
        d.items.forEach(i => items.push(Object.assign({}, i, { did: r.id, dname: dn })));
      });
      items.sort((a, b) => String(b.ma || b.mt || '').localeCompare(String(a.ma || a.mt || '')));
      return json({ seg, items: items.slice(0, 300), counts, shops });
    }
    const did = validDid(sp.get('did')) ? sp.get('did') : '';
    if (path === '/api/hub/admin/mod/photo' && (method === 'PUT' || method === 'DELETE')) {
      if (!did || !recs.some(r => r.id === did)) return json({ error: 'not_found' }, 404);
      const q = '?id=' + encodeURIComponent(sp.get('id') || '') + '&n=' + encodeURIComponent(sp.get('n') || '1') + (method === 'DELETE' ? '&del=1' : '');
      if (method === 'PUT' && Number(request.headers.get('content-length') || 0) > PROD_PHOTO_MAX) return json({ error: 'too_big' }, 413);
      const bytes = method === 'PUT' ? new Uint8Array(await request.arrayBuffer()) : new Uint8Array(0);
      const r = await stubOf(this.env.SHOP, did).fetch(new Request('https://internal/__/mod-photo' + q, { method: 'POST', headers: { 'content-type': 'application/octet-stream', 'x-did': did }, body: bytes }));
      let data = null; try { data = await r.json(); } catch (e) { /* пусто */ }
      return json(data || { error: 'server' }, r.status);
    }
    const rd = await this.readBody(request, 30000);
    const b = rd.body && typeof rd.body === 'object' ? rd.body : null;
    if (rd.err || !b) return json({ error: 'bad_request' }, 400);
    const have = id => validDid(id) && recs.some(r => r.id === id);
    if (path === '/api/hub/admin/mod/approve' && method === 'POST') {
      const by = new Map();
      for (const x of (Array.isArray(b.items) ? b.items : []).slice(0, 300)) {
        if (!x || !have(x.did) || !validId(x.id)) continue;
        by.set(x.did, (by.get(x.did) || []).concat([x.id]));
      }
      let n = 0;
      for (const [d, ids] of by) { const r = await shopCall(this.env, d, '/__/mod-approve', { ids, origin }); n += r.data && r.data.n || 0; }
      return json({ ok: true, n });
    }
    if (!have(b.did)) return json({ error: 'not_found' }, 404);
    if (path === '/api/hub/admin/mod/return' && method === 'POST') {
      const r = await shopCall(this.env, b.did, '/__/mod-return', { id: b.id, reason: b.reason, origin });
      return json(r.data || { error: 'server' }, r.status);
    }
    if (path === '/api/hub/admin/mod/edit' && method === 'PUT') {
      const r = await shopCall(this.env, b.did, '/__/mod-edit', { id: b.id, item: b.item });
      return json(r.data || { error: 'server' }, r.status);
    }
    return json({ error: 'not_found' }, 404);
  }
  /* Проверяет код, который задал владелец, или придумывает новый. Возвращает {code, hash} или {err}. */
  async pickCode(want, except) {
    let code;
    if (want === undefined || want === null || want === '') code = newCode();
    else {
      if (typeof want !== 'string') return { err: 'bad_request' };
      code = cleanStr(want, 64);
      if (code.length < MIN_CODE) return { err: 'weak_code' };
    }
    const hash = await sha256hex('code:' + code);
    if (this.env.ADMIN_CODE && safeEq(hash, await sha256hex('code:' + this.env.ADMIN_CODE))) return { err: 'code_taken' };
    for (const x of await this.allRecs()) if (x.hash && x.id !== except && safeEq(hash, x.hash)) return { err: 'code_taken' };
    for (const x of await this.allAgents()) if (x.hash && x.id !== except && safeEq(hash, x.hash)) return { err: 'code_taken' };
    return { code, hash };
  }
  async createShop(b) {
    const name = cleanStr(b.name, 60);
    if (name.length < 2) return json({ error: 'bad_name' }, 400);
    const idx = (await this.st.get('dx')) || [];
    if (idx.length >= MAX_SHOPS) return json({ error: 'too_many' }, 409);
    const c = await this.pickCode(b.code);
    if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
    let id;
    do { id = 's' + randId(5).toLowerCase(); } while (idx.includes(id));
    const init = await shopCall(this.env, id, '/__/init', { name, pct: COMM_DEFAULT });
    if (!init.ok) return json({ error: 'server' }, 500);
    const rec = newRec(id, name, c.hash);
    await this.st.put({ ['d:' + id]: rec, dx: idx.concat([id]) });
    return json({ shop: await this.ownerRec(rec), code: c.code });
  }
  /* Удаление дистрибьютора совсем: сначала очищается его хранилище (если не вышло, ничего не меняется), потом запись в реестре.
     Продавцы теряют доступ. Первого дистрибьютора (компанию владельца) удалить нельзя. */
  async deleteShop(rec) {
    if (rec.id === MAIN) return json({ error: 'main_shop' }, 409);
    const adm = (await shopCall(this.env, rec.id, '/__/admins', {})).data;
    const admins = adm && Array.isArray(adm.admins) ? adm.admins.filter(Number.isSafeInteger) : [];
    const wipe = await shopCall(this.env, rec.id, '/__/wipe', {});
    if (!wipe.ok) return json({ error: 'server' }, 500);
    for (const uid of admins) await this.setSeller(uid, rec.id, false);
    await this.st.put('dx', ((await this.st.get('dx')) || []).filter(x => x !== rec.id));
    await this.st.delete('d:' + rec.id);
    return json({ ok: true, id: rec.id });
  }
  /* Новый код дистрибьютора. Прежние продавцы теряют доступ и входят заново по новому коду. */
  async resetCode(rec, b) {
    const c = await this.pickCode(b.code, rec.id);
    if (c.err) return json({ error: c.err }, c.err === 'code_taken' ? 409 : 400);
    const cleared = await shopCall(this.env, rec.id, '/__/admin-clear', {});
    const removed = cleared.data && Array.isArray(cleared.data.removed) ? cleared.data.removed : [];
    for (const uid of removed) await this.setSeller(uid, rec.id, false);
    rec.hash = c.hash;
    rec.sellers = 0;
    await this.st.put('d:' + rec.id, rec);
    // владельцы площадки остаются продавцами первого дистрибьютора: у них свой код (ADMIN_CODE)
    if (rec.id === MAIN) for (const uid of await this.owners()) {
      const res = await shopCall(this.env, MAIN, '/__/admin-add', { uid });
      await this.setSeller(uid, MAIN, true, res.data && res.data.admins);
    }
    return json({ shop: await this.ownerRec(rec), code: c.code });
  }

  /* --- бот --- */
  async webhook(request) {
    if (!this.env.BOT_TOKEN) return new Response('no token', { status: 500 });
    const secret = await this.webhookSecret();
    const given = request.headers.get('x-telegram-bot-api-secret-token') || '';
    if (!safeEq(given, secret)) return new Response('forbidden', { status: 403 });
    let up = null;
    try { up = await request.json(); } catch (e) { return json({ ok: true }); }
    try {
      await this.ensure();
      if (up && up.message) await this.onMessage(up.message);
      else if (up && up.callback_query) await this.onCallback(request, up, given);
    } catch (e) {
      console.error('webhook handler error', e && e.stack || e);
    }
    return json({ ok: true });
  }
  /* Нажатие кнопки под заказом уходит в хранилище того дистрибьютора, чей это заказ. */
  async onCallback(request, up, secret) {
    const did = cbParse(up.callback_query.data).did;
    if (!validDid(did) || !(await this.getRec(did))) return;
    await stubOf(this.env.SHOP, did).fetch(new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-did': did, 'x-telegram-bot-api-secret-token': secret },
      body: JSON.stringify(up)
    }));
  }
  async onMessage(msg) {
    if (!msg.from || !msg.chat || msg.chat.type !== 'private') return;
    await this.touchPerson(msg.from);
    const uid = msg.from.id, chat = msg.chat.id;
    const text = String(msg.text || '').trim();
    const lang = String(msg.from.language_code || '').toLowerCase().startsWith('uz') ? 'uz' : 'ru';
    const cmd = text.split(/\s+/)[0].split('@')[0].toLowerCase();
    const openText = 'CATALOG';
    const isSeller = async () => (await this.sellsOf(uid)).length > 0;

    if (cmd === '/admin') {
      const code = text.replace(/^\S+\s*/, '');
      if (!code) {
        const adm = await isSeller();
        await this.tg('sendMessage', { chat_id: chat, text: adm ? bilingual(lang, 'Вы подключены как продавец. Новые заказы приходят в этот чат.', 'Siz sotuvchi sifatida ulangansiz. Yangi buyurtmalar shu chatga keladi.') : await this.welcome(lang, false, ''), reply_markup: openBtn(this.origin, openText) });
        return;
      }
      const res = await this.tryCode(code, uid);
      // код не должен оставаться в переписке
      await this.tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });
      if (res.r === 'ok') {
        const rec = await this.getRec(res.did);
        if (res.fresh) await this.notifyOwners('🔑 Вход по коду: ' + whoFull(msg.from) + ' вошёл как ' + (res.owner ? 'владелец площадки' : 'продавец «' + (rec ? rec.name : res.did) + '»') + '.', uid);
        const who = res.did === MAIN && res.owner ? 'Готово, вы продавец.' : 'Готово, вы продавец «' + (rec ? rec.name : res.did) + '».';
        await this.tg('sendMessage', {
          chat_id: chat,
          text: who + ' Новые заказы будут приходить сюда с кнопками «Принять», «Готов», «Выдан». Каталог, цены и настройки меняются в приложении, вкладка «Продавец».'
            + (res.owner ? '\n\nВы также владелец площадки: дистрибьюторов можно добавлять в приложении: кнопка ☰ → «Дистрибьюторы» → «Добавить».' : ''),
          reply_markup: openBtn(this.origin, 'Открыть приложение', sellerUrl(this.origin, res.did))
        });
      } else if (res.r === 'locked') {
        await this.tg('sendMessage', { chat_id: chat, text: 'Слишком много неверных попыток. Попробуйте через час.' });
      } else if (res.r === 'nocode') {
        await this.tg('sendMessage', { chat_id: chat, text: 'На сервере не задан ADMIN_CODE.' });
      } else if (res.r === 'error') {
        await this.tg('sendMessage', { chat_id: chat, text: 'Не получилось подключить. Попробуйте ещё раз.' });
      } else {
        await this.tg('sendMessage', { chat_id: chat, text: 'Неверный код.' });
      }
      return;
    }

    if (cmd === '/agent') {
      const code = text.replace(/^\S+\s*/, '');
      if (!code) {
        await this.tg('sendMessage', { chat_id: chat, text: 'Отправьте «/agent КОД». Код агента выдаёт владелец площадки.' });
        return;
      }
      const res = await this.tryAgentCode(code, uid);
      await this.tg('deleteMessage', { chat_id: chat, message_id: msg.message_id });   // код не должен оставаться в переписке
      if (res.r === 'ok') {
        if (res.fresh) await this.notifyOwners('🔑 Вход по коду: ' + whoFull(msg.from) + ' вошёл как агент «' + res.ag.name + '».' + (res.prev ? ' Этот код раньше был у другого Telegram-аккаунта (ID ' + res.prev + '), тот аккаунт отключён.' : ''), uid);
        const names = (await this.terrs()).filter(t => (res.ag.terr || []).includes(t.id)).map(t => t.name);
        await this.tg('sendMessage', {
          chat_id: chat,
          text: 'Готово, вы агент «' + res.ag.name + '».' + (names.length ? ' Территории: ' + names.join(', ') + '.' : '')
            + '\n\nВ приложении откройте вкладку «База»: там можно проверять данные магазинов после визита, исправлять ошибки и добавлять тех, кого ещё нет. Свою ссылку для магазинов вы найдёте там же.',
          reply_markup: openBtn(this.origin, 'Открыть базу', this.origin + '/?v=base')
        });
      } else if (res.r === 'locked') await this.tg('sendMessage', { chat_id: chat, text: 'Слишком много неверных попыток. Попробуйте через час.' });
      else await this.tg('sendMessage', { chat_id: chat, text: 'Неверный код.' });
      return;
    }

    // «/start d_<номер>» — ссылка на каталог конкретного дистрибьютора; всё остальное — общее приветствие
    const payload = cmd === '/start' ? (text.split(/\s+/)[1] || '') : '';
    // «/start c_<дистрибьютор>_<ключ>» — приглашение доставщика, которое выдал продавец
    const cj = payload.match(/^c_([a-z0-9]{2,12})_([a-z0-9]{6,12})$/);
    if (cj) { await this.courierJoin(uid, chat, lang, cj[1], cj[2], msg.from); return; }
    // «/start a_<номер>» — личная ссылка агента: магазин, пришедший по ней, закрепляется за агентом (при первом заказе)
    const am0 = payload.match(/^a_(a[a-z0-9]{3,10})$/);
    if (am0 && !(await this.st.get('ref:' + uid))) { const ag = await this.st.get('a:' + am0[1]); if (ag && ag.on) await this.st.put('ref:' + uid, ag.id); }
    let target = null;
    const m = payload.match(/^d_([a-z0-9]{2,12})$/);
    if (m) { const rec = await this.getRec(m[1]); if (rec && rec.on) target = rec; }
    await this.tg('sendMessage', {
      chat_id: chat,
      text: await this.welcome(lang, await isSeller(), target ? target.name : ''),
      reply_markup: openBtn(this.origin, openText, target ? shopUrl(this.origin, target.id) : this.origin + '/')
    });
  }
  /* Доставщик нажал ссылку-приглашение: хранилище дистрибьютора проверяет ключ и записывает его, площадка запоминает, где он доставщик. */
  async courierJoin(uid, chat, lang, did, tok, from) {
    const say = (ru, uz, markup) => this.tg('sendMessage', { chat_id: chat, text: bilingual(lang, ru, uz), reply_markup: markup });
    const rec = await this.getRec(did);
    const r = rec ? await shopCall(this.env, did, '/__/courier-join', { uid, token: tok }) : null;
    if (!r || !r.ok || !r.data || !r.data.ok) {
      if (r && r.status === 409) await say('Вы уже доставщик у другого продавца площадки или у этого. Один человек — одна запись.', 'Siz allaqachon yetkazib beruvchisiz. Bir kishi — bitta yozuv.');
      else await say('Ссылка не подошла: она устарела или уже использована. Попросите продавца прислать новую.', 'Havola yaroqsiz: eskirgan yoki allaqachon ishlatilgan. Sotuvchidan yangisini soʻrang.');
      return;
    }
    const dl = (await this.st.get('dls:' + uid)) || [];
    if (!dl.includes(did)) await this.st.put('dls:' + uid, dl.concat([did]));
    await this.notifyOwners('🔑 Вход по приглашению: ' + whoFull(from || { id: uid }) + ' стал доставщиком «' + rec.name + '».', uid);
    await say('Готово, вы доставщик «' + rec.name + '». Когда продавец отметит заказ готовым к доставке, он придёт сюда с кнопкой «Взял». Заказы, должников и кассу смотрите в приложении.',
      'Tayyor, siz «' + rec.name + '» yetkazib beruvchisisiz. Sotuvchi buyurtmani yetkazishga tayyor deb belgilasa, u shu yerga «Взял» tugmasi bilan keladi. Buyurtmalar, qarzdorlar va kassa ilovada.',
      openBtn(this.origin, lang === 'uz' ? 'Yetkazib berishni ochish' : 'Открыть доставку', courierUrl(this.origin, did)));
  }
  /* Приветствие: если дистрибьютор один (или клиент пришёл по ссылке на него), говорим от его имени, иначе от имени площадки. */
  async welcome(lang, isAdmin, shopName) {
    let name = shopName;
    if (!name) {
      const vis = (await this.allRecs()).filter(r => r.on && r.items > 0);
      name = vis.length === 1 ? vis[0].name : await this.title();     // один дистрибьютор: от его имени, иначе от имени площадки
    }
    return welcomeText(lang, isAdmin, { name });
  }
}
