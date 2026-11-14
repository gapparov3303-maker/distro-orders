// Локальная проверка сервера без интернета: поддельные Telegram и хранилище Durable Object.
// Запуск: npm test   (или: node build.js && node test/test.js)
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const mod = await import(path.join(root, 'dist/worker.js'));

// общий код (время, статусы, тексты) берём из исходника, чтобы сверять сервер с независимым «эталоном»
const S = new Function(fs.readFileSync(path.join(root, 'src/shared.js'), 'utf8')
  + '\n;return {DEFAULT,pickupInfo,shopNow,ymd,mergeCfg,setLang,STATUS,stOf,leadFor,orderText,fmtWhen,deliveryFee,unitPrice,nextTier,orderDiscount,nextDiscount,packText,packSplit,cleanLoc,mapUrl,distKm,parseGeo}')();

/* ---------- окружение ---------- */
const TOKEN = '123456:TEST-TOKEN-abcdef';
const CODE = 'correct-horse-battery';
class MockStorage {
  constructor() { this.m = new Map(); }
  async get(k) {
    if (Array.isArray(k)) { const out = new Map(); k.forEach(x => { if (this.m.has(x)) out.set(x, structuredClone(this.m.get(x))); }); return out; }
    return this.m.has(k) ? structuredClone(this.m.get(k)) : undefined;
  }
  async put(k, v) {
    if (typeof k === 'object') { Object.keys(k).forEach(x => this.m.set(x, structuredClone(k[x]))); return; }
    this.m.set(k, structuredClone(v));
  }
  /* как в Durable Object: записи по префиксу, по возрастанию ключа */
  async list({ prefix = '', limit } = {}) {
    const out = new Map();
    for (const k of [...this.m.keys()].filter(x => x.startsWith(prefix)).sort()) { if (limit && out.size >= limit) break; out.set(k, structuredClone(this.m.get(k))); }
    return out;
  }
  async deleteAll() { this.m.clear(); }
  async delete(k) {
    const list = Array.isArray(k) ? k : [k];
    let n = 0;
    list.forEach(x => { if (this.m.delete(x)) n++; });
    return Array.isArray(k) ? n : n > 0;
  }
}
let tgLog = [], tgFail = false, tgDocFail = false, tgDocDelay = 0, msgSeq = 1000;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  assert.ok(u.startsWith('https://api.telegram.org/bot' + TOKEN + '/'), 'запрос ушёл не в Telegram: ' + u);
  if (tgFail) throw new Error('сеть недоступна');
  const method = u.split('/').pop();
  // файлы уходят как multipart-форма: поля складываем в payload, сам файл — в file
  let payload, file = null;
  if (init.body instanceof FormData) {
    payload = {};
    for (const [k, v] of init.body.entries()) {
      if (typeof v === 'string') payload[k] = v;
      else file = { name: v.name, type: v.type, bytes: new Uint8Array(await v.arrayBuffer()) };
    }
  } else payload = JSON.parse(init.body);
  tgLog.push({ method, payload, file });
  if (tgDocDelay && method === 'sendDocument') await new Promise(r => setTimeout(r, tgDocDelay));
  if (tgDocFail && method === 'sendDocument') return new Response(JSON.stringify({ ok: false, error_code: 403, description: 'Forbidden: bot was blocked by the user' }), { status: 403, headers: { 'content-type': 'application/json' } });
  const res = { ok: true, result: true };
  if (method === 'sendMessage') res.result = { message_id: ++msgSeq, chat: { id: payload.chat_id } };
  if (method === 'sendDocument') res.result = { message_id: ++msgSeq, chat: { id: Number(payload.chat_id) } };
  if (method === 'getMe') res.result = { id: 123456, username: 'distro_test_bot' };
  return new Response(JSON.stringify(res), { headers: { 'content-type': 'application/json' } });
};

function makeWorld(envExtra) {
  const env = { BOT_TOKEN: TOKEN, ADMIN_CODE: CODE };
  Object.assign(env, envExtra);
  // у каждого дистрибьютора своё хранилище (как отдельные Durable Object), плюс хранилище площадки
  const shops = new Map();
  const getShop = name => {
    if (!shops.has(name)) { const storage = new MockStorage(); shops.set(name, { storage, shop: new mod.Shop({ storage }, env) }); }
    return shops.get(name);
  };
  env.SHOP = { idFromName: n => n, get: id => ({ fetch: r => getShop(id).shop.fetch(r) }) };
  const hubStorage = new MockStorage();
  const hub = new mod.Hub({ storage: hubStorage }, env);
  env.HUB = { idFromName: n => n, get: () => ({ fetch: r => hub.fetch(r) }) };
  const main = getShop('main');
  return { storage: main.storage, shop: main.shop, env, hub, hubStorage, shops, getShop };
}
let W = makeWorld();
const HOST = 'https://distro.example.workers.dev';
const call = (method, p, { body, init, headers } = {}) =>
  mod.default.fetch(new Request(HOST + p, { method, headers: Object.assign({ 'content-type': 'application/json' }, init ? { 'x-init-data': init } : {}, headers || {}), body: body === undefined ? undefined : (typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body)) }), W.env);
const jsonOf = async r => { const t = await r.text(); try { return JSON.parse(t); } catch (e) { return t; } };

function initDataFor(user, { authDate, token, extra, tamper } = {}) {
  const params = Object.assign({
    auth_date: String(authDate || Math.floor(Date.now() / 1000)),
    query_id: 'AAH' + crypto.randomBytes(4).toString('hex'),
    user: JSON.stringify(user),
    signature: 'sig' + crypto.randomBytes(6).toString('hex')
  }, extra || {});
  const dcs = Object.keys(params).sort().map(k => k + '=' + params[k]).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token || TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  const q = new URLSearchParams(params);
  q.set('hash', tamper ? hash.replace(/.$/, c => (c === '0' ? '1' : '0')) : hash);
  return q.toString();
}
const ANNA = { id: 1001, first_name: 'Анна', username: 'anna_k', language_code: 'ru' };
const BOB = { id: 1002, first_name: 'Bobur', language_code: 'uz' };
const SELLER = { id: 9001, first_name: 'Jasur', username: 'Jasur_Gm1', language_code: 'ru' };
const iA = () => initDataFor(ANNA), iB = () => initDataFor(BOB), iS = () => initDataFor(SELLER);

async function webhookSecret() { return crypto.createHash('sha256').update('shop-webhook:' + TOKEN).digest('hex'); }
async function send(update) {
  return call('POST', '/webhook', { body: update, headers: { 'x-telegram-bot-api-secret-token': await webhookSecret() } });
}
const lastTg = (m, pred) => [...tgLog].reverse().find(x => x.method === m && (!pred || pred(x.payload)));
const tgAll = (m, pred) => tgLog.filter(x => x.method === m && (!pred || pred(x.payload)));
const DEFAULT_NAME = 'Оптовая база';
const norm = s => String(s).replace(/[  ]/g, ' ');   // в числах ru-RU пробелы неразрывные

let userSeq = 2000;
const newUser = () => { const id = ++userSeq; const u = { id, first_name: 'Гость' + id, language_code: 'ru' }; return { u, init: () => initDataFor(u) }; };
const cb = (from, data, messageId, chat) => send({ update_id: Math.floor(Math.random() * 1e9), callback_query: { id: 'cq' + Math.random(), from, data, message: { message_id: messageId || 777, chat: { id: chat || from.id } } } });

/* ---------- каталог для проверок ---------- */
const SAMPLE_PROD = () => ({
  cats: [{ id: 'oil', name: 'Масла', uz: 'Yogʻlar' }, { id: 'groats', name: 'Крупы и макароны', uz: 'Yorma va makaron' }],
  items: [
    { id: 'p1', cat: 'oil', name: 'Масло подсолнечное', uz: 'Kungaboqar yogʻi', desc: 'Рафинированное', descUz: 'Tozalangan', amount: 5, unit: 'l', price: 82000, on: true },
    { id: 'p2', cat: 'groats', name: 'Рис', uz: 'Guruch', desc: '', descUz: '', amount: 25, unit: 'kg', price: 410000, on: true },
    { id: 'p3', cat: 'groats', name: 'Сахар', uz: 'Shakar', desc: 'Мешок', descUz: '', amount: 50, unit: 'kg', price: 520000, on: false },
    { id: 'p4', cat: 'groats', name: 'Макароны', uz: 'Makaron', desc: '', descUz: '', amount: 400, unit: 'g', price: 7500, on: true }
  ]
});
const PRICE = { p1: 82000, p2: 410000, p4: 7500 };
const totalOf = cart => Array.isArray(cart) ? cart.reduce((s, c) => s + (c && PRICE[c.id] ? PRICE[c.id] * c.qty : 0), 0) : undefined;
const CART = [{ id: 'p1', qty: 2 }, { id: 'p2', qty: 3 }];            // 164 000 + 1 230 000 = 1 394 000
const putProd = (prod, init) => call('PUT', '/api/admin/products', { init: init || iS(), body: { prod } });
const getCfg = async () => (await jsonOf(await call('GET', '/api/config'))).cfg;
const getProd = async () => (await jsonOf(await call('GET', '/api/config'))).prod;
const putCfg = async mut => { const c = await getCfg(); mut(c.shop); return call('PUT', '/api/admin/config', { init: iS(), body: { cfg: c } }); };

// форма заказа: время берём так же, как это делает приложение
function formFor(cfg, mode, over) {
  const pk = S.pickupInfo(cfg, S.shopNow(), S.leadFor(cfg, mode));
  return Object.assign({
    name: 'ООО Ориент', phone: '+998 91 555 44 33', mode,
    address: mode === 'delivery' ? 'Навои, ул. Галаба 12, склад 3' : '',
    date: pk.min, time: pk.slots(pk.min)[0], comment: 'Позвоните за час'
  }, over || {});
}
const ob = (cart, over, mode) => Object.assign({ cart, form: formFor(S.DEFAULT, mode || 'pickup'), lang: 'ru', expectTotal: totalOf(cart) }, over || {});
const place = (c, cart, over, mode) => call('POST', '/api/order', { init: c.init(), body: ob(cart, over, mode) });

// настоящий минимальный JPEG нужного размера: заголовок, SOF0 с размерами, SOS, данные, EOI
function fakeJpeg(w, h, pad) {
  const head = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xFF, 0xC0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00];
  const body = Buffer.alloc(pad || 3000, 0x55);
  return Buffer.concat([Buffer.from(head), body, Buffer.from([0xFF, 0xD9])]);
}
const jpegBytes = (w, h, pad) => new Uint8Array(fakeJpeg(w || 800, h || 600, pad || 20000));
const putPhoto = (id, bytes, init) => call('PUT', '/api/admin/photo/' + id, { init: init || iS(), body: bytes, headers: { 'content-type': 'image/jpeg' } });

/* ---------- мини-раннер ---------- */
const results = [];
async function t(name, fn) {
  try { await fn(); results.push([true, name]); }
  catch (e) { results.push([false, name, e]); }
}
/* региональный фильтр в приложении выключен; эти проверки включают его на время теста (globalThis.__regionsOn) */
async function tr(name, fn) {
  return t(name, async () => { globalThis.__regionsOn = true; try { await fn(); } finally { delete globalThis.__regionsOn; } });
}

/* ============ тесты ============ */
await t('страница приложения отдаётся и содержит собранный общий код, без торта', async () => {
  const r = await call('GET', '/');
  assert.equal(r.status, 200);
  const h = await r.text();
  assert.ok(h.includes('telegram-web-app.js'));
  assert.ok(!h.includes('/*SHARED*/'));
  assert.ok(h.includes('function pickupInfo(') && h.includes('function orderText('));
  assert.ok(h.includes('x-init-data'));
  assert.ok(!h.includes('cakeSVG') && !h.includes('buildCake'), 'в приложении остался код конструктора');
});

await t('каталог доступен без входа и пуст, настройки по умолчанию: доставка включена, самовывоз 2 ч, доставка 24 ч', async () => {
  const r = await call('GET', '/api/config');
  const d = await jsonOf(r);
  assert.equal(r.status, 200);
  assert.deepEqual(d.prod, { cats: [], items: [] });
  assert.equal(d.cfg.shop.delivery, true);
  assert.equal(d.cfg.shop.leadHours, 2);
  assert.equal(d.cfg.shop.deliveryLeadHours, 24);
  assert.equal(d.cfg.menu, undefined);
});

await t('вход: без данных, с чужой подписью, с подделкой и с просроченными данными — отказ', async () => {
  assert.equal((await call('GET', '/api/bootstrap')).status, 401);
  assert.equal((await call('GET', '/api/bootstrap', { init: initDataFor(ANNA, { tamper: true }) })).status, 401);
  assert.equal((await call('GET', '/api/bootstrap', { init: initDataFor(ANNA, { token: '999:OTHER' }) })).status, 401);
  const old = initDataFor(ANNA, { authDate: Math.floor(Date.now() / 1000) - 3 * 24 * 3600 });
  const r = await call('GET', '/api/bootstrap', { init: old });
  assert.equal(r.status, 401);
  assert.equal((await jsonOf(r)).error, 'expired');
  const good = new URLSearchParams(iA());
  good.set('user', JSON.stringify({ id: 9001, first_name: 'Evil' }));
  assert.equal((await call('GET', '/api/bootstrap', { init: good.toString() })).status, 401);
});

await t('вход: верные данные принимаются, клиент не продавец', async () => {
  const r = await call('GET', '/api/bootstrap', { init: iA() });
  const d = await jsonOf(r);
  assert.equal(r.status, 200);
  assert.equal(d.me.id, 1001);
  assert.equal(d.me.admin, false);
  assert.deepEqual(d.orders, []);
  assert.deepEqual(d.prod, { cats: [], items: [] });
});

await t('бот: вебхук без секрета отклоняется', async () => {
  const r = await call('POST', '/webhook', { body: { update_id: 1, message: { text: '/start' } } });
  assert.equal(r.status, 403);
  const r2 = await call('POST', '/webhook', { body: { update_id: 1 }, headers: { 'x-telegram-bot-api-secret-token': 'wrong' } });
  assert.equal(r2.status, 403);
});

await t('бот: /start зовёт открыть каталог сразу на двух языках, узбекский всегда сверху', async () => {
  tgLog = [];
  await send({ update_id: 1, message: { message_id: 1, from: ANNA, chat: { id: ANNA.id, type: 'private' }, text: '/start' } });
  let m = lastTg('sendMessage');
  assert.equal(m.payload.chat_id, ANNA.id);
  // русскому интерфейсу: узбекский всё равно сверху, русский ниже
  assert.ok(m.payload.text.includes('Нажмите «Каталог»') && m.payload.text.includes('«Katalog» tugmasini bosing'));
  assert.ok(m.payload.text.includes('Самовывоз или доставка. Оплата при получении заказа.'));
  assert.ok(m.payload.text.includes('Toʻlovni buyurtmangizni olganda qilasiz.'));
  assert.ok(m.payload.text.indexOf('Assalomu alaykum') < m.payload.text.indexOf('Здравствуйте'));
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].text, 'CATALOG');
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/');
  const ruText = m.payload.text;
  await send({ update_id: 2, message: { message_id: 2, from: BOB, chat: { id: BOB.id, type: 'private' }, text: 'salom' } });
  m = lastTg('sendMessage');
  // узбекскому интерфейсу то же самое: тот же текст, тот же порядок и та же кнопка
  assert.equal(m.payload.text, ruText);
  assert.ok(m.payload.text.indexOf('Assalomu alaykum') < m.payload.text.indexOf('Здравствуйте'));
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].text, 'CATALOG');
  assert.ok(m.payload.text.split('\n').length <= 6, 'приветствие короткое');
});

await t('продавец: неверный код не даёт прав, сообщение с кодом удаляется', async () => {
  tgLog = [];
  await send({ update_id: 3, message: { message_id: 30, from: SELLER, chat: { id: SELLER.id, type: 'private' }, text: '/admin wrong-code' } });
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'));
  assert.ok(lastTg('deleteMessage', p => p.message_id === 30));
  assert.equal((await call('GET', '/api/admin/orders', { init: iS() })).status, 403);
});

await t('продавец: верный код даёт права, команда в группе игнорируется', async () => {
  tgLog = [];
  await send({ update_id: 4, message: { message_id: 40, from: ANNA, chat: { id: -500, type: 'group' }, text: '/admin ' + CODE } });
  assert.equal(tgLog.length, 0);
  assert.equal((await call('GET', '/api/admin/orders', { init: iA() })).status, 403);
  await send({ update_id: 5, message: { message_id: 41, from: SELLER, chat: { id: SELLER.id, type: 'private' }, text: '/admin ' + CODE } });
  assert.ok(lastTg('sendMessage').payload.text.includes('вы продавец'));
  assert.ok(lastTg('deleteMessage', p => p.message_id === 41));
  assert.equal((await jsonOf(await call('GET', '/api/bootstrap', { init: iS() }))).me.admin, true);
});

/* ---------- каталог ---------- */
await t('каталог: клиент не может менять его и загружать фото, продавец может', async () => {
  assert.equal((await putProd(SAMPLE_PROD(), iA())).status, 403);
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  assert.equal((await putPhoto('p1', jpegBytes(), iA())).status, 403);
  assert.equal((await call('DELETE', '/api/admin/photo/p1', { init: iA() })).status, 403);
  assert.equal((await call('PUT', '/api/admin/products', { body: { prod: SAMPLE_PROD() } })).status, 401);
  const prod = await getProd();
  assert.equal(prod.items.length, 4);
  assert.equal(prod.cats.length, 2);
  assert.equal(prod.items[2].on, false);
  assert.equal(prod.items[0].unit, 'l');
  assert.equal(prod.items[0].uz, 'Kungaboqar yogʻi');
});

await t('каталог: мусор от клиента чистится (лимиты, единицы, цены, чужая категория, версия фото)', async () => {
  const junk = {
    cats: [{ id: 'a', name: 'К'.repeat(100), uz: 5 }, { id: 'a', name: 'Дубль' }, null, 'x', { name: '' }],
    items: [
      { id: 'j1', cat: 'нет-такой', name: '  ', uz: 'U'.repeat(200), desc: 'D'.repeat(900), amount: -5, unit: 'tonn', price: -100, on: 'yes', pv: 'HACK' },
      { id: 'j1', cat: 'a', name: 'Дубликат id', amount: 1e9, unit: 'kg', price: 1e12 },
      { id: '../etc', cat: 'a', name: 'Плохой id', amount: 1.23456, unit: 'ml', price: 1500.7 },
      7, null
    ]
  };
  const r = await putProd(junk);
  assert.equal(r.status, 200);
  const prod = (await jsonOf(r)).prod;
  assert.equal(prod.cats.length, 3);
  assert.equal(new Set(prod.cats.map(c => c.id)).size, 3);
  assert.equal(prod.cats[0].name.length, 40);
  assert.equal(prod.cats[0].uz, '');
  assert.equal(prod.cats[2].name, 'Без названия');
  assert.equal(prod.items.length, 3);
  assert.equal(new Set(prod.items.map(i => i.id)).size, 3);
  const [a, b, c] = prod.items;
  assert.equal(a.cat, 'a');
  assert.equal(a.name, 'Без названия');
  assert.equal(a.uz.length, 60);
  assert.equal(a.desc.length, 300);
  assert.equal(a.amount, 0);
  assert.equal(a.unit, 'g');
  assert.equal(a.price, 0);
  assert.equal(a.on, true);
  assert.equal(a.pv, '');
  assert.equal(b.amount, 100000);
  assert.equal(b.price, 1e8);
  assert.ok(/^[A-Za-z0-9_-]{1,24}$/.test(c.id) && c.id !== '../etc');
  assert.equal(c.amount, 1.235);
  assert.equal(c.price, 1501);
  const many = { cats: Array.from({ length: 50 }, (_, i) => ({ id: 'k' + i, name: 'K' + i })), items: Array.from({ length: 400 }, (_, i) => ({ id: 'i' + i, cat: 'k1', name: 'I' + i, price: 1 })) };
  const rr = (await jsonOf(await putProd(many))).prod;
  assert.equal(rr.cats.length, 40);
  assert.equal(rr.items.length, 300);
  assert.equal((await call('PUT', '/api/admin/products', { init: iS(), body: 'не json' })).status, 400);
  await putProd(SAMPLE_PROD());
});

await t('фото товара: загрузка, открытая отдача, замена, удаление; чужие и битые файлы отклоняются', async () => {
  const jp = jpegBytes(800, 600, 20000);
  let r = await putPhoto('p1', jp);
  assert.equal(r.status, 200);
  const pv1 = (await jsonOf(r)).pv;
  assert.ok(pv1 && pv1.length >= 4);
  const img = await call('GET', '/img/p1?v=' + pv1, { headers: { 'content-type': 'image/jpeg' } });
  assert.equal(img.status, 200);
  assert.equal(img.headers.get('content-type'), 'image/jpeg');
  assert.ok(img.headers.get('cache-control').includes('immutable'));
  assert.deepEqual(new Uint8Array(await img.arrayBuffer()), jp);
  assert.equal((await getProd()).items[0].pv, pv1);
  // текстовые правки не затирают версию фото
  const cur = await getProd();
  cur.items[0].name = 'Масло подсолнечное 5 л'; cur.items[0].pv = 'EVIL';
  const saved = (await jsonOf(await putProd(cur))).prod;
  assert.equal(saved.items[0].pv, pv1);
  // замена даёт новую версию
  const jp2 = jpegBytes(640, 640, 5000);
  const pv2 = (await jsonOf(await putPhoto('p1', jp2))).pv;
  assert.notEqual(pv1, pv2);
  assert.deepEqual(new Uint8Array(await (await call('GET', '/img/p1?v=' + pv2)).arrayBuffer()), jp2);
  // неверные файлы
  assert.equal((await putPhoto('p1', new Uint8Array(5000).fill(7))).status, 400);
  assert.equal((await putPhoto('p1', jpegBytes(30, 30, 3000))).status, 400);
  assert.equal((await putPhoto('p1', jpegBytes(5000, 4000, 3000))).status, 400);
  assert.equal((await putPhoto('p1', jpegBytes(800, 600, 1))).status, 400);
  assert.equal((await putPhoto('p1', jpegBytes(800, 600, 400000))).status, 413);
  assert.equal((await putPhoto('nope', jp)).status, 404);
  assert.equal((await putPhoto('bad/id', jp)).status, 404);
  assert.equal((await call('GET', '/img/nope')).status, 404);
  assert.equal((await call('GET', '/img/..%2Fcfg')).status, 404);
  assert.equal((await getProd()).items[0].pv, pv2);
  // удаление
  const del = await call('DELETE', '/api/admin/photo/p1', { init: iS() });
  assert.equal(del.status, 200);
  assert.equal((await jsonOf(del)).pv, '');
  assert.equal((await call('GET', '/img/p1')).status, 404);
  assert.equal((await getProd()).items[0].pv, '');
  await putProd(SAMPLE_PROD());
});

await t('фото товара: при удалении товара его фото тоже удаляется', async () => {
  const pv = (await jsonOf(await putPhoto('p4', jpegBytes()))).pv;
  assert.ok(pv);
  assert.ok(await W.storage.get('p:p4'));
  const cur = await getProd();
  cur.items = cur.items.filter(i => i.id !== 'p4');
  await putProd(cur);
  assert.equal(await W.storage.get('p:p4'), undefined);
  assert.equal((await call('GET', '/img/p4')).status, 404);
  await putProd(SAMPLE_PROD());
});

await t('фото товара: до трёх фото, порядок без пропусков, отдача по номеру', async () => {
  const a = jpegBytes(800, 600, 6000), b = jpegBytes(700, 700, 7000), c = jpegBytes(640, 480, 8000);
  const img = async (v, n) => call('GET', '/img/p2?v=' + v + (n ? '&n=' + n : ''));
  // второе фото нельзя положить, пока нет первого; четвёртого не бывает
  assert.equal((await putPhoto('p2?n=2', b)).status, 400);
  assert.equal((await jsonOf(await putPhoto('p2?n=2', b))).error, 'bad_slot');
  assert.equal((await putPhoto('p2?n=4', b)).status, 400);
  assert.equal((await putPhoto('p2?n=0', b)).status, 400);
  assert.equal((await putPhoto('p2?n=abc', b)).status, 400);
  // обычная загрузка без номера = главное фото (как раньше)
  let r = await jsonOf(await putPhoto('p2', a));
  assert.ok(r.pv && !r.pv2 && !r.pv3);
  assert.equal((await putPhoto('p2?n=3', c)).status, 400);                  // через пропуск нельзя
  r = await jsonOf(await putPhoto('p2?n=2', b));
  assert.ok(r.pv && r.pv2 && !r.pv3);
  r = await jsonOf(await putPhoto('p2?n=3', c));
  assert.ok(r.pv && r.pv2 && r.pv3);
  const it = (await getProd()).items.find(x => x.id === 'p2');
  assert.deepEqual([it.pv, it.pv2, it.pv3], [r.pv, r.pv2, r.pv3]);
  assert.deepEqual(new Uint8Array(await (await img(r.pv)).arrayBuffer()), a);
  assert.deepEqual(new Uint8Array(await (await img(r.pv, 1)).arrayBuffer()), a);
  assert.deepEqual(new Uint8Array(await (await img(r.pv2, 2)).arrayBuffer()), b);
  assert.deepEqual(new Uint8Array(await (await img(r.pv3, 3)).arrayBuffer()), c);
  assert.ok((await img(r.pv3, 3)).headers.get('cache-control').includes('immutable'));
  assert.equal((await call('GET', '/img/p2?n=4')).status, 200);             // неверный номер = главное фото
  assert.deepEqual(new Uint8Array(await (await call('GET', '/img/p2?n=4')).arrayBuffer()), a);
  // замена второго меняет только его версию
  const b2 = jpegBytes(500, 500, 4000);
  const r2 = await jsonOf(await putPhoto('p2?n=2', b2));
  assert.equal(r2.pv, r.pv); assert.equal(r2.pv3, r.pv3); assert.notEqual(r2.pv2, r.pv2);
  assert.deepEqual(new Uint8Array(await (await img(r2.pv2, 2)).arrayBuffer()), b2);
  // текстовые правки не трогают версии всех трёх
  const cur = await getProd();
  const ci = cur.items.find(x => x.id === 'p2');
  ci.name = 'Другое имя'; ci.pv2 = 'EVIL'; ci.pv3 = 'EVIL'; ci.pv = 'EVIL';
  const sv = (await jsonOf(await putProd(cur))).prod.items.find(x => x.id === 'p2');
  assert.deepEqual([sv.pv, sv.pv2, sv.pv3], [r2.pv, r2.pv2, r2.pv3]);
  // удаление среднего сдвигает третье на его место, версии новые
  const d = await jsonOf(await call('DELETE', '/api/admin/photo/p2?n=2', { init: iS() }));
  assert.equal(d.pv, r2.pv);
  assert.ok(d.pv2 && d.pv2 !== r2.pv2 && d.pv2 !== r2.pv3);
  assert.equal(d.pv3, '');
  assert.deepEqual(new Uint8Array(await (await img(d.pv2, 2)).arrayBuffer()), c);
  assert.equal((await call('GET', '/img/p2?n=3')).status, 404);             // третьего фото больше нет
  assert.equal(await W.storage.get('p3:p2'), undefined);
  // удаление главного сдвигает всё влево
  const d1 = await jsonOf(await call('DELETE', '/api/admin/photo/p2', { init: iS() }));
  assert.ok(d1.pv && d1.pv !== r2.pv && !d1.pv2 && !d1.pv3);
  assert.deepEqual(new Uint8Array(await (await img(d1.pv)).arrayBuffer()), c);
  assert.equal(await W.storage.get('p2:p2'), undefined);
  // удаление несуществующего номера не ломает
  assert.equal((await call('DELETE', '/api/admin/photo/p2?n=3', { init: iS() })).status, 200);
  assert.equal((await call('DELETE', '/api/admin/photo/p2?n=9', { init: iS() })).status, 400);
  // последнее фото
  const d2 = await jsonOf(await call('DELETE', '/api/admin/photo/p2', { init: iS() }));
  assert.deepEqual([d2.pv, d2.pv2, d2.pv3], ['', '', '']);
  assert.equal((await call('GET', '/img/p2')).status, 404);
  assert.equal((await putPhoto('nope?n=2', a)).status, 404);
  await putProd(SAMPLE_PROD());
});

await t('фото товара: при удалении товара удаляются все три фото', async () => {
  for (const n of [1, 2, 3]) assert.equal((await putPhoto('p4?n=' + n, jpegBytes(800, 600, 4000 + n))).status, 200);
  assert.ok(await W.storage.get('p:p4') && await W.storage.get('p2:p4') && await W.storage.get('p3:p4'));
  const cur = await getProd();
  cur.items = cur.items.filter(i => i.id !== 'p4');
  await putProd(cur);
  for (const k of ['p:p4', 'p2:p4', 'p3:p4']) assert.equal(await W.storage.get(k), undefined, k);
  await putProd(SAMPLE_PROD());
});

await t('фото товара: клиент и гость не загружают и не удаляют', async () => {
  assert.equal((await putPhoto('p1?n=1', jpegBytes(), iA())).status, 403);
  assert.equal((await putPhoto('p1', jpegBytes(), 'bad')).status >= 400, true);
  assert.equal((await call('DELETE', '/api/admin/photo/p1?n=1', { init: iA() })).status, 403);
  assert.equal((await getProd()).items.find(x => x.id === 'p1').pv, '');
  await putProd(SAMPLE_PROD());
});

/* ---------- заказы ---------- */
let orderA, clientA;
await t('заказ с самовывозом: сервер сам считает цену, продавцу приходит карточка, клиенту подтверждение', async () => {
  clientA = newUser();
  tgLog = [];
  const r = await place(clientA, CART, { total: 1, price: 1, items: [{ name: 'x', price: 1 }], status: 'done', uid: 5, mode: 'delivery' });
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  orderA = d.order;
  assert.match(orderA.id, /^Z-[A-Z2-9]{5}$/);
  assert.equal(orderA.total, 1394000);
  assert.equal(orderA.status, 'new');
  assert.equal(orderA.mode, 'pickup');
  assert.equal(orderA.address, '');
  assert.equal(orderA.uid, undefined);
  assert.equal(orderA.tg, undefined);
  assert.equal(orderA.msgs, undefined);
  assert.deepEqual(orderA.items.map(i => [i.id, i.name, i.price, i.qty, i.unit, i.amount]), [['p1', 'Масло подсолнечное', 82000, 2, 'l', 5], ['p2', 'Рис', 410000, 3, 'kg', 25]]);
  assert.equal(orderA.name, 'ООО Ориент');
  const toSeller = lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes(orderA.id));
  assert.ok(toSeller, 'продавцу не пришла карточка');
  const txt = norm(toSeller.payload.text);
  assert.ok(txt.includes('Масло подсолнечное (5 л) × 2 = 164 000 сум'), txt);
  assert.ok(txt.includes('Рис (25 кг) × 3 = 1 230 000 сум'), txt);
  assert.ok(txt.includes('Самовывоз: ') && !txt.includes('Адрес:'));
  assert.ok(txt.includes('Итого: 1 394 000 сум, оплата при получении'));
  assert.ok(txt.includes('+998 91 555 44 33') && txt.includes('Позвоните за час'));
  assert.ok(txt.includes('@' + clientA.u.username) || txt.includes('без username'));
  assert.ok(txt.includes('Статус: Новый'));
  const kb = toSeller.payload.reply_markup.inline_keyboard.flat();
  assert.ok(kb.some(b => b.callback_data === 's:' + orderA.id + ':accepted'));
  assert.ok(kb.some(b => b.callback_data === 'c:' + orderA.id));
  assert.ok(kb.every(b => !b.callback_data || b.callback_data.length <= 64));
  const toCust = lastTg('sendMessage', p => p.chat_id === clientA.u.id);
  assert.ok(toCust && toCust.payload.text.includes(orderA.id) && norm(toCust.payload.text).includes('1 394 000'));
  assert.ok(toCust.payload.text.includes('Самовывоз:'));
  const mine = await jsonOf(await call('GET', '/api/my-orders', { init: clientA.init() }));
  assert.equal(mine.orders.length, 1);
  assert.equal(mine.orders[0].uid, undefined);
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: iB() }))).orders.length, 0);
});

let orderD, clientD;
await t('заказ с доставкой: адрес сохраняется и показывается продавцу и клиенту', async () => {
  clientD = newUser();
  tgLog = [];
  const r = await place(clientD, [{ id: 'p4', qty: 120 }], null, 'delivery');
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  orderD = d.order;
  assert.equal(orderD.mode, 'delivery');
  assert.equal(orderD.address, 'Навои, ул. Галаба 12, склад 3');
  assert.equal(orderD.total, 900000);
  const txt = norm(lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes(orderD.id)).payload.text);
  assert.ok(txt.includes('Доставка: ') && txt.includes('Адрес: Навои, ул. Галаба 12, склад 3'), txt);
  assert.ok(!txt.includes('Самовывоз'));
  assert.ok(txt.includes('Макароны (400 г) × 120 = 900 000 сум'));
  const cust = lastTg('sendMessage', p => p.chat_id === clientD.u.id).payload.text;
  assert.ok(cust.includes('Доставка: ') && cust.includes('Адрес доставки: Навои, ул. Галаба 12, склад 3'), cust);
  const stored = await W.storage.get('o:' + orderD.id);
  assert.equal(stored.mode, 'delivery');
  assert.equal(stored.uid, clientD.u.id);
});

await t('заказ: оптовое количество — 500 штук проходит, 501 и странные числа отклоняются', async () => {
  const c = newUser();
  let r = await place(c, [{ id: 'p4', qty: 500 }]);
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.order.total, 500 * 7500);
  assert.equal(d.order.items[0].qty, 500);
  await call('POST', '/api/cancel', { init: c.init(), body: { id: d.order.id } });
  for (const q of [501, 1000, 0, -1, 1.5, '2', null, true, NaN, 1e9]) {
    r = await call('POST', '/api/order', { init: c.init(), body: ob([{ id: 'p4', qty: q }], { expectTotal: undefined }) });
    assert.equal(r.status, 400, 'ждали отказ для qty=' + String(q) + ', получили ' + r.status);
  }
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders.filter(o => o.status === 'new').length, 0);
});

await t('заказ: мусор в корзине (пусто, не список, дубли, без id, 31 строка) отклоняется', async () => {
  const c = newUser();
  const bad = [[], 'p1', {}, null, [null], [{ qty: 1 }], [{ id: 5, qty: 1 }], [{ id: 'p1', qty: 1 }, { id: 'p1', qty: 2 }],
    Array.from({ length: 31 }, (_, i) => ({ id: 'p' + i, qty: 1 }))];
  for (const cart of bad) {
    const r = await call('POST', '/api/order', { init: c.init(), body: ob(cart, { expectTotal: undefined }) });
    assert.ok(r.status === 400 || r.status === 409, 'принято: ' + JSON.stringify(cart).slice(0, 50));
  }
  assert.equal((await call('POST', '/api/order', { init: c.init(), body: '{oops' })).status, 400);
  assert.ok([400, 413].includes((await call('POST', '/api/order', { init: c.init(), body: 'x'.repeat(30000) })).status));
  assert.equal((await call('POST', '/api/order', { body: ob(CART) })).status, 401);
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders.length, 0);
});

await t('заказ: подмена цены, товар «нет в наличии» и несуществующий — отказ со свежим каталогом', async () => {
  const c = newUser();
  let r = await call('POST', '/api/order', { init: c.init(), body: ob(CART, { expectTotal: 1000 }) });
  assert.equal(r.status, 409);
  let d = await jsonOf(r);
  assert.equal(d.error, 'price_changed');
  assert.equal(d.prod.items.length, 4);
  assert.equal(d.cfg.shop.delivery, true);
  r = await call('POST', '/api/order', { init: c.init(), body: ob([{ id: 'p3', qty: 1 }], { expectTotal: undefined }) });
  assert.equal(r.status, 409);
  d = await jsonOf(r);
  assert.equal(d.error, 'unavailable');
  assert.equal(d.prod.items[2].on, false);
  r = await call('POST', '/api/order', { init: c.init(), body: ob([{ id: 'p1', qty: 1 }, { id: 'zzz', qty: 1 }], { expectTotal: undefined }) });
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'unavailable');
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders.length, 0);
});

await t('заказ: цены продавца действуют сразу, старая сумма требует подтверждения, старые заказы не меняются', async () => {
  const cur = await getProd();
  cur.items[0].price = 90000;
  await putProd(cur);
  const c = newUser();
  let r = await place(c, [{ id: 'p1', qty: 2 }]);              // клиент считал по 82 000
  assert.equal(r.status, 409);
  const d = await jsonOf(r);
  assert.equal(d.error, 'price_changed');
  assert.equal(d.prod.items[0].price, 90000);
  r = await call('POST', '/api/order', { init: c.init(), body: ob([{ id: 'p1', qty: 2 }], { expectTotal: 180000 }) });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).order.total, 180000);
  // уже оформленный заказ хранит цену на момент заказа
  const old = (await jsonOf(await call('GET', '/api/my-orders', { init: clientA.init() }))).orders[0];
  assert.equal(old.total, 1394000);
  assert.equal(old.items[0].price, 82000);
  // товар закончился, пока клиент оформлял
  const cur2 = await getProd();
  cur2.items[0].on = false;
  await putProd(cur2);
  r = await call('POST', '/api/order', { init: c.init(), body: ob([{ id: 'p1', qty: 1 }, { id: 'p2', qty: 1 }], { expectTotal: undefined }) });
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'unavailable');
  await putProd(SAMPLE_PROD());
});

await t('заказ: форма — имя, телефон, адрес доставки проверяются; способ-мусор считается самовывозом', async () => {
  const c = newUser();
  const post = (form, mode) => call('POST', '/api/order', { init: c.init(), body: ob(CART, { form }, mode) });
  const pf = formFor(S.DEFAULT, 'pickup'), df = formFor(S.DEFAULT, 'delivery');
  assert.equal((await post(Object.assign({}, pf, { name: '  ' }))).status, 400);
  assert.equal((await post(Object.assign({}, pf, { phone: '12' }))).status, 400);
  assert.equal((await post(Object.assign({}, pf, { phone: '9'.repeat(20) }))).status, 400);
  assert.equal((await post(null)).status, 400);
  // доставка без адреса или с коротким
  for (const address of ['', '   ', 'ул', undefined, 12345]) {
    const r = await post(Object.assign({}, df, { address }));
    assert.equal(r.status, 400, 'адрес ' + JSON.stringify(address));
    assert.equal((await jsonOf(r)).error, 'bad_request');
  }
  // самовывоз: адрес не нужен и не сохраняется
  let r = await post(Object.assign({}, pf, { address: 'Навои, лишний адрес' }));
  assert.equal(r.status, 200);
  let o = (await jsonOf(r)).order;
  assert.equal(o.mode, 'pickup'); assert.equal(o.address, '');
  // неизвестный способ получения = самовывоз
  r = await post(Object.assign({}, pf, { mode: 'teleport', address: 'где-то' }));
  assert.equal(r.status, 200);
  o = (await jsonOf(r)).order;
  assert.equal(o.mode, 'pickup'); assert.equal(o.address, '');
  // адрес чистится и обрезается
  r = await post(Object.assign({}, df, { address: 'Навои\nул. Галаба\u0000 12 ' + 'я'.repeat(300) }));
  assert.equal(r.status, 200);
  o = (await jsonOf(r)).order;
  assert.equal(o.mode, 'delivery');
  assert.equal(o.address.length, 200);
  assert.ok(!/[\u0000-\u001f]/.test(o.address));
  assert.ok(o.address.startsWith('Навои ул. Галаба'));
  // комментарий: переносы строк остаются, управляющие символы убираются
  r = await post(Object.assign({}, pf, { comment: 'строка 1\nстрока 2\u0000' + 'x'.repeat(600) }));
  o = (await jsonOf(r)).order;
  assert.ok(o.comment.includes('строка 1\nстрока 2') && !o.comment.includes('\u0000'));
  assert.equal(o.comment.length, 500);
  for (const id of (await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders.map(x => x.id)) await call('POST', '/api/cancel', { init: c.init(), body: { id } });
});

await t('заказ: время проверяется (слишком рано, не по сетке, вне часов, далеко вперёд, мусор)', async () => {
  const c = newUser();
  const today = S.ymd(S.shopNow());
  const far = S.ymd(new Date(S.shopNow().getTime() + 90 * 86400000));
  const f = formFor(S.DEFAULT, 'pickup');
  for (const form of [
    Object.assign({}, f, { date: '2020-01-01', time: '10:00' }),
    Object.assign({}, f, { time: '10:07' }),
    Object.assign({}, f, { time: '03:00' }),
    Object.assign({}, f, { time: '23:30' }),
    Object.assign({}, f, { date: far }),
    Object.assign({}, f, { date: '2026-13-45' }),
    Object.assign({}, f, { date: 'завтра' }),
    Object.assign({}, f, { date: undefined }),
    Object.assign({}, f, { time: 930 })
  ]) {
    const r = await call('POST', '/api/order', { init: c.init(), body: ob(CART, { form }) });
    assert.equal(r.status, 400, JSON.stringify(form));
    assert.equal((await jsonOf(r)).error, 'pickup');
  }
  // доставка «на сегодня» невозможна при запасе 24 часа
  const df = formFor(S.DEFAULT, 'delivery', { date: today, time: '20:00' });
  const r = await call('POST', '/api/order', { init: c.init(), body: ob(CART, { form: df }, 'delivery') });
  assert.equal(r.status, 400);
  assert.equal((await jsonOf(r)).error, 'pickup');
});

await t('сроки: самовывоз и доставка считаются по своим настройкам', async () => {
  const c = newUser();
  const post = async (form, mode) => { const r = await call('POST', '/api/order', { init: c.init(), body: ob(CART, { form }, mode) }); return { status: r.status, d: await jsonOf(r) }; };
  const drop = async x => { if (x.status === 200) await call('POST', '/api/cancel', { init: c.init(), body: { id: x.d.order.id } }); };
  const quick = formFor(S.DEFAULT, 'pickup');                    // самое раннее время самовывоза (через 2 ч)
  try {
    // доставка на это же время: слишком рано (нужны 24 ч)
    let x = await post(Object.assign({}, quick, { mode: 'delivery', address: 'Навои, ул. Галаба 12' }));
    assert.equal(x.status, 400);
    assert.equal(x.d.error, 'pickup');
    // время доставки подходит и для самовывоза
    x = await post(Object.assign({}, formFor(S.DEFAULT, 'delivery'), { mode: 'pickup', address: '' }));
    assert.equal(x.status, 200, JSON.stringify(x.d));
    await drop(x);
    // настройки обрезаются до 240 часов
    assert.equal((await putCfg(s => { s.leadHours = 500; s.deliveryLeadHours = -3; })).status, 200);
    const cfg = await getCfg();
    assert.equal(cfg.shop.leadHours, 240);
    assert.equal(cfg.shop.deliveryLeadHours, 0);
    // доставка без запаса: раннее время теперь подходит
    x = await post(formFor(cfg, 'delivery'), 'delivery');
    assert.equal(x.status, 200, JSON.stringify(x.d));
    await drop(x);
    // а самовывоз теперь только через 10 суток
    x = await post(quick);
    assert.equal(x.status, 400);
    assert.equal(x.d.error, 'pickup');
    x = await post(formFor(cfg, 'pickup'));
    assert.equal(x.status, 200, JSON.stringify(x.d));
    await drop(x);
  } finally {
    assert.equal((await putCfg(s => { s.leadHours = 2; s.deliveryLeadHours = 24; })).status, 200);
  }
});

await t('доставка можно отключить: заказ на доставку отклоняется со свежими настройками, самовывоз работает', async () => {
  const c = newUser();
  assert.equal((await putCfg(s => { s.delivery = false; })).status, 200);
  assert.equal((await getCfg()).shop.delivery, false);
  let r = await place(c, CART, null, 'delivery');
  assert.equal(r.status, 409);
  const d = await jsonOf(r);
  assert.equal(d.error, 'no_delivery');
  assert.equal(d.cfg.shop.delivery, false);
  assert.equal(d.prod.items.length, 4);
  r = await place(c, CART, null, 'pickup');
  assert.equal(r.status, 200);
  await call('POST', '/api/cancel', { init: c.init(), body: { id: (await jsonOf(r)).order.id } });
  assert.equal((await putCfg(s => { s.delivery = true; })).status, 200);
  assert.equal((await place(c, CART, null, 'delivery')).status, 200);
  for (const o of (await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders) await call('POST', '/api/cancel', { init: c.init(), body: { id: o.id } });
});

await t('заказ: ошибки Telegram не мешают принять заказ', async () => {
  const c = newUser();
  tgFail = true;
  const r = await place(c, CART);
  tgFail = false;
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  await call('POST', '/api/cancel', { init: c.init(), body: { id: d.order.id } });
});

await t('заказ: узбекский клиент получает подтверждение по-узбекски, продавцу карточка по-русски', async () => {
  const c = newUser();
  tgLog = [];
  let r = await place(c, CART, { lang: 'uz' });
  assert.equal(r.status, 200);
  let m = lastTg('sendMessage', p => p.chat_id === c.u.id);
  assert.ok(m.payload.text.includes('sotuvchiga yuborildi') && m.payload.text.includes('Olib ketish:') && m.payload.text.includes('soʻm'), m.payload.text);
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].text, 'Buyurtmalarim');
  assert.ok(lastTg('sendMessage', p => p.chat_id === SELLER.id).payload.text.includes('Товары:'));
  tgLog = [];
  r = await place(c, CART, { lang: 'uz' }, 'delivery');
  assert.equal(r.status, 200);
  m = lastTg('sendMessage', p => p.chat_id === c.u.id);
  assert.ok(m.payload.text.includes('Yetkazib berish:') && m.payload.text.includes('Yetkazib berish manzili: Навои'), m.payload.text);
  for (const o of (await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders) await call('POST', '/api/cancel', { init: c.init(), body: { id: o.id } });
});

await t('защита от спама: не больше 5 неподтверждённых заказов от одного человека', async () => {
  const c = newUser();
  const ids = [];
  let last = null;
  for (let i = 0; i < 7; i++) {
    const r = await place(c, [{ id: 'p4', qty: 1 }]);
    last = r.status;
    if (r.status === 200) ids.push((await jsonOf(r)).order.id);
    else { assert.equal((await jsonOf(r)).error, 'too_many'); break; }
  }
  assert.equal(ids.length, 5);
  assert.equal(last, 429);
  const other = newUser();
  const r = await place(other, [{ id: 'p4', qty: 1 }]);
  assert.equal(r.status, 200);
  await call('POST', '/api/cancel', { init: other.init(), body: { id: (await jsonOf(r)).order.id } });
  for (const id of ids) await call('POST', '/api/cancel', { init: c.init(), body: { id } });
  assert.equal((await place(c, [{ id: 'p4', qty: 1 }])).status, 200);   // после отмены место освободилось
});

await t('защита склада: при 300 активных заказах новые не принимаются', async () => {
  const act = await W.storage.get('act');
  await W.storage.put('act', Array.from({ length: 300 }, (_, i) => 'FAKE' + i));
  const r = await place(newUser(), [{ id: 'p4', qty: 1 }]);
  assert.equal(r.status, 503);
  assert.equal((await jsonOf(r)).error, 'busy');
  await W.storage.put('act', act);
  assert.equal((await place(newUser(), [{ id: 'p4', qty: 1 }])).status, 200);
});

await t('панель продавца: клиенту закрыта, продавец видит заказы с контактами, способом и адресом', async () => {
  assert.equal((await call('GET', '/api/admin/orders', { init: iA() })).status, 403);
  assert.equal((await call('POST', '/api/admin/status', { init: clientA.init(), body: { id: orderA.id, to: 'accepted' } })).status, 403);
  assert.equal((await call('PUT', '/api/admin/config', { init: iA(), body: { cfg: S.DEFAULT } })).status, 403);
  const d = await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }));
  const a = d.orders.find(x => x.id === orderA.id), b = d.orders.find(x => x.id === orderD.id);
  assert.ok(a && b);
  assert.equal(a.phone, '+998 91 555 44 33');
  assert.equal(b.mode, 'delivery');
  assert.equal(b.address, 'Навои, ул. Галаба 12, склад 3');
  assert.equal(a.uid, undefined);
  assert.equal(a.msgs, undefined);
  assert.ok(a.tg && typeof a.tg === 'object');
});

await t('статусы самовывоза: нельзя перепрыгнуть, клиент получает сообщения, карточка продавца обновляется', async () => {
  let r = await call('POST', '/api/admin/status', { init: iS(), body: { id: orderA.id, to: 'ready' } });
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'bad_transition');
  assert.equal((await call('POST', '/api/admin/status', { init: iS(), body: { id: 'Z-NOPE1', to: 'accepted' } })).status, 404);
  tgLog = [];
  r = await call('POST', '/api/admin/status', { init: iS(), body: { id: orderA.id, to: 'accepted' } });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).order.status, 'accepted');
  assert.ok(lastTg('sendMessage', p => p.chat_id === clientA.u.id).payload.text.includes('принят в работу'));
  const edit = lastTg('editMessageText', p => p.chat_id === SELLER.id);
  assert.ok(edit.payload.text.includes('Статус: В работе'));
  const kb = edit.payload.reply_markup.inline_keyboard.flat();
  assert.ok(kb.some(b => b.callback_data === 's:' + orderA.id + ':ready' && b.text.includes('Готов к выдаче')));
  // повтор того же статуса ничего не рассылает
  tgLog = [];
  assert.equal((await call('POST', '/api/admin/status', { init: iS(), body: { id: orderA.id, to: 'accepted' } })).status, 200);
  assert.equal(tgLog.length, 0);
  // клиент уже не может отменить сам
  r = await call('POST', '/api/cancel', { init: clientA.init(), body: { id: orderA.id } });
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'not_cancellable');
  // готов → выдан
  tgLog = [];
  await call('POST', '/api/admin/status', { init: iS(), body: { id: orderA.id, to: 'ready' } });
  assert.ok(lastTg('sendMessage', p => p.chat_id === clientA.u.id).payload.text.includes('готов, можно забирать'));
  const e2 = lastTg('editMessageText', p => p.chat_id === SELLER.id);
  assert.ok(e2.payload.text.includes('Статус: Готов к выдаче'));
  assert.ok(e2.payload.reply_markup.inline_keyboard.flat().some(b => b.callback_data === 's:' + orderA.id + ':done' && b.text.includes('Выдан клиенту')));
  tgLog = [];
  await call('POST', '/api/admin/status', { init: iS(), body: { id: orderA.id, to: 'done' } });
  assert.ok(lastTg('sendMessage', p => p.chat_id === clientA.u.id).payload.text.includes('Спасибо, что выбрали'));
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id).payload.text.includes('Статус: Выдан'));
  const st = (await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).stats;
  assert.equal(st.doneCount, 1);
  assert.equal(st.doneSum, 1394000);
  assert.equal((await call('POST', '/api/admin/status', { init: iS(), body: { id: orderA.id, to: 'cancelled' } })).status, 409);
});

await t('статусы доставки: «Готов к отправке», «Доставлен клиенту», сообщения клиенту с адресом', async () => {
  tgLog = [];
  await call('POST', '/api/admin/status', { init: iS(), body: { id: orderD.id, to: 'accepted' } });
  const acc = lastTg('sendMessage', p => p.chat_id === clientD.u.id).payload.text;
  assert.ok(acc.includes('принят в работу') && acc.includes('Адрес доставки: Навои'), acc);
  const e1 = lastTg('editMessageText', p => p.chat_id === SELLER.id);
  assert.ok(e1.payload.reply_markup.inline_keyboard.flat().some(b => b.callback_data === 's:' + orderD.id + ':ready' && b.text.includes('Готов к отправке')));
  tgLog = [];
  await call('POST', '/api/admin/status', { init: iS(), body: { id: orderD.id, to: 'ready' } });
  const rdy = lastTg('sendMessage', p => p.chat_id === clientD.u.id).payload.text;
  assert.ok(rdy.includes('собран и скоро будет доставлен') && !rdy.includes('можно забирать'), rdy);
  const e2 = lastTg('editMessageText', p => p.chat_id === SELLER.id);
  assert.ok(e2.payload.text.includes('Статус: Готов к отправке'));
  assert.ok(e2.payload.reply_markup.inline_keyboard.flat().some(b => b.callback_data === 's:' + orderD.id + ':done' && b.text.includes('Доставлен клиенту')));
  tgLog = [];
  await call('POST', '/api/admin/status', { init: iS(), body: { id: orderD.id, to: 'done' } });
  assert.ok(lastTg('sendMessage', p => p.chat_id === clientD.u.id).payload.text.includes('доставлен. Спасибо'));
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id).payload.text.includes('Статус: Доставлен'));
  const st = (await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).stats;
  assert.equal(st.doneCount, 2);
  assert.equal(st.doneSum, 1394000 + 900000);
});

await t('названия статусов: у самовывоза и доставки свои, на двух языках', async () => {
  assert.equal(S.stOf('ready', 'pickup').name, 'Готов к выдаче');
  assert.equal(S.stOf('ready', 'delivery').name, 'Готов к отправке');
  assert.equal(S.stOf('done', 'pickup').name, 'Выдан');
  assert.equal(S.stOf('done', 'delivery').name, 'Доставлен');
  assert.equal(S.stOf('ready', 'delivery').uz, 'Joʻnatishga tayyor');
  assert.equal(S.stOf('done', 'delivery').uz, 'Yetkazildi');
  assert.equal(S.stOf('new', 'delivery').name, 'Новый');
  assert.equal(S.stOf('cancelled', undefined).name, 'Отменён');
  assert.equal(S.stOf('ready', 'delivery').c, 'ok');
});

await t('кнопки в боте: чужой нажать не может, устаревшая кнопка безвредна, отмена требует подтверждения', async () => {
  const c = newUser();
  const o = (await jsonOf(await place(c, [{ id: 'p4', qty: 10 }]))).order;
  tgLog = [];
  await cb(ANNA, 's:' + o.id + ':accepted');
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Нет доступа'));
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders[0].status, 'new');
  // отмена: запрос подтверждения → назад → подтверждение
  await cb(SELLER, 'c:' + o.id, 778);
  const e = lastTg('editMessageText', p => p.message_id === 778);
  const kb = e.payload.reply_markup.inline_keyboard.flat();
  assert.ok(kb.some(b => b.callback_data === 's:' + o.id + ':cancelled'));
  assert.ok(kb.some(b => b.callback_data === 'b:' + o.id));
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders[0].status, 'new');
  await cb(SELLER, 'b:' + o.id, 778);
  assert.ok(lastTg('editMessageText', p => p.message_id === 778).payload.reply_markup.inline_keyboard.flat().some(b => b.callback_data === 's:' + o.id + ':accepted'));
  // принять, потом нажать старую кнопку «принять» ещё раз
  await cb(SELLER, 's:' + o.id + ':accepted', 778);
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':accepted', 778);
  assert.equal(tgAll('sendMessage', p => p.chat_id === c.u.id).length, 0, 'клиенту ушло повторное сообщение');
  await cb(SELLER, 's:' + o.id + ':done', 778);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Статус уже другой'));
  // отменить принятый заказ
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':cancelled', 778);
  assert.equal((await jsonOf(await call('GET', '/api/my-orders', { init: c.init() }))).orders[0].status, 'cancelled');
  assert.ok(lastTg('sendMessage', p => p.chat_id === c.u.id).payload.text.includes('отменён'));
  // несуществующий заказ
  tgLog = [];
  await cb(SELLER, 's:Z-NOPE1:accepted');
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('не найден'));
});

await t('клиент отменяет новый заказ сам: чужой отменить не может, продавец получает уведомление', async () => {
  const c = newUser();
  const o = (await jsonOf(await place(c, [{ id: 'p4', qty: 10 }], null, 'delivery'))).order;
  assert.equal((await call('POST', '/api/cancel', { init: iB(), body: { id: o.id } })).status, 404);
  tgLog = [];
  const r = await call('POST', '/api/cancel', { init: c.init(), body: { id: o.id } });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).order.status, 'cancelled');
  assert.ok(lastTg('sendMessage', p => p.chat_id === SELLER.id).payload.text.includes('Клиент отменил'));
  assert.ok(lastTg('sendMessage', p => p.chat_id === SELLER.id).payload.text.startsWith('❌ Mijoz ' + o.id + ' buyurtmasini bekor qildi'), 'узбекский сверху');
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id).payload.text.includes('Статус: Отменён'));
  assert.equal((await call('POST', '/api/cancel', { init: c.init(), body: { id: o.id } })).status, 409);   // повторно нельзя
});

await t('большой заказ: 30 длинных позиций по 500 штук умещаются в сообщение Telegram, кнопки остаются', async () => {
  const items = Array.from({ length: 30 }, (_, i) => ({ id: 'big' + i, cat: 'oil', name: ('Очень длинное название номер ' + i + ' ').padEnd(60, 'ы'), uz: 'U', desc: '', amount: 99999.999, unit: 'kg', price: 99999999, on: true }));
  await putProd({ cats: SAMPLE_PROD().cats, items });
  assert.equal((await putCfg(s => { s.name = 'Очень длинное название оптовой компании'.padEnd(60, '!'); })).status, 200);
  const c = newUser();
  tgLog = [];
  const cart = items.map(i => ({ id: i.id, qty: 500 }));
  const form = formFor(S.DEFAULT, 'delivery', { comment: 'К'.repeat(500), address: 'А'.repeat(200), name: 'Н'.repeat(60) });
  const r = await call('POST', '/api/order', { init: c.init(), body: { cart, form, lang: 'ru', expectTotal: 30 * 500 * 99999999 } });
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.order.items.length, 30);
  const m = lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes(d.order.id));
  assert.ok(m.payload.text.length <= 4096, 'длина ' + m.payload.text.length);
  assert.ok(m.payload.text.includes('и ещё') && m.payload.text.includes('Итого:'), 'список не сокращён');
  assert.ok(m.payload.text.includes('va yana') && m.payload.text.includes('Jami:'), 'узбекская часть тоже сокращена, итог на месте');
  assert.ok(m.payload.reply_markup.inline_keyboard.flat().length >= 2);
  // полный список остаётся в заказе
  assert.equal((await W.storage.get('o:' + d.order.id)).items.length, 30);
  await call('POST', '/api/cancel', { init: c.init(), body: { id: d.order.id } });
  await putProd(SAMPLE_PROD());
  assert.equal((await putCfg(s => { s.name = DEFAULT_NAME; })).status, 200);
});

await t('настройки: мусор от клиента чистится, лишние поля отбрасываются', async () => {
  const junk = {
    shop: { name: '<b>' + 'Я'.repeat(200) + '</b>', telegram: '@bad name!', leadHours: -5, deliveryLeadHours: 9999, openFrom: 30, openTo: 2, address: 'x'.repeat(500), addressUz: 'y'.repeat(500), phone: 'z'.repeat(100), delivery: 'maybe' },
    menu: { weird: true }, basePerKg: 5
  };
  const r = await call('PUT', '/api/admin/config', { init: iS(), body: { cfg: junk } });
  assert.equal(r.status, 200);
  const c = (await jsonOf(r)).cfg;
  assert.equal(c.shop.name.length, 60);
  assert.equal(c.shop.telegram, 'badname');
  assert.equal(c.shop.leadHours, 0);
  assert.equal(c.shop.deliveryLeadHours, 240);
  assert.ok(c.shop.openFrom <= 22 && c.shop.openTo > c.shop.openFrom && c.shop.openTo <= 23);
  assert.equal(c.shop.address.length, 120);
  assert.equal(c.shop.addressUz.length, 120);
  assert.equal(c.shop.phone.length, 30);
  assert.equal(c.shop.delivery, true);
  assert.equal(c.menu, undefined);
  assert.equal(c.basePerKg, undefined);
  // delivery: false сохраняется только как явное «выключено»
  assert.equal((await jsonOf(await call('PUT', '/api/admin/config', { init: iS(), body: { cfg: { shop: { delivery: false } } } }))).cfg.shop.delivery, false);
  assert.equal((await jsonOf(await call('PUT', '/api/admin/config', { init: iS(), body: { cfg: {} } }))).cfg.shop.name, 'Оптовая база');
  assert.equal((await call('PUT', '/api/admin/config', { init: iS(), body: 'не json' })).status, 400);
  assert.equal((await putCfg(s => { s.name = DEFAULT_NAME; })).status, 200);
});

await t('название компании из настроек попадает в приветствие бота и в сообщения клиентам', async () => {
  assert.equal((await putCfg(s => { s.name = 'Навои Трейд'; s.telegram = 'navoi_trade'; s.phone = '+998 79 123 45 67'; s.address = 'Навои, ул. Островского 5'; s.addressUz = 'Navoiy, Ostrovskiy koʻchasi 5'; })).status, 200);
  tgLog = [];
  await send({ update_id: 60, message: { message_id: 60, from: ANNA, chat: { id: ANNA.id, type: 'private' }, text: '/start' } });
  assert.ok(lastTg('sendMessage').payload.text.includes('Навои Трейд'));
  // адрес самовывоза в подтверждении
  const c = newUser();
  const o = (await jsonOf(await place(c, [{ id: 'p4', qty: 3 }]))).order;
  assert.ok(lastTg('sendMessage', p => p.chat_id === c.u.id).payload.text.includes('Адрес: Навои, ул. Островского 5'));
  assert.ok(lastTg('sendMessage', p => p.chat_id === SELLER.id).payload.text.includes('Навои Трейд'));
  // при отмене продавцом клиент получает контакты
  tgLog = [];
  await call('POST', '/api/admin/status', { init: iS(), body: { id: o.id, to: 'cancelled' } });
  const cn = lastTg('sendMessage', p => p.chat_id === c.u.id).payload.text;
  assert.ok(cn.includes('отменён продавцом') && cn.includes('@navoi_trade') && cn.includes('+998 79 123 45 67'), cn);
  assert.equal((await putCfg(s => { s.name = DEFAULT_NAME; s.telegram = ''; s.phone = ''; s.address = ''; s.addressUz = ''; })).status, 200);
});

await t('общий код: текст заказа для Telegram одинаковый для приложения и сервера, срок и сетка времени', async () => {
  const o = { id: 'Z-TEST1', mode: 'delivery', address: 'Навои', pickupAt: '2026-11-05T10:30', name: 'Тест', phone: '+998901234567', comment: '', total: 164000,
    items: [{ id: 'p1', name: 'Масло', uz: 'Yogʻ', amount: 5, unit: 'l', price: 82000, qty: 2 }] };
  S.setLang('ru');
  const txt = norm(S.orderText(o, { name: 'Оптовая база' }));
  assert.ok(txt.includes('Заказ Z-TEST1 — Оптовая база') && txt.includes('Масло (5 л) × 2 = 164 000 сум') && txt.includes('Адрес: Навои') && txt.includes('Итого: 164 000 сум'));
  S.setLang('uz');
  assert.ok(norm(S.orderText(o, { name: 'X' })).includes('Yogʻ (5 l) × 2 = 164 000 soʻm'));
  S.setLang('ru');
  // сетка времени: шаг 30 минут, внутри часов работы, не раньше запаса
  const now = new Date('2026-11-05T09:10:00');
  const pk = S.pickupInfo(S.DEFAULT, now, 2);
  assert.equal(pk.min, '2026-11-05');
  assert.deepEqual(pk.slots('2026-11-05').slice(0, 3), ['11:30', '12:00', '12:30']);
  assert.equal(pk.slots('2026-11-05').at(-1), '20:00');
  const late = S.pickupInfo(S.DEFAULT, new Date('2026-11-05T19:00:00'), 24);
  assert.equal(late.min, '2026-11-06');
  assert.equal(S.leadFor(S.DEFAULT, 'delivery'), 24);
  assert.equal(S.leadFor(S.DEFAULT, 'pickup'), 2);
});

await t('настройка /setup: форма, неверный код, верный код подключает бота и кнопку меню «Каталог»', async () => {
  const f = await call('GET', '/setup');
  assert.equal(f.status, 200);
  assert.ok((await f.text()).includes('type="password"'));
  tgLog = [];
  let r = await call('POST', '/setup', { body: 'code=nope', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.ok((await r.text()).includes('Неверный код'));
  assert.equal(tgLog.length, 0);
  r = await call('POST', '/setup', { body: 'code=' + encodeURIComponent(CODE), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const page = await r.text();
  assert.ok(page.includes('distro_test_bot'));
  assert.ok(!page.includes('✘'));
  const hook = lastTg('setWebhook').payload;
  assert.equal(hook.url, HOST + '/webhook');
  assert.equal(hook.secret_token, await webhookSecret());
  assert.match(hook.secret_token, /^[A-Za-z0-9_-]{1,256}$/);
  assert.deepEqual(hook.allowed_updates, ['message', 'callback_query']);
  const menu = lastTg('setChatMenuButton').payload.menu_button;
  assert.equal(menu.type, 'web_app');
  assert.equal(menu.text, '🛒 Каталог');
  assert.equal(menu.web_app.url, HOST + '/');
  assert.equal(lastTg('setMyCommands').payload.commands[0].description, 'Открыть каталог');
});

await t('перебор кода: после 8 ошибок вход блокируется, даже верный код не проходит', async () => {
  W = makeWorld();
  const post = code => call('POST', '/setup', { body: 'code=' + code, headers: { 'content-type': 'application/x-www-form-urlencoded' } }).then(r => r.text());
  for (let i = 0; i < 8; i++) assert.ok((await post('guess' + i)).includes('Неверный код'));
  assert.ok((await post(CODE)).includes('Слишком много'));
  // то же в боте: ошибки считаются по человеку, 8 подряд закрывают ввод кода на час, и верный код тоже не проходит
  W = makeWorld();
  tgLog = [];
  const bad = (from, n) => send({ update_id: 100 + n, message: { message_id: 100 + n, from, chat: { id: from.id, type: 'private' }, text: '/admin guess' + n } });
  for (let i = 0; i < 8; i++) await bad(SELLER, i);
  tgLog = [];
  await send({ update_id: 1, message: { message_id: 1, from: SELLER, chat: { id: SELLER.id, type: 'private' }, text: '/admin ' + CODE } });
  assert.ok(lastTg('sendMessage').payload.text.includes('Слишком много'));
  assert.equal((await call('GET', '/api/admin/orders', { init: iS() })).status, 403);
  // чужие ошибки другого человека не мешают: у него счёт свой
  tgLog = [];
  await send({ update_id: 2, message: { message_id: 2, from: ANNA, chat: { id: ANNA.id, type: 'private' }, text: '/admin ' + CODE } });
  assert.ok(lastTg('sendMessage').payload.text.includes('вы продавец'));
});

await t('пустое хранилище и неполные данные работают: настройки дополняются значениями по умолчанию', async () => {
  W = makeWorld();
  await W.storage.put({ cfg: { shop: { name: 'Старое имя' } }, admins: [SELLER.id] });
  const d = await jsonOf(await call('GET', '/api/bootstrap', { init: iA() }));
  assert.equal(d.cfg.shop.name, 'Старое имя');
  assert.equal(d.cfg.shop.delivery, true);
  assert.equal(d.cfg.shop.deliveryLeadHours, 24);
  assert.deepEqual(d.prod, { cats: [], items: [] });
  assert.deepEqual(d.orders, []);
  const adm = await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }));
  assert.deepEqual(adm.orders, []);
  assert.deepEqual(adm.stats, { doneSum: 0, doneCount: 0 });
  // заказ при пустом каталоге: «нет такого товара»
  const r = await call('POST', '/api/order', { init: iA(), body: ob([{ id: 'p1', qty: 1 }], { expectTotal: undefined }) });
  assert.equal(r.status, 409);
  W = makeWorld();
});

/* ---------- остатки на складе ---------- */
async function stockWorld() {
  W = makeWorld();
  await send({ update_id: 5, message: { message_id: 41, from: SELLER, chat: { id: SELLER.id, type: 'private' }, text: '/admin ' + CODE } });
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  tgLog = [];
}
const stockOp = (body, init) => call('POST', '/api/admin/stock', { init: init || iS(), body });
const getStock = async () => (await jsonOf(await call('GET', '/api/admin/stock', { init: iS() }))).stk;
const getJr = async () => (await jsonOf(await call('GET', '/api/admin/journal', { init: iS() }))).jr;
const pubItem = async id => (await getProd()).items.find(x => x.id === id);
const stockAlerts = () => tgAll('sendMessage', p => String(p.text).startsWith('Ombordagi qoldiqlar:') && String(p.text).includes('\n\nОстатки на складе:'));
const setSt = (id, n, low) => stockOp({ id, op: 'set', n, low });
const adminOrdersOf = async () => (await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).orders;
const setStatus = (id, to) => call('POST', '/api/admin/status', { init: iS(), body: { id, to } });

await t('остатки: приход, исправление, порог, выключение; клиенту закрыто; мусор отклоняется; журнал ведётся', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await stockOp({ id: 'p2', op: 'set', n: 5 }, A.init())).status, 403);
  assert.equal((await call('GET', '/api/admin/stock', { init: A.init() })).status, 403);
  assert.equal((await call('GET', '/api/admin/journal', { init: A.init() })).status, 403);
  assert.equal((await call('POST', '/api/admin/stock', { body: { id: 'p2', op: 'set', n: 5 } })).status, 401);
  assert.deepEqual(await getStock(), {});

  let r = await setSt('p2', 40, 10);
  assert.equal(r.status, 200);
  assert.deepEqual((await jsonOf(r)).stk.p2, { q: 40, r: 0, low: 10 });
  r = await stockOp({ id: 'p2', op: 'in', n: 5 });
  assert.equal((await jsonOf(r)).stk.p2.q, 45);
  assert.equal((await jsonOf(await setSt('p2', 44))).stk.p2.q, 44);
  assert.equal((await jsonOf(await setSt('p2', 44))).stk.p2.low, 10, 'порог не должен сбрасываться, если его не прислали');
  assert.equal((await jsonOf(await stockOp({ id: 'p2', op: 'low', n: 12 }))).stk.p2.low, 12);
  r = await stockOp({ id: 'p1', op: 'low', n: 3 });
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'not_tracked');

  const before = JSON.stringify(await getStock());
  const bad = [
    { id: 'p2', op: 'in', n: 0 }, { id: 'p2', op: 'in', n: -3 }, { id: 'p2', op: 'in', n: 1.5 }, { id: 'p2', op: 'in', n: '5' },
    { id: 'p2', op: 'set', n: -1 }, { id: 'p2', op: 'set', n: 2000000 }, { id: 'p2', op: 'set', n: null }, { id: 'p2', op: 'set' },
    { id: 'p2', op: 'set', n: 5, low: -1 }, { id: 'p2', op: 'set', n: 5, low: 'много' }, { id: 'p2', op: 'low', n: 1.2 },
    { id: 'p2', op: 'wipe', n: 5 }, { id: 'p2', n: 5 }, { id: '../x', op: 'set', n: 5 }, { id: 5, op: 'set', n: 5 }
  ];
  for (const b of bad) assert.equal((await stockOp(b)).status, 400, JSON.stringify(b));
  assert.equal((await stockOp({ id: 'p9', op: 'set', n: 5 })).status, 404);
  assert.equal(JSON.stringify(await getStock()), before, 'неверные запросы не должны менять остаток');

  const jr = await getJr();
  assert.deepEqual(jr.map(x => [x.kind, x.d, x.q]), [['fix', 0, 44], ['fix', -1, 44], ['in', 5, 45], ['start', 40, 40]]);
  assert.equal(jr[0].name, 'Рис, 25 кг');
  assert.equal(jr[0].by, 'Jasur');
  assert.equal(jr[0].id, 'p2');

  r = await stockOp({ id: 'p2', op: 'off' });
  assert.deepEqual((await jsonOf(r)).stk, {});
  assert.equal((await getJr())[0].kind, 'off');
  assert.equal((await stockOp({ id: 'p2', op: 'off' })).status, 200, 'повторное выключение безвредно');

  // журнал хранит только последние записи
  for (let i = 0; i < 205; i++) await stockOp({ id: 'p4', op: 'in', n: 1 });
  const jr2 = await getJr();
  assert.equal(jr2.length, 200);
  assert.equal(jr2[0].q, 205);
});

await t('остатки: покупатель всегда видит, сколько можно заказать (av), «мало» (lw) — отдельная пометка; склад, резерв и порог не раскрываются', async () => {
  await stockWorld();
  await setSt('p2', 40, 10);
  const clean = async () => {
    const txt = await (await call('GET', '/api/config')).text();
    assert.ok(!txt.includes('"stk"') && !txt.includes('"q"') && !txt.includes('"r"') && !txt.includes('"low"') && !txt.includes('"rs"'), 'в каталог попали внутренние данные остатков');
    const b = await jsonOf(await call('GET', '/api/bootstrap', { init: iA() }));
    assert.equal(JSON.stringify(b.prod), JSON.stringify((await jsonOf(await call('GET', '/api/config'))).prod));
    return pubItem('p2');
  };
  let it = await clean();
  assert.equal(it.av, 40);                                        // много: «В наличии», а в корзине упирается в 40
  assert.equal(it.lw, undefined);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 29 }])).status, 200);   // свободно 11 — ещё выше порога 10
  it = await clean();
  assert.equal(it.av, 11);
  assert.equal(it.lw, undefined);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 2 }])).status, 200);    // свободно 9 — «Мало (осталось 9)»
  it = await clean();
  assert.equal(it.av, 9);
  assert.equal(it.lw, 1);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 9 }])).status, 200);
  it = await clean();
  assert.equal(it.av, 0);                                         // свободно 0 — «Нет в наличии»
  assert.equal(it.lw, undefined);
  const r = await place(newUser(), [{ id: 'p2', qty: 1 }]);
  const d = await jsonOf(r);
  assert.equal(r.status, 409);
  assert.equal(d.error, 'stock');
  assert.deepEqual(d.short, [{ id: 'p2', avail: 0 }]);
  assert.equal(d.prod.items.find(x => x.id === 'p2').av, 0, 'ответ об ошибке несёт свежий каталог');
  // приход возвращает товар в продажу
  await stockOp({ id: 'p2', op: 'in', n: 100 });
  it = await clean();
  assert.equal(it.av, 100);
  assert.equal(it.lw, undefined);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 1 }])).status, 200);
  assert.equal((await pubItem('p2')).av, 99);
  // порог 0: «мало» не бывает, число совпадает с остатком до самого нуля
  await setSt('p4', 50, 0);
  assert.equal((await pubItem('p4')).av, 50);
  assert.equal((await pubItem('p4')).lw, undefined);
  assert.equal((await place(newUser(), [{ id: 'p4', qty: 49 }])).status, 200);
  assert.equal((await pubItem('p4')).av, 1);
  assert.equal((await pubItem('p4')).lw, undefined);
  assert.equal((await place(newUser(), [{ id: 'p4', qty: 1 }])).status, 200);
  assert.equal((await pubItem('p4')).av, 0);
  // товар без учёта: ни av, ни lw
  const free = await pubItem('p1');
  assert.equal(free.av, undefined);
  assert.equal(free.lw, undefined);
});

await t('остатки: большой склад клиенту не раскрывается — av не больше 500, а в заказ всё равно нельзя взять больше остатка', async () => {
  await stockWorld();
  await setSt('p2', 12345, 20);
  let it = await pubItem('p2');
  assert.equal(it.av, 500);
  assert.equal(it.lw, undefined);
  assert.ok(!JSON.stringify(await getProd()).includes('12345'));
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 500 }])).status, 200);
  assert.equal((await pubItem('p2')).av, 500);                     // свободно 11845, но выше 500 в заказ всё равно не берут
  // порог выше предела: число в «Мало (осталось N)» точное
  await stockOp({ id: 'p2', op: 'set', n: 600 });
  await stockOp({ id: 'p2', op: 'low', n: 550 });
  it = await pubItem('p2');
  assert.equal(it.av, 100);                                         // 600 на складе − 500 в резерве
  assert.equal(it.lw, 1);
});

await t('остатки: заказ откладывает товар — другим доступно только свободное; заказ принимается целиком или никак', async () => {
  await stockWorld();
  await setSt('p2', 10);
  const c1 = newUser(), c2 = newUser(), c3 = newUser(), c4 = newUser();
  let r = await place(c1, [{ id: 'p2', qty: 7 }]);
  assert.equal(r.status, 200);
  const o1 = (await jsonOf(r)).order;
  assert.equal(o1.rs, undefined, 'служебная пометка о резерве не должна уходить клиенту');
  assert.deepEqual((await getStock()).p2, { q: 10, r: 7, low: 0 });
  // второй хочет 4, а свободно 3
  r = await place(c2, [{ id: 'p2', qty: 4 }]);
  assert.equal(r.status, 409);
  assert.deepEqual((await jsonOf(r)).short, [{ id: 'p2', avail: 3 }]);
  // заказ с несколькими товарами: нехватка по одному отклоняет всё, лишнего не откладывается и заказов не прибавляется
  await setSt('p4', 20);
  const nOrders = (await adminOrdersOf()).length;
  r = await place(c2, [{ id: 'p4', qty: 5 }, { id: 'p2', qty: 4 }, { id: 'p1', qty: 2 }]);
  assert.equal(r.status, 409);
  assert.deepEqual((await jsonOf(r)).short, [{ id: 'p2', avail: 3 }]);
  assert.equal((await adminOrdersOf()).length, nOrders);
  assert.deepEqual((await getStock()).p4, { q: 20, r: 0, low: 0 });
  // ровно столько, сколько свободно, — можно; смешанный заказ с товаром без учёта тоже
  r = await place(c2, [{ id: 'p4', qty: 5 }, { id: 'p2', qty: 3 }, { id: 'p1', qty: 2 }]);
  assert.equal(r.status, 200);
  const st = await getStock();
  assert.deepEqual([st.p2.q, st.p2.r, st.p4.r], [10, 10, 5]);
  assert.equal(st.p1, undefined, 'товар без учёта не должен получить остаток');
  // свободного нет
  r = await place(c3, [{ id: 'p2', qty: 1 }]);
  assert.equal(r.status, 409);
  // старый баг-класс: сумма и количество проверяются раньше остатка и не ломаются
  assert.equal((await place(c4, [{ id: 'p2', qty: 501 }])).status, 400);
  assert.equal((await place(c4, [{ id: 'p2', qty: 0 }])).status, 400);
  // у продавца и в «моих заказах» служебного поля нет
  assert.ok((await adminOrdersOf()).every(o => o.rs === undefined));
  const mine = await jsonOf(await call('GET', '/api/my-orders', { init: c1.init() }));
  assert.ok(mine.orders.every(o => o.rs === undefined));
  // всё свободное взять можно, а на единицу больше — нет
  assert.equal((await place(c4, [{ id: 'p4', qty: 15 }])).status, 200);
  assert.equal((await place(c4, [{ id: 'p4', qty: 1 }])).status, 409);
});

await t('остатки: отмена и выдача — отложенное возвращается или списывается ровно один раз', async () => {
  await stockWorld();
  await setSt('p2', 20);
  const a = newUser(), b = newUser(), c = newUser(), d = newUser();
  const oa = (await jsonOf(await place(a, [{ id: 'p2', qty: 5 }]))).order;
  const ob_ = (await jsonOf(await place(b, [{ id: 'p2', qty: 4 }]))).order;
  assert.deepEqual((await getStock()).p2, { q: 20, r: 9, low: 0 });
  // клиент сам отменяет новый заказ — товар возвращается
  assert.equal((await call('POST', '/api/cancel', { init: a.init(), body: { id: oa.id } })).status, 200);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 4, low: 0 });
  assert.equal((await call('POST', '/api/cancel', { init: a.init(), body: { id: oa.id } })).status, 409);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 4, low: 0 }, 'повторная отмена не должна возвращать второй раз');
  // заказ в работе и готов — остаток пока не списан, но отложен
  assert.equal((await setStatus(ob_.id, 'accepted')).status, 200);
  assert.equal((await setStatus(ob_.id, 'ready')).status, 200);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 4, low: 0 });
  assert.equal((await jsonOf(await call('GET', '/api/admin/journal', { init: iS() }))).jr.filter(x => x.kind === 'out').length, 0);
  // выдан — списывается со склада
  assert.equal((await setStatus(ob_.id, 'done')).status, 200);
  assert.deepEqual((await getStock()).p2, { q: 16, r: 0, low: 0 });
  let out = (await getJr()).filter(x => x.kind === 'out');
  assert.deepEqual(out.map(x => [x.d, x.q, x.ref, x.id]), [[-4, 16, ob_.id, 'p2']]);
  assert.equal(out[0].name, 'Рис, 25 кг');
  // повторное «выдан» и попытка отменить выданный заказ ничего не меняют
  assert.equal((await setStatus(ob_.id, 'done')).status, 200);
  assert.equal((await setStatus(ob_.id, 'cancelled')).status, 409);
  assert.deepEqual((await getStock()).p2, { q: 16, r: 0, low: 0 });
  assert.equal((await getJr()).filter(x => x.kind === 'out').length, 1);
  // продавец отменяет заказ в работе — возвращается; повтор безвреден
  const oc = (await jsonOf(await place(c, [{ id: 'p2', qty: 3 }]))).order;
  await setStatus(oc.id, 'accepted');
  assert.deepEqual((await getStock()).p2, { q: 16, r: 3, low: 0 });
  await setStatus(oc.id, 'cancelled');
  await setStatus(oc.id, 'cancelled');
  assert.deepEqual((await getStock()).p2, { q: 16, r: 0, low: 0 });
  // кнопки в Telegram работают так же
  const od = (await jsonOf(await place(d, [{ id: 'p2', qty: 2 }]))).order;
  await cb(SELLER, 'c:' + od.id);
  await cb(SELLER, 's:' + od.id + ':cancelled');
  await cb(SELLER, 's:' + od.id + ':cancelled');
  assert.deepEqual((await getStock()).p2, { q: 16, r: 0, low: 0 });
  const oe = (await jsonOf(await place(d, [{ id: 'p2', qty: 6 }]))).order;
  for (const to of ['accepted', 'ready']) await cb(SELLER, 's:' + oe.id + ':' + to);
  await cb(SELLER, 's:' + oe.id + ':done');   // «Выдан клиенту» сначала спрашивает способ оплаты
  assert.equal((await getStock()).p2.q, 16, 'до выбора оплаты заказ не выдан');
  await cb(SELLER, 'p:' + oe.id + ':cash');
  assert.deepEqual((await getStock()).p2, { q: 10, r: 0, low: 0 });
  // выдача не уводит остаток в минус, даже если продавец его уже уменьшил вручную
  const ox = (await jsonOf(await place(a, [{ id: 'p2', qty: 8 }]))).order;
  await setSt('p2', 3);
  for (const to of ['accepted', 'ready', 'done']) await setStatus(ox.id, to);
  assert.deepEqual((await getStock()).p2, { q: 0, r: 0, low: 0 });
  assert.equal((await getJr())[0].d, -3, 'в журнале записано, сколько реально списано');
});

await t('остатки: продавцу приходит предупреждение один раз при пересечении порога и когда товар закончился', async () => {
  await stockWorld();
  await setSt('p2', 30, 10);
  const o = [];
  const buy = async qty => { const r = await place(newUser(), [{ id: 'p2', qty }]); assert.equal(r.status, 200); o.push(qty); return stockAlerts().length; };
  tgLog = [];
  assert.equal(await buy(15), 0);                  // свободно 15 — выше порога
  assert.equal(await buy(6), 1);                   // свободно 9 — ниже порога: предупреждение
  const a1 = stockAlerts()[0];
  assert.equal(a1.payload.chat_id, SELLER.id);
  assert.ok(a1.payload.text.includes('Рис, 25 кг: осталось 9 (порог 10)'), a1.payload.text);
  assert.equal(await buy(1), 1);                   // уже ниже порога — повторно не пишем
  assert.equal(await buy(8), 2);                   // закончился
  assert.ok(stockAlerts()[1].payload.text.includes('свободного остатка нет (на складе 30, в заказах 30)'));
  // приход предупреждений не вызывает, а исправление «вниз» ниже порога — вызывает
  await setSt('p4', 100, 10);
  tgLog = [];
  await stockOp({ id: 'p4', op: 'in', n: 5 });
  assert.equal(stockAlerts().length, 0);
  await setSt('p4', 8);
  assert.equal(stockAlerts().length, 1);
  assert.ok(stockAlerts()[0].payload.text.includes('Макароны, 400 г: осталось 8 (порог 10)'));
  await setSt('p4', 7);
  assert.equal(stockAlerts().length, 1, 'ниже порога уже было — не повторяем');
  // у товара без порога предупреждаем только о нуле
  await setSt('p1', 5, 0);
  tgLog = [];
  assert.equal((await place(newUser(), [{ id: 'p1', qty: 4 }])).status, 200);
  assert.equal(stockAlerts().length, 0);
  assert.equal((await place(newUser(), [{ id: 'p1', qty: 1 }])).status, 200);
  assert.equal(stockAlerts().length, 1);
  // отмена заказа возвращает товар без предупреждений; недоступность Telegram не мешает принять заказ
  tgFail = true;
  try { assert.equal((await place(newUser(), [{ id: 'p4', qty: 1 }])).status, 200); } finally { tgFail = false; }
});

await t('остатки: товар без учёта работает как раньше; учёт можно выключить и включить заново; удалённый товар не оставляет остатка', async () => {
  await stockWorld();
  // без учёта: 500 штук проходят, остатков нет
  assert.equal((await place(newUser(), [{ id: 'p1', qty: 500 }])).status, 200);
  assert.deepEqual(await getStock(), {});
  // включили учёт, заказали, выключили, заказали ещё, включили заново: в резерве только то, что было отложено при включённом учёте
  await setSt('p2', 100);
  const c1 = newUser(), c2 = newUser();
  const o1 = (await jsonOf(await place(c1, [{ id: 'p2', qty: 4 }]))).order;
  await stockOp({ id: 'p2', op: 'off' });
  assert.equal((await pubItem('p2')).av, undefined);
  const o2 = (await jsonOf(await place(c2, [{ id: 'p2', qty: 50 }]))).order;   // учёта нет — можно
  await setSt('p2', 20);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 4, low: 0 });
  assert.equal((await call('POST', '/api/cancel', { init: c2.init(), body: { id: o2.id } })).status, 200);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 4, low: 0 }, 'заказ без резерва не должен менять остаток при отмене');
  assert.equal((await call('POST', '/api/cancel', { init: c1.init(), body: { id: o1.id } })).status, 200);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 0, low: 0 });
  // отмена заказа, пока учёт выключен, и повторное включение
  const o3 = (await jsonOf(await place(c1, [{ id: 'p2', qty: 6 }]))).order;
  await stockOp({ id: 'p2', op: 'off' });
  assert.equal((await call('POST', '/api/cancel', { init: c1.init(), body: { id: o3.id } })).status, 200);
  await setSt('p2', 20);
  assert.deepEqual((await getStock()).p2, { q: 20, r: 0, low: 0 }, 'отменённый заказ не должен остаться в резерве');
  // удалили товар из каталога — остаток исчезает, а при возврате товара с тем же номером он без учёта
  const o4 = (await jsonOf(await place(c1, [{ id: 'p2', qty: 2 }]))).order;
  const prod = await getProd();
  prod.items = prod.items.filter(x => x.id !== 'p2');
  const r = await putProd(prod);
  assert.equal(r.status, 200);
  assert.equal((await getStock()).p2, undefined);
  assert.equal((await call('POST', '/api/cancel', { init: c1.init(), body: { id: o4.id } })).status, 200, 'отмена заказа с удалённым товаром не падает');
  assert.deepEqual(await getStock(), {});
});

await t('остатки: каталог, сохранённый продавцом, не затирает остатки, а поля av/q/stock от клиента игнорируются', async () => {
  await stockWorld();
  await setSt('p2', 10, 4);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 7 }])).status, 200);        // свободно 3, мало
  const prod = await getProd();
  assert.equal(prod.items.find(x => x.id === 'p2').av, 3);
  // приложение продавца отправляет каталог обратно вместе с av и придуманными полями
  prod.items.forEach(x => { x.stock = 999; x.q = 999; x.r = 0; x.low = 1; x.rs = { p2: 1 }; if (x.id === 'p4') { x.av = 0; x.lw = 1; } });
  prod.items.find(x => x.id === 'p2').price = 415000;
  const r = await putProd(prod);
  const saved = (await jsonOf(r)).prod;
  assert.equal(saved.items.find(x => x.id === 'p2').price, 415000);
  assert.equal(saved.items.find(x => x.id === 'p2').av, 3, 'ответ сохранения содержит актуальное «осталось»');
  assert.equal(saved.items.find(x => x.id === 'p4').av, undefined, 'av от клиента не принимается');
  assert.equal(saved.items.find(x => x.id === 'p4').lw, undefined, 'lw от клиента не принимается');
  assert.ok(saved.items.every(x => x.stock === undefined && x.q === undefined && x.low === undefined && x.rs === undefined));
  assert.deepEqual((await getStock()).p2, { q: 10, r: 7, low: 4 });
  // товар p4 не заблокирован выдуманным av
  assert.equal((await place(newUser(), [{ id: 'p4', qty: 5 }], { expectTotal: undefined })).status, 200);
  // и цена изменилась: старая сумма просит подтверждения, а свежий каталог приходит с остатками
  const r2 = await place(newUser(), [{ id: 'p2', qty: 1 }], { expectTotal: 410000 });
  const d2 = await jsonOf(r2);
  assert.equal(r2.status, 409);
  assert.equal(d2.error, 'price_changed');
  assert.equal(d2.prod.items.find(x => x.id === 'p2').av, 3);
});

/* ---------- клиентская база ---------- */
const adminClients = async () => (await jsonOf(await call('GET', '/api/admin/clients', { init: iS() }))).clients;
const clientOf = async uid => (await adminClients()).find(c => c.uid === uid);
const editClient = (uid, body, init) => call('PUT', '/api/admin/clients/' + uid, { init: init || iS(), body });
const putProfile = (c, body) => call('PUT', '/api/profile', { init: c.init(), body });
const meOf = async c => (await jsonOf(await call('GET', '/api/bootstrap', { init: c.init() }))).me;
const delForm = over => ({ form: formFor(S.DEFAULT, 'delivery', over) });
const ONE = [{ id: 'p4', qty: 1 }];

await t('клиенты: первый заказ создаёт клиента, следующие дополняют только пустое; заметка, группа и блокировка клиенту не видны', async () => {
  await stockWorld();
  const A = { u: ANNA, init: iA };
  assert.equal((await adminClients()).length, 0);
  assert.equal((await place(A, ONE, delForm(), 'delivery')).status, 200);
  let c = await clientOf(ANNA.id);
  assert.equal(c.name, 'ООО Ориент');
  assert.equal(c.phone, '+998 91 555 44 33');
  assert.deepEqual(c.addrs, ['Навои, ул. Галаба 12, склад 3']);
  assert.equal(c.n, 1);
  assert.equal(c.ds, 0);
  assert.equal(c.sum, 0);
  assert.equal(c.tg.username, 'anna_k');
  assert.ok(c.last && c.since);
  // клиент видит только своё: имя, телефон, организацию, адреса
  assert.deepEqual((await meOf(A)).profile, { name: 'ООО Ориент', phone: '+998 91 555 44 33', org: '', addrs: ['Навои, ул. Галаба 12, склад 3'] });
  assert.equal((await editClient(ANNA.id, { note: 'секретная заметка', grp: 'Кафе' })).status, 200);
  const txt = JSON.stringify(await jsonOf(await call('GET', '/api/bootstrap', { init: iA() }))) + await (await call('GET', '/api/my-orders', { init: iA() })).text();
  assert.ok(!txt.includes('секретная') && !txt.includes('Кафе') && !txt.includes('"note"') && !txt.includes('"grp"') && !txt.includes('"sum"') && !txt.includes('"cx"'), 'внутренние данные клиента попали к клиенту');
  // второй заказ с другим именем и новым адресом: имя не меняется, адрес добавляется, повтор адреса не дублируется
  assert.equal((await place(A, ONE, { form: formFor(S.DEFAULT, 'delivery', { name: 'Анна', address: 'Навои, ул. Другая 5' }) }, 'delivery')).status, 200);
  assert.equal((await place(A, ONE, { form: formFor(S.DEFAULT, 'delivery', { name: 'Анна', address: 'НАВОИ, УЛ. ДРУГАЯ 5' }) }, 'delivery')).status, 200);
  c = await clientOf(ANNA.id);
  assert.equal(c.name, 'ООО Ориент');
  assert.deepEqual(c.addrs, ['Навои, ул. Галаба 12, склад 3', 'Навои, ул. Другая 5']);
  assert.equal(c.n, 3);
  assert.equal(c.note, 'секретная заметка');
  // закрыто для остальных
  const B = newUser();
  assert.equal((await call('GET', '/api/admin/clients', { init: B.init() })).status, 403);
  assert.equal((await call('GET', '/api/admin/clients/' + ANNA.id, { init: B.init() })).status, 403);
  assert.equal((await editClient(ANNA.id, { note: 'x' }, B.init())).status, 403);
  assert.equal((await call('DELETE', '/api/admin/clients/' + ANNA.id, { init: B.init() })).status, 403);
  assert.equal((await call('GET', '/api/admin/clients')).status, 401);
});

await t('клиенты: профиль — проверка полей, адреса, лишние поля игнорируются', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await call('PUT', '/api/profile', { body: { name: 'Х' } })).status, 401);
  assert.equal((await meOf(A)).profile, null);
  let r = await putProfile(A, { name: 'ИП Юсупов', phone: '+998 90 123 45 67', org: 'Магазин «Ляззат»', addrs: ['Навои, ул. Навои 1', 'навои, ул. навои 1', ' Зарафшан, ул. Мира 7 '] });
  assert.equal(r.status, 200);
  assert.deepEqual((await jsonOf(r)).profile, { name: 'ИП Юсупов', phone: '+998 90 123 45 67', org: 'Магазин «Ляззат»', addrs: ['Навои, ул. Навои 1', 'Зарафшан, ул. Мира 7'] });
  assert.deepEqual((await meOf(A)).profile.addrs, ['Навои, ул. Навои 1', 'Зарафшан, ул. Мира 7']);
  // отдельные поля можно менять по одному
  let pr = await jsonOf(await putProfile(A, { org: '' }));
  assert.equal(pr.profile.org, '');
  assert.equal(pr.profile.name, 'ИП Юсупов');
  // плохие данные
  assert.equal((await jsonOf(await putProfile(A, { phone: '123' }))).error, 'bad_phone');
  assert.equal((await jsonOf(await putProfile(A, { addrs: ['ул'] }))).error, 'bad_addr');
  assert.equal((await jsonOf(await putProfile(A, { addrs: ['а1 адрес', 'а2 адрес', 'а3 адрес', 'а4 адрес', 'а5 адрес', 'а6 адрес'] }))).error, 'too_many_addrs');
  assert.equal((await putProfile(A, { addrs: 'ул. Мира 5' })).status, 400);
  assert.equal((await putProfile(A, { name: 123 })).status, 400);
  assert.equal((await putProfile(A, [])).status, 400);
  assert.equal((await call('PUT', '/api/profile', { init: A.init(), body: 'не json' })).status, 400);
  assert.deepEqual((await meOf(A)).profile.addrs, ['Навои, ул. Навои 1', 'Зарафшан, ул. Мира 7'], 'ошибочный запрос не должен ничего менять');
  // длинные значения обрезаются, управляющие символы убираются
  pr = await jsonOf(await putProfile(A, { name: 'Я'.repeat(100) + '\n', org: 'О'.repeat(200) }));
  assert.equal(pr.profile.name.length, 60);
  assert.equal(pr.profile.org.length, 80);
  // клиент не может сам поставить себе заметку, группу или снять блокировку
  await editClient(A.u.id, { blocked: true, grp: 'Кафе', note: 'ждёт' });
  r = await putProfile(A, { note: 'моя', grp: 'Свой', blocked: false, name: 'Новое имя' });
  assert.equal(r.status, 200);
  const c = await clientOf(A.u.id);
  assert.equal(c.name, 'Новое имя');
  assert.equal(c.note, 'ждёт');
  assert.equal(c.grp, 'Кафе');
  assert.equal(c.blocked, true);
  // а заказ принимает данные из профиля: форма — как обычно, организация подставляется сервером
  await editClient(A.u.id, { blocked: false, org: 'ООО Ромашка' });
  assert.equal((await place(A, ONE)).status, 200);
  assert.equal((await adminOrdersOf()).find(o => o.uid === undefined && o.name === 'ООО Ориент').org, 'ООО Ромашка');
});

await t('клиенты: продавец правит данные, заказ их не затирает; организация, группа и заметка видны продавцу в Telegram', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await place(A, ONE)).status, 200);
  const uid = A.u.id;
  let r = await editClient(uid, { name: 'ООО Ромашка', phone: '+998 90 111 22 33', org: 'Сеть «Ромашка»', addrs: ['Навои, ул. Мира 1'], note: 'платит в конце недели\nзвонить заранее', grp: 'Магазин' });
  assert.equal(r.status, 200);
  const c = (await jsonOf(r)).client;
  assert.equal(c.note, 'платит в конце недели\nзвонить заранее');
  assert.equal(c.n, 1);
  tgLog = [];
  const o = (await jsonOf(await place(A, ONE))).order;
  assert.equal(o.org, 'Сеть «Ромашка»', 'клиент видит организацию в своём заказе');
  assert.equal(o.note, undefined);
  const c2 = await clientOf(uid);
  assert.equal(c2.name, 'ООО Ромашка');
  assert.equal(c2.phone, '+998 90 111 22 33');
  assert.equal(c2.n, 2);
  const card = lastTg('sendMessage', p => p.chat_id === SELLER.id && String(p.text).includes(o.id)).payload.text;
  assert.ok(card.includes('Организация: Сеть «Ромашка»'), card);
  assert.ok(card.includes('👥 Группа: Магазин') && card.includes('📝 Заметка: платит в конце недели\nзвонить заранее'), card);
  // при смене статуса карточка в Telegram перерисовывается и сохраняет эти строки
  tgLog = [];
  assert.equal((await setStatus(o.id, 'accepted')).status, 200);
  const edited = lastTg('editMessageText');
  assert.ok(edited && edited.payload.text.includes('👥 Группа: Магазин') && edited.payload.text.includes('Организация: Сеть «Ромашка»'));
  // проверки продавца
  assert.equal((await jsonOf(await editClient(uid, { phone: '12' }))).error, 'bad_phone');
  assert.equal((await editClient(uid, { addrs: Array(6).fill(0).map((_, i) => 'Адрес номер ' + i) })).status, 400);
  assert.equal((await editClient(uid, { note: 5 })).status, 400);
  assert.equal((await editClient(uid, { grp: ['Кафе'] })).status, 400);
  assert.equal((await jsonOf(await editClient(uid, { note: 'Н'.repeat(900) }))).client.note.length, 500);
  assert.equal((await jsonOf(await editClient(uid, { grp: 'Г'.repeat(90) }))).client.grp.length, 30);
  assert.equal((await jsonOf(await editClient(uid, { blocked: 'yes' }))).client.blocked, false, 'блокировка включается только значением true');
  assert.equal((await editClient(424242, { note: 'x' })).status, 404);
  assert.equal((await call('GET', '/api/admin/clients/424242', { init: iS() })).status, 404);
  assert.equal((await call('GET', '/api/admin/clients/abc', { init: iS() })).status, 404);
  assert.equal((await clientOf(uid)).n, 2, 'счётчики не принимаются от продавца');
  await editClient(uid, { n: 999, sum: 999, uid: 5, since: 'x' });
  const c3 = await clientOf(uid);
  assert.ok(c3.n === 2 && c3.sum === 0 && c3.uid === uid && c3.since !== 'x');
  // карточка клиента с историей заказов
  const d = await jsonOf(await call('GET', '/api/admin/clients/' + uid, { init: iS() }));
  assert.equal(d.client.uid, uid);
  assert.equal(d.orders.length, 2);
  assert.ok(d.orders.every(x => x.uid === undefined && x.rs === undefined));
});

await t('клиенты: блокировка закрывает заказы, но не профиль; снимается сразу', async () => {
  await stockWorld();
  await setSt('p2', 10);
  const A = newUser(), B = newUser();
  assert.equal((await place(A, ONE)).status, 200);
  assert.equal((await editClient(A.u.id, { blocked: true })).status, 200);
  const nOrders = (await adminOrdersOf()).length;
  tgLog = [];
  const r = await place(A, [{ id: 'p2', qty: 3 }]);
  assert.equal(r.status, 403);
  assert.equal((await jsonOf(r)).error, 'blocked');
  assert.equal((await adminOrdersOf()).length, nOrders, 'заказ не создан');
  assert.deepEqual((await getStock()).p2, { q: 10, r: 0, low: 0 }, 'товар не отложен');
  assert.equal(tgAll('sendMessage').length, 0, 'продавцу ничего не пришло');
  assert.equal((await meOf(A)).blocked, true);
  assert.equal((await meOf(B)).blocked, false);
  assert.equal((await putProfile(A, { name: 'Другое имя' })).status, 200);
  assert.equal((await place(B, ONE)).status, 200, 'остальные заказывают как обычно');
  // отменить свой прежний заказ заблокированный клиент по-прежнему может
  const mine = (await jsonOf(await call('GET', '/api/my-orders', { init: A.init() }))).orders;
  assert.equal((await call('POST', '/api/cancel', { init: A.init(), body: { id: mine[0].id } })).status, 200);
  assert.equal((await editClient(A.u.id, { blocked: false })).status, 200);
  assert.equal((await meOf(A)).blocked, false);
  assert.equal((await place(A, [{ id: 'p2', qty: 3 }])).status, 200);
});

await t('клиенты: выдача добавляет сумму клиенту, отмена убирает заказ из счёта', async () => {
  await stockWorld();
  const A = newUser();
  const o1 = (await jsonOf(await place(A, CART))).order;      // 1 394 000
  const o2 = (await jsonOf(await place(A, ONE))).order;
  const o3 = (await jsonOf(await place(A, ONE))).order;
  let c = await clientOf(A.u.id);
  assert.equal(c.n, 3);
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await setStatus(o1.id, to)).status, 200);
  assert.equal((await setStatus(o2.id, 'cancelled')).status, 200);
  assert.equal((await call('POST', '/api/cancel', { init: A.init(), body: { id: o3.id } })).status, 200);
  c = await clientOf(A.u.id);
  assert.equal(c.n, 1);
  assert.equal(c.ds, 1);
  assert.equal(c.sum, 1394000);
  // повторная смена того же статуса ничего не удваивает
  assert.equal((await setStatus(o1.id, 'done')).status, 200);
  assert.equal((await clientOf(A.u.id)).sum, 1394000);
  // администратор через кнопку в Telegram
  const o4 = (await jsonOf(await place(A, ONE))).order;
  for (const to of ['accepted', 'ready']) await cb(SELLER, 's:' + o4.id + ':' + to);
  await cb(SELLER, 's:' + o4.id + ':done');
  await cb(SELLER, 'p:' + o4.id + ':cash');
  assert.equal((await clientOf(A.u.id)).ds, 2);
  assert.equal((await clientOf(A.u.id)).sum, 1394000 + 7500);
});

/* ---------- оплата и долги ---------- */
const shopDay = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
const plusDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const doneWith = (id, pay) => call('POST', '/api/admin/status', { init: iS(), body: { id, to: 'done', pay } });
const readyOrder = async (c, cart) => {
  const o = (await jsonOf(await place(c, cart))).order;
  for (const to of ['accepted', 'ready']) assert.equal((await setStatus(o.id, to)).status, 200);
  return o;
};
const debtsOf = async () => jsonOf(await call('GET', '/api/admin/debts', { init: iS() }));
const debtOf = async uid => (await jsonOf(await call('GET', '/api/admin/debts/' + uid, { init: iS() }))).debt;
/* Магазин нажимает «Верно» под всеми сообщениями с вопросом (записи, которые ждут ответа или не дошли). */
async function confirmAll(uid) {
  const lg = await W.storage.get('lg:' + uid);
  for (const g of [...new Set((lg ? lg.rows : []).filter(r => r.cf && r.cf !== 'ok').map(r => r.g || r.n))]) await cb({ id: uid, first_name: 'Магазин' }, 'q:' + g + ':y');
}
const debtAct = (uid, act, body, init) => call('POST', '/api/admin/debts/' + uid + '/' + act, { init: init || iS(), body });
/* Сдвигает срок выдачи в долг в прошлое (журнал и заголовок), чтобы проверить просрочку. */
async function backdate(uid, ref, due) {
  const lg = await W.storage.get('lg:' + uid), lh = await W.storage.get('lh:' + uid);
  lg.rows.forEach(r => { if (r.k === 'ch' && r.ref === ref) r.due = due; });
  lh.open.forEach(q => { if (q.ref === ref) q.due = due; });
  await W.storage.put('lg:' + uid, lg); await W.storage.put('lh:' + uid, lh);
}

await t('оплата: способ при выдаче выбирает продавец, без выбора наличные, неверные данные не принимаются', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, ONE);
  const bad = [{ m: 'crypto' }, { m: 'credit' }, { m: 'credit', days: 0 }, { m: 'credit', days: 91 }, { m: 'credit', days: 2.5 }, 'cash',
    { m: 'credit', days: 7, paid: 7500, pm: 'cash' }, { m: 'credit', days: 7, paid: 100, pm: 'gold' }, { m: 'credit', days: 7, paid: -5, pm: 'cash' }];
  for (const pay of bad) assert.equal((await doneWith(o.id, pay)).status, 400, JSON.stringify(pay));
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'ready', 'заказ остался не выданным');
  assert.equal((await jsonOf(await doneWith(o.id))).order.pay.m, 'cash', 'без выбора — наличные');
  for (const m of ['card', 'bank']) {
    const x = await readyOrder(A, ONE);
    assert.equal((await jsonOf(await doneWith(x.id, { m }))).order.pay.m, m);
  }
  assert.equal((await debtsOf()).debtors.length, 0, 'оплаченные заказы долга не создают');
  assert.equal((await call('POST', '/api/admin/status', { init: iA(), body: { id: o.id, to: 'done' } })).status, 403);
});

await t('долги: выдача в долг со сроком и часть сразу; клиент получает срок оплаты', async () => {
  await stockWorld();
  const A = newUser(), B = newUser();
  const o1 = await readyOrder(A, CART);                       // 1 394 000
  tgLog = [];
  const r1 = await jsonOf(await doneWith(o1.id, { m: 'credit', days: 7 }));
  assert.deepEqual(r1.order.pay, { m: 'credit', days: 7, due: plusDays(shopDay(), 7) });
  assert.ok(tgAll('sendMessage', p => p.chat_id === A.u.id).some(x => x.payload.text.includes('Оплатить до ' + plusDays(shopDay(), 7).split('-').reverse().join('.'))));
  const o2 = await readyOrder(B, CART);
  const r2 = await jsonOf(await doneWith(o2.id, { m: 'credit', days: 14, paid: 400000, pm: 'card' }));
  assert.equal(r2.order.pay.paid, 400000);
  const d = await debtsOf();
  assert.equal(d.n, 2);
  assert.equal(d.total, 1394000 + 994000);
  assert.equal(d.overdue, 0);
  assert.equal(d.debtors.find(x => x.uid === B.u.id).bal, 994000);
  const db = await debtOf(B.u.id);
  assert.deepEqual(db.rows.map(r => [r.k, r.d, r.m || '']), [['pay', -400000, 'card'], ['ch', 1394000, '']], 'в журнале выдача и сразу оплаченная часть');
  assert.equal(db.due, plusDays(shopDay(), 14));
  assert.equal(db.name, 'ООО Ориент', 'имя и телефон магазина берутся из заказа');
  assert.equal(db.phone, '+998 91 555 44 33');
});

await t('долги: оплата частями гасит старые выдачи первыми, просрочка считается по остатку', async () => {
  await stockWorld();
  const A = newUser();
  const o1 = await readyOrder(A, CART);                       // 1 394 000
  const o2 = await readyOrder(A, ONE);                        // 7 500
  await doneWith(o1.id, { m: 'credit', days: 3 });
  await doneWith(o2.id, { m: 'credit', days: 10 });
  await backdate(A.u.id, o1.id, plusDays(shopDay(), -4));     // первый долг просрочен на 4 дня
  let db = await debtOf(A.u.id);
  assert.equal(db.bal, 1401500);
  assert.equal(db.over, 1394000);
  assert.equal(db.days, 4);
  let list = await debtsOf();
  assert.equal(list.late, 1);
  assert.equal(list.overdue, 1394000);
  // платёж 1 000 000: первый долг закрывается частично, просрочка уменьшается
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1000000, m: 'cash', note: 'принёс директор' })).status, 200);
  db = await debtOf(A.u.id);
  assert.equal(db.bal, 401500);
  assert.equal(db.over, 394000);
  assert.deepEqual(db.open.map(q => [q.ref, q.r]), [[o1.id, 394000], [o2.id, 7500]]);
  assert.equal(db.rows[0].note, 'принёс директор');
  // ещё платёж закрывает первый долг полностью: просрочки нет, остаётся второй со своим сроком
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 394000, m: 'bank' })).status, 200);
  db = await debtOf(A.u.id);
  assert.equal(db.bal, 7500);
  assert.equal(db.over, 0);
  assert.equal(db.due, plusDays(shopDay(), 10));
  list = await debtsOf();
  assert.equal(list.late, 0);
  // последний платёж: магазин уходит из списка должников
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 7500, m: 'card' })).status, 200);
  list = await debtsOf();
  assert.equal(list.debtors.length, 1, 'пока магазин не подтвердил записи, он остаётся в списке');
  assert.equal(list.debtors[0].bal, 0);
  assert.equal(list.debtors[0].wt > 0, true);
  await confirmAll(A.u.id);
  list = await debtsOf();
  assert.equal(list.debtors.length, 0);
  assert.equal((await debtOf(A.u.id)).bal, 0, 'история сохраняется');
});

await t('долги: неверная сумма, лишний платёж как аванс, отмена записи об оплате, чужие не могут', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 5 });
  for (const body of [{ amount: 0, m: 'cash' }, { amount: -5, m: 'cash' }, { amount: 1.5, m: 'cash' }, { amount: 'много', m: 'cash' }, { amount: 100, m: 'credit' }, { amount: 100 }, { amount: 2e11, m: 'cash' }])
    assert.equal((await debtAct(A.u.id, 'pay', body)).status, 400, JSON.stringify(body));
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 100, m: 'cash' }, iA())).status, 403, 'не продавец');
  assert.equal((await debtAct(777000, 'pay', { amount: 100, m: 'cash' })).status, 404, 'нет журнала');
  // оплата больше долга: переплата (аванс) уходит в конец списка
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1500000, m: 'cash' })).status, 200);
  let db = await debtOf(A.u.id);
  assert.equal(db.bal, -106000);
  assert.equal(db.open.length, 0);
  assert.equal((await debtsOf()).n, 0, 'аванс не считается долгом');
  // отмена записи об оплате возвращает долг; второй раз нельзя; выдачу в долг отменить нельзя
  const pay = db.rows.find(r => r.k === 'pay');
  assert.equal((await debtAct(A.u.id, 'void', { n: pay.n })).status, 400, 'без причины отменить нельзя');
  assert.equal((await debtAct(A.u.id, 'void', { n: pay.n, reason: 'ab' })).status, 400, 'причина слишком короткая');
  assert.equal((await debtAct(A.u.id, 'void', { n: pay.n, reason: 'ошиблись суммой' }, iA())).status, 403);
  assert.equal((await debtAct(A.u.id, 'void', { n: pay.n, reason: 'ошиблись суммой' })).status, 200);
  db = await debtOf(A.u.id);
  assert.equal(db.bal, 1394000);
  assert.ok(db.rows.find(r => r.n === pay.n).void, 'запись помечена отменённой');
  assert.equal((await debtAct(A.u.id, 'void', { n: pay.n, reason: 'ещё раз' })).status, 409);
  const ch = db.rows.find(r => r.k === 'ch');
  assert.equal((await debtAct(A.u.id, 'void', { n: ch.n, reason: 'выдача' })).status, 404);
  assert.equal((await debtAct(A.u.id, 'void', { n: 99999, reason: 'нет такой' })).status, 404);
  assert.equal(db.rows.length, 3, 'записи не стираются: выдача, оплата и отмена');
});

await t('долги: напоминание магазину не чаще раза в час, без долга не отправляется', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, ONE);
  await doneWith(o.id, { m: 'credit', days: 5 });
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'remind', {})).status, 200);
  const m = lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text.replace(/\u00a0/g, ' ');
  assert.ok(m.includes('напоминание') && m.includes('7 500') && m.includes('Срок оплаты'), m);
  assert.equal((await debtAct(A.u.id, 'remind', {})).status, 429);
  assert.equal(tgAll('sendMessage', p => p.chat_id === A.u.id).length, 1);
  await debtAct(A.u.id, 'pay', { amount: 7500, m: 'cash' });
  assert.equal((await debtAct(A.u.id, 'remind', {})).status, 409, 'долга нет');
  // узбекский клиент получает напоминание на своём языке; блокировка бота даёт понятную ошибку
  const U = newUser(); U.u.language_code = 'uz';
  const o2 = await readyOrder(U, ONE);
  await doneWith(o2.id, { m: 'credit', days: 5 });
  assert.equal((await debtAct(U.u.id, 'remind', {})).status, 200);
});

await t('долги: в карточке долга и в напоминании виден состав заказов и остаток по частично оплаченным', async () => {
  await stockWorld();
  const A = newUser();
  const o1 = await readyOrder(A, CART);                                          // 1 394 000
  await doneWith(o1.id, { m: 'credit', days: 7, paid: 394000, pm: 'cash' });     // в долг 1 000 000
  const o2 = await readyOrder(A, [{ id: 'p4', qty: 4 }]);                        // 30 000
  await doneWith(o2.id, { m: 'credit', days: 3 });
  const db = await debtOf(A.u.id);
  assert.deepEqual(Object.keys(db.ords).sort(), [o1.id, o2.id].sort());
  assert.deepEqual([db.ords[o1.id].total, db.ords[o1.id].items.map(i => [i.id, i.qty])], [1394000, [['p1', 2], ['p2', 3]]]);
  assert.deepEqual(db.open.map(q => [q.ref, q.r]), [[o1.id, 1000000], [o2.id, 30000]]);
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'remind', {})).status, 200);
  const m = lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text.replace(/ /g, ' ');
  assert.ok(m.includes(o1.id) && m.includes('• Масло подсолнечное (5 л) × 2') && m.includes('• Рис (25 кг) × 3'), m);
  assert.ok(m.includes('Сумма 1 394 000 сум, осталось 1 000 000 сум'), m);
  assert.ok(m.includes('• Макароны (400 г) × 4') && m.includes('Сумма 30 000 сум'), m);
  assert.ok(!m.includes('осталось 30 000'), 'у полностью неоплаченного заказа остаток не дублируется');
  assert.ok(m.indexOf(o1.id) < m.indexOf(o2.id), 'старые заказы идут первыми');
  // заказ, которого уже нет, не ломает ни карточку, ни напоминание
  await W.storage.delete('o:' + o2.id);
  const db2 = await debtOf(A.u.id);
  assert.deepEqual(Object.keys(db2.ords), [o1.id]);
  assert.equal(db2.open.length, 2);
  await W.storage.put('lh:' + A.u.id, Object.assign(await W.storage.get('lh:' + A.u.id), { rem: 0 }));
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'remind', {})).status, 200);
  const m2 = lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text.replace(/ /g, ' ');
  assert.ok(m2.includes(o2.id + ' · осталось 30 000 сум'), m2);
  // узбекский клиент получает названия и подписи по-узбекски
  const U = newUser();
  const o3 = (await jsonOf(await place(U, ONE, { lang: 'uz' }))).order;
  for (const to of ['accepted', 'ready']) assert.equal((await setStatus(o3.id, to)).status, 200);
  await doneWith(o3.id, { m: 'credit', days: 5 });
  tgLog = [];
  assert.equal((await debtAct(U.u.id, 'remind', {})).status, 200);
  const mu = lastTg('sendMessage', p => p.chat_id === U.u.id).payload.text.replace(/ /g, ' ');
  assert.ok(mu.includes('Makaron') && mu.includes('Summa 7 500') && !mu.includes('Сумма'), mu);
});

await t('долги: в напоминании не больше 5 заказов, длинный заказ сокращается, текст влезает в одно сообщение', async () => {
  await stockWorld();
  const A = newUser();
  const ids = [];
  for (let i = 0; i < 7; i++) { const o = await readyOrder(A, ONE); await doneWith(o.id, { m: 'credit', days: 7 }); ids.push(o.id); }
  const setItems = async (id, items) => { const o = await W.storage.get('o:' + id); o.items = items; await W.storage.put('o:' + id, o); };
  const unrem = async () => W.storage.put('lh:' + A.u.id, Object.assign(await W.storage.get('lh:' + A.u.id), { rem: 0 }));
  const remind = async () => { tgLog = []; assert.equal((await debtAct(A.u.id, 'remind', {})).status, 200); return lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text.replace(/ /g, ' '); };
  await setItems(ids[0], Array.from({ length: 12 }, (_, i) => ({ id: 'x' + i, name: 'Товар ' + i, uz: '', amount: 1, unit: 'kg', price: 1000, qty: 1 })));
  let m = await remind();
  assert.ok(m.includes(ids[0]) && m.includes(ids[4]) && !m.includes(ids[5]), 'показаны пять самых старых заказов');
  assert.ok(m.includes('…и ещё 2 зак. на 15 000 сум'), m);
  assert.ok(m.includes('• Товар 7 (1 кг) × 1') && !m.includes('Товар 8') && m.includes('…и ещё 4 поз.'), m);
  // огромный заказ с очень длинными названиями: сообщение всё равно меньше лимита Telegram
  await unrem();
  await setItems(ids[1], Array.from({ length: 100 }, (_, i) => ({ id: 'y' + i, name: 'Ы'.repeat(150) + i, uz: '', amount: 1, unit: 'kg', price: 1000, qty: 1 })));
  await setItems(ids[2], Array.from({ length: 100 }, (_, i) => ({ id: 'z' + i, name: 'Щ'.repeat(150) + i, uz: '', amount: 1, unit: 'kg', price: 1000, qty: 1 })));
  m = await remind();
  assert.ok(m.length <= 4096 && m.includes('Долг по заказам: 52 500'), 'длина ' + m.length);
});

await t('долги: «Выдан клиенту» в боте сначала спрашивает оплату; долг виден на карточках; клиента с долгом удалить нельзя', async () => {
  await stockWorld();
  const A = newUser();
  const o = (await jsonOf(await place(A, CART))).order;
  for (const to of ['accepted', 'ready']) await cb(SELLER, 's:' + o.id + ':' + to, 700);
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':done', 700);
  let e = lastTg('editMessageText', p => p.message_id === 700).payload;
  const kb = e.reply_markup.inline_keyboard.flat();
  assert.ok(e.text.includes('Как клиент оплатил заказ'));
  for (const m of ['cash', 'card', 'bank', 'credit']) assert.ok(kb.some(b => b.callback_data === 'p:' + o.id + ':' + m), m);
  assert.ok(kb.some(b => b.web_app && b.text.includes('Часть сразу')), 'частичная оплата — в панели продавца');
  assert.ok(kb.every(b => !b.callback_data || b.callback_data.length <= 64));
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'ready', 'пока оплата не выбрана, заказ не выдан');
  // «в долг» спрашивает срок
  await cb(SELLER, 'p:' + o.id + ':credit', 700);
  e = lastTg('editMessageText', p => p.message_id === 700).payload;
  assert.ok(e.text.includes('На сколько дней'));
  assert.deepEqual(e.reply_markup.inline_keyboard[0].map(b => b.callback_data), [3, 7, 14, 30].map(n => 'p:' + o.id + ':credit:' + n));
  await cb(SELLER, 'p:' + o.id + ':credit:7', 700);
  e = lastTg('editMessageText', p => p.message_id === 700).payload;
  assert.ok(e.text.includes('Оплата: 📒 В долг до ' + plusDays(shopDay(), 7).split('-').reverse().join('.')), e.text);
  assert.equal((await debtOf(A.u.id)).bal, 1394000);
  // нажатие чужого: нет доступа; неверный способ не проходит
  const o2 = (await jsonOf(await place(A, ONE))).order;
  for (const to of ['accepted', 'ready']) await cb(SELLER, 's:' + o2.id + ':' + to, 701);
  await cb(SELLER, 'p:' + o2.id + ':gold', 701);
  assert.equal((await adminOrdersOf()).find(x => x.id === o2.id).status, 'ready');
  // у нового заказа того же магазина на карточке виден его долг
  tgLog = [];
  const o3 = (await jsonOf(await place(A, ONE))).order;
  const card = lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes(o3.id)).payload.text.replace(/\u00a0/g, ' ');
  assert.ok(card.includes('⚠️ Долг магазина: 1 394 000'), card);
  // в панели у заказа в работе есть долг магазина
  const ord = (await adminOrdersOf()).find(x => x.id === o3.id);
  assert.equal(ord.debt.bal, 1394000);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).debt, undefined, 'у выданного заказа долг не показываем');
  // клиента с долгом удалить нельзя
  const del = await call('DELETE', '/api/admin/clients/' + A.u.id, { init: iS() });
  assert.equal(del.status, 409);
  assert.equal((await jsonOf(del)).error, 'has_debt');
  await debtAct(A.u.id, 'pay', { amount: 1394000, m: 'cash' });
  assert.equal((await call('DELETE', '/api/admin/clients/' + A.u.id, { init: iS() })).status, 409, 'ответа магазина на оплату ещё нет');
  await confirmAll(A.u.id);
  assert.equal((await call('DELETE', '/api/admin/clients/' + A.u.id, { init: iS() })).status, 200);
});

await t('долги: журнал не растёт бесконечно — старые записи сворачиваются, долг и срок сохраняются', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 9 });
  for (let i = 0; i < 510; i++) assert.equal((await debtAct(A.u.id, 'pay', { amount: 1, m: 'cash' })).status, 200);
  const lg = await W.storage.get('lg:' + A.u.id);
  assert.ok(lg.rows.length > 500 && lg.rows.length <= 800, 'ждущие ответа записи не сворачиваются, пока журнал не вырос в полтора раза: ' + lg.rows.length);
  await confirmAll(A.u.id);
  const lg2 = await W.storage.get('lg:' + A.u.id);
  assert.ok(lg2.rows.length <= 500, 'после ответа магазина журнал сворачивается: ' + lg2.rows.length);
  assert.ok(lg2.base && lg2.base.due === plusDays(shopDay(), 9), 'срок свёрнутой выдачи не потерян');
  const db = await debtOf(A.u.id);
  assert.equal(db.bal, 1394000 - 510);
  assert.equal(db.due, plusDays(shopDay(), 9));
  assert.equal(db.rows.length, 100);
  assert.equal(db.more, true);
  // платёж на остаток закрывает долг полностью
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1394000 - 510, m: 'bank' })).status, 200);
  assert.equal((await debtOf(A.u.id)).bal, 0);
  await confirmAll(A.u.id);
  assert.equal((await debtsOf()).debtors.length, 0);
});

await t('клиенты: база собирается из прежних заказов один раз; удаление клиента не трогает заказы', async () => {
  W = makeWorld();
  await send({ update_id: 5, message: { message_id: 41, from: SELLER, chat: { id: SELLER.id, type: 'private' }, text: '/admin ' + CODE } });
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  tgLog = [];
  const mk = (id, uid, createdAt, status, over) => Object.assign({
    id, createdAt, status, lang: 'ru', name: 'Клиент ' + uid, phone: '+998 90 000 00 0' + (uid % 10), mode: 'pickup', address: '', pickupAt: '2030-01-01T10:00',
    comment: '', items: [{ id: 'p4', name: 'Макароны', uz: '', amount: 400, unit: 'g', price: 7500, qty: 2 }], total: 15000, uid, tg: { username: 'u' + uid, name: 'Имя ' + uid }, msgs: []
  }, over || {});
  const old = [
    mk('Z-OLD01', 5001, '2030-01-01T08:00:00.000Z', 'done', { total: 100000, name: 'Старое имя', mode: 'delivery', address: 'Навои, ул. Старая 1' }),
    mk('Z-OLD02', 5001, '2030-01-02T08:00:00.000Z', 'new', { name: 'Новое имя', mode: 'delivery', address: 'Навои, ул. Новая 2', total: 15000 }),
    mk('Z-OLD03', 5002, '2030-01-03T08:00:00.000Z', 'cancelled'),
    mk('Z-OLD04', 5003, '2030-01-04T08:00:00.000Z', 'accepted')
  ];
  const upd = { act: ['Z-OLD04', 'Z-OLD02'], hist: ['Z-OLD03', 'Z-OLD01'] };
  old.forEach(o => { upd['o:' + o.id] = o; });
  await W.storage.put(upd);
  let list = await adminClients();
  assert.deepEqual(list.map(c => c.uid).sort(), [5001, 5002, 5003]);
  const c1 = list.find(c => c.uid === 5001);
  assert.equal(c1.name, 'Новое имя', 'контакты берутся из самого свежего заказа');
  assert.equal(c1.n, 2);
  assert.equal(c1.ds, 1);
  assert.equal(c1.sum, 100000);
  assert.deepEqual(c1.addrs, ['Навои, ул. Новая 2', 'Навои, ул. Старая 1']);
  assert.equal(c1.tg.username, 'u5001');
  assert.equal(c1.last, '2030-01-02T08:00:00.000Z');
  assert.equal(list.find(c => c.uid === 5002).n, 0, 'отменённый заказ в счёт не идёт');
  // повторное чтение ничего не удваивает; новый заказ присоединяется к существующему клиенту
  list = await adminClients();
  assert.equal(list.find(c => c.uid === 5001).n, 2);
  const U = { u: { id: 5001, first_name: 'Клиент', language_code: 'ru' }, init: () => initDataFor({ id: 5001, first_name: 'Клиент', language_code: 'ru' }) };
  assert.equal((await place(U, ONE)).status, 200);
  assert.equal((await clientOf(5001)).n, 3);
  assert.equal((await adminClients()).length, 3);
  // удаление
  const before = (await adminOrdersOf()).length;
  assert.equal((await call('DELETE', '/api/admin/clients/5002', { init: iS() })).status, 200);
  assert.equal((await clientOf(5002)), undefined);
  assert.equal((await call('GET', '/api/admin/clients/5002', { init: iS() })).status, 404);
  assert.equal((await adminClients()).length, 2);
  assert.equal((await adminOrdersOf()).length, before, 'заказы удалённого клиента остаются');
  // а если такой клиент снова закажет, запись появится заново
  const V = { u: { id: 5002, first_name: 'Вернулся', language_code: 'ru' }, init: () => initDataFor({ id: 5002, first_name: 'Вернулся', language_code: 'ru' }) };
  assert.equal((await place(V, ONE)).status, 200);
  assert.equal((await clientOf(5002)).n, 1);
});

await t('клиенты: у клиента без заказов и профиля базы нет; при полной базе заказы всё равно принимаются', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await meOf(A)).profile, null);
  assert.equal((await adminClients()).length, 0);
  // база заполнена до предела
  const fake = Array.from({ length: 3000 }, (_, i) => 700000 + i);
  await W.storage.put({ cx: fake, cxb: 1 });
  assert.equal((await place(A, ONE)).status, 200, 'заказ принят, хотя в базу новый клиент не поместился');
  assert.equal((await clientOf(A.u.id)), undefined);
  assert.equal((await putProfile(A, { name: 'Не поместится' })).status, 503);
  assert.equal((await adminClients()).length, 0);   // записей нет, остался только пустой индекс
  // у существующего клиента всё работает и при полной базе
  await W.storage.put({ ['c:' + fake[0]]: Object.assign({ uid: fake[0], name: 'Старый', phone: '', org: '', addrs: [], note: '', grp: '', blocked: false, since: '2030-01-01', last: '', n: 0, ds: 0, sum: 0, tg: { username: '', name: '' }, lang: '' }) });
  assert.equal((await editClient(fake[0], { note: 'ок' })).status, 200);
  assert.equal((await clientOf(fake[0])).note, 'ок');
});

/* ---------- минимальная сумма и стоимость доставки ---------- */
await t('доставка и минимум: настройки по умолчанию «нет», числа приводятся к целым в пределах', async () => {
  await stockWorld();
  const c0 = await getCfg();
  assert.equal(c0.shop.minOrder, 0);
  assert.equal(c0.shop.deliveryFee, 0);
  assert.equal(c0.shop.freeDeliveryFrom, 0);
  assert.equal((await putCfg(sh => { sh.minOrder = -5; sh.deliveryFee = 'abc'; sh.freeDeliveryFrom = 12.7; })).status, 200);
  let c = await getCfg();
  assert.deepEqual([c.shop.minOrder, c.shop.deliveryFee, c.shop.freeDeliveryFrom], [0, 0, 13]);
  assert.equal((await putCfg(sh => { sh.minOrder = 1e12; sh.deliveryFee = 30000; })).status, 200);
  c = await getCfg();
  assert.equal(c.shop.minOrder, 1e9);
  assert.equal(c.shop.deliveryFee, 30000);
  // общая функция: клиент и сервер считают одинаково
  const cf = fee => ({ shop: { deliveryFee: fee[0], freeDeliveryFrom: fee[1] } });
  assert.equal(S.deliveryFee(cf([30000, 0]), 'delivery', 1), 30000);
  assert.equal(S.deliveryFee(cf([30000, 0]), 'pickup', 1), 0);
  assert.equal(S.deliveryFee(cf([0, 0]), 'delivery', 1), 0);
  assert.equal(S.deliveryFee(cf([30000, 500000]), 'delivery', 499999), 30000);
  assert.equal(S.deliveryFee(cf([30000, 500000]), 'delivery', 500000), 0);
  assert.equal(S.deliveryFee(cf([30000, 500000]), 'pickup', 100), 0);
});

await t('минимальная сумма: меньший заказ не принимается, доставка к сумме не прибавляется, настройки приходят свежие', async () => {
  await stockWorld();
  assert.equal((await putCfg(sh => { sh.minOrder = 100000; })).status, 200);
  const A = newUser();
  const nOrders = async () => (await adminOrdersOf()).length;
  let r = await place(A, [{ id: 'p4', qty: 1 }]);
  const d = await jsonOf(r);
  assert.equal(r.status, 409);
  assert.equal(d.error, 'min_order');
  assert.equal(d.min, 100000);
  assert.equal(d.cfg.shop.minOrder, 100000, 'ответ несёт свежие настройки');
  assert.equal(await nOrders(), 0);
  assert.equal((await place(A, [{ id: 'p4', qty: 13 }])).status, 409, '13 × 7 500 = 97 500, это меньше минимума');
  assert.equal((await place(A, [{ id: 'p4', qty: 13 }], {}, 'delivery')).status, 409, 'на доставку минимум тоже действует');
  assert.equal(await nOrders(), 0);
  // платная доставка не помогает набрать минимум: считаются только товары
  assert.equal((await putCfg(sh => { sh.deliveryFee = 30000; })).status, 200);
  const r2 = await place(A, [{ id: 'p4', qty: 13 }], { expectTotal: 127500 }, 'delivery');
  assert.equal(r2.status, 409);
  assert.equal((await jsonOf(r2)).error, 'min_order');
  // сумма товаров от минимума проходит (самовывоз без доставки и доставка с ценой)
  assert.equal((await place(A, [{ id: 'p4', qty: 14 }])).status, 200);        // 105 000
  assert.equal((await place(A, [{ id: 'p4', qty: 14 }], { expectTotal: 135000 }, 'delivery')).status, 200);   // 105 000 + 30 000
  assert.equal(await nOrders(), 2);
  // минимум можно убрать
  assert.equal((await putCfg(sh => { sh.minOrder = 0; })).status, 200);
  assert.equal((await place(A, [{ id: 'p4', qty: 1 }])).status, 200);
});

await t('стоимость доставки: берётся только при доставке, бесплатна от порога, сумма заказа проверяется сервером', async () => {
  await stockWorld();
  assert.equal((await putCfg(sh => { sh.deliveryFee = 30000; sh.freeDeliveryFrom = 500000; })).status, 200);
  // самовывоз: без доставки, в заказе нет лишних полей
  let o = (await jsonOf(await place(newUser(), [{ id: 'p1', qty: 2 }]))).order;      // 164 000
  assert.equal(o.total, 164000);
  assert.equal(o.fee, undefined);
  assert.equal(o.sub, undefined);
  // доставка: к товарам прибавляется 30 000
  tgLog = [];
  let r = await place(newUser(), [{ id: 'p1', qty: 2 }], { expectTotal: 194000 }, 'delivery');
  assert.equal(r.status, 200);
  o = (await jsonOf(r)).order;
  assert.equal(o.total, 194000);
  assert.equal(o.fee, 30000);
  assert.equal(o.sub, 164000);
  const card = norm(lastTg('sendMessage', p => p.chat_id === SELLER.id && String(p.text).includes(o.id)).payload.text);
  assert.ok(card.includes('Стоимость доставки: 30 000 сум') && card.includes('Итого: 194 000 сум'), card);
  // клиент, который ещё видит сумму без доставки, получает просьбу подтвердить новую
  r = await place(newUser(), [{ id: 'p1', qty: 2 }], { expectTotal: 164000 }, 'delivery');
  const d = await jsonOf(r);
  assert.equal(r.status, 409);
  assert.equal(d.error, 'price_changed');
  assert.equal(d.cfg.shop.deliveryFee, 30000);
  // от порога доставка бесплатна: 820 000 ≥ 500 000
  o = (await jsonOf(await place(newUser(), [{ id: 'p2', qty: 2 }], { expectTotal: 820000 }, 'delivery'))).order;
  assert.equal(o.total, 820000);
  assert.equal(o.fee, undefined);
  // граница: ровно на пороге уже бесплатно, на рубль меньше — платно
  assert.equal((await putCfg(sh => { sh.freeDeliveryFrom = 164000; })).status, 200);
  assert.equal((await jsonOf(await place(newUser(), [{ id: 'p1', qty: 2 }], { expectTotal: 164000 }, 'delivery'))).order.fee, undefined);
  assert.equal((await putCfg(sh => { sh.freeDeliveryFrom = 164001; })).status, 200);
  assert.equal((await jsonOf(await place(newUser(), [{ id: 'p1', qty: 2 }], { expectTotal: 194000 }, 'delivery'))).order.fee, 30000);
  // порога нет — доставка платная всегда
  assert.equal((await putCfg(sh => { sh.freeDeliveryFrom = 0; })).status, 200);
  assert.equal((await jsonOf(await place(newUser(), [{ id: 'p2', qty: 2 }], { expectTotal: 850000 }, 'delivery'))).order.fee, 30000);
  // доставка бесплатная по умолчанию (0)
  assert.equal((await putCfg(sh => { sh.deliveryFee = 0; })).status, 200);
  assert.equal((await jsonOf(await place(newUser(), [{ id: 'p1', qty: 2 }], { expectTotal: 164000 }, 'delivery'))).order.fee, undefined);
});

await t('стоимость доставки: сумма с доставкой попадает в «выдано» у клиента и в общую сумму, у заказа без неё всё как раньше', async () => {
  await stockWorld();
  assert.equal((await putCfg(sh => { sh.deliveryFee = 30000; })).status, 200);
  const A = newUser();
  const o = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }], { expectTotal: 194000 }, 'delivery'))).order;
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await setStatus(o.id, to)).status, 200);
  assert.equal((await clientOf(A.u.id)).sum, 194000);
  assert.equal((await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).stats.doneSum, 194000);
  const mine = (await jsonOf(await call('GET', '/api/my-orders', { init: A.init() }))).orders[0];
  assert.equal(mine.fee, 30000);
  assert.equal(mine.sub, 164000);
});


/* ---------- выгрузки: сборочный лист, Excel, резервная копия ---------- */
import zlib from 'node:zlib';
// читает ZIP без сжатия (так пишет сервер) и сверяет контрольные суммы независимым способом
function unzip(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let e = bytes.length - 22;
  assert.equal(dv.getUint32(e, true), 0x06054b50, 'нет конца архива');
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const out = {};
  for (let i = 0; i < n; i++) {
    assert.equal(dv.getUint32(p, true), 0x02014b50);
    const crc = dv.getUint32(p + 16, true), size = dv.getUint32(p + 24, true), nl = dv.getUint16(p + 28, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nl));
    assert.equal(dv.getUint32(off, true), 0x04034b50);
    const start = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    const data = bytes.subarray(start, start + size);
    assert.equal(zlib.crc32(data), crc, 'контрольная сумма ' + name);
    out[name] = data;
    p += 46 + nl;
  }
  return out;
}
const unxml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
// листы xlsx → { имя листа: [[ячейки]] }
function readXlsx(bytes) {
  const z = unzip(bytes), dec = x => new TextDecoder().decode(x);
  const wb = dec(z['xl/workbook.xml']);
  const names = [...wb.matchAll(/<sheet name="([^"]*)"/g)].map(m => unxml(m[1]));
  const res = {};
  names.forEach((nm, i) => {
    const xml = dec(z['xl/worksheets/sheet' + (i + 1) + '.xml']);
    const rows = [];
    for (const rm of xml.matchAll(/<row r="(\d+)">(.*?)<\/row>/g)) {
      const row = [];
      for (const cm of rm[2].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>(.*?)<\/c>/g)) {
        let ci = 0; for (const ch of cm[1]) ci = ci * 26 + ch.charCodeAt(0) - 64;
        const t = cm[3].match(/<t[^>]*>(.*?)<\/t>/s), v = cm[3].match(/<v>(.*?)<\/v>/);
        row[ci - 1] = t ? unxml(t[1]) : v ? Number(v[1]) : '';
      }
      rows[Number(rm[1]) - 1] = row;
    }
    res[nm] = Array.from(rows, r => Array.from(r || [], c => c === undefined ? '' : c));
  });
  return res;
}
const exportReq = (kind, extra, init) => call('POST', '/api/admin/export', { init: init || iS(), body: Object.assign({ kind }, extra || {}) });
const pickReq = (body, init) => call('POST', '/api/admin/pick', { init: init || iS(), body: body || {} });
const lastDoc = () => lastTg('sendDocument');
const dumpFile = f => { if (process.env.EXPORT_DUMP && f) fs.writeFileSync(path.join(process.env.EXPORT_DUMP, f.name), f.bytes); };

await t('выгрузки и сборочный лист доступны только продавцу', async () => {
  await stockWorld();
  const A = newUser();
  await place(A, [{ id: 'p1', qty: 1 }]);
  tgLog = [];
  for (const kind of ['orders', 'clients', 'backup', 'pick', 'debts']) {
    assert.equal((await exportReq(kind, {}, A.init())).status, 403, kind);
    assert.equal((await call('POST', '/api/admin/export', { body: { kind } })).status, 401, kind);
  }
  assert.equal((await pickReq({}, A.init())).status, 403);
  assert.equal((await call('POST', '/api/admin/pick', { body: {} })).status, 401);
  assert.equal(tgAll('sendDocument').length, 0);
});

await t('Excel с заказами: файл приходит продавцу в чат, внутри заказы и товары с суммами, доставкой и организацией', async () => {
  await stockWorld();
  assert.equal((await putCfg(sh => { sh.deliveryFee = 30000; })).status, 200);
  const A = newUser(), B = newUser();
  assert.equal((await putProfile(A, { org: 'Магазин «Ориент» & Ко <1>' })).status, 200);
  const o1 = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }, { id: 'p4', qty: 10 }], { expectTotal: 269000, form: formFor(S.DEFAULT, 'delivery', { comment: 'Звонить за час' }) }, 'delivery'))).order;   // 164 000 + 75 000 + доставка 30 000
  const o2 = (await jsonOf(await place(B, [{ id: 'p2', qty: 1 }], { form: formFor(S.DEFAULT, 'pickup', { name: '=1+1', comment: '' }) }))).order;
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await setStatus(o2.id, to)).status, 200);
  tgLog = [];
  const r = await exportReq('orders');
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.ok, true);
  assert.equal(d.n, 2);
  const doc = lastDoc();
  assert.ok(doc, 'файл не отправлен');
  dumpFile(doc.file);
  assert.equal(doc.payload.chat_id, String(SELLER.id));
  assert.ok(/^orders-\d{4}-\d{2}-\d{2}\.xlsx$/.test(doc.file.name), doc.file.name);
  assert.equal(doc.file.bytes.length, d.size);
  assert.ok(doc.payload.caption.includes('Заказы: 2'));
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Заказы', 'Товары в заказах']);
  const head = x['Заказы'][0];
  assert.deepEqual(head.slice(0, 5), ['№ заказа', 'Создан', 'Статус', 'Получение', 'Когда']);
  const by = id => x['Заказы'].find(r => r[0] === id);
  const a = by(o1.id), b = by(o2.id);
  assert.ok(a && b);
  const col = n => head.indexOf(n);
  assert.equal(a[col('Статус')], 'Новый');
  assert.equal(a[col('Получение')], 'Доставка');
  assert.equal(a[col('Организация')], 'Магазин «Ориент» & Ко <1>');       // служебные знаки XML сохранились
  assert.equal(a[col('Адрес доставки')], 'Навои, ул. Галаба 12, склад 3');
  assert.equal(a[col('Комментарий')], 'Звонить за час');
  assert.equal(a[col('Телефон')], '+998 91 555 44 33');                    // телефон остался текстом
  assert.equal(a[col('Доставка, сум')], 30000);
  assert.equal(a[col('Товары, сум')], o1.total - 30000);
  assert.equal(a[col('Скидка, сум')], 0);
  assert.equal(a[col('Итого, сум')], o1.total);
  assert.equal(a[col('Позиций')], 2);
  assert.equal(b[col('Статус')], 'Выдан');
  assert.equal(b[col('Получение')], 'Самовывоз');
  assert.equal(b[col('Адрес доставки')], '');
  assert.equal(b[col('Клиент')], '=1+1');                                   // «формула» осталась текстом
  assert.equal(b[col('Доставка, сум')], 0);
  assert.equal(b[col('Итого, сум')], 410000);
  // созданный заказ показан по времени склада (UTC+5)
  const cr = new Date(Date.parse(o1.createdAt) + 5 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
  assert.equal(a[col('Создан')], cr);
  // лист «Товары в заказах»: по строке на позицию, сумма = цена × количество
  const it = x['Товары в заказах'];
  assert.deepEqual(it[0], ['№ заказа', 'Статус', 'Когда', 'Клиент', 'Товар', 'Вес / объём', 'Количество', 'В упаковках', 'Цена, сум', 'Сумма, сум']);
  const lines = it.slice(1).filter(r => r[0] === o1.id);
  assert.equal(lines.length, 2);
  const oil = lines.find(r => r[4] === 'Масло подсолнечное');
  assert.deepEqual([oil[5], oil[6], oil[8], oil[9]], ['5 л', 2, 82000, 164000]);
  const mac = lines.find(r => r[4] === 'Макароны');
  assert.deepEqual([mac[5], mac[6], mac[8], mac[9]], ['400 г', 10, 7500, 75000]);
  assert.equal(it.slice(1).length, 3);
  // сервер освободился: следующая выгрузка проходит
  assert.equal((await exportReq('orders')).status, 200);
});

await t('Excel с клиентами: поля базы, группа, заметка, адреса, блокировка', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await putProfile(A, { name: 'Анвар', phone: '+998 90 111 22 33', org: 'Кафе «Чинор»', addrs: ['Навои, Галаба 1', 'Зарафшан, Мира 5'] })).status, 200);
  const o = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }]))).order;
  for (const to of ['accepted', 'ready', 'done']) await setStatus(o.id, to);
  assert.equal((await editClient(A.u.id, { grp: 'VIP', note: 'Платит в срок', blocked: false })).status, 200);
  const B = newUser();
  await place(B, [{ id: 'p4', qty: 1 }]);
  assert.equal((await editClient(B.u.id, { blocked: true })).status, 200);
  tgLog = [];
  const d = await jsonOf(await exportReq('clients'));
  assert.equal(d.ok, true);
  assert.equal(d.n, 2);
  const doc = lastDoc();
  dumpFile(doc.file);
  assert.ok(/^clients-\d{4}-\d{2}-\d{2}\.xlsx$/.test(doc.file.name));
  const rows = readXlsx(doc.file.bytes)['Клиенты'];
  const head = rows[0], col = n => head.indexOf(n);
  assert.deepEqual(head.slice(0, 7), ['Имя', 'Телефон', 'Организация', 'Тип', 'Группа', 'Адреса доставки', 'Заметка']);
  const a = rows.find(r => r[col('Организация')] === 'Кафе «Чинор»');
  assert.ok(a);
  assert.equal(a[col('Имя')], 'ООО Ориент' === a[col('Имя')] ? 'ООО Ориент' : 'Анвар');
  assert.equal(a[col('Группа')], 'VIP');
  assert.equal(a[col('Заметка')], 'Платит в срок');
  assert.equal(a[col('Адреса доставки')], 'Навои, Галаба 1 | Зарафшан, Мира 5');
  assert.equal(a[col('Заказов')], 1);
  assert.equal(a[col('Завершено')], 1);
  assert.equal(a[col('Сумма завершённых, сум')], 164000);
  assert.equal(a[col('Заблокирован')] || '', '');
  const b = rows.find(r => r[col('Заблокирован')] === 'да');
  assert.ok(b);
  assert.equal(rows.length, 3);
});

await t('резервная копия: архив с данными и фото, без токена и кода продавца', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await stockOp({ id: 'p1', op: 'set', n: 20, low: 3 })).status, 200);
  const o = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }]))).order;
  const photo = jpegBytes(800, 600, 5000);
  assert.equal((await putPhoto('p1', photo)).status, 200);
  assert.equal((await putPhoto('p2', jpegBytes(640, 480, 7000))).status, 200);
  await editClient(A.u.id, { grp: 'VIP', note: 'Заметка' });
  tgLog = [];
  const d = await jsonOf(await exportReq('backup'));
  assert.equal(d.ok, true);
  const doc = lastDoc();
  dumpFile(doc.file);
  assert.ok(/^backup-\d{4}-\d{2}-\d{2}\.zip$/.test(doc.file.name));
  assert.ok(doc.payload.caption.includes('заказов 1') && doc.payload.caption.includes('клиентов 1') && doc.payload.caption.includes('фото 2'), doc.payload.caption);
  const z = unzip(doc.file.bytes);
  assert.deepEqual(Object.keys(z).sort(), ['README.txt', 'backup.json', 'photos/p1.jpg', 'photos/p2.jpg']);
  assert.deepEqual(Buffer.from(z['photos/p1.jpg']), Buffer.from(photo));
  const raw = new TextDecoder().decode(z['backup.json']);
  assert.ok(!raw.includes(TOKEN) && !raw.includes(CODE), 'в копии нет токена и кода');
  const bk = JSON.parse(raw);
  assert.equal(bk.kind, 'distro-backup');
  assert.equal(bk.v, 1);
  assert.equal(bk.cfg.shop.name, DEFAULT_NAME);
  assert.equal(bk.prod.items.length, 4);
  assert.equal(bk.stk.p1.q, 20);
  assert.equal(bk.stk.p1.r, 2);                                              // резерв под активный заказ сохранён
  assert.equal(bk.orders.length, 1);
  assert.equal(bk.orders[0].id, o.id);
  assert.equal(bk.orders[0].uid, A.u.id);                                    // в копии есть владелец заказа
  assert.ok(!('msgs' in bk.orders[0]));
  assert.equal(bk.clients.length, 1);
  assert.equal(bk.clients[0].grp, 'VIP');
  assert.deepEqual(bk.admins, [SELLER.id]);
  assert.deepEqual(bk.photos, { saved: 2, of: 2 });
  assert.ok(new TextDecoder().decode(z['README.txt']).includes('backup.json'));
});

await t('резервная копия: все три фото товара попадают в архив с отдельными именами', async () => {
  await stockWorld();
  const f = [jpegBytes(800, 600, 5000), jpegBytes(700, 600, 6000), jpegBytes(600, 600, 7000)];
  for (let n = 1; n <= 3; n++) assert.equal((await putPhoto('p1?n=' + n, f[n - 1])).status, 200);
  tgLog = [];
  const d = await jsonOf(await exportReq('backup'));
  assert.equal(d.ok, true);
  const z = unzip(lastDoc().file.bytes);
  assert.deepEqual(Object.keys(z).sort(), ['README.txt', 'backup.json', 'photos/p1-2.jpg', 'photos/p1-3.jpg', 'photos/p1.jpg']);
  assert.deepEqual(Buffer.from(z['photos/p1-3.jpg']), Buffer.from(f[2]));
  const bk = JSON.parse(new TextDecoder().decode(z['backup.json']));
  assert.deepEqual(bk.photos, { saved: 3, of: 3 });
  assert.deepEqual([bk.prod.items[0].pv2 !== '', bk.prod.items[0].pv3 !== ''], [true, true]);
  await putProd(SAMPLE_PROD());
});

await t('резервная копия: фото сверх лимита не вешают копию, остальное сохраняется целиком', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD();
  for (let i = 0; i < 70; i++) prod.items.push({ id: 'x' + i, cat: 'oil', name: 'Товар ' + i, uz: '', desc: '', descUz: '', amount: 1, unit: 'kg', price: 1000, on: true });
  assert.equal((await putProd(prod)).status, 200);
  for (let i = 0; i < 70; i++) assert.equal((await putPhoto('x' + i, jpegBytes(800, 600, 290000))).status, 200, 'фото ' + i);
  tgLog = [];
  const d = await jsonOf(await exportReq('backup'));
  assert.equal(d.ok, true);
  const z = unzip(lastDoc().file.bytes);
  const photos = Object.keys(z).filter(k => k.startsWith('photos/'));
  assert.ok(photos.length > 60 && photos.length < 70, 'фото в копии: ' + photos.length);
  assert.ok(d.size < 21000000, 'размер ' + d.size);
  const bk = JSON.parse(new TextDecoder().decode(z['backup.json']));
  assert.deepEqual(bk.photos, { saved: photos.length, of: 70 });
  assert.equal(bk.prod.items.length, 74);
  assert.ok(lastDoc().payload.caption.includes('из 70'));
});

await t('сборочный лист: общий список по всем заказам и отдельная страница на каждый заказ', async () => {
  await stockWorld();
  assert.equal((await putCfg(sh => { sh.deliveryFee = 30000; })).status, 200);
  const A = newUser(), B = newUser();
  assert.equal((await putProfile(A, { org: 'Кафе <b>Чинор</b>' })).status, 200);
  const o1 = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }, { id: 'p4', qty: 3 }], { form: formFor(S.DEFAULT, 'delivery', { comment: 'Домофон <script>alert(1)</script>' }), expectTotal: totalOf([{ id: 'p1', qty: 2 }, { id: 'p4', qty: 3 }]) + 30000 }, 'delivery'))).order;
  const o2 = (await jsonOf(await place(B, [{ id: 'p1', qty: 3 }, { id: 'p2', qty: 1 }]))).order;
  const r = await pickReq({});
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.n, 2);
  if (process.env.EXPORT_DUMP) fs.writeFileSync(path.join(process.env.EXPORT_DUMP, 'sborka-multi.html'), d.html);
  const h = norm(d.html);
  assert.ok(h.startsWith('<!doctype html>'));
  assert.ok(h.includes('Всего собрать со склада'));
  // масло: 2 + 3 = 5 в двух заказах; макароны 3; рис 1
  const sum = h.slice(h.indexOf('Всего собрать'), h.indexOf('<section class="ord">'));
  assert.ok(/Масло подсолнечное<small>5 л<\/small><\/td><td class="q">5<\/td><td class="p">2<\/td>/.test(sum), sum);
  assert.ok(/Рис<small>25 кг<\/small><\/td><td class="q">1<\/td><td class="p">1<\/td>/.test(sum), sum);
  assert.ok(/Макароны<small>400 г<\/small><\/td><td class="q">3<\/td><td class="p">1<\/td>/.test(sum), sum);
  assert.ok(sum.indexOf('Масла') < sum.indexOf('Крупы и макароны'), 'товары сгруппированы по категориям каталога');
  // страницы заказов
  assert.equal(h.split('<section class="ord">').length - 1, 2);
  assert.ok(h.includes(o1.id) && h.includes(o2.id));
  const s1 = h.slice(h.indexOf(o1.id), h.indexOf('</section>', h.indexOf(o1.id)));
  assert.ok(s1.includes('Доставка') && s1.includes('Навои, ул. Галаба 12, склад 3'), s1);
  assert.ok(s1.includes('<td colspan="3">Доставка</td><td class="s">30 000</td>'), s1);
  assert.ok(s1.includes('К оплате при получении: <b>' + norm(S.fmtMoney ? '' : '') ) || s1.includes('К оплате при получении'));
  assert.ok(s1.includes('<td class="s">' + norm((o1.total).toLocaleString('ru-RU')) + '</td>'), 'итог заказа: ' + s1);
  // ввод клиента не превращается в разметку
  assert.ok(!h.includes('<script>alert(1)</script>') && !h.includes('<b>Чинор</b>'));
  assert.ok(h.includes('Домофон &lt;script&gt;alert(1)&lt;/script&gt;') && h.includes('Кафе &lt;b&gt;Чинор&lt;/b&gt;'));
  // заказы идут по времени выдачи
  assert.ok(h.indexOf('Всего собрать') < h.indexOf(o1.id));
});

await t('сборочный лист: один заказ — без общего списка; по номерам, по дню, только новые и в работе', async () => {
  await stockWorld();
  const A = newUser(), B = newUser(), C = newUser();
  const o1 = (await jsonOf(await place(A, [{ id: 'p1', qty: 1 }]))).order;
  const o2 = (await jsonOf(await place(B, [{ id: 'p4', qty: 2 }]))).order;
  const o3 = (await jsonOf(await place(C, [{ id: 'p2', qty: 1 }]))).order;
  // по номеру: общего списка нет
  let d = await jsonOf(await pickReq({ ids: [o2.id] }));
  assert.equal(d.n, 1);
  assert.ok(d.html.includes(o2.id) && !d.html.includes(o1.id) && !d.html.includes('Всего собрать'));
  // чужие и неверные номера отбрасываются
  d = await jsonOf(await pickReq({ ids: [o1.id, 'нет-такого', '../x', 42, o1.id] }));
  assert.equal(d.n, 1);
  // готовые и выданные в «сборку» по умолчанию не попадают, отменённые тоже
  await setStatus(o1.id, 'accepted'); await setStatus(o1.id, 'ready');
  await setStatus(o3.id, 'cancelled');
  d = await jsonOf(await pickReq({}));
  assert.equal(d.n, 1);
  assert.ok(d.html.includes(o2.id) && !d.html.includes(o1.id) && !d.html.includes(o3.id));
  await setStatus(o2.id, 'accepted');
  assert.equal((await jsonOf(await pickReq({}))).n, 1);                       // «в работе» тоже собираем
  // по дню
  const day = (await adminOrdersOf()).find(o => o.id === o2.id).pickupAt.slice(0, 10);
  assert.equal((await jsonOf(await pickReq({ day }))).n, 1);
  const r = await pickReq({ day: '2001-01-01' });
  assert.equal(r.status, 404);
  assert.equal((await jsonOf(r)).error, 'empty');
  // мусор в дне не ломает запрос: берутся все
  assert.equal((await jsonOf(await pickReq({ day: '<x>' }))).n, 1);
  // совсем пусто
  await setStatus(o2.id, 'cancelled');
  assert.equal((await pickReq({})).status, 404);
  assert.equal((await pickReq({ ids: [] })).status, 404);
  assert.equal((await call('POST', '/api/admin/pick', { init: iS(), body: 'null' })).status, 400);
});

await t('сборочный лист: больше 100 заказов — в лист входят первые, об остальных предупреждение', async () => {
  await stockWorld();
  assert.equal((await stockOp({ id: 'p4', op: 'set', n: 1000 })).status, 200);
  for (let i = 0; i < 103; i++) assert.equal((await place(newUser(), [{ id: 'p4', qty: 1 }])).status, 200, 'заказ ' + i);
  const d = await jsonOf(await pickReq({}));
  assert.equal(d.n, 100);
  assert.equal(d.cut, 3);
  assert.ok(d.html.includes('ещё 3 не поместились'));
  assert.equal(d.html.split('<section class="ord">').length - 1, 100);
});

await t('сборочный лист отправляется файлом .html в чат продавца', async () => {
  await stockWorld();
  const A = newUser();
  const o = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }]))).order;
  tgLog = [];
  const r = await exportReq('pick', { ids: [o.id] });
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  const doc = lastDoc();
  dumpFile(doc.file);
  assert.ok(/^sborka-\d{4}-\d{2}-\d{2}\.html$/.test(doc.file.name));
  assert.equal(doc.file.type, 'text/html');
  const h = new TextDecoder().decode(doc.file.bytes);
  assert.ok(h.startsWith('<!doctype html>') && h.includes(o.id) && h.includes('Масло подсолнечное'));
  assert.equal(doc.payload.chat_id, String(SELLER.id));
  // пустой выбор — понятная ошибка, ничего не отправлено
  tgLog = [];
  const e = await exportReq('pick', { ids: ['Z-NOPE1'] });
  assert.equal(e.status, 404);
  assert.equal(tgAll('sendDocument').length, 0);
});

await t('выгрузка: Telegram отказал — продавец получает причину, а сервер не зависает', async () => {
  await stockWorld();
  await place(newUser(), [{ id: 'p1', qty: 1 }]);
  tgDocFail = true;
  const r = await exportReq('orders');
  tgDocFail = false;
  const d = await jsonOf(r);
  assert.equal(r.status, 502);
  assert.equal(d.error, 'send_failed');
  assert.ok(d.detail.includes('blocked'));
  // сеть упала совсем
  tgFail = true;
  const r2 = await exportReq('clients');
  tgFail = false;
  assert.equal(r2.status, 502);
  assert.equal((await jsonOf(r2)).error, 'send_failed');
  // после ошибки выгрузка снова работает
  assert.equal((await exportReq('orders')).status, 200);
});

await t('выгрузка: неизвестный вид и две выгрузки одновременно', async () => {
  await stockWorld();
  await place(newUser(), [{ id: 'p1', qty: 1 }]);
  for (const kind of ['', 'photos', 'ALL', '../x']) assert.equal((await exportReq(kind)).status, 400, 'вид «' + kind + '»');
  assert.equal((await call('POST', '/api/admin/export', { init: iS(), body: 'null' })).status, 400);
  assert.equal((await call('GET', '/api/admin/export', { init: iS() })).status, 404);
  tgLog = [];
  tgDocDelay = 60;
  const [a, b] = await Promise.all([exportReq('orders'), exportReq('orders')]);
  tgDocDelay = 0;
  const codes = [a.status, b.status].sort();
  assert.deepEqual(codes, [200, 429]);
  assert.equal(tgAll('sendDocument').length, 1);
  assert.equal((await exportReq('orders')).status, 200);
});

await t('Excel «Долги»: три фильтра, листы «Долги» и «История», только продавцу', async () => {
  await stockWorld();
  const A = newUser(), B = newUser(), C = newUser();
  assert.equal((await exportReq('debts', { f: 'all' }, A.init())).status, 403, 'клиент не может');
  assert.equal((await call('POST', '/api/admin/export', { body: { kind: 'debts' } })).status, 401);
  tgLog = [];
  assert.equal((await exportReq('debts', { f: 'all' })).status, 404, 'без долгов файла нет');
  assert.equal(tgAll('sendDocument').length, 0);
  const o1 = await readyOrder(A, CART), o2 = await readyOrder(B, CART), o3 = await readyOrder(C, ONE);
  await doneWith(o1.id, { m: 'credit', days: 3 });
  await doneWith(o2.id, { m: 'credit', days: 14, paid: 400000, pm: 'card' });
  await doneWith(o3.id, { m: 'credit', days: 10 });
  await backdate(A.u.id, o1.id, plusDays(shopDay(), -4));
  assert.equal((await debtAct(B.u.id, 'pay', { amount: 100000, m: 'cash', note: 'принёс директор' })).status, 200);
  await confirmAll(A.u.id); await confirmAll(B.u.id);
  // магазин C отвечает «Не так» → спорная запись
  const lgC = await W.storage.get('lg:' + C.u.id);
  const gC = lgC.rows.find(r => r.k === 'ch').g || lgC.rows.find(r => r.k === 'ch').n;
  await cb({ id: C.u.id, first_name: 'Магазин' }, 'q:' + gC + ':n');
  tgLog = [];
  const r = await exportReq('debts', { f: 'all' });
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.n, 3);
  const doc = lastDoc();
  dumpFile(doc.file);
  assert.equal(doc.payload.chat_id, String(SELLER.id));
  assert.ok(/^debts-\d{4}-\d{2}-\d{2}\.xlsx$/.test(doc.file.name), doc.file.name);
  assert.ok(doc.payload.caption.includes('магазинов 3'), doc.payload.caption);
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Долги', 'История']);
  const rows = x['Долги'], head = rows[0], col = n => head.indexOf(n);
  assert.deepEqual(head.slice(0, 5), ['Магазин', 'Организация', 'Телефон', 'Адрес', 'Долг, сум']);
  assert.equal(rows.length, 4);
  const byBal = bal => rows.slice(1).find(r => r[col('Долг, сум')] === bal);
  const a = byBal(1394000);
  assert.ok(a, 'долг первого магазина');
  assert.equal(a[col('Просрочено, сум')], 1394000);
  assert.equal(a[col('Дней просрочки')], 4);
  assert.equal(a[col('Статус')], 'Просрочен');
  const b = byBal(994000 - 100000);
  assert.ok(b, 'долг второго магазина после платежа');
  assert.equal(b[col('Дней просрочки')], 0);
  assert.equal(b[col('Статус')], 'Должен в срок');
  assert.match(String(b[col('Последняя оплата')]), /^\d{4}-\d{2}-\d{2}$/);
  const c = byBal(7500);
  assert.equal(c[col('Спорных записей')], 1);
  assert.ok(String(c[col('Статус')]).includes('спорные записи'));
  const hist = x['История'], hh = hist[0], hc = n => hh.indexOf(n);
  assert.ok(hist.length > 4, 'в истории все записи');
  const chRows = hist.slice(1).filter(r => r[hc('Запись')] === 'Выдача в долг');
  assert.equal(chRows.length, 3);
  assert.ok(chRows.every(r => /^Z-/.test(r[hc('№ заказа')])), 'у выдач есть номер заказа');
  const pays = hist.slice(1).filter(r => r[hc('Запись')] === 'Оплата');
  assert.deepEqual(pays.map(r => [r[hc('Способ')], r[hc('Сумма, сум')]]).sort(), [['Карта', 400000], ['Наличные', 100000]]);
  assert.ok(pays.find(r => r[hc('Комментарий')] === 'принёс директор'));
  assert.ok(hist.slice(1).some(r => r[hc('Ответ магазина')] === 'ответил «Не так»'), 'ответ магазина виден');
  // фильтры
  tgLog = [];
  const over = await jsonOf(await exportReq('debts', { f: 'over' }));
  assert.equal(over.n, 1);
  assert.ok(lastDoc().payload.caption.includes('просроченные'));
  assert.equal(readXlsx(lastDoc().file.bytes)['Долги'].length, 2);
  const fl = await jsonOf(await exportReq('debts', { f: 'fl' }));
  assert.equal(fl.n, 1);
  assert.equal(readXlsx(lastDoc().file.bytes)['Долги'][1][col('Долг, сум')], 7500);
  assert.equal((await jsonOf(await exportReq('debts', { f: 'zzz' }))).n, 3, 'неизвестный фильтр = все');
  assert.equal((await jsonOf(await exportReq('debts', {}))).n, 3, 'без фильтра = все');
  // старые записи свёрнуты в остаток: в истории строка-пояснение
  const lgB = await W.storage.get('lg:' + B.u.id); lgB.base = { d: 5000, due: '2026-01-01' }; await W.storage.put('lg:' + B.u.id, lgB);
  await exportReq('debts', { f: 'all' });
  const hx = readXlsx(lastDoc().file.bytes)['История'], bi = hx.find(r => r[hx[0].indexOf('Запись')] === 'Ранние записи свёрнуты');
  assert.ok(bi, 'строка про свёрнутые записи');
  assert.equal(bi[hx[0].indexOf('Сумма, сум')], 5000);
  assert.equal(bi[hx[0].indexOf('Срок оплаты')], '01.01.2026');
  // всё погашено → «просроченные» пусто, файла нет
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1394000, m: 'cash' })).status, 200);
  tgLog = [];
  assert.equal((await exportReq('debts', { f: 'over' })).status, 404);
  assert.equal(tgAll('sendDocument').length, 0);
});

await t('выгрузки: пустой магазин не ломается', async () => {
  await stockWorld();
  for (const kind of ['orders', 'clients', 'backup']) {
    tgLog = [];
    const r = await exportReq(kind);
    assert.equal(r.status, 200, kind);
    assert.ok(lastDoc().file.bytes.length > 100, kind);
  }
  const x = readXlsx(lastTg('sendDocument', p => true).file.bytes);   // backup.zip читается как zip
  assert.ok(x);
});


/* ---------- пакет 3: метки, избранное, прайс из Excel ---------- */
const FIX = f => new Uint8Array(fs.readFileSync(path.join(root, 'test/fixtures', f)));
const importReq = (bytes, apply, init) => call('POST', '/api/admin/import' + (apply ? '?apply=1' : ''), { init: init || iS(), body: bytes, headers: { 'content-type': 'application/octet-stream' } });
const favReq = (c, ids) => call('PUT', '/api/fav', { init: c.init(), body: { ids } });
const catalogNow = async () => (await jsonOf(await call('GET', '/api/config'))).prod;

await t('метки: «Акция» со старой ценой и «Новинка»; лишнее и неверное убирается', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD();
  prod.items[0].tag = 'sale'; prod.items[0].old = 95000;
  prod.items[1].tag = 'new'; prod.items[1].old = 500000;       // у «Новинки» старой цены нет
  prod.items[2].tag = 'hot'; prod.items[2].old = 100;          // чужая метка не принимается
  prod.items[3].tag = 'sale'; prod.items[3].old = -5;
  assert.equal((await putProd(prod)).status, 200);
  const it = (await catalogNow()).items;
  assert.deepEqual([it[0].tag, it[0].old], ['sale', 95000]);
  assert.deepEqual([it[1].tag, it[1].old], ['new', 0]);
  assert.deepEqual([it[2].tag, it[2].old], ['', 0]);
  assert.deepEqual([it[3].tag, it[3].old], ['sale', 0]);
  // метки видны всем, в том числе без входа
  const open = (await jsonOf(await call('GET', '/api/config'))).prod.items;
  assert.equal(open[0].tag, 'sale');
  // метка и старая цена не влияют на цену заказа
  const r = await place(newUser(), [{ id: 'p1', qty: 1 }]);
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).order.total, 82000);
});

await t('избранное: хранится у клиента, чужих и удалённых товаров нет, в базе клиентов не появляется', async () => {
  await stockWorld();
  const A = newUser(), B = newUser();
  assert.deepEqual((await meOf(A)).fav, []);
  let r = await favReq(A, ['p2', 'p1', 'p2', 'nope1']);          // повтор и товар, которого нет
  assert.equal(r.status, 200);
  assert.deepEqual((await jsonOf(r)).fav, ['p2', 'p1']);
  assert.deepEqual((await meOf(A)).fav, ['p2', 'p1']);
  assert.deepEqual((await meOf(B)).fav, []);                      // у другого клиента своё
  assert.equal((await adminClients()).length, 0);                 // «сердечко» не создаёт клиента
  // неверные данные
  assert.equal((await favReq(A, ['../x'])).status, 400);
  assert.equal((await favReq(A, 'p1')).status, 400);
  assert.equal((await call('PUT', '/api/fav', { init: A.init(), body: { ids: Array.from({ length: 101 }, (_, i) => 'p' + i) } })).status, 400);
  assert.equal((await call('PUT', '/api/fav', { body: { ids: [] } })).status, 401);
  assert.deepEqual((await meOf(A)).fav, ['p2', 'p1']);            // после отказов список не пострадал
  // удалённый из каталога товар уходит из избранного при следующем сохранении
  const prod = SAMPLE_PROD(); prod.items = prod.items.filter(x => x.id !== 'p2');
  assert.equal((await putProd(prod)).status, 200);
  r = await favReq(A, ['p2', 'p1']);
  assert.deepEqual((await jsonOf(r)).fav, ['p1']);
  // пустой список очищает
  assert.deepEqual((await jsonOf(await favReq(A, []))).fav, []);
  assert.deepEqual((await meOf(A)).fav, []);
  // 100 штук — можно
  const big = SAMPLE_PROD();
  for (let i = 0; i < 100; i++) big.items.push({ id: 'f' + i, cat: 'oil', name: 'Т' + i, uz: '', desc: '', descUz: '', amount: 1, unit: 'kg', price: 1000, on: true });
  assert.equal((await putProd(big)).status, 200);
  assert.equal((await jsonOf(await favReq(A, big.items.slice(4).map(x => x.id)))).fav.length, 100);
});

await t('Excel-прайс доступен только продавцу', async () => {
  await stockWorld();
  const A = newUser();
  assert.equal((await importReq(FIX('price-openpyxl.xlsx'), false, A.init())).status, 403);
  assert.equal((await call('POST', '/api/admin/import', { body: FIX('price-openpyxl.xlsx') })).status, 401);
  assert.equal((await exportReq('catalog', {}, A.init())).status, 403);
  const before = JSON.stringify(await catalogNow());
  assert.equal((await importReq(FIX('price-openpyxl.xlsx'), true, A.init())).status, 403);
  assert.equal(JSON.stringify(await catalogNow()), before);
});

for (const fx of ['price-openpyxl.xlsx', 'price-libreoffice.xlsx']) {
  await t('прайс из Excel (' + fx + '): сначала показывает изменения, ничего не удаляет, фото и остатки на месте', async () => {
    await stockWorld();
    const photo = jpegBytes(800, 600, 5000);
    assert.equal((await putPhoto('p1', photo)).status, 200);
    assert.equal((await stockOp({ id: 'p1', op: 'set', n: 20, low: 3 })).status, 200);
    const before = JSON.stringify(await catalogNow());
    // просмотр: каталог не меняется
    let r = await importReq(FIX(fx), false);
    let d = await jsonOf(r);
    assert.equal(r.status, 200, JSON.stringify(d));
    assert.equal(d.applied, false);
    assert.deepEqual(d.summary, { added: 2, updated: 3, same: 1, errors: 4, newCats: ['Мука'] });
    assert.equal(JSON.stringify(await catalogNow()), before);
    // что именно изменится
    const upd = id => d.changes.find(c => c.id === id);
    const f = (c, k) => c.fields.find(x => x.k === k);
    assert.deepEqual([f(upd('p1'), 'price').from, f(upd('p1'), 'price').to], [82000, 85000]);   // «85 000» с пробелом прочитан как число
    assert.equal(f(upd('p1'), 'tag').to, 'sale');
    assert.equal(f(upd('p1'), 'old').to, 95000);
    assert.equal(f(upd('p2'), 'price').to, 430000);                 // «рис» найден по названию без учёта регистра
    assert.equal(upd('p2').name, 'Рис');
    assert.equal(f(upd('p3'), 'on').to, true);                      // «Сахар» возвращён в продажу
    assert.equal(f(upd('p3'), 'price').to, 530000);
    assert.equal(d.changes.filter(c => c.kind === 'add').length, 2);
    // ошибки по строкам, остальные строки не пострадали
    const msgs = d.errors.map(e => e.msg).join(' | ');
    assert.ok(msgs.includes('цена должна быть числом') && msgs.includes('нет названия') && msgs.includes('неизвестная единица') && msgs.includes('уже был выше'), msgs);
    assert.ok(d.errors.every(e => e.row >= 4), 'номера строк считаются по листу');
    // применение
    r = await importReq(FIX(fx), true);
    d = await jsonOf(r);
    assert.equal(r.status, 200);
    assert.equal(d.applied, true);
    const prod = await catalogNow();
    assert.equal(prod.items.length, 6);                              // 4 прежних + 2 новых, ничего не удалено
    const it = id => prod.items.find(x => x.id === id);
    assert.deepEqual([it('p1').price, it('p1').tag, it('p1').old], [85000, 'sale', 95000]);
    assert.equal(it('p2').price, 430000);
    assert.deepEqual([it('p3').on, it('p3').tag, it('p3').price], [true, 'new', 530000]);
    assert.equal(it('p4').price, 7500);                              // в файле такая же цена, а вторая строка «Макароны» отклонена
    assert.equal(it('p1').pv, (await jsonOf(await call('GET', '/api/config'))).prod.items[0].pv);
    const mouka = prod.items.find(x => x.name === 'Мука высшего сорта');
    assert.deepEqual([mouka.price, mouka.amount, mouka.unit, mouka.tag, mouka.on], [300000, 50, 'kg', 'new', true]);
    assert.ok(/^[A-Za-z0-9_-]{1,24}$/.test(mouka.id));
    assert.equal(prod.cats.find(c => c.id === mouka.cat).name, 'Мука');
    const odd = prod.items.find(x => x.name === 'Крупа <b>тест</b> & Ко');
    assert.deepEqual([odd.price, odd.on, odd.tag, odd.old, odd.unit], [1201, false, 'sale', 1501, 'pc']);   // «1 200,5» с запятой округлено
    assert.equal(prod.cats.length, 3);
    // фото и остаток те же
    assert.equal(it('p1').pv.length > 0, true);
    const img = await call('GET', '/img/p1');
    assert.deepEqual(Buffer.from(await img.arrayBuffer()), Buffer.from(photo));
    assert.deepEqual(await getStock(), { p1: { q: 20, r: 0, low: 3 } });
    // повтор того же файла ничего не меняет
    d = await jsonOf(await importReq(FIX(fx), true));
    assert.equal(d.applied, false);
    assert.deepEqual([d.summary.added, d.summary.updated], [0, 0]);
    // клиент заказывает по новой цене
    const o = await place(newUser(), [{ id: 'p1', qty: 2 }], { expectTotal: 170000 });
    assert.equal(o.status, 200);
  });
}

await t('прайс из Excel: каталог можно выгрузить, поправить и загрузить обратно; без правок изменений нет', async () => {
  await stockWorld();
  assert.equal((await putCfg(sh => { sh.name = 'База'; })).status, 200);
  tgLog = [];
  assert.equal((await exportReq('catalog')).status, 200);
  const doc = lastDoc();
  dumpFile(doc.file);
  assert.ok(/^catalog-\d{4}-\d{2}-\d{2}\.xlsx$/.test(doc.file.name));
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Каталог', 'Как заполнять']);
  assert.deepEqual(x['Каталог'][0].slice(0, 3), ['Код', 'Категория', 'Название']);
  const row = x['Каталог'].find(r => r[0] === 'p1');
  assert.deepEqual([row[1], row[2], row[6], row[7], row[8], row[9]], ['Масла', 'Масло подсолнечное', 5, 'л', 82000, 'да']);
  assert.equal(x['Каталог'].find(r => r[0] === 'p3')[9], 'нет');
  assert.equal(x['Каталог'].length, 5);
  // выгруженный файл читается обратно: все 4 товара «без изменений»
  const d = await jsonOf(await importReq(doc.file.bytes, true));
  assert.equal(d.applied, false);
  assert.deepEqual(d.summary, { added: 0, updated: 0, same: 4, errors: 0, newCats: [] });
});

await t('прайс из Excel: плохие файлы отклоняются понятной причиной, каталог цел', async () => {
  await stockWorld();
  const before = JSON.stringify(await catalogNow());
  const why = async (bytes, status) => { const r = await importReq(bytes, true); assert.equal(r.status, status || 400); const d = await jsonOf(r); assert.equal(d.error, 'bad_file'); return d.why; };
  assert.equal(await why(new Uint8Array([1, 2, 3])), 'not_xlsx');
  assert.equal(await why(new TextEncoder().encode('Название;Цена\nРис;1000\n'.repeat(20))), 'not_xlsx');   // CSV
  assert.equal(await why(new Uint8Array(0)), 'not_xlsx');
  assert.equal(await why(new Uint8Array(1100000).fill(0x50), 413), 'too_big');
  // zip без книги Excel: резервная копия
  tgLog = [];
  await exportReq('backup');
  assert.equal(await why(lastDoc().file.bytes), 'not_xlsx');
  // настоящая книга, но без колонок «Название» и «Цена»
  tgLog = [];
  await exportReq('orders');
  assert.equal(await why(lastDoc().file.bytes), 'no_header');
  // «архив-бомба»: честно заявлен большой размер, и вранье о малом размере
  const mk = (name, raw, declared) => {
    const nm = Buffer.from(name), data = zlib.deflateRawSync(raw);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(declared, 22); lh.writeUInt16LE(nm.length, 26);
    const cd = Buffer.alloc(46); cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(8, 10); cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(declared, 24); cd.writeUInt16LE(nm.length, 28);
    const body = Buffer.concat([lh, nm, data]);
    const eo = Buffer.alloc(22); eo.writeUInt32LE(0x06054b50, 0); eo.writeUInt16LE(1, 8); eo.writeUInt16LE(1, 10); eo.writeUInt32LE(46 + nm.length, 12); eo.writeUInt32LE(body.length, 16);
    return new Uint8Array(Buffer.concat([body, cd, nm, eo]));
  };
  const big = Buffer.alloc(30000000, 0x20);
  assert.equal(await why(mk('xl/workbook.xml', big, big.length)), 'too_big');
  assert.equal(await why(mk('xl/workbook.xml', big, 100)), 'too_big');
  assert.equal(JSON.stringify(await catalogNow()), before);
});

await t('прайс из Excel: больше 300 товаров и 40 категорий не помещаются, остальное добавляется', async () => {
  await stockWorld();
  let d = await jsonOf(await importReq(FIX('price-many.xlsx'), true));
  assert.equal(d.applied, true);
  assert.equal((await catalogNow()).items.length, 300);
  assert.deepEqual([d.summary.added, d.summary.errors], [296, 14]);
  assert.ok(d.errors.every(e => e.msg.includes('уже 300 товаров')));
  await stockWorld();
  d = await jsonOf(await importReq(FIX('price-cats.xlsx'), true));
  const prod = await catalogNow();
  assert.equal(prod.cats.length, 40);
  assert.deepEqual([d.summary.added, d.summary.errors], [38, 12]);
  assert.ok(d.errors.every(e => e.msg.includes('40 категорий')));
  assert.equal(prod.items.length, 4 + 38);
});

/* ============ пакет 4: цены от количества, скидка от суммы, упаковки, отчёты ============ */
const finish = async id => { for (const to of ['accepted', 'ready', 'done']) assert.equal((await setStatus(id, to)).status, 200); };
const priceCart = (cart, prod) => cart.reduce((s, c) => { const p = prod.items.find(x => x.id === c.id); return s + S.unitPrice(p, c.qty) * c.qty; }, 0);
const placeP = async (c, cart, over, mode) => {
  const prod = await getProd(), cfg = await getCfg();
  const sub = priceCart(cart, prod), d = S.orderDiscount(cfg, sub), fee = S.deliveryFee(cfg, mode || 'pickup', sub);
  return place(c, cart, Object.assign({ expectTotal: sub - d.amount + fee }, over || {}), mode);
};
const named = (name, mode) => ({ form: formFor(S.DEFAULT, mode || 'pickup', { name }) });
const putCfgFull = async mut => { const c = await getCfg(); mut(c.shop); return call('PUT', '/api/admin/config', { init: iS(), body: { cfg: c } }); };

await t('цены от количества: ступени чистятся, цену считает сервер, на все штуки товара', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD();
  Object.assign(prod.items[3], { tiers: [{ n: 50, price: 6500 }, { n: 10, price: 7000 }, { n: 10, price: 6900 }, { n: 1, price: 100 }, { n: 600, price: 10 }, { n: 20, price: 8000 }, { n: 30, price: 6800 }] });
  assert.equal((await putProd(prod)).status, 200);
  // отсортированы, повтор «от 10», ступень «от 1» и «от 600», цена выше обычной и выше предыдущей ступени отброшены
  assert.deepEqual((await pubItem('p4')).tiers, [{ n: 10, price: 7000 }, { n: 30, price: 6800 }, { n: 50, price: 6500 }]);
  assert.deepEqual((await pubItem('p1')).tiers, []);
  // не больше трёх
  prod.items[3].tiers = [{ n: 2, price: 7400 }, { n: 3, price: 7300 }, { n: 4, price: 7200 }, { n: 5, price: 7100 }];
  await putProd(prod);
  assert.equal((await pubItem('p4')).tiers.length, 3);
  // мусор
  prod.items[3].tiers = 'x'; await putProd(prod);
  assert.deepEqual((await pubItem('p4')).tiers, []);
  prod.items[3].tiers = [null, 5, { n: 'a', price: 'b' }, { n: 10, price: -1 }]; await putProd(prod);
  assert.deepEqual((await pubItem('p4')).tiers, []);
  // цена базовая упала: ступень, которая стала дороже, отбрасывается
  prod.items[3].tiers = [{ n: 10, price: 7000 }, { n: 50, price: 6500 }]; prod.items[3].price = 6800; await putProd(prod);
  assert.deepEqual((await pubItem('p4')).tiers, [{ n: 50, price: 6500 }]);
  prod.items[3].price = 7500; prod.items[3].tiers = [{ n: 10, price: 7000 }, { n: 50, price: 6500 }]; await putProd(prod);

  const A = newUser();
  for (const [qty, unit] of [[1, 7500], [9, 7500], [10, 7000], [49, 7000], [50, 6500], [500, 6500]]) {
    const r = await placeP(A, [{ id: 'p4', qty }]);
    assert.equal(r.status, 200, qty + ' ' + JSON.stringify(await r.clone().json()));
    const o = (await jsonOf(r)).order;
    assert.equal(o.items[0].price, unit, 'цена за штуку при ' + qty);
    assert.equal(o.total, unit * qty);
    await setStatus(o.id, 'cancelled');
  }
  // клиент, считавший по старой цене, получает price_changed со свежим каталогом
  let r = await place(A, [{ id: 'p4', qty: 10 }], { expectTotal: 75000 });
  assert.equal(r.status, 409);
  let d = await jsonOf(r);
  assert.equal(d.error, 'price_changed');
  assert.deepEqual(d.prod.items.find(x => x.id === 'p4').tiers, [{ n: 10, price: 7000 }, { n: 50, price: 6500 }]);
  // ступень считается по каждому товару отдельно: 9 макарон по обычной цене даже при дорогом масле
  r = await placeP(A, [{ id: 'p1', qty: 20 }, { id: 'p4', qty: 9 }]);
  assert.equal((await jsonOf(r)).order.total, 82000 * 20 + 7500 * 9);
  // у ступени своя цена: заказ хранит её, а смена каталога старый заказ не трогает
  r = await placeP(A, [{ id: 'p4', qty: 10 }]);
  const o = (await jsonOf(r)).order;
  prod.items[3].tiers = []; await putProd(prod);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).total, 70000);
  // общие функции: следующая ступень
  assert.deepEqual(S.nextTier({ price: 100, tiers: [{ n: 10, price: 90 }, { n: 50, price: 80 }] }, 5), { n: 10, price: 90, left: 5 });
  assert.equal(S.nextTier({ price: 100, tiers: [{ n: 10, price: 90 }] }, 10), null);
});

await t('скидка от суммы заказа: ступени чистятся, считается от суммы товаров, на минимум и доставку не влияет', async () => {
  await stockWorld();
  assert.deepEqual((await getCfg()).shop.discounts, []);
  const set = async list => { assert.equal((await putCfgFull(sh => { sh.discounts = list; })).status, 200); return (await getCfg()).shop.discounts; };
  assert.deepEqual(await set([{ from: 3000000, pct: 5 }, { from: 1000000, pct: 3 }, { from: 2000000, pct: 3 }, { from: 0, pct: 9 }, { from: 5000000, pct: 4 }, { from: 9000000, pct: 7 }]),
    [{ from: 1000000, pct: 3 }, { from: 3000000, pct: 5 }, { from: 9000000, pct: 7 }]);   // «от 2 млн — 3 %» не выше предыдущей, «от 5 млн — 4 %» ниже, «от 0» не ступень; больше трёх нет
  assert.deepEqual(await set([{ from: 1000, pct: 99 }, { from: 'x', pct: 5 }, null, { from: 5000, pct: 0 }, { from: 700.4, pct: 2.6 }]), [{ from: 700, pct: 3 }, { from: 1000, pct: 50 }]);
  assert.deepEqual(await set('мусор'), []);
  await set([{ from: 1000000, pct: 3 }, { from: 3000000, pct: 5 }]);

  const A = newUser();
  // ниже первой ступени: скидки нет, лишних полей в заказе нет
  let r = await placeP(newUser(), [{ id: 'p2', qty: 2 }]);                       // 820 000
  let o = (await jsonOf(r)).order;
  assert.equal(o.total, 820000);
  assert.equal(o.disc, undefined); assert.equal(o.dpct, undefined); assert.equal(o.sub, undefined);
  // 1 394 000: скидка 3 %
  r = await placeP(newUser(), CART);
  assert.equal(r.status, 200);
  o = (await jsonOf(r)).order;
  assert.deepEqual([o.sub, o.dpct, o.disc, o.total], [1394000, 3, 41820, 1394000 - 41820]);
  assert.equal(o.fee, undefined);
  // клиент не угадал: ждёт сумму без скидки
  r = await place(newUser(), CART, { expectTotal: 1394000 });
  assert.equal(r.status, 409);
  const pc = await jsonOf(r);
  assert.equal(pc.error, 'price_changed');
  assert.deepEqual(pc.cfg.shop.discounts, [{ from: 1000000, pct: 3 }, { from: 3000000, pct: 5 }]);
  // ровно на пороге скидка есть: 1 000 000 = 2 × 410 000 + 180 000 → берём 4 × 250 000
  const prod = SAMPLE_PROD(); prod.items[0].price = 250000; assert.equal((await putProd(prod)).status, 200);
  o = (await jsonOf(await placeP(newUser(), [{ id: 'p1', qty: 4 }]))).order;
  assert.deepEqual([o.sub, o.dpct, o.disc, o.total], [1000000, 3, 30000, 970000]);
  o = (await jsonOf(await placeP(newUser(), [{ id: 'p1', qty: 3 }, { id: 'p4', qty: 33 }]))).order;       // 750 000 + 247 500 = 997 500
  assert.equal(o.disc, undefined);
  // вторая ступень
  o = (await jsonOf(await placeP(newUser(), [{ id: 'p1', qty: 12 }]))).order;                              // 3 000 000
  assert.deepEqual([o.dpct, o.disc, o.total], [5, 150000, 2850000]);
  // округление до сума
  prod.items[3].price = 7777; await putProd(prod);
  o = (await jsonOf(await placeP(newUser(), [{ id: 'p4', qty: 129 }]))).order;                             // 1 003 233 → 3 % = 30 096,99
  assert.deepEqual([o.sub, o.disc, o.total], [1003233, 30097, 973136]);

  // минимальная сумма и бесплатная доставка считаются по сумме ДО скидки
  prod.items[3].price = 7500; await putProd(prod);
  await putCfgFull(sh => { sh.minOrder = 1000000; sh.deliveryFee = 30000; sh.freeDeliveryFrom = 1000000; });
  r = await placeP(newUser(), [{ id: 'p1', qty: 4 }], null, 'delivery');                                   // 1 000 000: минимум пройден, доставка бесплатна, скидка 3 %
  assert.equal(r.status, 200, JSON.stringify(await r.clone().json()));
  o = (await jsonOf(r)).order;
  assert.deepEqual([o.sub, o.disc, o.fee, o.total], [1000000, 30000, undefined, 970000]);
  r = await placeP(newUser(), [{ id: 'p1', qty: 3 }], null, 'delivery');                                   // 750 000 < минимума
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'min_order');
  // доставка платная, скидка есть: итог = товары − скидка + доставка
  await putCfgFull(sh => { sh.minOrder = 0; sh.freeDeliveryFrom = 0; });
  o = (await jsonOf(await placeP(newUser(), [{ id: 'p1', qty: 4 }], null, 'delivery'))).order;
  assert.deepEqual([o.sub, o.disc, o.fee, o.total], [1000000, 30000, 30000, 1000000]);

  // продавцу и клиенту приходит строка про скидку
  const txt = tgAll('sendMessage', p => String(p.text).includes('Скидка 5%')).map(x => norm(x.payload.text));
  assert.ok(txt.some(x => x.includes('Скидка 5%: −150 000 сум') && x.includes('Итого: 2 850 000 сум')), txt.join('|'));
  // общие функции
  assert.deepEqual(S.nextDiscount({ shop: { discounts: [{ from: 1000, pct: 3 }, { from: 5000, pct: 5 }] } }, 1500), { from: 5000, pct: 5, left: 3500 });
  assert.equal(S.nextDiscount({ shop: { discounts: [{ from: 1000, pct: 3 }] } }, 1500), null);
});

await t('скидка: выданный заказ учитывается в клиенте и статистике по сумме со скидкой; в Excel и сборочном листе есть скидка', async () => {
  await stockWorld();
  await putCfgFull(sh => { sh.discounts = [{ from: 1000000, pct: 5 }]; });
  const A = newUser();
  assert.equal((await putProfile(A, { name: 'Анвар', phone: '+998 90 111 22 33' })).status, 200);
  const o = (await jsonOf(await placeP(A, CART))).order;                 // 1 394 000, скидка 69 700
  assert.deepEqual([o.disc, o.total], [69700, 1324300]);
  await finish(o.id);
  const cl = (await adminClients()).find(c => c.name === 'Анвар');
  assert.deepEqual([cl.ds, cl.sum], [1, 1324300]);
  const st = (await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).stats;
  assert.deepEqual([st.doneCount, st.doneSum], [1, 1324300]);
  // Excel
  assert.equal((await exportReq('orders')).status, 200);
  const x = readXlsx(lastDoc().file.bytes)['Заказы'];
  const col = n => x[0].indexOf(n), row = x.find(r => r[0] === o.id);
  assert.deepEqual([row[col('Товары, сум')], row[col('Скидка, сум')], row[col('Доставка, сум')], row[col('Итого, сум')]], [1394000, 69700, 0, 1324300]);
  // сборочный лист
  const pk = await jsonOf(await call('POST', '/api/admin/pick', { init: iS(), body: { ids: [o.id] } }));
  assert.ok(pk.html.includes('Скидка 5%') && pk.html.includes('−69') && pk.html.includes('1' + String.fromCharCode(160) + '324' + String.fromCharCode(160) + '300') || norm(pk.html).includes('1 324 300'), 'в листе есть скидка и итог');
  // у клиента в «моих заказах» тоже есть скидка и сумма
  const mine = (await meOf(A));
  assert.ok(mine);
  const my = (await jsonOf(await call('GET', '/api/my-orders', { init: A.init() }))).orders.find(z => z.id === o.id);
  assert.deepEqual([my.sub, my.disc, my.dpct, my.total], [1394000, 69700, 5, 1324300]);
});

await t('блоки и коробки: размеры чистятся, попадают в заказ, сборочный лист и текст пишут «2 кор. × 12 шт»', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD();
  Object.assign(prod.items[3], { box: 48, blk: 12 });
  Object.assign(prod.items[0], { box: 1, blk: 'x' });
  Object.assign(prod.items[1], { box: 501, blk: 500.4 });
  assert.equal((await putProd(prod)).status, 200);
  let pr = await getProd();
  assert.deepEqual([pr.items[3].box, pr.items[3].blk], [48, 12]);
  assert.deepEqual([pr.items[0].box, pr.items[0].blk], [0, 0]);          // 1 и мусор — упаковки нет
  assert.deepEqual([pr.items[1].box, pr.items[1].blk], [0, 500]);        // больше 500 не бывает, а 500,4 → 500
  const A = newUser();
  const o = (await jsonOf(await placeP(A, [{ id: 'p4', qty: 100 }, { id: 'p1', qty: 2 }]))).order;
  assert.deepEqual([o.items[0].box, o.items[0].blk], [48, 12]);
  assert.equal(o.items[1].box, undefined);
  assert.equal(S.packText(o.items[0], 100), '2 кор. + 4 шт');
  assert.equal(S.packText(o.items[0], 96), '2 кор. × 48 шт');
  assert.equal(S.packText(o.items[0], 60), '1 кор. + 1 бл.');
  assert.equal(S.packText(o.items[0], 24), '2 бл. × 12 шт');
  assert.equal(S.packText(o.items[0], 5), '');
  assert.equal(S.packText(o.items[1], 2), '');
  // сообщение продавцу
  const msg = tgAll('sendMessage', p => String(p.text).includes(o.id)).map(x => x.payload.text).join('\n');
  assert.ok(msg.includes('× 100 (2 кор. + 4 шт)'), msg);
  assert.ok(msg.includes('Масло подсолнечное (5 л) × 2 = '), 'у товара без упаковок скобок нет');
  // сборочный лист: в сводке и в заказе
  const o2 = (await jsonOf(await placeP(newUser(), [{ id: 'p4', qty: 48 }]))).order;
  const pk = await jsonOf(await call('POST', '/api/admin/pick', { init: iS(), body: { ids: [o.id, o2.id] } }));
  assert.ok(pk.html.includes('<small>2 кор. + 4 шт</small>'), 'в заказе');
  assert.ok(pk.html.includes('<small>3 кор. + 4 шт</small>'), 'в общей сводке 148 шт = 3 коробки и 4 штуки');
  // Excel: столбец «В упаковках»
  await exportReq('orders');
  const it = readXlsx(lastDoc().file.bytes)['Товары в заказах'];
  assert.equal(it.find(r => r[0] === o.id && r[4] === 'Макароны')[7], '2 кор. + 4 шт');
  // старый заказ хранит размер упаковки на момент заказа
  Object.assign(prod.items[3], { box: 24 }); await putProd(prod);
  assert.equal((await adminOrdersOf()).find(z => z.id === o.id).items[0].box, 48);
});

await t('приход в коробках и блоках: на склад идут штуки, журнал в штуках, без упаковки отказ', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD(); Object.assign(prod.items[3], { box: 48, blk: 12 });
  await putProd(prod);
  let r = await stockOp({ id: 'p4', op: 'set', n: 2, u: 'box', low: 24 });                // начали учёт: 2 коробки = 96 шт
  assert.equal(r.status, 200);
  assert.deepEqual((await getStock()).p4, { q: 96, r: 0, low: 24 });
  r = await stockOp({ id: 'p4', op: 'in', n: 3, u: 'blk' });                             // + 3 блока = 36 шт
  assert.equal((await getStock()).p4.q, 132);
  r = await stockOp({ id: 'p4', op: 'in', n: 1, u: 'box' });
  assert.equal((await getStock()).p4.q, 180);
  r = await stockOp({ id: 'p4', op: 'in', n: 5, u: 'pc' });                              // штуки как раньше
  assert.equal((await getStock()).p4.q, 185);
  r = await stockOp({ id: 'p4', op: 'in', n: 5 });
  assert.equal((await getStock()).p4.q, 190);
  r = await stockOp({ id: 'p4', op: 'set', n: 0, u: 'box' });                            // «задать остаток» 0 коробок = 0 штук
  assert.equal((await getStock()).p4.q, 0);
  const jr = await getJr();
  assert.deepEqual(jr.slice(0, 6).map(x => x.d).reverse(), [96, 36, 48, 5, 5, -190]);        // журнал в штуках: что пришло, что исправлено
  // отказы
  for (const bad of [{ u: 'box', id: 'p2' }, { u: 'carton' }, { u: 'box', n: -1 }, { u: 'box', n: 1.5 }, { u: 'box', n: '2' }, { u: 'box', n: 100000000 }]) {
    r = await stockOp(Object.assign({ id: 'p4', op: 'in', n: 2 }, bad));
    assert.equal(r.status, 400, JSON.stringify(bad));
  }
  assert.equal((await jsonOf(await stockOp({ id: 'p2', op: 'in', n: 2, u: 'box' }))).error, 'no_pack');
  assert.equal((await getStock()).p4.q, 0);
  // порог в штуках, упаковки на него не действуют
  assert.equal((await stockOp({ id: 'p4', op: 'low', n: 12 })).status, 200);
});

await t('отчёты: продажи копятся по дням, считаются суммы, товары, клиенты; доступ только продавцу', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD(); await putProd(prod);
  const A = newUser(), B = newUser();
  await putProfile(A, { name: 'Анвар', phone: '+998 90 111 22 33', org: 'Кафе «Чинор»' });
  await putProfile(B, { name: 'Бобур', phone: '+998 91 111 22 33' });
  const rep = async (days, init) => call('GET', '/api/admin/report' + (days ? '?days=' + days : ''), { init: init || iS() });
  assert.equal((await rep(30, A.init())).status, 403);
  assert.equal((await call('GET', '/api/admin/report')).status, 401);
  let d = (await jsonOf(await rep())).report;
  assert.deepEqual([d.days, d.series.length, d.tot.n, d.tot.sum, d.prev, d.prods.length, d.cl.length], [30, 30, 0, 0, null, 0, 0]);
  const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  assert.equal(d.to, today);
  assert.equal(d.since, today);
  assert.equal(d.series.at(-1).d, today);
  const o1 = (await jsonOf(await placeP(A, [{ id: 'p1', qty: 2 }, { id: 'p4', qty: 10 }], named('Анвар')))).order;      // 164 000 + 75 000
  const o2 = (await jsonOf(await placeP(A, [{ id: 'p2', qty: 1 }], named('Анвар')))).order;                             // 410 000
  const o3 = (await jsonOf(await placeP(B, [{ id: 'p4', qty: 4 }], named('Бобур')))).order;                             // 30 000
  const o4 = (await jsonOf(await placeP(B, [{ id: 'p1', qty: 1 }], named('Бобур')))).order;                             // отменён: в отчёт не входит
  await setStatus(o4.id, 'cancelled');
  // пока ничего не выдано — в отчёте пусто
  assert.equal((await jsonOf(await rep())).report.tot.n, 0);
  for (const o of [o1, o2, o3]) await finish(o.id);
  d = (await jsonOf(await rep(7))).report;
  assert.deepEqual([d.days, d.series.length, d.tot.n, d.tot.sum, d.tot.avg], [7, 7, 3, 239000 + 410000 + 30000, Math.round(679000 / 3)]);
  assert.deepEqual(d.series.at(-1), { d: today, n: 3, sum: 679000 });
  assert.equal(d.series.slice(0, -1).every(x => x.n === 0 && x.sum === 0), true);
  assert.deepEqual(d.months, [{ m: today.slice(0, 7), n: 3, sum: 679000 }]);
  assert.deepEqual(d.prods.map(x => [x.id, x.qty, x.sum]), [['p2', 1, 410000], ['p1', 2, 164000], ['p4', 14, 105000]]);
  assert.deepEqual(d.prods[0].name, 'Рис');
  assert.equal(d.prods[0].w, '25 кг');
  assert.deepEqual(d.cl.map(x => [x.name, x.org, x.n, x.sum]), [['Анвар', 'Кафе «Чинор»', 2, 649000], ['Бобур', '', 1, 30000]]);
  assert.equal(d.thin, true);
  // недопустимые периоды заменяются на 30 дней
  for (const q of ['5', '0', 'abc', '-7', '9999']) assert.equal((await jsonOf(await rep(q))).report.days, 30);
  assert.equal((await jsonOf(await rep(365))).report.series.length, 365);
  // заказ, который уже выдан, второй раз не считается (повтор статуса)
  assert.equal((await setStatus(o1.id, 'done')).status, 200);
  assert.equal((await jsonOf(await rep(7))).report.tot.n, 3);
  // отменённый после выдачи нельзя: переход запрещён, отчёт не меняется
  assert.equal((await setStatus(o1.id, 'cancelled')).status, 409);
  assert.equal((await jsonOf(await rep(7))).report.tot.sum, 679000);
});

await t('отчёты: скидка и доставка попадают в итоги; сумма товара считается по цене ступени', async () => {
  await stockWorld();
  await putCfgFull(sh => { sh.discounts = [{ from: 1000000, pct: 10 }]; sh.deliveryFee = 30000; });
  const prod = SAMPLE_PROD(); prod.items[3].tiers = [{ n: 10, price: 7000 }]; await putProd(prod);
  const A = newUser();
  const o1 = (await jsonOf(await placeP(A, [{ id: 'p2', qty: 3 }], null, 'delivery'))).order;     // 1 230 000, скидка 123 000, доставка 30 000
  const o2 = (await jsonOf(await placeP(A, [{ id: 'p4', qty: 10 }]))).order;                      // 70 000 по ступени
  await finish(o1.id); await finish(o2.id);
  const d = (await jsonOf(await call('GET', '/api/admin/report?days=7', { init: iS() }))).report;
  assert.deepEqual([d.tot.n, d.tot.disc, d.tot.fee, d.tot.sum], [2, 123000, 30000, (1230000 - 123000 + 30000) + 70000]);
  assert.deepEqual(d.prods.map(x => [x.id, x.qty, x.sum]), [['p2', 3, 1230000], ['p4', 10, 70000]]);
});

await t('отчёты: при первом обращении данные берутся из уже завершённых заказов, второй раз не удваиваются', async () => {
  await stockWorld();
  const A = newUser();
  // «старые» заказы: до обновления отчётов их выдача нигде не записывалась. Ставим их напрямую в хранилище.
  const day = n => new Date(Date.now() - n * 86400000).toISOString();                       // настоящая метка времени
  const tday = n => new Date(Date.now() + 5 * 3600000 - n * 86400000).toISOString().slice(0, 10); // дата по Ташкенту
  const mk = (id, ago, total, qty, st) => ({ id, createdAt: day(ago), status: st || 'done', statusAt: day(ago), name: 'Старый клиент', phone: '+998 90 000 00 00', mode: 'pickup', pickupAt: '2026-01-01T10:00', comment: '', uid: 777, items: [{ id: 'p4', name: 'Макароны', amount: 400, unit: 'g', price: 7500, qty }], total, msgs: [] });
  const olds = [mk('Z-OLD01', 12, 75000, 10), mk('Z-OLD02', 3, 30000, 4), mk('Z-OLD03', 3, 45000, 6), mk('Z-OLD04', 2, 7500, 1, 'cancelled')];
  const st = W.storage;
  for (const o of olds) await st.put('o:' + o.id, o);
  await st.put('hist', olds.map(o => o.id));
  assert.equal(await st.get('rpx'), undefined);
  let d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual([d.tot.n, d.tot.sum], [3, 150000]);
  assert.equal(d.since, tday(12));
  assert.equal(d.thin, false);
  assert.deepEqual(d.series.filter(x => x.n).map(x => x.n), [1, 2]);
  assert.deepEqual(d.cl.map(x => [x.name, x.n, x.sum]), [['Старый клиент', 3, 150000]]);
  // повторный запрос и новые выдачи ничего не удваивают
  d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.equal(d.tot.n, 3);
  const o = (await jsonOf(await placeP(A, [{ id: 'p4', qty: 2 }]))).order;
  await finish(o.id);
  d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual([d.tot.n, d.tot.sum], [4, 165000]);
  // прошлый период: учёт идёт не с начала предыдущих 7 дней — сравнивать нечего
  assert.equal((await jsonOf(await call('GET', '/api/admin/report?days=7', { init: iS() }))).report.prev, null);
  // а за 7 дней, когда учёт шёл ещё раньше, сравнение есть
  const r7 = (await jsonOf(await call('GET', '/api/admin/report?days=7', { init: iS() }))).report;
  assert.equal(r7.since, tday(12));
});

await t('отчёты: сравнение с прошлым периодом, когда учёт шёл уже тогда', async () => {
  await stockWorld();
  const st = W.storage, ago = n => new Date(Date.now() + 5 * 3600000 - n * 86400000).toISOString().slice(0, 10);
  await st.put('rpx', [ago(9), ago(2)]);
  await st.put('rp0', ago(40));
  await st.put('rp:' + ago(9), { n: 2, sum: 100000, disc: 0, fee: 0, items: [], cl: [] });
  await st.put('rp:' + ago(2), { n: 3, sum: 300000, disc: 0, fee: 0, items: [], cl: [] });
  const d = (await jsonOf(await call('GET', '/api/admin/report?days=7', { init: iS() }))).report;
  assert.deepEqual([d.tot.n, d.tot.sum, d.prev], [3, 300000, { n: 2, sum: 100000 }]);
  const m = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual([m.tot.n, m.tot.sum, m.prev], [5, 400000, null]);                // учёт идёт 40 дней, а прошлые 30 дней начались 59 дней назад
  await st.put('rp0', ago(70));
  const m2 = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual(m2.prev, { n: 0, sum: 0 });
  assert.equal(m.months.reduce((s, x) => s + x.sum, 0), 400000);
  assert.deepEqual(m.months.map(x => x.m), [...new Set([ago(9).slice(0, 7), ago(2).slice(0, 7)])]);
});

await t('отчёты: «что пора закупать» считает по продажам и остатку, только у товаров с учётом', async () => {
  await stockWorld();
  const st = W.storage, ago = n => new Date(Date.now() + 5 * 3600000 - n * 86400000).toISOString().slice(0, 10);
  // 10 дней учёта: макароны продаются по 5 шт в день, рис по 1 шт в 2 дня, масло без учёта остатка
  await st.put('rp0', ago(9));
  const days = [];
  for (let i = 9; i >= 0; i--) {
    days.push(ago(i));
    await st.put('rp:' + ago(i), { n: 1, sum: 0, disc: 0, fee: 0, items: [{ id: 'p4', name: 'Макароны', qty: 5, sum: 37500 }, { id: 'p1', name: 'Масло', qty: 1, sum: 82000 }].concat(i % 2 ? [{ id: 'p2', name: 'Рис', qty: 1, sum: 410000 }] : []), cl: [] });
  }
  await st.put('rpx', days);
  assert.equal((await setSt('p4', 30, 10)).status, 200);                    // хватит на 6 дней
  assert.equal((await setSt('p2', 100)).status, 200);                       // 0,5 шт в день, хватит на 200 дней — не показываем
  let d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.equal(d.buy.window, 10);
  assert.equal(d.buy.cover, 14);
  assert.deepEqual(d.buy.list, [{ id: 'p4', name: 'Макароны', uz: 'Makaron', w: '400 г', wu: '400 g', avail: 30, daily: 5, left: 6, need: 40 }]);
  // товар без учёта остатка в подсказку не попадает, а у товара с нулевым остатком «хватит на 0 дней»
  assert.equal((await setSt('p1', 0)).status, 200);
  d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual(d.buy.list.map(x => [x.id, x.left, x.need]), [['p1', 0, 14], ['p4', 6, 40]]);
  // свободный остаток: отложенное под заказ вычитается
  const A = newUser();
  const o = await placeP(A, [{ id: 'p4', qty: 10 }]);
  assert.equal(o.status, 200);
  d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual(d.buy.list.find(x => x.id === 'p4'), { id: 'p4', name: 'Макароны', uz: 'Makaron', w: '400 г', wu: '400 g', avail: 20, daily: 5, left: 4, need: 50 });
});

await t('отчёты: старше 400 дней записи удаляются, остальные остаются', async () => {
  await stockWorld();
  const st = W.storage, ago = n => new Date(Date.now() + 5 * 3600000 - n * 86400000).toISOString().slice(0, 10);
  const days = [];
  for (let i = 400; i >= 1; i--) { days.push(ago(i)); await st.put('rp:' + ago(i), { n: 1, sum: 1000, disc: 0, fee: 0, items: [], cl: [] }); }
  await st.put('rpx', days); await st.put('rp0', days[0]);
  assert.equal(days.length, 400);
  const o = (await jsonOf(await placeP(newUser(), [{ id: 'p4', qty: 1 }]))).order;
  await finish(o.id);
  const idx = await st.get('rpx');
  assert.equal(idx.length, 400);
  assert.equal(idx[0], ago(399));
  assert.equal(idx.at(-1), ago(0));
  assert.equal(await st.get('rp:' + ago(400)), undefined, 'самый старый день удалён');
  assert.ok(await st.get('rp:' + ago(399)));
  assert.equal((await st.get('rp:' + ago(0))).n, 1);
  // отчёт за год не падает и не больше 365 строк
  const d = (await jsonOf(await call('GET', '/api/admin/report?days=365', { init: iS() }))).report;
  assert.equal(d.series.length, 365);
});

await t('отчёт в Excel приходит файлом в чат: сводка, дни, месяцы, товары, клиенты, что закупать', async () => {
  await stockWorld();
  const A = newUser();
  await putProfile(A, { name: 'Анвар', phone: '+998 90 111 22 33', org: 'Кафе «Чинор»' });
  const o = (await jsonOf(await placeP(A, [{ id: 'p1', qty: 2 }, { id: 'p4', qty: 10 }], named('Анвар')))).order;
  await finish(o.id);
  assert.equal((await exportReq('report', { days: 7 }, A.init())).status, 403);
  const r = await exportReq('report', { days: 7 });
  assert.equal(r.status, 200);
  const doc = lastDoc();
  dumpFile(doc.file);
  assert.ok(/^report-\d{4}-\d{2}-\d{2}\.xlsx$/.test(doc.file.name));
  assert.ok(doc.payload.caption.includes('Отчёт за 7 дн.'));
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Сводка', 'По дням', 'По месяцам', 'Товары', 'Клиенты', 'Что закупать']);
  assert.equal(x['По дням'].length, 1 + 7 + 1);
  assert.deepEqual(x['По дням'].at(-1), ['Итого', 1, 239000]);
  assert.deepEqual(x['Товары'][1], ['Масло подсолнечное', '5 л', 2, 164000]);
  assert.deepEqual(x['Клиенты'][1], ['Анвар', 'Кафе «Чинор»', 1, 239000]);
  assert.ok(x['Сводка'].flat().some(c => String(c).includes('Заказов: 1.')));
  assert.equal(x['Что закупать'][0][0], 'Товар');
  assert.equal((await exportReq('report', { days: 999 })).status, 200);       // неверный период — 30 дней
  assert.ok(lastDoc().payload.caption.includes('за 30 дн.'));
});

await t('резервная копия содержит продажи по дням; прайс из Excel не стирает ступени, блоки и коробки', async () => {
  await stockWorld();
  const prod = SAMPLE_PROD();
  Object.assign(prod.items[3], { tiers: [{ n: 10, price: 7000 }], box: 48, blk: 12 });
  await putProd(prod);
  const o = (await jsonOf(await placeP(newUser(), [{ id: 'p4', qty: 12 }]))).order;
  await finish(o.id);
  assert.equal((await exportReq('backup')).status, 200);
  const zip = unzip(lastDoc().file.bytes);
  const bk = JSON.parse(Buffer.from(zip['backup.json']).toString('utf8'));
  const days = Object.keys(bk.reports.days);
  assert.equal(days.length, 1);
  assert.equal(bk.reports.days[days[0]].n, 1);
  assert.deepEqual(bk.reports.days[days[0]].items, [{ id: 'p4', name: 'Макароны', qty: 12, sum: 84000, c: 'groats', n: 1 }]);
  assert.equal(bk.reports.days[days[0]].v, 2, 'день начат со счётом заказов по товарам');
  assert.deepEqual(bk.reports.days[days[0]].cn, { groats: 1 }, 'заказ засчитан в категорию «Крупы и макароны»');
  assert.ok(bk.reports.since);
  assert.deepEqual(bk.prod.items[3].tiers, [{ n: 10, price: 7000 }]);
  // загрузка прайса меняет цену, но ступени и упаковки остаются
  assert.equal((await importReq(FIX('price-openpyxl.xlsx'), true)).status, 200);
  const it = (await catalogNow()).items;
  const p4 = it.find(x => x.id === 'p4');
  assert.deepEqual([p4.tiers, p4.box, p4.blk], [[{ n: 10, price: 7000 }], 48, 12]);
  // у вновь добавленных товаров упаковок и ступеней нет
  const added = it.find(x => x.name === 'Мука высшего сорта');
  assert.deepEqual([added.tiers, added.box, added.blk], [[], 0, 0]);
});

await t('без секретов сервер не падает и говорит, что делать', async () => {
  W = makeWorld({ BOT_TOKEN: undefined });
  W.shop.env.BOT_TOKEN = undefined;
  const r = await call('GET', '/api/bootstrap', { init: iA() });
  assert.equal(r.status, 500);
  assert.equal((await jsonOf(r)).error, 'no_token');
  const s = await call('POST', '/setup', { body: 'code=' + CODE, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.ok((await s.text()).includes('BOT_TOKEN'));
  W = makeWorld({ ADMIN_CODE: undefined });
  W.shop.env.ADMIN_CODE = undefined;
  const s2 = await call('POST', '/setup', { body: 'code=x', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.ok((await s2.text()).includes('ADMIN_CODE'));
});

/* ---------- площадка: несколько дистрибьюторов ---------- */
const DIL = { id: 9101, first_name: 'Dilshod', username: 'dil_alfa', language_code: 'ru' };
const JAS2 = { id: 9102, first_name: 'Sardor', username: 'sardor_b', language_code: 'ru' };
const iD = () => initDataFor(DIL);
const sx = sid => ({ 'x-shop': sid });
const REGION_ALL = () => ['kk', 'an', 'bu', 'ji', 'qa', 'nv', 'nm', 'sa', 'su', 'si', 'tv', 'tk', 'fa', 'xo'];
const adminMsg = (from, code, mid) => ({ update_id: 5000 + mid, message: { message_id: mid, from, chat: { id: from.id, type: 'private' }, text: '/admin ' + code } });
async function hubWorld() {
  W = makeWorld();
  await send(adminMsg(SELLER, CODE, 1));
  tgLog = [];
}
const createShop = (body, init) => call('POST', '/api/hub/admin/shops', { init: init || iS(), body });
const addShop = async (name, code) => { const r = await createShop({ name, code }); assert.equal(r.status, 200); return jsonOf(r); };
/* продавец отправляет все свои новые товары на проверку, владелец их одобряет */
async function approveAll(sid, sellerInit) {
  const sub = await call('POST', '/api/admin/submit', { init: sellerInit || iD(), headers: sx(sid), body: {} });
  assert.equal(sub.status, 200, 'отправка на проверку: ' + JSON.stringify(await sub.clone().json()));
  const ls = await jsonOf(await call('GET', '/api/hub/admin/mod?seg=wait', { init: iS() }));
  const ap = await call('POST', '/api/hub/admin/mod/approve', { init: iS(), body: { items: ls.items.filter(i => i.did === sid).map(i => ({ did: sid, id: i.id })) } });
  assert.equal(ap.status, 200);
  return jsonOf(ap);
}
/* дистрибьютор с каталогом и продавцом DIL */
async function shopWorld(name) {
  await hubWorld();
  const d = await addShop(name || 'Альфа Трейд');
  await send(adminMsg(DIL, d.code, 2));
  const put = await call('PUT', '/api/admin/products', { init: iD(), headers: sx(d.shop.id), body: { prod: SAMPLE_PROD() } });
  assert.equal(put.status, 200);
  await approveAll(d.shop.id);   // каталог дистрибьютора уже проверен владельцем: дальше тесты работают как с обычным каталогом
  tgLog = [];
  return { sid: d.shop.id, code: d.code };
}
const callS = (sid, method, p, o) => call(method, p, Object.assign({}, o, { headers: Object.assign({}, sx(sid), (o && o.headers) || {}) }));

await t('площадка: первый дистрибьютор вносится в реестр сам, а прежние продавцы становятся владельцами', async () => {
  W = makeWorld();
  await W.storage.put({ cfg: { shop: { name: 'Старое имя' } }, admins: [SELLER.id], prod: { cats: [{ id: 'c', name: 'Крупы' }], items: [{ id: 'p1', cat: 'c', name: 'Рис', amount: 1, unit: 'kg', price: 100, on: true }] } });
  const d = await jsonOf(await call('GET', '/api/shops', { init: iS() }));
  assert.equal(d.me.owner, true);
  assert.deepEqual(d.me.sells.map(x => ({ id: x.id, name: x.name })), [{ id: 'main', name: 'Старое имя' }]);
  assert.equal(typeof d.me.sells[0].link, 'string');
  assert.deepEqual(d.shops.map(x => x.id), ['main']);
  assert.equal(d.shops[0].name, 'Старое имя');
  assert.equal(d.shops[0].items, 1);
  assert.equal(JSON.stringify(d).includes('hash'), false);
  const a = await jsonOf(await call('GET', '/api/shops', { init: iA() }));
  assert.equal(a.me.owner, false);
  assert.deepEqual(a.me.sells, []);
  const g = await jsonOf(await call('GET', '/api/shops'));
  assert.equal(g.me, undefined);
  assert.ok(g.title);
  assert.equal((await call('GET', '/api/shops', { init: initDataFor(ANNA, { tamper: true }) })).status, 200, 'с неверной подписью это просто список без входа');
  assert.equal((await jsonOf(await call('GET', '/api/shops', { init: initDataFor(ANNA, { tamper: true }) }))).me, undefined);
});

await t('площадка: дистрибьюторов добавляет только владелец; код виден один раз и нигде не хранится открытым', async () => {
  await hubWorld();
  assert.equal((await createShop({ name: 'Альфа' }, iA())).status, 403);
  assert.equal((await call('POST', '/api/hub/admin/shops', { body: { name: 'Альфа' } })).status, 401);
  assert.equal((await createShop({ name: 'Я' })).status, 400);
  assert.equal((await createShop({ name: 'Альфа', code: 'short' })).status, 400);
  assert.equal((await createShop({ name: 'Альфа', code: CODE })).status, 409, 'код владельца занят');
  const r = await createShop({ name: '  Альфа Трейд  ' });
  const d = await jsonOf(r);
  assert.equal(r.status, 200);
  assert.match(d.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.match(d.shop.id, /^s[a-z0-9]{5}$/);
  assert.equal(d.shop.name, 'Альфа Трейд');
  assert.equal(d.shop.sellers, 0);
  assert.equal(d.shop.on, true);
  assert.ok(!JSON.stringify([...W.hubStorage.m.entries()]).includes(d.code), 'код лежит только в виде хэша');
  assert.ok(!JSON.stringify([...W.getShop(d.shop.id).storage.m.entries()]).includes(d.code));
  // свой код владельца
  const own = await jsonOf(await createShop({ name: 'Бета', code: 'моя-длинная-фраза-2026' }));
  assert.equal(own.code, 'моя-длинная-фраза-2026');
  assert.equal((await createShop({ name: 'Гамма', code: 'моя-длинная-фраза-2026' })).status, 409, 'один код у двух дистрибьюторов нельзя');
  const l = await jsonOf(await call('GET', '/api/hub/admin/shops', { init: iS() }));
  assert.deepEqual(l.shops.map(x => x.id), ['main', d.shop.id, own.shop.id]);
  assert.deepEqual(l.shops.map(x => x.own), [false, true, true]);
  assert.ok(l.shops.every(x => !('hash' in x)));
  assert.equal((await call('GET', '/api/hub/admin/shops', { init: iA() })).status, 403);
  // пустой дистрибьютор клиентам не виден
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops', { init: iA() }))).shops, []);
});

await t('площадка: продавец дистрибьютора входит по своему коду и видит только своё', async () => {
  await hubWorld();
  const { shop, code } = await addShop('Альфа Трейд');
  const sid = shop.id;
  await send(adminMsg(DIL, 'wrong-wrong-wrong', 50));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'));
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 403);
  await send(adminMsg(DIL, code, 51));
  assert.ok(lastTg('deleteMessage', p => p.message_id === 51));
  const ok = lastTg('sendMessage').payload;
  assert.ok(ok.text.includes('вы продавец «Альфа Трейд»'));
  assert.ok(!ok.text.includes('владелец площадки'));
  assert.equal(ok.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?d=' + sid + '&v=seller');
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 200);
  assert.equal((await call('GET', '/api/admin/orders', { init: iD() })).status, 403, 'у первого дистрибьютора он никто');
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iS() })).status, 403, 'владелец площадки не продавец чужого дистрибьютора');
  assert.equal((await call('GET', '/api/hub/admin/shops', { init: iD() })).status, 403, 'дистрибьютор не владелец площадки');
  const bs = await jsonOf(await callS(sid, 'GET', '/api/bootstrap', { init: iD() }));
  assert.equal(bs.me.admin, true);
  assert.equal(bs.did, sid);
  assert.equal(bs.cfg.shop.name, 'Альфа Трейд');
  const me = (await jsonOf(await call('GET', '/api/shops', { init: iD() }))).me;
  assert.deepEqual(me.sells.map(x => ({ id: x.id, name: x.name })), [{ id: sid, name: 'Альфа Трейд' }]);
  assert.ok(me.sells[0].link === '' || me.sells[0].link.endsWith('?start=d_' + sid));
  assert.equal(me.owner, false);
  const l = await jsonOf(await call('GET', '/api/hub/admin/shops', { init: iS() }));
  assert.equal(l.shops.find(x => x.id === sid).sellers, 1);
  // владелец при входе узнаёт про вкладку «Дистрибьюторы» и открывает свой кабинет
  await send(adminMsg(SELLER, CODE, 52));
  const ow = lastTg('sendMessage').payload;
  assert.ok(ow.text.includes('вы продавец') && ow.text.includes('Дистрибьюторы'));
  assert.equal(ow.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?d=main&v=seller');
});

await t('площадка: у каждого дистрибьютора свои каталог и фото, список для клиентов собирается сам', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  const mine = (await jsonOf(await callS(sid, 'GET', '/api/config'))).prod;
  assert.equal(mine.items.length, 4);
  assert.deepEqual((await jsonOf(await call('GET', '/api/config'))).prod, { cats: [], items: [] }, 'первый дистрибьютор не затронут');
  const pub = await jsonOf(await call('GET', '/api/shops'));
  assert.deepEqual(pub.shops.map(x => x.id), [sid], 'первый пока без товаров, поэтому не показан');
  assert.equal(pub.shops[0].items, 4);
  assert.deepEqual(pub.shops[0].cats.map(c => c.name), ['Масла', 'Крупы и макароны']);
  assert.equal(pub.shops[0].delivery, true);
  // переименование в настройках сразу видно в списке
  const cfg = (await jsonOf(await callS(sid, 'GET', '/api/config'))).cfg;
  cfg.shop.name = 'Альфа Опт';
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/shops'))).shops[0].name, 'Альфа Опт');
  // фото: свой адрес у каждого дистрибьютора
  assert.equal((await callS(sid, 'PUT', '/api/admin/photo/p1', { init: iD(), body: jpegBytes(), headers: { 'content-type': 'image/jpeg' } })).status, 200);
  assert.equal((await call('GET', '/img/' + sid + '/p1')).status, 200);
  assert.equal((await call('GET', '/img/p1')).status, 404);
  assert.equal((await call('GET', '/img/main/p1')).status, 404);
  assert.equal((await call('GET', '/img/a/b/c')).status, 404);
  // и у первого дистрибьютора старые адреса картинок работают
  assert.equal((await putProd(SAMPLE_PROD(), iA())).status, 403, 'клиент каталог первого дистрибьютора не меняет');
  assert.equal((await putProd(SAMPLE_PROD(), iD())).status, 403, 'продавец другого дистрибьютора тоже');
  assert.equal((await putProd(SAMPLE_PROD())).status, 200, 'владелец (он же продавец первого дистрибьютора) меняет');
  assert.equal((await putPhoto('p1', jpegBytes())).status, 200);
  assert.equal((await call('GET', '/img/p1')).status, 200);
  assert.equal((await call('GET', '/img/main/p1')).status, 200);
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops'))).shops.map(x => x.id), ['main', sid]);
  // каталог одного не видно в избранном и заказе другого: id товаров могут совпадать
  const A = newUser();
  assert.equal((await callS(sid, 'PUT', '/api/fav', { init: A.init(), body: { ids: ['p1'] } })).status, 200);
  assert.deepEqual((await jsonOf(await call('GET', '/api/bootstrap', { init: A.init() }))).me.fav, []);
  assert.deepEqual((await jsonOf(await callS(sid, 'GET', '/api/bootstrap', { init: A.init() }))).me.fav, ['p1']);
});

await t('площадка: заказ уходит продавцу своего дистрибьютора, кнопки несут его номер и работают только у него', async () => {
  const { sid } = await shopWorld();
  await send(adminMsg(SELLER, CODE, 70));
  tgLog = [];
  const A = newUser();
  const r = await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) });
  assert.equal(r.status, 200);
  const order = (await jsonOf(r)).order;
  const card = tgAll('sendMessage', p => p.chat_id === DIL.id).pop().payload;
  const kb = card.reply_markup.inline_keyboard.flat();
  assert.ok(kb.some(b => b.callback_data === 's:' + sid + ':' + order.id + ':accepted'));
  assert.ok(kb.some(b => b.callback_data === 'c:' + sid + ':' + order.id));
  assert.ok(kb.every(b => !b.callback_data || b.callback_data.length <= 64));
  assert.ok(kb.some(b => b.web_app && b.web_app.url === HOST + '/?d=' + sid + '&v=seller'));
  assert.equal(tgAll('sendMessage', p => p.chat_id === SELLER.id).length, 0, 'продавец первого дистрибьютора чужой заказ не получает');
  assert.deepEqual((await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).orders, []);
  assert.equal((await jsonOf(await callS(sid, 'GET', '/api/admin/orders', { init: iD() }))).orders.length, 1);
  // чужой продавец нажать не может, свой может
  tgLog = [];
  await cb(SELLER, 's:' + sid + ':' + order.id + ':accepted', 555);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Нет доступа'));
  assert.equal((await jsonOf(await callS(sid, 'GET', '/api/admin/orders', { init: iD() }))).orders[0].status, 'new');
  tgLog = [];
  await cb(DIL, 's:' + sid + ':' + order.id + ':accepted', 556);
  assert.ok(lastTg('sendMessage', p => p.chat_id === A.u.id && p.text.includes('принят в работу')));
  assert.equal((await jsonOf(await callS(sid, 'GET', '/api/admin/orders', { init: iD() }))).orders[0].status, 'accepted');
  // отмена с подтверждением через кнопки с номером дистрибьютора
  tgLog = [];
  await cb(DIL, 'c:' + sid + ':' + order.id, 557);
  const e = lastTg('editMessageText').payload.reply_markup.inline_keyboard.flat();
  assert.ok(e.some(b => b.callback_data === 's:' + sid + ':' + order.id + ':cancelled'));
  assert.ok(e.some(b => b.callback_data === 'b:' + sid + ':' + order.id));
  // кнопка с неизвестным дистрибьютором молча игнорируется
  tgLog = [];
  await cb(DIL, 's:zzzzzz:' + order.id + ':accepted', 558);
  assert.equal(tgLog.length, 0);
});


await t('площадка: оплата при выдаче и долги работают у любого дистрибьютора, кнопки несут его номер', async () => {
  const { sid } = await shopWorld();
  const A = newUser();
  const order = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) }))).order;
  for (const to of ['accepted', 'ready']) await cb(DIL, 's:' + sid + ':' + order.id + ':' + to, 600);
  tgLog = [];
  await cb(DIL, 's:' + sid + ':' + order.id + ':done', 600);
  const kb = lastTg('editMessageText', p => p.message_id === 600).payload.reply_markup.inline_keyboard.flat();
  for (const m of ['cash', 'card', 'bank', 'credit']) assert.ok(kb.some(b => b.callback_data === 'p:' + sid + ':' + order.id + ':' + m), m);
  assert.ok(kb.every(b => !b.callback_data || b.callback_data.length <= 64));
  assert.ok(kb.some(b => b.web_app && b.web_app.url === HOST + '/?d=' + sid + '&v=seller'), 'частичная оплата открывает панель этого дистрибьютора');
  await cb(DIL, 'p:' + sid + ':' + order.id + ':credit', 600);
  const dk = lastTg('editMessageText', p => p.message_id === 600).payload.reply_markup.inline_keyboard.flat();
  assert.ok(dk.some(b => b.callback_data === 'p:' + sid + ':' + order.id + ':credit:30'));
  assert.ok(dk.every(b => !b.callback_data || b.callback_data.length <= 64));
  // продавец другого дистрибьютора нажать не может
  tgLog = [];
  await cb(SELLER, 'p:' + sid + ':' + order.id + ':credit:7', 601);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Нет доступа'));
  assert.equal((await jsonOf(await callS(sid, 'GET', '/api/admin/orders', { init: iD() }))).orders[0].status, 'ready');
  await cb(DIL, 'p:' + sid + ':' + order.id + ':credit:14', 600);
  const debts = await jsonOf(await callS(sid, 'GET', '/api/admin/debts', { init: iD() }));
  assert.equal(debts.n, 1);
  assert.equal(debts.total, 1394000);
  assert.equal((await jsonOf(await call('GET', '/api/admin/debts', { init: iS() }))).n, 0, 'у первого дистрибьютора долгов нет');
  assert.ok(W.getShop(sid).storage.m.has('lh:' + A.u.id) && !W.storage.m.has('lh:' + A.u.id), 'журнал лежит у своего дистрибьютора');
});
await t('площадка: «Мои заказы» собирает заказы клиента у всех дистрибьюторов; отмена идёт к своему дистрибьютору', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  await send(adminMsg(SELLER, CODE, 70));
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const A = newUser();
  assert.deepEqual((await jsonOf(await call('GET', '/api/hub/orders', { init: A.init() }))).orders, []);
  assert.equal((await call('GET', '/api/hub/orders')).status, 401);
  const o1 = (await jsonOf(await place(A, CART))).order;                                   // у первого дистрибьютора
  await new Promise(r => setTimeout(r, 5));
  const o2 = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) }))).order;   // у Альфы
  const list = (await jsonOf(await call('GET', '/api/hub/orders', { init: A.init() }))).orders;
  assert.deepEqual(list.map(o => o.id), [o2.id, o1.id], 'новые сверху');
  assert.deepEqual(list.map(o => o.did), [sid, 'main']);
  assert.equal(list[0].shopName, 'Альфа Трейд');
  assert.equal(list[1].shopName, 'Оптовая база');
  assert.ok(list.every(o => !('uid' in o) && !('tg' in o)));
  // чужой клиент их не видит
  assert.deepEqual((await jsonOf(await call('GET', '/api/hub/orders', { init: newUser().init() }))).orders, []);
  // отмена: к тому дистрибьютору, чей заказ
  assert.equal((await call('POST', '/api/cancel', { init: A.init(), body: { id: o2.id } })).status, 404, 'у первого дистрибьютора такого заказа нет');
  const c = await callS(sid, 'POST', '/api/cancel', { init: A.init(), body: { id: o2.id } });
  assert.equal(c.status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/hub/orders', { init: A.init() }))).orders[0].status, 'cancelled');
  // дистрибьютор отключён: заказы клиента у него по-прежнему видны
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { on: false } })).status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/hub/orders', { init: A.init() }))).orders.length, 2);
  // заказы до появления площадки: у первого дистрибьютора находятся и без записи в реестре клиентов
  const B = newUser();
  const ob1 = (await jsonOf(await place(B, CART))).order;
  await W.hubStorage.delete('u:' + B.u.id);
  const lb = (await jsonOf(await call('GET', '/api/hub/orders', { init: B.init() }))).orders;
  assert.deepEqual(lb.map(o => o.id), [ob1.id]);
  assert.deepEqual(await W.hubStorage.get('u:' + B.u.id), ['main']);
  const C = newUser();
  await call('GET', '/api/hub/orders', { init: C.init() });
  assert.deepEqual(await W.hubStorage.get('u:' + C.u.id), [], 'без заказов запись пустая, повторно первого дистрибьютора не опрашиваем');
});

await t('площадка: отключённый дистрибьютор скрыт и заказы не принимает, включается обратно', async () => {
  const { sid } = await shopWorld();
  const A = newUser();
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iA(), body: { on: false } })).status, 403);
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { on: 'no' } })).status, 400);
  assert.equal((await call('PUT', '/api/hub/admin/shops/nope12', { init: iS(), body: { on: false } })).status, 404);
  const off = await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { on: false } });
  assert.equal((await jsonOf(off)).shop.on, false);
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops'))).shops, []);
  assert.equal((await jsonOf(await callS(sid, 'GET', '/api/config'))).off, true);
  const r = await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) });
  assert.equal(r.status, 403);
  assert.equal((await jsonOf(r)).error, 'shop_off');
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 200, 'продавец заходит и видит свои данные');
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { on: true } })).status, 200);
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops'))).shops.map(x => x.id), [sid]);
  assert.equal((await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) })).status, 200);
});

await t('площадка: новый код закрывает доступ прежним продавцам; у первого дистрибьютора владелец остаётся продавцом', async () => {
  const { sid, code } = await shopWorld();
  assert.equal((await call('POST', '/api/hub/admin/shops/' + sid + '/code', { init: iA(), body: {} })).status, 403);
  assert.equal((await call('POST', '/api/hub/admin/shops/' + sid + '/code', { init: iS(), body: { code: 'short' } })).status, 400);
  assert.equal((await call('POST', '/api/hub/admin/shops/' + sid + '/code', { init: iS(), body: { code: CODE } })).status, 409);
  const r = await call('POST', '/api/hub/admin/shops/' + sid + '/code', { init: iS(), body: {} });
  const d = await jsonOf(r);
  assert.equal(r.status, 200);
  assert.notEqual(d.code, code);
  assert.equal(d.shop.sellers, 0);
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 403, 'прежний продавец вышел');
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops', { init: iD() }))).me.sells, []);
  tgLog = [];
  await send(adminMsg(DIL, code, 60));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'), 'старый код больше не работает');
  await send(adminMsg(DIL, d.code, 61));
  assert.ok(lastTg('sendMessage').payload.text.includes('вы продавец'));
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 200);
  // первый дистрибьютор: свой код для помощников, ADMIN_CODE остаётся кодом владельца
  const m = await jsonOf(await call('POST', '/api/hub/admin/shops/main/code', { init: iS(), body: { code: 'main-helper-code-777' } }));
  assert.equal(m.code, 'main-helper-code-777');
  assert.equal((await call('GET', '/api/admin/orders', { init: iS() })).status, 200, 'владелец по-прежнему продавец первого дистрибьютора');
  tgLog = [];
  await send(adminMsg(JAS2, 'main-helper-code-777', 62));
  assert.ok(lastTg('sendMessage').payload.text.includes('вы продавец'));
  assert.ok(!lastTg('sendMessage').payload.text.includes('владелец площадки'), 'помощник не становится владельцем');
  assert.equal((await call('GET', '/api/admin/orders', { init: initDataFor(JAS2) })).status, 200);
  assert.equal((await call('GET', '/api/hub/admin/shops', { init: initDataFor(JAS2) })).status, 403);
  await send(adminMsg(ANNA, CODE, 63));
  assert.equal((await call('GET', '/api/hub/admin/shops', { init: iA() })).status, 200, 'ADMIN_CODE по-прежнему делает владельцем');
});

await t('площадка: владелец удаляет дистрибьютора совсем: данные стёрты, продавец без доступа, «Мои заказы» целы; первого и чужих это не касается', async () => {
  const { sid } = await shopWorld('Удаляемый');
  const keep = (await addShop('Остаётся')).shop.id;
  await send(adminMsg(SELLER, CODE, 70));
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const A = newUser();
  const o1 = (await jsonOf(await place(A, CART))).order;                                   // у первого дистрибьютора
  await new Promise(r => setTimeout(r, 5));
  const o2 = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) }))).order;   // у удаляемого
  assert.deepEqual((await jsonOf(await call('GET', '/api/hub/orders', { init: A.init() }))).orders.map(o => o.id), [o2.id, o1.id]);
  assert.ok(W.getShop(sid).storage.m.size > 0, 'у дистрибьютора есть данные');
  // удаляет только владелец; первого дистрибьютора удалить нельзя; несуществующего тоже
  assert.equal((await call('DELETE', '/api/hub/admin' + '/shops/' + sid, { init: iD() })).status, 403);
  assert.equal((await call('DELETE', '/api/hub/admin' + '/shops/' + sid, { init: iA() })).status, 403);
  const rm = await call('DELETE', '/api/hub/admin' + '/shops/main', { init: iS() });
  assert.equal(rm.status, 409);
  assert.equal((await jsonOf(rm)).error, 'main_shop');
  assert.equal((await call('DELETE', '/api/hub/admin' + '/shops/nonexist', { init: iS() })).status, 404);
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 200, 'до удаления продавец работает');
  // удаление
  const del = await call('DELETE', '/api/hub/admin' + '/shops/' + sid, { init: iS() });
  assert.equal(del.status, 200);
  assert.equal((await jsonOf(del)).id, sid);
  // из реестра и из списка для клиентов он исчез, остальные на месте
  const reg = await jsonOf(await call('GET', '/api/hub/admin/shops', { init: iS() }));
  assert.deepEqual(reg.shops.map(x => x.id).sort(), ['main', keep].sort());
  const pub = (await jsonOf(await call('GET', '/api/shops', { init: A.init() }))).shops.map(x => x.id);   // в списке клиентов только дистрибьюторы с товарами
  assert.ok(pub.includes('main') && !pub.includes(sid));
  // хранилище очищено, продавец потерял доступ, каталог не открывается
  assert.equal(W.getShop(sid).storage.m.size, 0, 'хранилище дистрибьютора пустое');
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops', { init: iD() }))).me.sells, []);
  assert.equal((await callS(sid, 'GET', '/api/admin/orders', { init: iD() })).status, 404);
  assert.equal((await callS(sid, 'GET', '/api/config')).status, 404);
  assert.equal((await call('DELETE', '/api/hub/admin' + '/shops/' + sid, { init: iS() })).status, 404, 'повторно удалять нечего');
  // «Мои заказы» не ломаются: остался заказ у первого дистрибьютора
  const left = (await jsonOf(await call('GET', '/api/hub/orders', { init: A.init() }))).orders;
  assert.deepEqual(left.map(o => o.id), [o1.id]);
  // первый и второй дистрибьюторы работают как раньше
  assert.equal((await call('GET', '/api/config')).status, 200);
  assert.equal((await callS(keep, 'GET', '/api/config')).status, 200);
  // прежний общий код удалённого дистрибьютора больше не принимается
});

await t('площадка: чужой номер дистрибьютора не создаёт ничего, неверный номер отклоняется', async () => {
  await hubWorld();
  for (const bad of ['Evil/../x', 'UPPER', 'a', 'x'.repeat(13), 'a b']) {
    const r = await call('GET', '/api/config', { headers: { 'x-shop': bad } });
    assert.equal(r.status, 400, bad);
  }
  const r = await call('GET', '/api/config', { headers: sx('zzzzzz') });
  assert.equal(r.status, 404);
  assert.equal((await jsonOf(r)).error, 'no_shop');
  assert.equal((await callS('zzzzzz', 'GET', '/api/bootstrap', { init: iA() })).status, 404);
  assert.equal((await callS('zzzzzz', 'PUT', '/api/admin/products', { init: iS(), body: { prod: SAMPLE_PROD() } })).status, 404);
  assert.equal(W.getShop('zzzzzz').storage.m.size, 0, 'в хранилище ничего не появилось');
  // служебные адреса снаружи недоступны
  for (const p of ['/__/summary', '/__/admin-add', '/__/sync', '/__/off']) assert.equal((await call('POST', p, { body: { uid: 1 } })).status, 404, p);
  assert.equal((await call('GET', '/img/zzzzzz/p1')).status, 404);
});

await t('площадка: приветствие бота зависит от числа дистрибьюторов, ссылка d_<номер> открывает нужный каталог', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  const start = async (from, text) => { tgLog = []; await send({ update_id: 9, message: { message_id: 9, from, chat: { id: from.id, type: 'private' }, text } }); return lastTg('sendMessage').payload; };
  // виден один дистрибьютор: говорим от его имени, кнопка открывает приложение
  let m = await start(ANNA, '/start');
  assert.ok(m.text.includes('Альфа Трейд') && m.text.includes('Самовывоз или доставка'));
  assert.equal(m.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/');
  await send(adminMsg(SELLER, CODE, 70));
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  // два: от имени площадки
  m = await start(ANNA, '/start');
  assert.ok(m.text.includes('Sarbon') && m.text.includes('Нажмите «Каталог»') && !m.text.includes('Вы продавец'));
  assert.equal(m.reply_markup.inline_keyboard[0][0].text, 'CATALOG');
  // продавец видит пометку на обоих языках, узбекский сверху
  m = await start(SELLER, '/start');
  assert.ok(m.text.includes('Вы продавец: новые заказы придут сюда.') && m.text.includes('Siz sotuvchisiz: yangi buyurtmalar shu yerga keladi.'));
  assert.ok(m.text.indexOf('Siz sotuvchisiz') < m.text.indexOf('Вы продавец'));
  m = await start(BOB, '/start');
  assert.ok(m.text.includes('«Katalog» tugmasini bosing') && !m.text.includes('sotuvchisiz'));
  // ссылка на конкретного
  m = await start(ANNA, '/start d_' + sid);
  assert.ok(m.text.includes('Альфа Трейд'));
  assert.equal(m.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?d=' + sid);
  m = await start(ANNA, '/start d_zzzzzz');
  assert.ok(m.text.includes('Sarbon'));
  assert.equal(m.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/');
  // название площадки меняет владелец
  assert.equal((await call('PUT', '/api/hub/admin/title', { init: iA(), body: { title: 'X' } })).status, 403);
  assert.equal((await call('PUT', '/api/hub/admin/title', { init: iS(), body: { title: 5 } })).status, 400);
  assert.equal((await jsonOf(await call('PUT', '/api/hub/admin/title', { init: iS(), body: { title: '  Навои Опт  ' } }))).title, 'Навои Опт');
  assert.equal((await jsonOf(await call('GET', '/api/shops'))).title, 'Навои Опт');
  m = await start(ANNA, '/start');
  assert.ok(m.text.includes('Навои Опт'));
  // ссылка на каталог в кабинете владельца
  const l = await jsonOf(await call('GET', '/api/hub/admin/shops', { init: iS() }));
  assert.equal(l.shops.find(x => x.id === sid).link, 'https://t.me/distro_test_bot?start=d_' + sid);
});

await t('площадка: больше 50 дистрибьюторов не заводится', async () => {
  await hubWorld();
  for (let i = 0; i < 49; i++) assert.equal((await createShop({ name: 'Компания ' + i })).status, 200);
  const r = await createShop({ name: 'Лишняя' });
  assert.equal(r.status, 409);
  assert.equal((await jsonOf(r)).error, 'too_many');
  const l = await jsonOf(await call('GET', '/api/hub/admin/shops', { init: iS() }));
  assert.equal(l.shops.length, 50);
  assert.equal(new Set(l.shops.map(x => x.id)).size, 50);
});

await t('площадка: /setup подключает и реестр, показывает число дистрибьюторов', async () => {
  await hubWorld();
  await addShop('Альфа');
  tgLog = [];
  const r = await call('POST', '/setup', { body: 'code=' + encodeURIComponent(CODE), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const page = await r.text();
  assert.ok(page.includes('Площадка дистрибьюторов') && page.includes('дистрибьюторов: 2'));
  assert.ok(!page.includes('✘'));
  // без привязки HUB страница честно говорит, что делать
  const w = makeWorld();
  delete w.env.HUB;
  const prev = W; W = w;
  const r2 = await call('POST', '/setup', { body: 'code=' + encodeURIComponent(CODE), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  W = prev;
  assert.ok((await r2.text()).includes('HUB'));
});

await t('площадка: страница приложения отдаётся, скрипт собирается и использует номер дистрибьютора', async () => {
  await hubWorld();
  const r = await call('GET', '/');
  assert.equal(r.status, 200);
  const html = await r.text();
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length >= 1);
  // скрипт должен хотя бы разбираться без синтаксических ошибок
  scripts.forEach(code => new Function(code));
  const code = scripts.join('\n');
  assert.ok(code.includes("'x-shop'"), 'приложение не присылает номер дистрибьютора');
  assert.ok(code.includes('/api/hub/orders') && code.includes('/api/shops'));
  assert.ok(code.includes("'/img/'+encodeURIComponent(did||S.did"), 'картинки должны брать номер дистрибьютора (по умолчанию открытого)');
  assert.ok(!html.includes('/*SHARED*/'), 'метка общего кода должна быть заменена');
});

await t('площадка: без привязки HUB каталог и заказы первого дистрибьютора работают как раньше', async () => {
  W = makeWorld();
  delete W.env.HUB;
  await W.storage.put({ cfg: { shop: { name: 'Старое имя' } }, admins: [SELLER.id], prod: { cats: [{ id: 'c', name: 'Крупы' }], items: [{ id: 'p1', cat: 'c', name: 'Рис', amount: 1, unit: 'kg', price: 100, on: true }] } });
  const l = await call('GET', '/api/shops', { init: iA() });
  assert.equal(l.status, 503);
  const c = await call('GET', '/api/config');
  assert.equal(c.status, 200);
  assert.equal((await jsonOf(c)).cfg.shop.name, 'Старое имя');
  const b = await jsonOf(await call('GET', '/api/bootstrap', { init: iA() }));
  assert.equal(b.cfg.shop.name, 'Старое имя');
  assert.equal(b.me.admin, false);
  // webhook без HUB уходит первому дистрибьютору и не падает
  const r = await call('POST', '/webhook', { body: { update_id: 1 }, headers: { 'x-telegram-bot-api-secret-token': 'bad' } });
  assert.ok(r.status === 200 || r.status === 403, 'статус ' + r.status);
});

await t('площадка: комиссия считается с товаров без доставки, только с выданных заказов; процент меняет владелец', async () => {
  const { sid } = await shopWorld();
  const A = newUser();
  const statusOf = (id, to) => callS(sid, 'POST', '/api/admin/status', { init: iD(), body: { id, to } });
  const finish = async id => { for (const to of ['accepted', 'ready', 'done']) assert.equal((await statusOf(id, to)).status, 200); };
  const stats = async period => jsonOf(await call('GET', '/api/hub/admin/stats' + (period ? '?period=' + period : ''), { init: iS() }));
  const row = d => d.rows.find(x => x.id === sid);
  const order = async (over, mode) => (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART, over, mode) }))).order;
  // доставка платная: 30 000 в итог входят, а в комиссию нет
  const cfg = (await jsonOf(await callS(sid, 'GET', '/api/config'))).cfg;
  cfg.shop.deliveryFee = 30000;
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  const o1 = await order();
  const o2 = await order({ expectTotal: 1424000 }, 'delivery');
  const o3 = await order();
  assert.equal(o2.total, 1424000);
  assert.equal(o2.fee, 30000);
  // пока ничего не выдано, комиссии нет, но видно, сколько заказов в работе
  let d = await stats();
  assert.equal(d.period, 'month');
  assert.equal(row(d).pct, 2);
  assert.deepEqual([row(d).n, row(d).base, row(d).cm, row(d).active], [0, 0, 0, 3]);
  await finish(o1.id);
  await finish(o2.id);
  assert.equal((await callS(sid, 'POST', '/api/cancel', { init: A.init(), body: { id: o3.id } })).status, 200);
  d = await stats();
  assert.deepEqual([row(d).n, row(d).base, row(d).cm, row(d).active], [2, 2788000, 55760, 0]);
  // первый дистрибьютор: комиссии нет по умолчанию
  const main = d.rows.find(x => x.id === 'main');
  assert.deepEqual([main.pct, main.cm, main.err], [0, 0, false]);
  assert.equal(d.total.cm, 55760);
  assert.equal(d.total.base, 2788000);
  // прошлый месяц пуст
  assert.equal(row(await stats('prev')).n, 0);
  // новый процент действует только на заказы, выданные после изменения
  let r = await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { pct: 5 } });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).pct, 5);
  const o4 = await order();
  await finish(o4.id);
  d = await stats('30d');
  assert.deepEqual([row(d).pct, row(d).n, row(d).base, row(d).cm], [5, 3, 4182000, 55760 + 69700]);
  // дистрибьютор видит свою комиссию в отчёте, чужие данные не затронуты
  const rep = (await jsonOf(await callS(sid, 'GET', '/api/admin/report?days=30', { init: iD() }))).report;
  assert.equal(rep.comm.pct, 5);
  assert.deepEqual([rep.comm.cur.n, rep.comm.cur.base, rep.comm.cur.cm, rep.comm.prev.cm], [3, 4182000, 125460, 0]);
  const mainRep = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.equal(mainRep.comm.pct, 0);
  assert.equal(mainRep.comm.cur.cm, 0);
  // процент: запятая допустима, лишнее и чужие запросы отклоняются
  r = await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { pct: '1,5' } });
  assert.equal((await jsonOf(r)).pct, 1.5);
  assert.equal(row(await stats()).pct, 1.5);
  for (const bad of [51, -1, 'abc', null]) assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { pct: bad } })).status, 400, 'pct ' + bad);
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: {} })).status, 400);
  assert.equal((await call('GET', '/api/hub/admin/stats', { init: iD() })).status, 403);
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iD(), body: { pct: 0 } })).status, 403);
  assert.equal((await call('GET', '/api/hub/admin/stats', { init: A.init() })).status, 403);
  assert.equal((await call('GET', '/api/hub/admin/stats')).status, 401);
  // скрытие компании и процент можно менять в одном запросе
  r = await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { on: false, pct: 2 } });
  assert.equal(r.status, 200);
  assert.equal(row(await stats()).on, false);
  assert.equal(row(await stats()).pct, 2);
});

await t('площадка: комиссия у записей прежних дней считается по старым итогам и не ломает отчёты', async () => {
  W = makeWorld();
  await send(adminMsg(SELLER, CODE, 1));
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  // день, записанный до появления комиссии (без cb и cm), и новый заказ в тот же день
  const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  await W.storage.put({ rpx: [today], rp0: today, ['rp:' + today]: { n: 1, sum: 130000, disc: 0, fee: 30000, items: [], cl: [] } });
  await call('PUT', '/api/hub/admin/shops/main', { init: iS(), body: { pct: 10 } });
  const A = newUser();
  const o = (await jsonOf(await place(A, CART))).order;
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await call('POST', '/api/admin/status', { init: iS(), body: { id: o.id, to } })).status, 200);
  const d = await jsonOf(await call('GET', '/api/hub/admin/stats', { init: iS() }));
  const m = d.rows.find(x => x.id === 'main');
  // старая запись: 130 000 − 30 000 доставки = 100 000; новый заказ 1 394 000; комиссия только с нового
  assert.deepEqual([m.n, m.base, m.cm], [2, 1494000, 139400]);
  const rep = (await jsonOf(await call('GET', '/api/admin/report?days=7', { init: iS() }))).report;
  assert.equal(rep.tot.n, 2);
  assert.equal(rep.comm.cur.cm, 139400);
});

/* ---------- регионы: куда доставляет дистрибьютор, какой регион у магазина ---------- */
await t('регионы выключены: отмеченные регионы не ограничивают доставку и никому не показываются', async () => {
  const { sid } = await shopWorld();
  const cfg = (await jsonOf(await callS(sid, 'GET', '/api/config'))).cfg;
  cfg.shop.regions = ['sa', 'tk'];
  cfg.shop.home = 'nv';
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  const A = newUser();
  // доставка без региона, регион не нужен: ограничения не работают
  const r = await callS(sid, 'POST', '/api/order', { init: A.init(), body: { cart: CART, form: formFor(S.DEFAULT, 'delivery'), lang: 'ru', expectTotal: 1394000 } });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).order.region, undefined);
  const r2 = await callS(sid, 'POST', '/api/order', { init: A.init(), body: { cart: CART, form: formFor(S.DEFAULT, 'delivery', { region: 'nv' }), lang: 'ru', expectTotal: 1394000 } });
  assert.equal(r2.status, 200, 'регион вне списка доставки больше не отклоняется');
});

await tr('регионы: доставка только в отмеченные регионы, самовывоз всегда; ответ сервера подсказывает, что делать', async () => {
  const { sid } = await shopWorld();
  const mkOrder = async (form, mode, over) => {
    const A = newUser();
    const cfg = (await jsonOf(await callS(sid, 'GET', '/api/config'))).cfg;
    const r = await callS(sid, 'POST', '/api/order', { init: A.init(), body: Object.assign({ cart: CART, form: formFor(cfg, mode, form), lang: 'ru', expectTotal: 1394000 }, over || {}) });
    return { status: r.status, d: await jsonOf(r) };
  };
  // по умолчанию дистрибьютор доставляет везде, регион не нужен
  let l = (await jsonOf(await call('GET', '/api/shops', { init: iA() }))).shops.find(x => x.id === sid);
  assert.deepEqual([l.regions, l.home], [[], '']);
  let r = await mkOrder({}, 'delivery');
  assert.equal(r.status, 200);
  assert.equal(r.d.order.region, undefined, 'регион не присылали — в заказ ничего не пишем');
  // продавец отмечает регионы: лишнее и повторы чистятся, порядок как в справочнике
  const cfg = (await jsonOf(await callS(sid, 'GET', '/api/config'))).cfg;
  cfg.shop.regions = ['tk', 'sa', 'zz', 'sa', 5, 'tk'];
  cfg.shop.home = 'nv';
  let put = await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } });
  assert.equal(put.status, 200);
  const saved = await jsonOf(put);
  assert.deepEqual(saved.cfg.shop.regions, ['sa', 'tk']);
  assert.equal(saved.cfg.shop.home, 'nv');
  cfg.shop.home = 'нет';
  assert.equal((await jsonOf(await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } }))).cfg.shop.home, '');
  cfg.shop.home = 'nv';
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  // площадка узнала о регионах и складе
  l = (await jsonOf(await call('GET', '/api/shops', { init: iA() }))).shops.find(x => x.id === sid);
  assert.deepEqual([l.regions, l.home], [['sa', 'tk'], 'nv']);
  // доставка: без региона, с чужим и с выдуманным регионом заказ не проходит и приходит свежая настройка
  r = await mkOrder({}, 'delivery');
  assert.equal(r.status, 409);
  assert.equal(r.d.error, 'region_need');
  assert.deepEqual(r.d.cfg.shop.regions, ['sa', 'tk']);
  r = await mkOrder({ region: 'nv' }, 'delivery');
  assert.deepEqual([r.status, r.d.error], [409, 'no_region']);
  r = await mkOrder({ region: 'zz' }, 'delivery');
  assert.deepEqual([r.status, r.d.error], [409, 'region_need']);
  // свой регион: заказ принят, регион записан и виден продавцу
  tgLog = [];
  r = await mkOrder({ region: 'sa' }, 'delivery');
  assert.equal(r.status, 200);
  assert.equal(r.d.order.region, 'sa');
  assert.ok(lastTg('sendMessage', p => p.chat_id === DIL.id).payload.text.includes('Регион: Самаркандская область'));
  r = await mkOrder({ region: 'tk' }, 'delivery');
  assert.equal(r.status, 200);
  // самовывоз никто не ограничивает, регион в заказ не пишется
  r = await mkOrder({}, 'pickup');
  assert.equal(r.status, 200);
  r = await mkOrder({ region: 'nv' }, 'pickup');
  assert.equal(r.status, 200);
  assert.equal(r.d.order.region, undefined);
  // «все регионы» и пустой список — то же, что по всей стране
  cfg.shop.regions = REGION_ALL();
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  r = await mkOrder({ region: 'nv' }, 'delivery');
  assert.equal(r.status, 200, 'отмечены все регионы — ограничения нет');
  cfg.shop.regions = [];
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  r = await mkOrder({}, 'delivery');
  assert.equal(r.status, 200);
  // доставка выключена совсем: прежняя ошибка
  cfg.shop.delivery = false;
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  r = await mkOrder({ region: 'sa' }, 'delivery');
  assert.equal(r.d.error, 'no_delivery');
});

await tr('регионы: другие дистрибьюторы не затронуты; у первого доставка по-прежнему везде', async () => {
  const { sid } = await shopWorld();
  const cfg = (await jsonOf(await callS(sid, 'GET', '/api/config'))).cfg;
  cfg.shop.regions = ['sa'];
  assert.equal((await callS(sid, 'PUT', '/api/admin/config', { init: iD(), body: { cfg } })).status, 200);
  // у первого (main) настройки свои: список там пуст, заказ с доставкой без региона проходит
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const A = newUser();
  const mainCfg = await getCfg();
  assert.deepEqual(mainCfg.shop.regions, []);
  const r = await call('POST', '/api/order', { init: A.init(), body: { cart: CART, form: formFor(mainCfg, 'delivery'), lang: 'ru', expectTotal: 1394000 } });
  assert.equal(r.status, 200);
  const list = (await jsonOf(await call('GET', '/api/shops', { init: iA() }))).shops;
  assert.deepEqual(list.find(x => x.id === 'main').regions, []);
  assert.deepEqual(list.find(x => x.id === sid).regions, ['sa']);
});

await tr('регионы: регион магазина запоминается на площадке, проверяется и у каждого свой', async () => {
  await hubWorld();
  const A = newUser(), B = newUser();
  const meOfU = async u => (await jsonOf(await call('GET', '/api/shops', { init: u.init() }))).me;
  assert.equal((await meOfU(A)).region, '');
  let r = await call('PUT', '/api/hub/region', { init: A.init(), body: { region: 'sa' } });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).region, 'sa');
  assert.equal((await meOfU(A)).region, 'sa');
  assert.equal((await meOfU(B)).region, '', 'у другого человека свой регион');
  for (const bad of ['zz', 5, null, undefined, 'SA']) assert.equal((await call('PUT', '/api/hub/region', { init: A.init(), body: { region: bad } })).status, 400, 'region ' + bad);
  assert.equal((await call('PUT', '/api/hub/region', { init: A.init() })).status, 400);
  assert.equal((await call('PUT', '/api/hub/region', { body: { region: 'sa' } })).status, 401, 'без входа через Telegram нельзя');
  assert.equal((await meOfU(A)).region, 'sa', 'ошибочные запросы регион не стёрли');
  r = await call('PUT', '/api/hub/region', { init: A.init(), body: { region: '' } });
  assert.equal(r.status, 200);
  assert.equal((await meOfU(A)).region, '');
  // гость без входа список видит, региона у него нет
  assert.equal((await jsonOf(await call('GET', '/api/shops'))).me, undefined);
});

/* ---------- общая база магазинов: заказ, агенты, территории ---------- */
const AGT = { id: 9201, first_name: 'Aziz', username: 'aziz_ag', language_code: 'ru' };
const AGT2 = { id: 9202, first_name: 'Botir', username: 'botir_ag', language_code: 'ru' };
const iG = () => initDataFor(AGT), iG2 = () => initDataFor(AGT2);
const agentMsg = (from, code, mid) => ({ update_id: 6000 + mid, message: { message_id: mid, from, chat: { id: from.id, type: 'private' }, text: '/agent ' + code } });
const say = async (from, text) => { tgLog = []; await send({ update_id: 6500, message: { message_id: 6500, from, chat: { id: from.id, type: 'private' }, text } }); return lastTg('sendMessage') && lastTg('sendMessage').payload; };
const baseGet = async (qs, init) => jsonOf(await call('GET', '/api/hub/base' + (qs || ''), { init: init || iS() }));
const baseSend = (method, path, body, init) => call(method, '/api/hub/base' + path, { init: init || iS(), body });
const ordBase = async (did, u, form, mode) => {
  const r = await callS(did, 'POST', '/api/order', { init: u.init(), body: { cart: CART, form: formFor(S.DEFAULT, mode || 'pickup', form), lang: 'ru', expectTotal: 1394000 } });
  assert.equal(r.status, 200);
  return jsonOf(r);
};
const adm = (method, path, body, init) => call(method, '/api/hub/admin' + path, { init: init || iS(), body });
const meHub = async u => (await jsonOf(await call('GET', '/api/shops', { init: u.init ? u.init() : initDataFor(u) }))).me;

/* ---------- проверка товаров ---------- */
const modMsg = (n, name) => (name || 'Навои Фуд') + ': tekshiruvda ' + n + ' ta mahsulot\n\n' + (name || 'Навои Фуд') + ': на проверке ' + ruTovarT(n);
const ruTovarT = n => n + ' ' + (n % 100 > 10 && n % 100 < 15 ? 'товаров' : n % 10 === 1 ? 'товар' : n % 10 > 1 && n % 10 < 5 ? 'товара' : 'товаров');
const NEWP = (id, over) => Object.assign({ id, cat: 'oil', name: 'Масло «Золотое»', uz: 'Oltin yogʻ', desc: '', descUz: '', amount: 1, unit: 'l', price: 30000, on: true }, over || {});
/* дистрибьютор с одним проверенным товаром; продавец DIL добавляет новые */
async function modWorld() {
  const { sid } = await shopWorld('Навои Фуд');
  const cur = (await jsonOf(await callS(sid, 'GET', '/api/config', { init: iD() }))).prod;
  return { sid, cur };
}
const dPut = (sid, prod) => callS(sid, 'PUT', '/api/admin/products', { init: iD(), body: { prod } });
const dSee = async (sid, init) => (await jsonOf(await callS(sid, 'GET', '/api/config', init ? { init } : undefined))).prod;
const dMod = (sid, body) => callS(sid, 'POST', '/api/admin/submit', { init: iD(), body: body || {} });
const oMod = async seg => jsonOf(await call('GET', '/api/hub/admin/mod?seg=' + (seg || 'wait'), { init: iS() }));
const oAct = (action, body, init) => call(action === 'edit' ? 'PUT' : 'POST', '/api/hub/admin/mod/' + action, { init: init || iS(), body });

await t('проверка: новый товар продавца — черновик, клиентам не виден, прежние товары остаются одобренными', async () => {
  const { sid, cur } = await modWorld();
  assert.ok(cur.items.every(i => !i.ms), 'у прежних товаров метки нет');
  const next = { cats: cur.cats, items: cur.items.concat([NEWP('n1'), NEWP('n2', { name: 'Рис «Лазер»', cat: 'groats' })]) };
  const saved = (await jsonOf(await dPut(sid, next))).prod;
  assert.deepEqual(saved.items.filter(i => i.ms).map(i => [i.id, i.ms]), [['n1', 'draft'], ['n2', 'draft']]);
  // продавец видит всё, в том числе по общему адресу, если приложил подпись
  assert.equal((await dSee(sid, iD())).items.length, 6);
  // клиент и гость черновиков не видят
  assert.equal((await dSee(sid)).items.length, 4);
  assert.equal((await dSee(sid, iA())).items.length, 4);
  const boot = await jsonOf(await callS(sid, 'GET', '/api/bootstrap', { init: iA() }));
  assert.equal(boot.prod.items.length, 4);
  assert.equal((await jsonOf(await callS(sid, 'GET', '/api/bootstrap', { init: iD() }))).prod.items.length, 6, 'продавцу — весь каталог');
  // метки задать самому нельзя
  const hack = JSON.parse(JSON.stringify(saved));
  hack.items.find(i => i.id === 'n1').ms = ''; hack.items.push(Object.assign(NEWP('n3'), { ms: 'ok', ma: '2026-01-01' }));
  const h2 = (await jsonOf(await dPut(sid, hack))).prod;
  assert.equal(h2.items.find(i => i.id === 'n1').ms, 'draft');
  assert.deepEqual([h2.items.find(i => i.id === 'n3').ms, h2.items.find(i => i.id === 'n3').ma], ['draft', undefined]);
  // правки одобренного товара свободные: статус не появляется
  const e = JSON.parse(JSON.stringify(h2)); e.items.find(i => i.id === 'p1').price = 90000; e.items.find(i => i.id === 'p1').name = 'Масло новое';
  const e2 = (await jsonOf(await dPut(sid, e))).prod.items.find(i => i.id === 'p1');
  assert.equal(e2.ms, undefined); assert.equal(e2.price, 90000);
  assert.equal((await dSee(sid)).items.find(i => i.id === 'p1').price, 90000);
  // удаление черновика
  const d2 = JSON.parse(JSON.stringify(e)); d2.items = d2.items.filter(i => i.id !== 'n3');
  assert.equal((await jsonOf(await dPut(sid, d2))).prod.items.length, 6);
  // в списке дистрибьюторов считаются только одобренные
  const pub = await jsonOf(await call('GET', '/api/shops'));
  assert.equal(pub.shops.find(x => x.id === sid).items, 4);
});

await t('проверка: владелец и одиночный магазин добавляют товары сразу одобренными', async () => {
  W = makeWorld();
  await send(adminMsg(SELLER, CODE, 1));
  const prod = SAMPLE_PROD(); prod.items.push(NEWP('n9'));
  const r = (await jsonOf(await putProd(prod))).prod;
  assert.ok(r.items.every(i => !i.ms), 'у владельца всё одобрено сразу');
  assert.equal((await jsonOf(await call('GET', '/api/config'))).prod.items.length, 5);
  // без площадки (нет HUB) продавец и есть владелец
  const W0 = W; W = makeWorld(); delete W.env.HUB;
  await W.storage.put({ cfg: { shop: { name: 'Один' } }, admins: [SELLER.id] });
  const r2 = (await jsonOf(await putProd(SAMPLE_PROD()))).prod;
  assert.ok(r2.items.every(i => !i.ms));
  W = W0;
});

await t('проверка: отправка на проверку — нужны название, цена и категория; владельцу одно сообщение на отправку', async () => {
  const { sid, cur } = await modWorld();
  const A = newUser();
  const items = [NEWP('n1'), NEWP('n2', { name: 'Рис «Лазер»', cat: 'groats' }), NEWP('n3', { name: 'Новый товар' }), NEWP('n4', { price: 0 })];
  await dPut(sid, { cats: cur.cats, items: cur.items.concat(items) });
  tgLog = [];
  // по одному товару без названия/цены отправить нельзя, остальные уходят
  let r = await dMod(sid, {});
  let d = await jsonOf(r);
  assert.equal(r.status, 200);
  assert.equal(d.sent, 2);
  assert.deepEqual(d.bad.map(b => [b.id, b.why[0]]), [['n3', 'name'], ['n4', 'price']]);
  assert.deepEqual(d.prod.items.filter(i => i.ms === 'wait').map(i => i.id).sort(), ['n1', 'n2']);
  assert.ok(d.prod.items.filter(i => i.ms === 'wait').every(i => /^\d{4}-/.test(i.mt)));
  const tgs = tgLog.filter(x => x.method === 'sendMessage');
  assert.equal(tgs.length, 1, 'одно сообщение владельцу на всю отправку');
  assert.equal(tgs[0].payload.chat_id, SELLER.id);
  assert.equal(tgs[0].payload.text, modMsg(2), 'сначала узбекский, ниже русский');
  assert.equal(tgs[0].payload.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?v=review');
  // повторная отправка ничего нового не даёт
  tgLog = [];
  r = await dMod(sid, {});
  assert.equal(r.status, 400); assert.equal((await jsonOf(r)).error, 'nothing');
  assert.equal(tgLog.filter(x => x.method === 'sendMessage').length, 0);
  // отправка отдельным списком
  await dPut(sid, { cats: cur.cats, items: (await dSee(sid, iD())).items.map(i => i.id === 'n3' ? Object.assign({}, i, { name: 'Гречка отборная' }) : i) });
  r = await dMod(sid, { ids: ['n3', 'n4'] });
  d = await jsonOf(r);
  assert.deepEqual([d.sent, d.bad.map(b => b.id)], [1, ['n4']]);
  assert.equal(tgLog.pop().payload.text, modMsg(1));
  // клиент и посторонние отправлять не могут
  assert.equal((await callS(sid, 'POST', '/api/admin/submit', { init: A.init(), body: {} })).status, 403);
  assert.equal((await callS(sid, 'POST', '/api/admin/submit', { body: {} })).status, 401);
});

await t('проверка: клиент видит товар на проверке без цены, заказать его нельзя; черновики и возвращённые не видны', async () => {
  const { sid, cur } = await modWorld();
  const A = newUser();
  await dPut(sid, { cats: cur.cats, items: cur.items.concat([NEWP('n1', { tiers: [{ n: 10, price: 28000 }], tag: 'sale', old: 40000, box: 12 }), NEWP('n2', { name: 'Рис «Лазер»' }), NEWP('n3', { name: 'Гречка' })]) });
  await dMod(sid, { ids: ['n1', 'n2'] });
  assert.equal((await oAct('return', { did: sid, id: 'n2', reason: 'Нет фото' })).status, 200);
  const view = (await dSee(sid, A.init())).items;
  assert.deepEqual(view.map(i => i.id).sort(), ['n1', 'p1', 'p2', 'p3', 'p4'], 'n2 возвращён, n3 черновик — не видны');
  const n1 = view.find(i => i.id === 'n1');
  assert.deepEqual([n1.ms, n1.price, n1.tiers, n1.old, n1.box, n1.tag, n1.mt, n1.mc], ['wait', 0, [], 0, 0, '', undefined, undefined]);
  assert.equal(n1.name, 'Масло «Золотое»');
  // заказать нельзя
  const ord = await callS(sid, 'POST', '/api/order', { init: A.init(), body: { cart: [{ id: 'n1', qty: 1 }], form: formFor(S.DEFAULT, 'pickup', {}), lang: 'ru' } });
  assert.equal(ord.status, 409);
  const ordBody = await jsonOf(ord);
  assert.equal(ordBody.error, 'unavailable');
  const ord2 = await callS(sid, 'POST', '/api/order', { init: A.init(), body: { cart: [{ id: 'n3', qty: 1 }], form: formFor(S.DEFAULT, 'pickup', {}), lang: 'ru' } });
  assert.equal((await jsonOf(ord2)).error, 'unavailable', 'черновик заказать нельзя');
  // ответ про «изменилось» тоже не раскрывает цену
  assert.ok(ordBody.prod.items.every(i => i.id !== 'n1' || i.price === 0));
  assert.ok(!JSON.stringify(await dSee(sid, A.init())).includes('30000'), 'цена на проверке не утекает клиенту');
});

await t('проверка: владелец видит товары всех дистрибьюторов, возвращает с причиной, продавец исправляет и отправляет снова', async () => {
  const { sid, cur } = await modWorld();
  await dPut(sid, { cats: cur.cats, items: cur.items.concat([NEWP('n1'), NEWP('n2', { name: 'Рис «Лазер»', cat: 'groats' })]) });
  // второй дистрибьютор
  const d2 = await addShop('Зарафшан Опт');
  await send(adminMsg(JAS2, d2.code, 3));
  const sid2 = d2.shop.id, iJ = () => initDataFor(JAS2);
  await callS(sid2, 'PUT', '/api/admin/products', { init: iJ(), body: { prod: { cats: [{ id: 'c1', name: 'Соусы', uz: 'Souslar' }], items: [NEWP('z1', { cat: 'c1', name: 'Томатная паста' })] } } });
  tgLog = [];
  await dMod(sid, {});
  await callS(sid2, 'POST', '/api/admin/submit', { init: iJ(), body: {} });
  // счётчик у владельца (список площадки) и пустой список без отправок
  const me = (await jsonOf(await call('GET', '/api/shops', { init: iS() }))).me;
  assert.equal(me.modN, 3);
  assert.equal((await jsonOf(await call('GET', '/api/shops', { init: iD() }))).me.modN, undefined, 'продавцу счётчик не нужен');
  const l = await oMod('wait');
  assert.deepEqual(l.counts, { wait: 3, ret: 0, ok: 4 });
  assert.deepEqual(l.items.map(i => [i.did === sid ? 'sid' : i.did === sid2 ? 'sid2' : '?', i.dname, i.id]).sort(), [['sid', 'Навои Фуд', 'n1'], ['sid', 'Навои Фуд', 'n2'], ['sid2', 'Зарафшан Опт', 'z1']]);   // идентификаторы случайные: порядок по ним не сравниваем
  assert.deepEqual(l.shops.map(x => [x.name, x.n]).sort(), [['Зарафшан Опт', 1], ['Навои Фуд', 2]]);
  const z = l.items.find(i => i.id === 'z1');
  assert.deepEqual([z.catName, z.price, z.ms], ['Соусы', 30000, 'wait']);
  assert.equal(l.items.find(i => i.id === 'n2').catName, 'Крупы и макароны');
  // посторонние не видят и не решают
  assert.equal((await call('GET', '/api/hub/admin/mod', { init: iD() })).status, 403);
  assert.equal((await oAct('approve', { items: [{ did: sid, id: 'n1' }] }, iD())).status, 403);
  assert.equal((await oAct('return', { did: sid, id: 'n1', reason: 'x' }, iD())).status, 403);
  assert.equal((await call('GET', '/api/hub/admin/mod', { init: newUser().init() })).status, 403);
  // вернуть без причины нельзя
  assert.equal((await oAct('return', { did: sid, id: 'n1', reason: '   ' })).status, 400);
  assert.equal((await oAct('return', { did: sid, id: 'n1' })).status, 400);
  assert.equal((await oAct('return', { did: 'nosuch', id: 'n1', reason: 'x' })).status, 404);
  assert.equal((await oAct('return', { did: sid, id: 'nope', reason: 'x' })).status, 404);
  tgLog = [];
  const reason = 'Нет фото. Неверная цена: проверьте за коробку';
  assert.equal((await oAct('return', { did: sid, id: 'n1', reason })).status, 200);
  const tg = tgLog.filter(x => x.method === 'sendMessage');
  assert.equal(tg.length, 1);
  assert.equal(tg[0].payload.chat_id, DIL.id, 'сообщение продавцу дистрибьютора, а не другому');
  assert.ok(tg[0].payload.text.startsWith('↩️ «Oltin yogʻ» mahsuloti qayta ishlash uchun qaytarildi.') && tg[0].payload.text.includes('\n\n↩️ Товар «Масло «Золотое»» возвращён') && tg[0].payload.text.split(reason).length === 3, tg[0].payload.text);
  // у продавца: «нужно исправить» с причиной; в списке владельца — в «Возвращены»
  const mine = (await dSee(sid, iD())).items.find(i => i.id === 'n1');
  assert.deepEqual([mine.ms, mine.mc], ['ret', reason]);
  assert.deepEqual((await oMod('wait')).counts, { wait: 2, ret: 1, ok: 4 });
  const rl = await oMod('ret');
  assert.deepEqual(rl.items.map(i => [i.id, i.mc]), [['n1', reason]]);
  assert.equal((await call('GET', '/api/shops', { init: iS() }).then(jsonOf)).me.modN, 2);
  // повторно вернуть то, что не ждёт проверки, нельзя; а вот уже возвращённый можно переписать
  assert.equal((await oAct('return', { did: sid, id: 'p1', reason: 'x' })).status, 409);
  // продавец правит и отправляет снова: причина очищается, статус «ждёт»
  const fix = (await dSee(sid, iD())); fix.items.find(i => i.id === 'n1').price = 31000;
  assert.equal((await jsonOf(await dPut(sid, fix))).prod.items.find(i => i.id === 'n1').ms, 'ret', 'правка не снимает «нужно исправить»');
  tgLog = [];
  const re = await jsonOf(await dMod(sid, { ids: ['n1'] }));
  assert.equal(re.sent, 1);
  const n1 = re.prod.items.find(i => i.id === 'n1');
  assert.deepEqual([n1.ms, n1.mc], ['wait', undefined]);
  assert.equal(tgLog.filter(x => x.method === 'sendMessage').pop().payload.text, modMsg(1));
  assert.deepEqual((await oMod('wait')).counts, { wait: 3, ret: 0, ok: 4 });
});

await t('проверка: одобрение — товар появляется у клиентов с ценой; «одобрить все» по нескольким дистрибьюторам; продавцам одно сообщение', async () => {
  const { sid, cur } = await modWorld();
  const A = newUser();
  await dPut(sid, { cats: cur.cats, items: cur.items.concat([NEWP('n1'), NEWP('n2', { name: 'Рис «Лазер»', cat: 'groats' }), NEWP('n3', { name: 'Гречка' })]) });
  const d2 = await addShop('Зарафшан Опт');
  await send(adminMsg(JAS2, d2.code, 3));
  const sid2 = d2.shop.id, iJ = () => initDataFor(JAS2);
  await callS(sid2, 'PUT', '/api/admin/products', { init: iJ(), body: { prod: { cats: [{ id: 'c1', name: 'Соусы', uz: '' }], items: [NEWP('z1', { cat: 'c1', name: 'Томатная паста' })] } } });
  await dMod(sid, {}); await callS(sid2, 'POST', '/api/admin/submit', { init: iJ(), body: {} });
  tgLog = [];
  // один товар
  let r = await jsonOf(await oAct('approve', { items: [{ did: sid, id: 'n1' }] }));
  assert.deepEqual([r.ok, r.n], [true, 1]);
  let msgs = tgLog.filter(x => x.method === 'sendMessage');
  assert.equal(msgs.length, 1);
  assert.deepEqual([msgs[0].payload.chat_id, msgs[0].payload.text], [DIL.id, '✅ «Oltin yogʻ» mahsuloti tasdiqlandi va katalogda paydo boʻldi.\n\n✅ Товар «Масло «Золотое»» одобрен и появился в каталоге.']);
  const seen = (await dSee(sid, A.init())).items.find(i => i.id === 'n1');
  assert.deepEqual([seen.price, seen.ms, seen.ma === undefined], [30000, undefined, false]);
  // теперь его можно заказать
  const ok = await callS(sid, 'POST', '/api/order', { init: A.init(), body: { cart: [{ id: 'n1', qty: 2 }], form: formFor(S.DEFAULT, 'pickup', {}), lang: 'ru' } });
  assert.equal(ok.status, 200);
  assert.equal((await jsonOf(ok)).order.total, 60000);
  // «одобрить все» из двух дистрибьюторов; неверные записи пропускаются, уже одобренные не считаются
  tgLog = [];
  r = await jsonOf(await oAct('approve', { items: [{ did: sid, id: 'n2' }, { did: sid, id: 'n3' }, { did: sid, id: 'n1' }, { did: sid2, id: 'z1' }, { did: sid, id: 'p1' }, { did: 'nosuch', id: 'x' }, { did: sid, id: '../x' }] }));
  assert.equal(r.n, 3);
  msgs = tgLog.filter(x => x.method === 'sendMessage');
  assert.deepEqual(msgs.map(m => m.payload.chat_id).sort(), [DIL.id, JAS2.id].sort(), 'каждому продавцу по одному сообщению');
  const apT = msgs.find(m => m.payload.chat_id === DIL.id).payload.text;
  assert.ok(apT.startsWith('✅ Tasdiqlandi: 2 ta mahsulot') && apT.includes('\n\n✅ Одобрено: 2 товара') && apT.includes('• Рис «Лазер»'), apT);
  assert.deepEqual((await oMod('wait')).counts, { wait: 0, ret: 0, ok: 8 });
  assert.deepEqual((await oMod('wait')).items, []);
  const okl = await oMod('ok');
  assert.equal(okl.items.length, 8); assert.ok(okl.items.every(i => i.ma && !i.ms));
  assert.equal((await call('GET', '/api/shops', { init: iS() }).then(jsonOf)).me.modN, 0);
  // список площадки: теперь у дистрибьютора 7 товаров
  assert.equal((await jsonOf(await call('GET', '/api/shops'))).shops.find(x => x.id === sid).items, 7);
});

await t('проверка: владелец правит товар сам, статус остаётся; фото владельца; чужого не трогает', async () => {
  const { sid, cur } = await modWorld();
  await dPut(sid, { cats: cur.cats, items: cur.items.concat([NEWP('n1')]) });
  await dMod(sid, {});
  const it = { name: 'Масло «Золотое» 1 л', uz: 'Oltin yogʻ 1 l', desc: 'Рафинированное', cat: 'groats', price: 33000, amount: 1, unit: 'l', tiers: [{ n: 10, price: 31000 }], box: 12, ms: 'ok', pv: 'EVIL', price_x: 1 };
  let r = await oAct('edit', { did: sid, id: 'n1', item: it });
  assert.equal(r.status, 200);
  const got = (await jsonOf(r)).item;
  assert.deepEqual([got.name, got.cat, got.price, got.box, got.tiers.length, got.ms, got.pv], ['Масло «Золотое» 1 л', 'groats', 33000, 12, 1, 'wait', '']);
  assert.equal((await oAct('edit', { did: sid, id: 'nope', item: it })).status, 404);
  assert.equal((await oAct('edit', { did: sid, id: 'n1', item: it }, iD())).status, 403);
  // фото: три места, как у продавца
  const ph = (n, bytes, del) => call(del ? 'DELETE' : 'PUT', '/api/hub/admin/mod/photo?did=' + sid + '&id=n1&n=' + n, { init: iS(), body: bytes });
  r = await ph(1, jpegBytes(800, 600, 5000));
  assert.equal(r.status, 200);
  const v = await jsonOf(r);
  assert.ok(v.pv && !v.pv2);
  assert.equal((await ph(3, jpegBytes())).status, 400, 'через пропуск нельзя');
  assert.equal((await ph(2, jpegBytes())).status, 200);
  assert.equal((await ph(1, new Uint8Array(500).fill(3))).status, 400, 'не картинка');
  assert.equal((await ph(2, null, true)).status, 200);
  assert.equal((await oMod('wait')).items[0].pv, v.pv);
  assert.equal((await call('PUT', '/api/hub/admin/mod/photo?did=' + sid + '&id=n1&n=1', { init: iD(), body: jpegBytes() })).status, 403);
  assert.equal((await call('PUT', '/api/hub/admin/mod/photo?did=nosuch&id=n1&n=1', { init: iS(), body: jpegBytes() })).status, 404);
  // правка владельца не снимает статус «ждёт проверки», пока он сам не одобрит
  assert.equal((await oMod('wait')).items.length, 1);
});

await t('проверка: прайс из Excel у дистрибьютора — новые строки сразу «ждут проверки», у владельца — сразу одобрены', async () => {
  const { sid } = await modWorld();
  tgLog = [];
  const fx = 'price-openpyxl.xlsx';
  const r = await callS(sid, 'POST', '/api/admin/import?apply=1', { init: iD(), body: FIX(fx), headers: { 'content-type': 'application/octet-stream' } });
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.applied, true);
  const added = d.prod.items.filter(i => !['p1', 'p2', 'p3', 'p4'].includes(i.id));
  assert.ok(added.length >= 1, 'в прайсе есть новые товары');
  assert.ok(added.every(i => i.ms === 'wait'), 'новые строки сразу ждут проверки');
  assert.ok(d.prod.items.filter(i => ['p1', 'p2', 'p3', 'p4'].includes(i.id)).every(i => !i.ms), 'обновлённые прежние товары остаются одобренными');
  const tgs = tgLog.filter(x => x.method === 'sendMessage');
  assert.equal(tgs.length, 1);
  assert.equal(tgs[0].payload.text, modMsg(added.length));
  assert.equal((await dSee(sid)).items.filter(i => i.ms === 'wait').every(i => i.price === 0), true);
  assert.equal((await oMod('wait')).counts.wait, added.length);
});

await t('база: первый заказ сам добавляет магазин, повторные заказы и второй дистрибьютор дублей не создают', async () => {
  const { sid } = await shopWorld();
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const A = newUser(), B = newUser(), C = newUser();
  const madina = { name: 'Магазин Мадина', phone: '+998 90 111 22 33' };
  await ordBase(sid, A, madina, 'delivery');
  let d = await baseGet();
  assert.equal(d.total, 1);
  assert.deepEqual([d.items[0].name, d.items[0].phone, d.items[0].terr, d.items[0].chk, d.items[0].app, d.items[0].src], ['Магазин Мадина', '+998 90 111 22 33', '', false, true, 'order']);
  assert.equal(d.items[0].addr, 'Навои, ул. Галаба 12, склад 3');
  assert.equal(d.unchk, 1);
  // повторный заказ и заказ у другого дистрибьютора: дубля нет
  await ordBase(sid, A, madina);
  await ordBase('main', A, madina);
  assert.equal((await baseGet()).total, 1);
  // сотрудник того же магазина (другой аккаунт, тот же номер в другой записи): привязывается к той же записи
  await ordBase('main', B, { name: 'Мадина', phone: '+998 (90) 111-22-33' });
  assert.equal((await baseGet()).total, 1);
  assert.equal((await meHub(B)).card.name, 'Магазин Мадина');
  // другой магазин — новая запись
  await ordBase('main', C, { name: 'Дастур', phone: '+998 93 777 88 99' });
  d = await baseGet();
  assert.deepEqual(d.items.map(x => x.name), ['Дастур', 'Магазин Мадина']);
  // форма заказа подставляется из базы: карточка приходит владельцу аккаунта
  const card = (await meHub(A)).card;
  assert.deepEqual([card.name, card.phone, card.ver], ['Магазин Мадина', '+998 90 111 22 33', 0]);
  assert.equal((await meHub(newUser())).card, undefined, 'у того, кого нет в базе, карточки нет');
  // заказ без нормального телефона/названия базу не меняет: проверяется самим заказом
  assert.equal((await baseGet()).total, 2);
});

await t('база: агент входит по коду, правит и проверяет записи своей зоны, добавляет новых; повторы запрещены', async () => {
  const { sid } = await shopWorld();
  const A = newUser();
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои', 'Кармана', 'Зарафшан'] }));
  const id = n => t1.terr.find(x => x.name === n).id;
  assert.deepEqual(t1.terr.map(x => x.name), ['Навои', 'Кармана', 'Зарафшан']);
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [id('Навои')] }));
  assert.match(made.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.ok(!JSON.stringify([...W.hubStorage.m.entries()]).includes(made.code), 'код лежит только в виде хэша');
  // без входа по коду агентом не стать
  assert.equal((await baseGet('', iG())).error, 'forbidden');
  assert.equal((await meHub(AGT)).agent, undefined);
  await send(agentMsg(AGT, 'wrong-wrong-wrong', 1));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'));
  tgLog = [];
  await send(agentMsg(AGT, made.code, 2));
  assert.ok(lastTg('deleteMessage', p => p.message_id === 2), 'сообщение с кодом удалено');
  const hello = lastTg('sendMessage').payload;
  assert.ok(hello.text.includes('вы агент «Азиз»') && hello.text.includes('Навои'));
  assert.equal(hello.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?v=base');
  const me = await meHub(AGT);
  assert.deepEqual([me.agent.name, me.agent.terr], ['Азиз', [id('Навои')]]);
  assert.match(me.agent.link, /\?start=a_a[a-z0-9]+$/);
  assert.equal(me.owner, false);

  // магазин, оформивший заказ, виден агенту (без территории), как «не проверен»
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33' }, 'delivery');
  let d = await baseGet('', iG());
  assert.deepEqual([d.role, d.total, d.unchk, d.mine], ['agent', 1, 1, [id('Навои')]]);
  const rec = d.items[0];
  // агент исправляет данные после визита: запись проверена, магазин получит исправление
  let r = await baseSend('PUT', '/' + rec.id, { name: 'Мадина маркет', phone: '+998 90 111 22 34', terr: id('Навои') }, iG());
  assert.equal(r.status, 200);
  let it = (await jsonOf(r)).item;
  assert.deepEqual([it.name, it.phone, it.terr, it.chk, it.agent], ['Мадина маркет', '+998 90 111 22 34', id('Навои'), true, made.agentId]);
  assert.deepEqual([(await meHub(A)).card.name, (await meHub(A)).card.ver], ['Мадина маркет', 1]);
  assert.equal((await baseGet('', iG())).unchk, 0);
  // правка заметки версию карточки не меняет
  assert.equal((await baseSend('PUT', '/' + rec.id, { note: 'Директор Алишер, работает до 18:00', st: 'talk' }, iG())).status, 200);
  assert.equal((await meHub(A)).card.ver, 1);
  // чужая территория и пустая территория при наличии списка — нельзя
  assert.deepEqual([(await baseSend('PUT', '/' + rec.id, { terr: id('Кармана') }, iG())).status], [400]);
  assert.equal((await jsonOf(await baseSend('PUT', '/' + rec.id, { terr: '' }, iG()))).error, 'need_terr');
  assert.equal((await jsonOf(await baseSend('PUT', '/' + rec.id, { terr: 'tzzzz' }, iG()))).error, 'bad_terr');
  assert.equal((await jsonOf(await baseSend('PUT', '/' + rec.id, { phone: '12' }, iG()))).error, 'bad_phone');
  assert.equal((await jsonOf(await baseSend('PUT', '/' + rec.id, { name: 'Я' }, iG()))).error, 'bad_name');
  assert.equal((await jsonOf(await baseSend('PUT', '/' + rec.id, { st: 'x' }, iG()))).error, 'bad_request');

  // новый магазин, которого ещё нет в базе
  r = await baseSend('POST', '', { name: 'Дастур', phone: '+998 93 111 22 33', addr: 'Навои, Галаба 5', terr: id('Навои'), note: 'Зайти в пятницу' }, iG());
  assert.equal(r.status, 200);
  const dast = (await jsonOf(r)).item;
  assert.deepEqual([dast.chk, dast.app, dast.agent, dast.src, dast.st], [true, false, made.agentId, 'agent', 'new']);
  // повторно добавить нельзя: тот же телефон в любой записи, то же название по тому же адресу, телефон уже существующего клиента
  for (const dup of [
    { name: 'Другое', phone: '93 111 22 33', terr: id('Навои') },
    { name: 'ДАСТУР', phone: '+998 94 000 00 01', addr: 'навои, галаба  5', terr: id('Навои') },
    { name: 'Мадина', phone: '+998 90 111 22 34', terr: id('Навои') }
  ]) {
    r = await baseSend('POST', '', dup, iG());
    assert.equal(r.status, 409, JSON.stringify(dup));
    const e = await jsonOf(r);
    assert.equal(e.error, 'dup');
    assert.equal(e.exists.mine, true);
  }
  assert.equal((await jsonOf(await baseSend('POST', '', { name: 'Дастур', phone: '+998 94 000 00 02', addr: 'Навои, Другая 7', terr: id('Навои') }, iG()))).item.name, 'Дастур', 'то же название по другому адресу — другой магазин');
  // нельзя переименовать/сменить телефон на уже занятый
  assert.equal((await jsonOf(await baseSend('PUT', '/' + dast.id, { phone: '+998 90 111 22 34' }, iG()))).error, 'dup');
  // обязательные поля и территория при создании
  assert.equal((await jsonOf(await baseSend('POST', '', { name: 'Без телефона', terr: id('Навои') }, iG()))).error, 'bad_phone');
  assert.equal((await jsonOf(await baseSend('POST', '', { phone: '+998 95 123 45 67', terr: id('Навои') }, iG()))).error, 'bad_name');
  assert.equal((await jsonOf(await baseSend('POST', '', { name: 'Новый', phone: '+998 95 123 45 67' }, iG()))).error, 'need_terr');
  assert.equal((await jsonOf(await baseSend('POST', '', { name: 'Новый', phone: '+998 95 123 45 67', terr: id('Кармана') }, iG()))).error, 'bad_terr');

  // чужая зона не видна и не правится
  const far = (await jsonOf(await baseSend('POST', '', { name: 'Карманский', phone: '+998 97 555 66 77', terr: id('Кармана'), addr: 'Кармана' }))).item;   // владелец
  d = await baseGet('', iG());
  assert.ok(!d.items.some(x => x.id === far.id), 'магазин другой территории агенту не виден');
  assert.equal((await baseSend('PUT', '/' + far.id, { note: 'x' }, iG())).status, 403);
  assert.equal((await baseSend('DELETE', '/' + far.id, undefined, iG())).status, 403);
  // удалять агент может только свои записи без привязки к приложению
  assert.equal((await baseSend('DELETE', '/' + rec.id, undefined, iG())).status, 403, 'магазин, который уже заказывал, остаётся');
  assert.equal((await baseSend('DELETE', '/' + dast.id, undefined, iG())).status, 200);
  assert.equal((await baseSend('DELETE', '/' + dast.id, undefined, iG())).status, 404);
  assert.equal((await baseSend('POST', '', { name: 'Дастур', phone: '+998 93 111 22 33', addr: 'Навои, Галаба 5', terr: id('Навои') }, iG())).status, 200, 'после удаления можно добавить снова');
  // клиент базу не видит и не правит
  assert.equal((await call('GET', '/api/hub/base', { init: A.init() })).status, 403);
  assert.equal((await call('POST', '/api/hub/base', { init: A.init(), body: { name: 'Х', phone: '+998 90 000 00 00' } })).status, 403);
  assert.equal((await call('GET', '/api/hub/base')).status, 401);
  // выключенный агент теряет доступ
  assert.equal((await adm('PUT', '/agents/' + made.agentId, { on: false })).status, 200);
  assert.equal((await call('GET', '/api/hub/base', { init: iG() })).status, 403);
  assert.equal((await meHub(AGT)).agent, undefined);
  await adm('PUT', '/agents/' + made.agentId, { on: true });
  assert.equal((await baseGet('', iG())).role, 'agent');
});

await t('агенты: владелец удаляет агента: доступ закрыт, магазины остаются в базе без агента, код больше не работает', async () => {
  const { sid } = await shopWorld();
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои'] }));
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [t1.terr[0].id] }));
  await send(agentMsg(AGT, made.code, 40));
  assert.equal((await baseGet('', iG())).role, 'agent');
  const r = await baseSend('POST', '', { name: 'Дастур', phone: '+998 93 111 22 33', addr: 'Навои, Галаба 5', terr: t1.terr[0].id }, iG());
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/hub/admin/people', { init: iS() }))).agents[0].n, 1);
  // чужой аккаунт удалять не может
  assert.equal((await adm('DELETE', '/agents/' + made.agentId, null, iA())).status, 403);
  const del = await adm('DELETE', '/agents/' + made.agentId);
  assert.equal(del.status, 200);
  const st = await jsonOf(del);
  assert.equal(st.agents.length, 0, 'агента в списке нет');
  assert.equal((await call('GET', '/api/hub/base', { init: iG() })).status, 403, 'доступ закрыт сразу');
  assert.equal((await meHub(AGT)).agent, undefined);
  // его магазин остался в базе, но уже без агента
  const rows = (await baseGet('')).items;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Дастур');
  assert.equal(rows[0].agent, '');
  // прежний код не работает, повторное удаление — понятная ошибка
  tgLog = [];
  await send(agentMsg(AGT, made.code, 41));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'));
  assert.equal((await adm('DELETE', '/agents/' + made.agentId)).status, 404);
  // можно завести заново с тем же именем
  const again = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [t1.terr[0].id] }));
  assert.equal(again.agents.length, 1);
});

await t('база: поиск, территории, проверка и страницы; дистрибьютор видит всех, но без заметок и отказавшихся', async () => {
  const { sid } = await shopWorld();
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои', 'Кармана'] }));
  const tn = t1.terr[0].id, tk = t1.terr[1].id;
  const mk = async (i, over) => {
    const r = await baseSend('POST', '', Object.assign({ name: 'Магазин ' + String(i).padStart(3, '0'), phone: '+998 90 ' + String(100 + i).padStart(3, '0') + ' ' + String(10 + (i % 80)) + ' 00', addr: 'Адрес ' + i, terr: tn }, over || {}));
    assert.equal(r.status, 200, 'создание ' + i + ': ' + JSON.stringify(await r.clone().json()));
    return (await jsonOf(r)).item;
  };
  for (let i = 1; i <= 55; i++) await mk(i);
  const karm = await mk(56, { terr: tk, name: 'Карманский базар', note: 'внутренняя заметка' });
  const ref = await mk(57, { name: 'Отказник' });
  await baseSend('PUT', '/' + ref.id, { st: 'refuse', note: 'отказался' });
  let d = await baseGet();
  assert.deepEqual([d.total, d.all, d.items.length, d.more], [57, 57, 50, true]);
  assert.deepEqual(d.counts, { [tn]: 56, [tk]: 1 });
  const d2 = await baseGet('?off=50');
  assert.deepEqual([d2.items.length, d2.more], [7, false]);
  assert.equal(new Set(d.items.concat(d2.items).map(x => x.id)).size, 57, 'страницы не пересекаются и ничего не теряют');
  // фильтры
  assert.deepEqual((await baseGet('?terr=' + tk)).items.map(x => x.name), ['Карманский базар']);
  assert.equal((await baseGet('?terr=-')).total, 0, 'без территории никого нет');
  assert.equal((await baseGet('?f=refuse')).total, 1);
  assert.equal((await baseGet('?f=chk')).total, 0, 'все проверены (внесены агентом)');
  assert.deepEqual((await baseGet('?q=' + encodeURIComponent('базар'))).items.map(x => x.name), ['Карманский базар']);
  assert.deepEqual((await baseGet('?q=' + encodeURIComponent('адрес 7'))).items.map(x => x.name), ['Магазин 007'], 'поиск по адресу');
  // поиск по телефону: с кодом страны, без него и кусочком
  for (const q of ['+998 90 156', '90 156 66', '9015666']) assert.deepEqual((await baseGet('?q=' + encodeURIComponent(q))).items.map(x => x.name), ['Карманский базар'], q);
  assert.equal((await baseGet('?q=' + encodeURIComponent('99'))).total, 0, 'две цифры по телефону не ищем: слишком много случайных совпадений');
  // магазин из заказа без территории
  await ordBase(sid, newUser(), { name: 'Новый из заказа', phone: '+998 91 999 88 77' });
  assert.equal((await baseGet('?terr=-')).total, 1);
  assert.equal((await baseGet('?f=chk')).total, 1);
  // дистрибьютор: читает всех, кроме отказавшихся, без заметок, статусов и агентов; менять не может
  const dv = await baseGet('', iD());
  assert.deepEqual([dv.role, dv.total, dv.all], ['dist', 57, 57]);
  const kk = (await baseGet('?terr=' + tk, iD())).items[0];
  assert.deepEqual(Object.keys(kk).sort(), ['addr', 'app', 'id', 'name', 'phone', 'terr']);
  assert.ok(!JSON.stringify(dv).includes('внутренняя') && !JSON.stringify(dv).includes('отказался') && !dv.items.some(x => x.name === 'Отказник'));
  assert.ok(!('agents' in dv) && !('unchk' in dv));
  assert.equal((await baseGet('?f=refuse', iD())).total, 57, 'фильтр статусов дистрибьютору недоступен');
  for (const [m, pth, b] of [['POST', '', { name: 'Х', phone: '+998 90 000 00 00' }], ['PUT', '/' + karm.id, { note: 'x' }], ['DELETE', '/' + karm.id]]) assert.equal((await baseSend(m, pth, b, iD())).status, 403, m);
  // владелец: видит агентов
  assert.ok(Array.isArray((await baseGet()).agents));
});

await t('база: фильтры «новые», «в приложении», агент и порядок «сначала новые»; районы считаются с учётом фильтров', async () => {
  const { sid } = await shopWorld();
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои', 'Кармана'] }));
  const tn = t1.terr[0].id, tk = t1.terr[1].id;
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [tn] }));
  await send(agentMsg(AGT, made.code, 2));
  const mk = async (name, n, over) => (await jsonOf(await baseSend('POST', '', Object.assign({ name, phone: '+998 90 100 00 0' + n, addr: 'ул. ' + name }, over)))).item;
  const a = await mk('Альфа', 1, { terr: tn });
  const b = await mk('Бета', 2, { terr: tn, agent: made.agentId });
  const c = await mk('Гамма', 3, { terr: tk });
  const d = await mk('Дельта', 4, { terr: tk, agent: made.agentId });
  assert.equal((await baseSend('PUT', '/' + b.id, { st: 'talk' })).status, 200);
  assert.equal((await baseSend('PUT', '/' + d.id, { st: 'refuse' })).status, 200);
  await ordBase(sid, newUser(), { name: 'Эпсилон', phone: '+998 91 100 00 05' });
  // сохранённое время создания делаем разным, чтобы порядок «сначала новые» не зависел от скорости теста
  for (const [x, day] of [[a, 1], [b, 2], [c, 3], [d, 4]]) { const r = await W.hubStorage.get('b:' + x.id); r.created = '2026-11-0' + day + 'T10:00:00.000Z'; await W.hubStorage.put('b:' + x.id, r); }
  const eps = (await baseGet('?q=' + encodeURIComponent('Эпсилон'))).items[0];
  { const r = await W.hubStorage.get('b:' + eps.id); r.created = '2026-11-05T10:00:00.000Z'; await W.hubStorage.put('b:' + eps.id, r); }
  const nm = async (qs, init) => (await baseGet(qs, init)).items.map(x => x.name);
  assert.equal((await baseGet()).total, 5);
  assert.deepEqual(await nm('?f=new'), ['Альфа', 'Гамма', 'Эпсилон'], 'статус «Новый»');
  assert.deepEqual(await nm('?f=talk'), ['Бета']);
  assert.deepEqual(await nm('?f=refuse'), ['Дельта']);
  assert.deepEqual(await nm('?f=app'), ['Эпсилон'], 'в приложении — те, у кого есть аккаунт');
  assert.deepEqual(await nm('?f=chk'), ['Эпсилон'], 'не проверен — из заказа');
  // агент
  assert.deepEqual(await nm('?ag=' + made.agentId), ['Бета', 'Дельта']);
  assert.deepEqual(await nm('?ag=-'), ['Альфа', 'Гамма', 'Эпсилон'], 'без агента');
  // фильтры складываются
  assert.deepEqual(await nm('?f=refuse&ag=' + made.agentId), ['Дельта']);
  assert.deepEqual(await nm('?f=talk&ag=-'), []);
  assert.deepEqual(await nm('?f=new&terr=' + tk), ['Гамма']);
  assert.deepEqual(await nm('?f=new&ag=-&q=' + encodeURIComponent('аль')), ['Альфа']);
  // порядок
  assert.deepEqual(await nm('?sort=new'), ['Эпсилон', 'Дельта', 'Гамма', 'Бета', 'Альфа'], 'сначала новые');
  assert.deepEqual(await nm(''), ['Альфа', 'Бета', 'Гамма', 'Дельта', 'Эпсилон'], 'по умолчанию по названию');
  assert.deepEqual(await nm('?sort=new&terr=' + tk), ['Дельта', 'Гамма']);
  // районы считаются с учётом статуса, агента и поиска, но не района
  assert.deepEqual((await baseGet()).counts, { [tn]: 2, [tk]: 2, '': 1 });
  assert.deepEqual((await baseGet('?f=new')).counts, { [tn]: 1, [tk]: 1, '': 1 });
  assert.deepEqual((await baseGet('?ag=' + made.agentId)).counts, { [tn]: 1, [tk]: 1 });
  assert.deepEqual((await baseGet('?q=' + encodeURIComponent('Гамма'))).counts, { [tk]: 1 });
  const ft = await baseGet('?f=new&terr=' + tk);
  assert.deepEqual([ft.total, ft.all, ft.counts], [1, 5, { [tn]: 1, [tk]: 1, '': 1 }], 'выбор района не меняет счётчики районов');
  assert.equal((await baseGet('?f=app')).unchk, 1);
  // агент: только своя зона; фильтр по другому агенту ему не нужен и игнорируется; «в приложении» работает
  const ag = await baseGet('', iG());
  assert.deepEqual(ag.items.map(x => x.name), ['Альфа', 'Бета', 'Дельта', 'Эпсилон'], 'агент не видит Кармана без своих');
  assert.deepEqual((await baseGet('?ag=-', iG())).items.map(x => x.name), ['Альфа', 'Бета', 'Дельта', 'Эпсилон'], 'агент не выбирает агентов');
  assert.deepEqual((await baseGet('?f=app', iG())).items.map(x => x.name), ['Эпсилон']);
  assert.deepEqual((await baseGet('?f=talk&terr=' + tn, iG())).items.map(x => x.name), ['Бета']);
  assert.deepEqual((await baseGet('?sort=new', iG())).items.map(x => x.name), ['Эпсилон', 'Дельта', 'Бета', 'Альфа']);
  assert.ok(!('agents' in ag));
  // дистрибьютор: статусы, «в приложении» и агента не выбирает; район, поиск и порядок работают; отказавшихся не видит
  assert.deepEqual((await baseGet('?f=app&ag=-', iD())).items.map(x => x.name), ['Альфа', 'Бета', 'Гамма', 'Эпсилон']);
  assert.deepEqual((await baseGet('?terr=' + tk, iD())).items.map(x => x.name), ['Гамма']);
  assert.deepEqual((await baseGet('', iD())).counts, { [tn]: 2, [tk]: 1, '': 1 });
  assert.deepEqual((await baseGet('?sort=new', iD())).items.map(x => x.name), ['Эпсилон', 'Гамма', 'Бета', 'Альфа']);
});

await t('база: тип точки — ставят владелец и агент, фильтр «один тип» и «не указан», числа у типов; дистрибьютор видит и фильтрует, но не меняет; колонка «Тип» в Excel', async () => {
  const { sid } = await shopWorld();
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои', 'Кармана'] }));
  const tn = t1.terr[0].id, tk = t1.terr[1].id;
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [tn] }));
  await send(agentMsg(AGT, made.code, 2));
  const mk = async (name, n, over) => (await jsonOf(await baseSend('POST', '', Object.assign({ name, phone: '+998 90 100 00 0' + n, addr: 'ул. ' + name }, over)))).item;
  const a = await mk('Альфа', 1, { terr: tn, ty: 'super' });
  const b = await mk('Бета', 2, { terr: tn, ty: 'horeca' });
  const c = await mk('Гамма', 3, { terr: tk, ty: 'super' });
  const d = await mk('Дельта', 4, { terr: tk });
  assert.deepEqual([a.ty, b.ty, c.ty, d.ty], ['super', 'horeca', 'super', undefined], 'у записи без типа поля нет');
  // неверный тип не принимается ни при добавлении, ни при правке
  assert.equal((await baseSend('POST', '', { name: 'Эта', phone: '+998 90 100 00 09', terr: tn, ty: 'bar' })).status, 400);
  assert.equal((await baseSend('POST', '', { name: 'Эта', phone: '+998 90 100 00 09', terr: tn, ty: 5 })).status, 400);
  assert.equal((await baseSend('PUT', '/' + a.id, { ty: 'zzz' })).status, 400);
  assert.equal((await baseSend('PUT', '/' + a.id, { ty: ['shop'] })).status, 400);
  assert.equal((await baseGet('?q=' + encodeURIComponent('Эта'))).total, 0, 'с неверным типом магазин не добавился');
  // смена типа не заставляет магазин править форму заказа (ver) и не трогает остальные данные
  const ver0 = (await W.hubStorage.get('b:' + a.id)).ver;
  const up = await jsonOf(await baseSend('PUT', '/' + a.id, { ty: 'whole' }));
  assert.deepEqual([up.item.ty, up.item.name, up.item.terr], ['whole', 'Альфа', tn]);
  assert.equal((await W.hubStorage.get('b:' + a.id)).ver, ver0);
  assert.equal((await jsonOf(await baseSend('PUT', '/' + a.id, { ty: '' }))).item.ty, undefined, 'пустой тип снимает значение');
  assert.equal((await jsonOf(await baseSend('PUT', '/' + a.id, { ty: 'super' }))).item.ty, 'super');
  const nm = async (qs, init) => (await baseGet(qs, init)).items.map(x => x.name);
  // фильтр: один тип, «не указан», неизвестное значение игнорируется
  assert.deepEqual(await nm('?ty=super'), ['Альфа', 'Гамма']);
  assert.deepEqual(await nm('?ty=horeca'), ['Бета']);
  assert.deepEqual(await nm('?ty=shop'), []);
  assert.deepEqual(await nm('?ty=-'), ['Дельта'], 'не указан');
  assert.deepEqual(await nm('?ty=bar'), ['Альфа', 'Бета', 'Гамма', 'Дельта'], 'неизвестный тип не фильтрует');
  assert.deepEqual(await nm('?ty=super&terr=' + tk), ['Гамма'], 'тип и район складываются');
  assert.deepEqual(await nm('?ty=super&q=' + encodeURIComponent('аль')), ['Альфа'], 'тип и поиск складываются');
  // числа у типов не зависят от выбранного типа, но учитывают район; числа районов учитывают выбранный тип
  assert.deepEqual((await baseGet()).tcounts, { '-': 1, shop: 0, super: 2, whole: 0, horeca: 1 });
  assert.deepEqual((await baseGet('?ty=super')).tcounts, { '-': 1, shop: 0, super: 2, whole: 0, horeca: 1 });
  assert.deepEqual((await baseGet('?terr=' + tn)).tcounts, { '-': 0, shop: 0, super: 1, whole: 0, horeca: 1 });
  assert.deepEqual((await baseGet('?ty=super')).counts, { [tn]: 1, [tk]: 1 });
  const ft = await baseGet('?ty=super&terr=' + tk);
  assert.deepEqual([ft.total, ft.all], [1, 4]);
  // агент: ставит тип своим магазинам, чужим нет; фильтр работает в его зоне
  assert.equal((await baseSend('PUT', '/' + b.id, { ty: 'shop' }, iG())).status, 200);
  assert.equal((await baseSend('PUT', '/' + c.id, { ty: 'shop' }, iG())).status, 403, 'вне зоны агента');
  assert.deepEqual(await nm('?ty=shop', iG()), ['Бета']);
  assert.deepEqual((await baseGet('', iG())).tcounts, { '-': 0, shop: 1, super: 1, whole: 0, horeca: 0 }, 'числа только по зоне агента');
  assert.equal((await baseSend('POST', '', { name: 'Эпсилон', phone: '+998 90 100 00 07', terr: tn, ty: 'whole' }, iG())).status, 200, 'агент добавляет с типом');
  // дистрибьютор: видит тип и фильтрует, менять не может
  const dv = await baseGet('?ty=super', iD());
  assert.deepEqual(dv.items.map(x => [x.name, x.ty]), [['Альфа', 'super'], ['Гамма', 'super']]);
  assert.deepEqual(dv.tcounts, { '-': 1, shop: 1, super: 2, whole: 1, horeca: 0 });
  assert.deepEqual(await nm('?ty=-', iD()), ['Дельта']);
  assert.equal((await baseSend('PUT', '/' + d.id, { ty: 'shop' }, iD())).status, 403);
  assert.equal((await baseSend('POST', '', { name: 'Зета', phone: '+998 90 100 00 08', ty: 'shop' }, iD())).status, 403);
  // Excel дистрибьютора: колонка «Тип» берётся из общей базы
  const u1 = newUser(), u2 = newUser();
  await ordBase(sid, u1, { name: 'Омега', phone: '+998 91 100 00 11' });
  await ordBase(sid, u2, { name: 'Сигма', phone: '+998 91 100 00 12' });
  const om = (await baseGet('?q=' + encodeURIComponent('Омега'))).items[0];
  assert.equal((await baseSend('PUT', '/' + om.id, { ty: 'whole' })).status, 200);
  const xl = async lang => { tgLog = []; assert.equal((await callS(sid, 'POST', '/api/admin/export', { init: iD(), body: { kind: 'clients', lang } })).status, 200); const rows = readXlsx(lastDoc().file.bytes)[lang === 'uz' ? 'Mijozlar' : 'Клиенты']; return { rows, col: n => rows[0].indexOf(n) }; };
  const ru = await xl('ru'), uz = await xl('uz');
  const types = x => x.rows.slice(1).map(r => String(r[x.col(x === ru ? 'Телефон' : 'Telefon')]).replace(/\D/g, '').slice(-2) + ':' + (r[x.col(x === ru ? 'Тип' : 'Turi')] || '')).sort();
  assert.deepEqual(types(ru), ['11:Оптом', '12:'], 'у магазина с типом он есть, у остальных пусто');
  assert.deepEqual(types(uz), ['11:Ulgurji', '12:']);
});

await t('база: территории и агенты — без повторов, удаляются только пустые; новый код отключает прежний аккаунт', async () => {
  await shopWorld();
  let r = await adm('POST', '/terr', { names: ['Навои', 'навои', ' Зарафшан ', 'x', 5] });
  assert.equal(r.status, 200);
  let st = await jsonOf(r);
  assert.deepEqual(st.terr.map(x => x.name), ['Навои', 'Зарафшан']);
  assert.equal((await adm('POST', '/terr', { names: ['НАВОИ'] })).status, 409);
  assert.equal((await adm('POST', '/terr', { names: [] })).status, 400);
  assert.equal((await adm('POST', '/terr', {})).status, 400);
  const [tn, tz] = st.terr.map(x => x.id);
  // переименование
  assert.equal((await adm('PUT', '/terr/' + tz, { name: 'Зарафшан город' })).status, 200);
  assert.equal((await adm('PUT', '/terr/' + tz, { name: 'навои' })).status, 409);
  assert.equal((await adm('PUT', '/terr/' + tz, { name: 'Я' })).status, 400);
  assert.equal((await adm('PUT', '/terr/tzzzz', { name: 'Любое' })).status, 404);
  // агент закреплён за территориями; несуществующие отбрасываются
  const ag = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [tn, tz, 'tqqqq', tn] }));
  assert.deepEqual(ag.agents[0].terr, [tn, tz]);
  assert.deepEqual([ag.agents[0].used, ag.agents[0].n], [false, 0]);
  // территорию с магазинами удалить нельзя; пустую можно, и из агентов она уходит
  await baseSend('POST', '', { name: 'Магазин А', phone: '+998 90 123 45 67', terr: tn });
  assert.equal((await adm('DELETE', '/terr/' + tn)).status, 409);
  assert.equal((await jsonOf(await adm('DELETE', '/terr/' + tz))).terr.length, 1);
  assert.deepEqual((await jsonOf(await adm('GET', '/people'))).agents[0].terr, [tn]);
  // агенты: коды не пересекаются с другими
  assert.equal((await adm('POST', '/agents', { name: 'Ещё', code: CODE })).status, 409, 'код владельца занят');
  assert.equal((await adm('POST', '/agents', { name: 'Ещё', code: 'short' })).status, 400);
  assert.equal((await adm('POST', '/agents', { name: 'Я' })).status, 400);
  const own = await jsonOf(await adm('POST', '/agents', { name: 'Ещё', code: 'агент-длинный-код-2026' }));
  assert.equal(own.code, 'агент-длинный-код-2026');
  assert.equal((await adm('POST', '/agents', { name: 'Третий', code: 'агент-длинный-код-2026' })).status, 409);
  assert.equal((await createShop({ name: 'Альфа', code: 'агент-длинный-код-2026' })).status, 409, 'код агента не годится дистрибьютору');
  const dcode = (await addShop('Бета')).code;
  assert.equal((await adm('POST', '/agents', { name: 'Четвёртый', code: dcode })).status, 409, 'и наоборот');
  // /agent и /admin не подменяют друг друга
  await send(agentMsg(AGT, CODE, 20));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'), 'код владельца агентом не делает');
  await send(adminMsg(AGT, own.code, 21));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'), 'код агента продавцом не делает');
  // вход, новый код отключает прежний аккаунт
  await send(agentMsg(AGT, ag.code, 22));
  assert.equal((await meHub(AGT)).agent.name, 'Азиз');
  assert.equal((await jsonOf(await adm('GET', '/people'))).agents[0].used, true);
  const re = await jsonOf(await adm('POST', '/agents/' + ag.agentId + '/code', {}));
  assert.notEqual(re.code, ag.code);
  assert.equal((await meHub(AGT)).agent, undefined, 'прежний аккаунт потерял доступ');
  assert.equal((await call('GET', '/api/hub/base', { init: iG() })).status, 403);
  await send(agentMsg(AGT2, ag.code, 23));
  assert.ok(lastTg('sendMessage').payload.text.includes('Неверный код'), 'старый код не работает');
  await send(agentMsg(AGT2, re.code, 24));
  assert.equal((await meHub(AGT2)).agent.name, 'Азиз');
  // агент и переименование/территории
  assert.equal((await adm('PUT', '/agents/' + ag.agentId, { name: 'Азиз Каримов', terr: [] })).status, 200);
  const nm2 = (await jsonOf(await adm('GET', '/people'))).agents[0];
  assert.deepEqual([nm2.name, nm2.terr], ['Азиз Каримов', []]);
  assert.equal((await adm('PUT', '/agents/' + ag.agentId, { terr: 'x' })).status, 400);
  assert.equal((await adm('PUT', '/agents/azzzzz', { on: false })).status, 404);
  // неверные коды агента закрывают ввод на час, как у /admin
  for (let i = 0; i < 8; i++) await send(agentMsg(ANNA, 'неверный-код-' + i, 40 + i));
  await send(agentMsg(ANNA, re.code, 50));
  assert.ok(lastTg('sendMessage').payload.text.includes('Слишком много'));
  // всё это только для владельца
  for (const [m, pth, b] of [['GET', '/people'], ['POST', '/terr', { names: ['Х1'] }], ['POST', '/agents', { name: 'Ага' }], ['PUT', '/agents/' + ag.agentId, { on: false }], ['POST', '/base/import', {}]]) assert.equal((await adm(m, pth, b, iA())).status, 403, m + pth);
});

await t('база: перенос клиентов дистрибьюторов — уже внесённые не дублируются, повторный перенос ничего не меняет', async () => {
  const { sid } = await shopWorld();
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const tn = (await jsonOf(await adm('POST', '/terr', { names: ['Навои'] }))).terr[0].id;
  const A = newUser(), B = newUser(), C = newUser();
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33' });
  await ordBase('main', B, { name: 'Дастур', phone: '+998 93 777 88 99', address: 'Навои, Галаба 5' }, 'delivery');
  await ordBase('main', C, { name: 'Сардор', phone: '+998 94 000 11 22' });
  assert.equal((await baseGet()).total, 3);
  // имитируем «прежних» клиентов: записи из заказов стёрты, агент внёс Мадину сам и Дастура по тому же адресу, но с другим номером
  for (const x of (await baseGet()).items) assert.equal((await baseSend('DELETE', '/' + x.id)).status, 200);
  assert.equal((await baseGet()).total, 0);
  const mad = (await jsonOf(await baseSend('POST', '', { name: 'Мадина (агент)', phone: '90 111 22 33', terr: tn, note: 'проверено' }))).item;
  const das = (await jsonOf(await baseSend('POST', '', { name: 'Дастур', phone: '+998 99 000 00 00', addr: 'Навои, Галаба 5', terr: tn }))).item;
  let r = await jsonOf(await adm('POST', '/base/import', {}));
  assert.deepEqual([r.added, r.linked], [1, 2], JSON.stringify(r));
  const d = await baseGet();
  assert.equal(d.total, 3, 'Мадина и Дастур не задвоились, добавлен только Сардор');
  const byName = n => d.items.find(x => x.name === n);
  assert.deepEqual([byName('Мадина (агент)').app, byName('Мадина (агент)').note, byName('Мадина (агент)').chk], [true, 'проверено', true], 'данные агента не затёрты, магазин привязан');
  assert.deepEqual([byName('Дастур').app, byName('Дастур').phone], [true, '+998 99 000 00 00']);
  assert.deepEqual([byName('Сардор').app, byName('Сардор').chk, byName('Сардор').src, byName('Сардор').terr], [true, false, 'import', '']);
  assert.equal((await meHub(A)).card.name, 'Мадина (агент)', 'форма заказа подставится из базы');
  // повторный перенос: ничего нового
  r = await jsonOf(await adm('POST', '/base/import', {}));
  assert.deepEqual([r.added, r.linked], [0, 0]);
  assert.equal((await baseGet()).total, 3);
  assert.deepEqual(r.state.total, 3);
  assert.ok(mad.id && das.id);
});

await t('база: личная ссылка агента закрепляет магазин за ним при первом заказе', async () => {
  const { sid } = await shopWorld();
  const ag = await jsonOf(await adm('POST', '/agents', { name: 'Азиз' }));
  const ag2 = await jsonOf(await adm('POST', '/agents', { name: 'Ботир' }));
  const [a1, a2] = ag2.agents.map(x => x.id);
  const A = newUser(), B = newUser(), C = newUser();
  let m = await say(A.u, '/start a_' + a1);
  assert.ok(m.text.length > 10 && m.reply_markup.inline_keyboard[0][0].web_app.url === HOST + '/', 'обычное приветствие с кнопкой каталога');
  await say(A.u, '/start a_' + a2);   // вторая ссылка первую не перебивает
  await say(B.u, '/start a_azzzzz');    // неизвестный агент игнорируется
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33' });
  await ordBase(sid, B, { name: 'Дастур', phone: '+998 93 777 88 99' });
  await ordBase(sid, C, { name: 'Сардор', phone: '+998 94 000 11 22' });
  const by = n => baseGet().then(d => d.items.find(x => x.name === n));
  assert.equal((await by('Магазин Мадина')).agent, a1);
  assert.equal((await by('Дастур')).agent, '');
  assert.equal((await by('Сардор')).agent, '');
  // выключенный агент ссылкой не закрепляет
  await adm('PUT', '/agents/' + a2, { on: false });
  const D = newUser();
  await say(D.u, '/start a_' + a2);
  await ordBase(sid, D, { name: 'Четвёртый', phone: '+998 95 222 33 44' });
  assert.equal((await by('Четвёртый')).agent, '');
  assert.ok(ag.code);
  // владелец видит, сколько магазинов у каждого агента
  const pe = await jsonOf(await adm('GET', '/people'));
  assert.deepEqual(pe.agents.map(x => [x.name, x.n]), [['Азиз', 1], ['Ботир', 0]]);
  assert.equal(pe.free, 4, 'четыре магазина пока без территории');
});

await t('база: район или город из заказа попадает в базу, список территорий виден клиенту, чужие значения игнорируются', async () => {
  const { sid } = await shopWorld();
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои', 'Кармана'] }));
  const id = n => t1.terr.find(x => x.name === n).id;
  const A = newUser(), B = newUser(), C = newUser();
  // названия территорий видны всем: клиент выбирает свой район в форме заказа
  const pub = await jsonOf(await call('GET', '/api/shops'));
  assert.deepEqual(pub.terrs.map(x => x.name), ['Навои', 'Кармана']);
  assert.ok(pub.terrs.every(x => Object.keys(x).sort().join() === 'id,name'));
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33', terr: id('Кармана') });
  await ordBase(sid, B, { name: 'Дастур', phone: '+998 93 777 88 99', terr: 'tzzzz' });   // не из списка владельца
  await ordBase(sid, C, { name: 'Бахор', phone: '+998 94 000 11 22' });   // район не указан
  let d = await baseGet();
  const by = n => d.items.find(x => x.name === n);
  assert.equal(by('Магазин Мадина').terr, id('Кармана'));
  assert.equal(by('Дастур').terr, '');
  assert.equal(by('Бахор').terr, '');
  assert.equal(d.items.length, 3, 'чужое значение не создаёт лишних записей');
  assert.equal((await meHub(A)).card.terr, id('Кармана'), 'выбранный район приходит в карточку для автозаполнения');
  assert.equal((await meHub(B)).card.terr, '');
  // пустой район дополняется следующим заказом, уже выбранный (в том числе агентом) не меняется
  await ordBase(sid, B, { name: 'Дастур', phone: '+998 93 777 88 99', terr: id('Навои') });
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33', terr: id('Навои') });
  d = await baseGet();
  assert.equal(by('Дастур').terr, id('Навои'));
  assert.equal(by('Магазин Мадина').terr, id('Кармана'));
  assert.equal(d.items.length, 3);
  assert.equal((await meHub(B)).card.terr, id('Навои'));
  // сотрудник того же магазина с другим аккаунтом: запись находится по телефону, район берётся из неё
  const E = newUser();
  await ordBase(sid, E, { name: 'Мадина', phone: '+998 (90) 111-22-33', terr: id('Навои') });
  assert.equal((await baseGet()).items.length, 3);
  assert.equal((await meHub(E)).card.terr, id('Кармана'));
});

/* ---------- местоположение ---------- */
await t('точка: разбор координат и ссылок на карты, расстояние', async () => {
  const P = (x, la, ln) => assert.deepEqual(S.parseGeo(x), la === null ? null : { lat: la, lng: ln }, String(x));
  P('41.5543, 60.6361', 41.5543, 60.6361);
  P('41.5543 60.6361', 41.5543, 60.6361);
  P('41,5543 60,6361', 41.5543, 60.6361);
  P('Координаты: 41.55432, 60.63611.', 41.55432, 60.63611);
  P('https://yandex.uz/maps/?ll=60.636100%2C41.554300&z=17', 41.5543, 60.6361);          // у Яндекса сначала долгота
  P('https://yandex.com/maps/?pt=60.6361,41.5543&z=17&l=map', 41.5543, 60.6361);
  P('https://www.google.com/maps/place/Foo/@41.5543,60.6361,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!7e2!8m2!3d41.5555!4d60.6666', 41.5555, 60.6666);   // метка точнее центра карты
  P('https://www.google.com/maps/@41.5543,60.6361,17z', 41.5543, 60.6361);
  P('https://maps.google.com/?q=41.5543,60.6361', 41.5543, 60.6361);
  P('https://www.google.com/maps/search/?api=1&query=41.5543%2C60.6361', 41.5543, 60.6361);
  P('https://2gis.uz/navoi?m=60.6361%2C41.5543%2F17', 41.5543, 60.6361);
  P('https://www.openstreetmap.org/?mlat=41.5543&mlon=60.6361#map=17/41.5543/60.6361', 41.5543, 60.6361);
  P('https://maps.app.goo.gl/AbCdEf', null, 0);        // короткая ссылка без координат
  P('https://yandex.uz/maps/-/CCUxyz', null, 0);
  P('hello', null, 0); P('', null, 0); P(null, null, 0); P('0, 0', null, 0); P('41.5543', null, 0);
  assert.deepEqual(S.cleanLoc({ lat: '41.55', lng: 60.1 }), { lat: 41.55, lng: 60.1 });
  assert.deepEqual(S.cleanLoc({ lat: 41.123456789, lng: 60.987654321 }), { lat: 41.12346, lng: 60.98765 }, 'пять знаков');
  for (const bad of [null, undefined, 'x', [], {}, { lat: null, lng: 1 }, { lat: '', lng: 1 }, { lat: true, lng: 1 }, { lat: 91, lng: 0 }, { lat: 0, lng: 181 }, { lat: NaN, lng: 1 }, { lat: 0, lng: 0 }]) assert.equal(S.cleanLoc(bad), null, JSON.stringify(bad));
  assert.ok(Math.abs(S.distKm({ lat: 41.55, lng: 60.63 }, { lat: 41.56, lng: 60.63 }) - 1.112) < 0.01);
  assert.equal(S.distKm({ lat: 41.55, lng: 60.63 }, { lat: 41.55, lng: 60.63 }), 0);
  assert.equal(S.mapUrl('y', { lat: 41.5, lng: 60.6 }), 'https://yandex.com/maps/?pt=60.6,41.5&z=17&l=map');
  assert.equal(S.mapUrl('g', { lat: 41.5, lng: 60.6 }), 'https://www.google.com/maps/search/?api=1&query=41.5,60.6');
});

await t('точка в заказе: хранится в заказе, неверная отбрасывается, продавцу — кнопки карт, в базу идёт только предложением', async () => {
  const { sid } = await shopWorld();
  const A = newUser(), B = newUser(), C = newUser();
  tgLog = [];
  const o = await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33', loc: { lat: 41.55432123, lng: '60.63611' } });
  assert.deepEqual(o.order.loc, { lat: 41.55432, lng: 60.63611 }, 'округляется до пяти знаков');
  const ao = (await jsonOf(await callS(sid, 'GET', '/api/admin/orders', { init: iD() }))).orders;
  assert.deepEqual(ao[0].loc, { lat: 41.55432, lng: 60.63611 }, 'продавец видит точку заказа');
  const card = tgLog.filter(x => x.method === 'sendMessage' && x.payload.chat_id === DIL.id)[0].payload;
  assert.deepEqual(card.reply_markup.inline_keyboard.flat().filter(b => b.url).map(b => b.url), [S.mapUrl('y', o.order.loc), S.mapUrl('g', o.order.loc)], 'в сообщении продавцу две кнопки: Яндекс и Google');
  // неверная точка заказ не ломает
  const b1 = await ordBase(sid, B, { name: 'Дастур', phone: '+998 93 777 88 99', loc: { lat: 999, lng: 5 } });
  assert.equal(b1.order.loc, undefined);
  const c1 = await ordBase(sid, C, { name: 'Бахор', phone: '+998 94 000 11 22', loc: 'abc' });
  assert.equal(c1.order.loc, undefined);
  // без точки у заказа нет кнопок карт
  const none = tgLog.filter(x => x.method === 'sendMessage' && x.payload.chat_id === DIL.id).pop().payload;
  assert.equal(none.reply_markup.inline_keyboard.flat().some(b => b.url), false);
  // в базе точка клиента лежит предложением, сохранённой точки нет
  const d = await baseGet();
  const by = n => d.items.find(x => x.name === n);
  assert.equal(by('Магазин Мадина').loc, undefined);
  assert.deepEqual(by('Магазин Мадина').cloc, { lat: 41.55432, lng: 60.63611 });
  assert.equal(by('Дастур').cloc, undefined);
  // дистрибьютор не видит ни точки, ни предложения клиента
  const dd = await baseGet('', iD());
  assert.equal(dd.role, 'dist');
  assert.ok(dd.items.every(x => x.loc === undefined && x.cloc === undefined));
  assert.ok(!JSON.stringify([...W.hubStorage.m.entries()].filter(([k]) => k.startsWith('o:'))).includes('41.55432'), 'заказы лежат в хранилище дистрибьютора, не площадки');
});

await t('точка магазина: менять могут только владелец и агент своей зоны; клиент и дистрибьютор смотрят; предложение клиента принимается', async () => {
  const { sid } = await shopWorld();
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои', 'Кармана'] }));
  const id = n => t1.terr.find(x => x.name === n).id;
  const mk = async (name, terr, from, mid) => { const m = await jsonOf(await adm('POST', '/agents', { name, terr: [terr] })); await send(agentMsg(from, m.code, mid)); return m; };
  await mk('Азиз', id('Навои'), AGT, 21);
  await mk('Ботир', id('Кармана'), AGT2, 22);
  const A = newUser();
  const P1 = { lat: 41.55432, lng: 60.63611 };
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33', terr: id('Навои'), loc: P1 });
  let rec = (await baseGet('', iG())).items[0];
  assert.deepEqual(rec.cloc, P1);
  const put = (body, init) => baseSend('PUT', '/' + rec.id, body, init);
  // чужие не меняют: другой агент, дистрибьютор, клиент, посторонний
  assert.equal((await put({ accept: true }, iG2())).status, 403, 'агент другого района');
  assert.equal((await put({ loc: { lat: 41.6, lng: 60.7 } }, iG2())).status, 403);
  assert.equal((await put({ loc: { lat: 41.6, lng: 60.7 } }, iD())).status, 403, 'дистрибьютор');
  assert.equal((await put({ accept: true }, iD())).status, 403);
  assert.equal((await put({ loc: { lat: 41.6, lng: 60.7 } }, A.init())).status, 403, 'клиент');
  assert.equal((await put({ loc: { lat: 41.6, lng: 60.7 } }, newUser().init())).status, 403);
  assert.equal((await baseGet('', iG())).items[0].loc, undefined, 'ничего не изменилось');
  // вместе с другими полями чужой точки тоже не поставить
  assert.equal((await put({ note: 'x', loc: { lat: 41.6, lng: 60.7 } }, iD())).status, 403);
  // принять без предложения нельзя; верная точка принимается
  assert.equal((await baseSend('PUT', '/' + rec.id, { accept: true }, iG())).status, 200);
  rec = (await baseGet('', iG())).items[0];
  assert.deepEqual([rec.loc, rec.cloc], [{ lat: P1.lat, lng: P1.lng, by: 'client' }, undefined], 'принятая точка помечена «от клиента», предложение ушло');
  assert.equal((await put({ accept: true }, iG())).status, 409, 'принимать больше нечего');
  // дистрибьютор теперь видит сохранённую точку, но не её происхождение
  const dd = (await baseGet('', iD())).items[0];
  assert.deepEqual(dd.loc, P1);
  assert.equal(dd.cloc, undefined);
  // агент ставит свою точку; неверное отвергается
  const P2 = { lat: 41.5601, lng: 60.6402 };
  const r2 = await jsonOf(await put({ loc: P2 }, iG()));
  assert.deepEqual(r2.item.loc, { lat: P2.lat, lng: P2.lng, by: 'agent' });
  assert.equal((await put({ loc: { lat: 200, lng: 1 } }, iG())).status, 400);
  assert.equal((await put({ loc: 'x' }, iG())).status, 400);
  assert.equal((await put({ loc: {} }, iG())).status, 400);
  assert.deepEqual((await baseGet('', iG())).items[0].loc, { lat: P2.lat, lng: P2.lng, by: 'agent' }, 'после ошибок точка прежняя');
  // владелец тоже ставит; а правка других полей точку не трогает
  const P3 = { lat: 41.57, lng: 60.65 };
  assert.deepEqual((await jsonOf(await put({ loc: P3 }))).item.loc, { lat: P3.lat, lng: P3.lng, by: 'owner' });
  assert.deepEqual((await jsonOf(await put({ note: 'Звонить после обеда' }, iG()))).item.loc, { lat: P3.lat, lng: P3.lng, by: 'owner' });
  // клиент заказывает снова: рядом с сохранённой (до 50 м) — предложения нет; далеко — предложение
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33', loc: { lat: 41.57002, lng: 60.65002 } });
  assert.equal((await baseGet('', iG())).items[0].cloc, undefined);
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33', loc: { lat: 41.6, lng: 60.7 } });
  assert.deepEqual((await baseGet('', iG())).items[0].cloc, { lat: 41.6, lng: 60.7 });
  assert.deepEqual((await baseGet('', iG())).items[0].loc, { lat: P3.lat, lng: P3.lng, by: 'owner' }, 'сохранённая точка от заказа не меняется');
  // своя точка агента убирает устаревшее предложение; «убрать» очищает точку
  await put({ loc: P2 }, iG());
  assert.equal((await baseGet('', iG())).items[0].cloc, undefined);
  assert.equal((await jsonOf(await put({ loc: null }, iG()))).item.loc, undefined);
  assert.equal((await baseGet('', iD())).items[0].loc, undefined);
  // агент добавляет новый магазин сразу с точкой
  const cr = await jsonOf(await baseSend('POST', '', { name: 'Новый Базар', phone: '+998 91 222 33 44', addr: 'ул. Навои', terr: id('Навои'), loc: P2 }, iG()));
  assert.deepEqual(cr.item.loc, { lat: P2.lat, lng: P2.lng, by: 'agent' });
  assert.equal((await baseSend('POST', '', { name: 'Плохая Точка', phone: '+998 91 222 33 55', terr: id('Навои'), loc: { lat: 'a', lng: 1 } }, iG())).status, 400);
});

await t('точка: «ближайшие» — по расстоянию от того, кто смотрит; магазины без точки в конце; видят владелец, агент и дистрибьютор', async () => {
  const { sid } = await shopWorld();
  const mk = (name, ph, loc) => baseSend('POST', '', Object.assign({ name, phone: ph, addr: '' }, loc ? { loc } : {}));
  await mk('Дальний', '+998 90 000 00 03', { lat: 41.75, lng: 60.63 });       // ~22 км к северу
  await mk('Ближний', '+998 90 000 00 01', { lat: 41.56, lng: 60.63 });       // ~1,1 км
  await mk('Без точки', '+998 90 000 00 04');
  await mk('Средний', '+998 90 000 00 02', { lat: 41.6, lng: 60.63 });        // ~5,6 км
  const q = '?sort=near&lat=41.55&lng=60.63';
  for (const [who, init] of [['владелец', iS()], ['дистрибьютор', iD()]]) {
    const d = await baseGet(q, init);
    assert.deepEqual(d.items.map(x => x.name), ['Ближний', 'Средний', 'Дальний', 'Без точки'], who);
    assert.deepEqual(d.items.map(x => x.d), [1.1, 5.6, 22.2, undefined], who + ': расстояние в км с одним знаком');
  }
  // без координат «ближайшие» не работают: обычный порядок по названию и без расстояний
  const plain = await baseGet('?sort=near');
  assert.deepEqual(plain.items.map(x => x.name), ['Без точки', 'Ближний', 'Дальний', 'Средний']);
  assert.ok(plain.items.every(x => x.d === undefined));
  assert.equal((await baseGet('?sort=near&lat=abc&lng=1')).items[0].d, undefined, 'неверные координаты игнорируются');
  // фильтры работают вместе с «ближайшими»
  const f = await baseGet(q + '&q=ж');
  assert.deepEqual(f.items.map(x => x.name), ['Ближний']);
  // агент видит расстояние тоже
  const t1 = await jsonOf(await adm('POST', '/terr', { names: ['Навои'] }));
  const m = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [t1.terr[0].id] }));
  await send(agentMsg(AGT, m.code, 31));
  const ag = await baseGet(q, iG());
  assert.deepEqual(ag.items.map(x => x.name), ['Ближний', 'Средний', 'Дальний', 'Без точки']);
});

/* ---------- одна база на всех: клиенты дистрибьютора внутри «Базы» ---------- */
const iJ2 = () => initDataFor(JAS2);
const prof = (sid, u, body) => callS(sid, 'PUT', '/api/profile', { init: u.init(), body });
async function twoShopWorld() {
  const { sid } = await shopWorld('Альфа Трейд');
  const d2 = await addShop('Бета Опт');
  await send(adminMsg(JAS2, d2.code, 3));
  const put = await callS(d2.shop.id, 'PUT', '/api/admin/products', { init: iJ2(), body: { prod: SAMPLE_PROD() } });
  assert.equal(put.status, 200);
  await approveAll(d2.shop.id, iJ2());
  tgLog = [];
  return { sid, sid2: d2.shop.id };
}
const byName = (list, n) => list.items.find(x => x.name === n);

await t('одна база: магазин попадает в базу, когда заполнил профиль, без заказа; повторно не дублируется', async () => {
  const { sid } = await twoShopWorld();
  const u = newUser();
  assert.equal((await baseGet()).items.length, 0);
  assert.equal((await prof(sid, u, { name: 'Ромашка', phone: '+998 90 111 22 33', org: '', addrs: ['Навои, ул. Галаба 5'] })).status, 200);
  const o = await baseGet();
  assert.equal(o.items.length, 1);
  const r = byName(o, 'Ромашка');
  assert.deepEqual([r.phone, r.addr, r.app, r.chk], ['+998 90 111 22 33', 'Навои, ул. Галаба 5', true, false]);
  await prof(sid, u, { name: 'Ромашка', phone: '+998 90 111 22 33', addrs: ['Навои, ул. Галаба 5'] });
  assert.equal((await baseGet()).items.length, 1, 'повторное сохранение профиля не создаёт второй записи');
  // без телефона или с названием из одной буквы в базу не идёт
  const u2 = newUser();
  await prof(sid, u2, { name: 'Роза', phone: '' });
  await prof(sid, newUser(), { name: 'А', phone: '+998 90 222 33 44' });
  assert.equal((await baseGet()).items.length, 1);
  // дистрибьютор видит магазин в общей базе, но номера аккаунта в ответе нет
  const dl = await baseGet('', iD());
  assert.equal(dl.items.length, 1);
  assert.ok(!JSON.stringify(dl).includes('"uid"'));
  // потом тот же магазин заказывает: запись та же, не вторая
  await ordBase(sid, u, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  assert.equal((await baseGet()).items.length, 1);
});

await t('одна база: «Мои клиенты» и заказы у дистрибьютора свои, у владельца по всем дистрибьюторам', async () => {
  const { sid, sid2 } = await twoShopWorld();
  const [a, b, c] = [newUser(), newUser(), newUser()];
  await prof(sid, b, { name: 'Только профиль', phone: '+998 90 333 44 55' });
  await ordBase(sid, a, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  await ordBase(sid2, a, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  await ordBase(sid2, a, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  await ordBase(sid2, c, { name: 'Лилия', phone: '+998 90 444 55 66' });
  assert.equal((await baseGet()).items.length, 3, 'в общей базе все три магазина');
  // дистрибьютор Альфа: только те, кто заказывал у него
  const da = await baseGet('?mine=1&sh=' + sid, iD());
  assert.deepEqual(da.items.map(x => x.name), ['Ромашка']);
  assert.equal(da.items[0].m.n, 1);
  assert.equal(da.items[0].m.by, undefined, 'у дистрибьютора нет разбивки по чужим дистрибьюторам');
  assert.equal(da.sh, sid);
  // без «Мои клиенты» в списке все, но заказы считаются только его
  const all = await baseGet('?sh=' + sid, iD());
  assert.equal(all.items.length, 3);
  assert.equal(byName(all, 'Ромашка').m.n, 1);
  assert.equal(byName(all, 'Лилия').m, undefined);
  // дистрибьютор Бета: Ромашка (2 заказа у него) и Лилия
  const db = await baseGet('?mine=1&sh=' + sid2, iJ2());
  assert.deepEqual(db.items.map(x => [x.name, x.m.n]), [['Лилия', 1], ['Ромашка', 2]]);
  // чужой sh подменить нельзя: берётся свой магазин
  const fake = await baseGet('?mine=1&sh=' + sid2, iD());
  assert.deepEqual(fake.items.map(x => x.name), ['Ромашка']);
  assert.equal(fake.items[0].m.n, 1);
  // владелец видит заказы у всех
  const ow = await baseGet('?mine=1');
  assert.deepEqual(ow.items.map(x => [x.name, x.m.n]), [['Лилия', 1], ['Ромашка', 3]]);
  const rm = byName(ow, 'Ромашка').m;
  assert.deepEqual(rm.by.map(x => [x.name, x.n]).sort(), [['Альфа Трейд', 1], ['Бета Опт', 2]]);
  assert.ok(rm.last, 'есть дата последнего заказа');
  assert.equal(rm.sum, 0, 'сумма считается только по выданным: новые не в счёте');
  // агент и посторонние данных клиентов не получают
  await adm('POST', '/terr', { names: ['Навои'] });
  const ag = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [] }));
  await send(agentMsg(AGT, ag.code, 70));
  const agl = await baseGet('', iG());
  assert.ok(agl.items.every(x => x.m === undefined && x.my === undefined) && agl.sh === undefined);
  assert.equal((await call('GET', '/api/hub/base/' + all.items[0].id + '/mine', { init: iG() })).status, 403);
  assert.equal((await call('GET', '/api/hub/base/' + all.items[0].id + '/mine')).status, 401);
  assert.equal((await call('GET', '/api/hub/base/' + all.items[0].id + '/mine', { init: newUser().init() })).status, 403);
});

await t('одна база: заметка, группа и блокировка у каждого дистрибьютора свои, история заказов', async () => {
  const { sid, sid2 } = await twoShopWorld();
  const a = newUser();
  await ordBase(sid, a, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  await ordBase(sid2, a, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  const bid = byName(await baseGet(), 'Ромашка').id;
  const mine = (sh, init) => call('GET', '/api/hub/base/' + bid + '/mine?sh=' + sh, { init });
  const set = (body, init) => call('PUT', '/api/hub/base/' + bid + '/mine', { init, body });
  // Альфа ведёт свою заметку и группу
  const r1 = await set({ sh: sid, note: 'Платит в конце недели', grp: 'Магазин' }, iD());
  assert.equal(r1.status, 200);
  const r1j = await jsonOf(r1);
  assert.deepEqual([r1j.my.note, r1j.my.grp], ['Платит в конце недели', 'Магазин']);
  // Бета её не видит, у Беты своя
  const mb = await jsonOf(await mine(sid2, iJ2()));
  assert.ok(!mb.my || (!mb.my.note && !mb.my.grp), 'чужая заметка не видна');
  await set({ sh: sid2, note: 'Вежливый, звонить после 10' }, iJ2());
  const ma = await jsonOf(await mine(sid, iD()));
  assert.equal(ma.my.note, 'Платит в конце недели');
  assert.equal((await jsonOf(await mine(sid2, iJ2()))).my.note, 'Вежливый, звонить после 10');
  // владелец (продавец первого дистрибьютора) своих заметок у чужих не видит
  const mo = await jsonOf(await mine('main', iS()));
  assert.ok(!mo.my || !mo.my.note);
  // в списке «Базы» у дистрибьютора своя заметка
  assert.equal(byName(await baseGet('?sh=' + sid, iD()), 'Ромашка').my.note, 'Платит в конце недели');
  assert.equal(byName(await baseGet('?sh=' + sid2, iJ2()), 'Ромашка').my.note, 'Вежливый, звонить после 10');
  // заметка попадает в карточку заказа в Telegram
  tgLog = [];
  await ordBase(sid, a, { name: 'Ромашка', phone: '+998 90 111 22 33' });
  const card = tgLog.filter(x => x.method === 'sendMessage').map(x => x.payload.text).join('\n');
  assert.ok(card.includes('Платит в конце недели') && card.includes('Магазин'), 'заметка и группа в карточке заказа');
  // история: у дистрибьютора только его заказы, у владельца все с названием дистрибьютора
  const ha = await jsonOf(await mine(sid, iD()));
  assert.equal(ha.orders.length, 2);
  assert.ok(ha.orders.every(o => o.did === sid && o.items.length && o.total > 0) && !JSON.stringify(ha).includes('"uid"'));
  const ho = await jsonOf(await mine('main', iS()));
  assert.deepEqual(ho.orders.map(o => o.shopName).sort(), ['Альфа Трейд', 'Альфа Трейд', 'Бета Опт']);
  assert.equal(ho.m.n, 3);
  // блокировка: клиент больше не может заказать именно у этого дистрибьютора
  const bl = await set({ sh: sid, blocked: true }, iD());
  assert.equal((await jsonOf(bl)).my.blocked, true);
  const denied = await callS(sid, 'POST', '/api/order', { init: a.init(), body: { cart: CART, form: formFor(S.DEFAULT, 'pickup', { name: 'Ромашка', phone: '+998 90 111 22 33' }), lang: 'ru', expectTotal: 1394000 } });
  assert.equal(denied.status, 403);
  assert.equal((await ordBase(sid2, a, { name: 'Ромашка', phone: '+998 90 111 22 33' })).order.status, 'new', 'у другого дистрибьютора заказ проходит');
  assert.equal((await jsonOf(await set({ sh: sid, blocked: false }, iD()))).my.blocked, false);
  assert.equal((await ordBase(sid, a, { name: 'Ромашка', phone: '+998 90 111 22 33' })).order.status, 'new');
  // правила доступа
  assert.equal((await set({ sh: sid2, note: 'x' }, iD())).status, 403, 'чужой дистрибьютор не правит');
  assert.equal((await set({ sh: sid, note: 'x' }, iG())).status, 403);
  assert.equal((await set({ sh: sid, note: 'x'.repeat(600) }, iD())).status, 200, 'длинная заметка обрезается');
  assert.equal((await jsonOf(await mine(sid, iD()))).my.note.length, 500);
  assert.equal((await set({ sh: sid, grp: 'я'.repeat(50) }, iD())).status, 200);
  assert.equal((await jsonOf(await mine(sid, iD()))).my.grp.length, 30);
  assert.equal((await set({ sh: sid, note: 5 }, iD())).status, 400);
  assert.equal((await call('PUT', '/api/hub/base/bnotfound1/mine', { init: iD(), body: { sh: sid, note: 'x' } })).status, 404);
});

await t('одна база: заметка у магазина без аккаунта (добавил агент); блокировать такого нельзя; «Отказался» дистрибьютору не виден', async () => {
  const { sid } = await twoShopWorld();
  const cr = await jsonOf(await baseSend('POST', '', { name: 'Магазин у базара', phone: '+998 90 777 88 99', addr: 'Базар', st: 'new' }));
  const bid = cr.item.id;
  const set = body => call('PUT', '/api/hub/base/' + bid + '/mine', { init: iD(), body });
  const r = await set({ sh: sid, note: 'Ходит сам, без телефона' });
  assert.equal(r.status, 200);
  assert.equal((await jsonOf(r)).my.note, 'Ходит сам, без телефона');
  assert.equal((await set({ sh: sid, blocked: true })).status, 409, 'нет аккаунта: блокировать нечего');
  assert.equal(byName(await baseGet('?sh=' + sid, iD()), 'Магазин у базара').my.note, 'Ходит сам, без телефона');
  assert.deepEqual((await baseGet('?mine=1&sh=' + sid, iD())).items, [], 'не заказывал: в «Моих клиентах» его нет');
  await baseSend('PUT', '/' + bid, { st: 'refuse' });
  assert.equal((await call('GET', '/api/hub/base/' + bid + '/mine?sh=' + sid, { init: iD() })).status, 404);
  assert.equal((await set({ sh: sid, note: 'ещё' })).status, 404);
});

/* ---------- аналитика владельца: продажи по категориям, товарам и магазинам ---------- */
const anaGet = async (qs, init) => jsonOf(await call('GET', '/api/hub/admin/analytics' + (qs || ''), { init: init || iS() }));
const todayT = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
async function placeDone(sid, sellerInit, u, cart, form) {
  const r = await callS(sid, 'POST', '/api/order', { init: u.init(), body: { cart, form: formFor(S.DEFAULT, 'pickup', form), lang: 'ru', expectTotal: totalOf(cart) } });
  assert.equal(r.status, 200);
  const id = (await jsonOf(r)).order.id;
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await callS(sid, 'POST', '/api/admin/status', { init: sellerInit, body: { id, to } })).status, 200);
  return id;
}
const RM = { name: 'Ромашка', phone: '+998 90 111 22 33' }, LI = { name: 'Лилия', phone: '+998 90 444 55 66' };
async function anaWorld() {
  const w = await twoShopWorld();
  const [a, c, b] = [newUser(), newUser(), newUser()];
  await placeDone(w.sid, iD(), a, [{ id: 'p1', qty: 2 }, { id: 'p2', qty: 1 }], RM);   // 164 000 + 410 000
  await placeDone(w.sid2, iJ2(), a, [{ id: 'p2', qty: 1 }], RM);                          // 410 000
  await placeDone(w.sid2, iJ2(), a, [{ id: 'p1', qty: 1 }], RM);                          // 82 000
  await placeDone(w.sid2, iJ2(), c, [{ id: 'p1', qty: 1 }], LI);                          // 82 000
  // заказы, которые не выданы, в аналитику не входят
  await ordBase(w.sid, b, { name: 'Незавершённый', phone: '+998 90 555 66 77' });
  const x = await ordBase(w.sid2, b, { name: 'Незавершённый', phone: '+998 90 555 66 77' });
  assert.equal((await callS(w.sid2, 'POST', '/api/admin/status', { init: iJ2(), body: { id: x.order.id, to: 'cancelled' } })).status, 200);
  return w;
}
const catRow = (a, n) => a.cats.find(c => c.name === n);

await t('аналитика: только выданные заказы; категории сведены по названию у всех дистрибьюторов', async () => {
  const { sid, sid2 } = await anaWorld();
  const a = await anaGet('?days=30');
  assert.deepEqual([a.days, a.to, a.sh, a.partial, a.failed], [30, todayT(), '', false, 0]);
  assert.deepEqual(a.tot, { n: 4, sum: 1148000, shops: 2, stores: 2 }, 'невыданные и отменённые не считаются');
  assert.equal(a.cats.length, 2, 'одинаковые категории двух дистрибьюторов в одной строке');
  assert.deepEqual([catRow(a, 'Масла').n, catRow(a, 'Масла').qty, catRow(a, 'Масла').sum], [3, 4, 328000]);
  assert.deepEqual([catRow(a, 'Крупы и макароны').n, catRow(a, 'Крупы и макароны').qty, catRow(a, 'Крупы и макароны').sum], [2, 2, 820000]);
  assert.equal(a.cats.reduce((s, c) => s + c.sum, 0), a.tot.sum, 'суммы категорий дают общую сумму (скидок нет)');
  assert.equal(a.cats[0].name, 'Крупы и макароны', 'сначала то, что продано на большую сумму');
  assert.equal(a.cats[0].uz, 'Yorma va makaron');
  // товары: у каждого свой дистрибьютор, заказов / штук / сумма
  assert.equal(a.nprods, 4);
  const pr = (shop, nm) => a.prods.find(x => x.shop === shop && x.name === nm);
  assert.deepEqual([pr(sid, 'Масло подсолнечное').n, pr(sid, 'Масло подсолнечное').qty, pr(sid, 'Масло подсолнечное').sum], [1, 2, 164000]);
  assert.deepEqual([pr(sid2, 'Масло подсолнечное').n, pr(sid2, 'Масло подсолнечное').qty, pr(sid2, 'Масло подсолнечное').sum], [2, 2, 164000]);
  assert.deepEqual([pr(sid2, 'Рис').n, pr(sid2, 'Рис').qty, pr(sid2, 'Рис').sum, pr(sid2, 'Рис').shopName], [1, 1, 410000, 'Бета Опт']);
  assert.equal(a.prods[0].sum, 410000, 'по убыванию суммы');
  // магазины: сведены по записи базы, у Ромашки два дистрибьютора
  assert.equal(a.nstores, 2);
  assert.deepEqual(a.stores.map(x => [x.name, x.n, x.sum, x.nd, x.last]), [['Ромашка', 3, 1066000, 2, todayT()], ['Лилия', 1, 82000, 1, todayT()]]);
  assert.ok(!JSON.stringify(a).includes('"uid"'), 'номера аккаунтов наружу не уходят');
  assert.ok(['Альфа Трейд', 'Бета Опт'].every(n => a.shops.some(x => x.name === n)), 'в списке дистрибьюторов оба');
  assert.ok(/^\d{4}-\d\d-\d\d$/.test(a.since));
});

await t('аналитика: один дистрибьютор, период, доступ только у владельца', async () => {
  const { sid, sid2 } = await anaWorld();
  const b = await anaGet('?days=30&sh=' + sid2);
  assert.deepEqual([b.sh, b.tot.n, b.tot.sum, b.tot.shops, b.tot.stores], [sid2, 3, 574000, 1, 2]);
  assert.deepEqual([catRow(b, 'Масла').n, catRow(b, 'Масла').qty, catRow(b, 'Масла').sum], [2, 2, 164000]);
  assert.deepEqual([catRow(b, 'Крупы и макароны').n, catRow(b, 'Крупы и макароны').sum], [1, 410000]);
  assert.ok(b.prods.every(x => x.shop === sid2));
  assert.deepEqual(b.stores.map(x => [x.name, x.n, x.nd]), [['Ромашка', 2, 1], ['Лилия', 1, 1]], 'Ромашка у одного дистрибьютора: заказов 2');
  const al = await anaGet('?days=30&sh=' + sid);
  assert.deepEqual([al.tot.n, al.tot.sum, al.stores.length], [1, 574000, 1]);
  // чужой номер дистрибьютора и неверный период: все дистрибьюторы, 30 дней
  const bad = await anaGet('?days=5&sh=nope');
  assert.deepEqual([bad.days, bad.sh, bad.tot.n], [30, '', 4]);
  for (const d of [7, 90, 365]) assert.equal((await anaGet('?days=' + d)).days, d);
  assert.equal((await anaGet('?days=7')).tot.n, 4, 'сегодняшние заказы в недельном периоде');
  // доступ
  assert.equal((await call('GET', '/api/hub/admin/analytics', { init: iD() })).status, 403, 'дистрибьютор не видит');
  assert.equal((await call('GET', '/api/hub/admin/analytics', { init: newUser().init() })).status, 403);
  assert.equal((await call('GET', '/api/hub/admin/analytics')).status, 401);
  assert.equal((await call('POST', '/api/hub/admin/analytics', { init: iS(), body: {} })).status, 404);
});

await t('аналитика: удалённый товар попадает в «Без категории», за прежние дни считаются штуки и суммы без заказов', async () => {
  const { sid } = await anaWorld();
  // старый день без счёта заказов (запись сделана до появления раздела)
  const st = W.shops.get(sid).storage, old = new Date(Date.now() + 5 * 3600000 - 3 * 86400000).toISOString().slice(0, 10);
  const idx = (await st.get('rpx')) || [];
  await st.put('rp:' + old, { n: 2, sum: 200000, disc: 0, fee: 0, items: [{ id: 'p1', name: 'Масло подсолнечное', qty: 2, sum: 164000 }], cl: [] });
  await st.put('rpx', [...idx, old].sort());
  const wide = await anaGet('?days=7&sh=' + sid);
  assert.equal(wide.partial, true, 'в периоде есть дни без счёта заказов');
  assert.deepEqual([wide.tot.n, wide.tot.sum], [3, 774000]);
  assert.deepEqual([catRow(wide, 'Масла').qty, catRow(wide, 'Масла').sum, catRow(wide, 'Масла').n], [4, 328000, 1], 'штуки и суммы за все дни, заказов только за новые');
  const p1 = wide.prods.find(x => x.name === 'Масло подсолнечное');
  assert.deepEqual([p1.qty, p1.sum, p1.n], [4, 328000, 1]);
  // период короче: старый день не входит, счёт полный
  const fresh = await anaGet('?days=7&sh=' + sid);
  assert.equal(fresh.partial, true);
  await st.put('rpx', idx);
  assert.equal((await anaGet('?days=7&sh=' + sid)).partial, false, 'без старого дня счёт полный');
  // товар удалён, а его категория осталась: продажи остаются в ней, заказов и штук поровну
  const cur = (await jsonOf(await callS(sid, 'GET', '/api/config', { init: iD() }))).prod;
  const noItem = Object.assign({}, cur, { items: cur.items.filter(x => x.id !== 'p1') });
  assert.equal((await callS(sid, 'PUT', '/api/admin/products', { init: iD(), body: { prod: noItem } })).status, 200);
  const a1 = await anaGet('?days=30&sh=' + sid);
  assert.equal(catRow(a1, ''), undefined, 'категория жива: «Без категории» нет');
  assert.deepEqual([catRow(a1, 'Масла').n, catRow(a1, 'Масла').qty, catRow(a1, 'Масла').sum], [1, 2, 164000]);
  assert.ok(a1.prods.some(x => x.name === 'Масло подсолнечное' && x.qty === 2), 'товар в списке остался');
  // удалена и категория: продажи уходят в «Без категории», суммы не теряются
  const noCat = Object.assign({}, noItem, { cats: noItem.cats.filter(c => c.id !== 'oil') });
  assert.equal((await callS(sid, 'PUT', '/api/admin/products', { init: iD(), body: { prod: noCat } })).status, 200);
  const a = await anaGet('?days=30&sh=' + sid);
  assert.equal(catRow(a, 'Масла'), undefined, 'категории «Масла» больше нет');
  assert.deepEqual([catRow(a, '').n, catRow(a, '').qty, catRow(a, '').sum], [1, 2, 164000]);
  assert.deepEqual([catRow(a, 'Крупы и макароны').qty, catRow(a, 'Крупы и макароны').sum], [1, 410000]);
  assert.equal(a.cats.reduce((x, c) => x + c.sum, 0), a.tot.sum, 'сумма по строкам не потерялась');
});

await t('аналитика: площадка без продаж отвечает нулями, а не ошибкой', async () => {
  await twoShopWorld();
  const a = await anaGet('?days=30');
  assert.deepEqual([a.tot, a.cats, a.prods, a.stores, a.nprods, a.nstores, a.partial, a.failed], [{ n: 0, sum: 0, shops: 0, stores: 0 }, [], [], [], 0, 0, false, 0]);
});

/* ---------- доставка: доставщики, «Взял», касса наличных ---------- */
const DRV = { id: 7001, first_name: 'Рустам', language_code: 'ru' }, DRV2 = { id: 7002, first_name: 'Азиз', language_code: 'uz' };
const iR = () => initDataFor(DRV), iR2 = () => initDataFor(DRV2);
const PH = '+998 90 111 22 33';
/* запрос к хранилищу дистрибьютора: без sid — к первому */
const crq = (sid, method, p, init, body) => sid ? callS(sid, method, p, { init, body }) : call(method, p, { init, body });
const startMsg = (from, payload) => send({ update_id: 7000 + Math.floor(Math.random() * 1e6), message: { message_id: 1, from, chat: { id: from.id, type: 'private' }, text: '/start ' + payload } });
/* продавец заводит доставщика, человек нажимает ссылку; возвращает номер доставщика */
async function hire(user, name, sid) {
  const r = await jsonOf(await crq(sid, 'POST', '/api/admin/couriers', sid ? iD() : iS(), { name, phone: PH }));
  const m = String(r.courier.link).match(/start=c_([a-z0-9]+)_([a-z0-9]+)$/);
  assert.ok(m, 'ссылка-приглашение: ' + r.courier.link);
  await startMsg(user, 'c_' + m[1] + '_' + m[2]);
  return r.courier.id;
}
async function readyDelivery(c, cart, sid) {
  const sInit = sid ? iD() : iS();
  const r = await crq(sid, 'POST', '/api/order', c.init(), ob(cart, {}, 'delivery'));
  assert.equal(r.status, 200, JSON.stringify(await r.clone().json()));
  const o = (await jsonOf(r)).order;
  for (const to of ['accepted', 'ready']) assert.equal((await crq(sid, 'POST', '/api/admin/status', sInit, { id: o.id, to })).status, 200);
  return o;
}
const drvTake = (id, init, sid) => crq(sid, 'POST', '/api/courier/take', init || iR(), { id });
const drvDone = (id, pay, init, sid) => crq(sid, 'POST', '/api/courier/done', init || iR(), { id, pay });
const drvCash = async (init, sid) => jsonOf(await crq(sid, 'GET', '/api/courier/cash', init || iR()));
const crList = async () => (await jsonOf(await call('GET', '/api/admin/couriers', { init: iS() }))).couriers;

await t('доставка: продавец приглашает доставщика ссылкой, она работает один раз и не подходит чужому', async () => {
  await stockWorld();
  const add = (body, init) => call('POST', '/api/admin/couriers', { init: init || iS(), body });
  assert.equal((await add({ name: 'Р', phone: PH })).status, 400, 'короткое имя');
  assert.equal((await add({ name: 'Рустам', phone: '123' })).status, 400, 'неверный телефон');
  assert.equal((await add({ name: 'Рустам', phone: PH }, iA())).status, 403, 'доставщиков заводит только продавец');
  const c = (await jsonOf(await add({ name: 'Рустам', phone: PH }))).courier;
  assert.equal(c.joined, false);
  const m = c.link.match(/^https:\/\/t\.me\/distro_test_bot\?start=c_main_([a-z0-9]{8})$/);
  assert.ok(m, c.link);
  // чужой ключ не подходит
  tgLog = [];
  await startMsg(DRV2, 'c_main_zzzzzzzz');
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV2.id).payload.text.includes('Ссылка не подошла'));
  assert.equal((await call('GET', '/api/courier/orders', { init: iR2() })).status, 403);
  // настоящая ссылка
  tgLog = [];
  await startMsg(DRV, 'c_main_' + m[1]);
  const hi = lastTg('sendMessage', p => p.chat_id === DRV.id).payload;
  assert.ok(hi.text.includes('вы доставщик'), hi.text);
  assert.ok(hi.reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/?d=main&v=courier'));
  const list = await crList();
  assert.deepEqual([list.length, list[0].joined, list[0].link, list[0].cash], [1, true, '', 0]);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR() })).status, 200);
  // второй человек по той же ссылке
  tgLog = [];
  await startMsg(DRV2, 'c_main_' + m[1]);
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV2.id).payload.text.includes('Ссылка не подошла'));
  assert.equal((await call('GET', '/api/courier/orders', { init: iR2() })).status, 403);
  // сам доставщик нажал ссылку ещё раз: ничего не ломается
  tgLog = [];
  await startMsg(DRV, 'c_main_' + m[1]);
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV.id).payload.text.includes('вы доставщик'));
  // площадка знает, где он доставщик; обычный клиент нет
  const sh = await jsonOf(await call('GET', '/api/shops', { init: iR() }));
  assert.deepEqual(sh.me.delivers.map(x => x.id), ['main']);
  assert.equal((await jsonOf(await call('GET', '/api/shops', { init: iA() }))).me.delivers, undefined);
  // в приложении магазина он тоже виден
  const bs = await jsonOf(await call('GET', '/api/bootstrap', { init: iR() }));
  assert.deepEqual([bs.me.courier.name, bs.me.admin], ['Рустам', false]);
});

await t('доставка: готовый заказ на доставку приходит доставщикам, «Взял» достаётся одному, клиент и продавец узнают имя', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам'); await hire(DRV2, 'Азиз');
  const A = newUser();
  tgLog = [];
  await readyOrder(A, ONE);                                    // самовывоз: доставщикам не пишем
  assert.equal(tgAll('sendMessage', p => p.chat_id === DRV.id || p.chat_id === DRV2.id).length, 0);
  const o = await readyDelivery(A, CART);
  const m1 = lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes(o.id)).payload;
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV2.id && p.text.includes(o.id)), 'второй доставщик тоже получил');
  assert.ok(m1.text.includes('Готов к доставке') && m1.text.includes('Навои, ул. Галаба 12'), m1.text);
  const kb = m1.reply_markup.inline_keyboard.flat();
  assert.ok(kb.some(b => b.callback_data === 'k:' + o.id && b.callback_data.length <= 64));
  assert.ok(kb.some(b => b.web_app && b.web_app.url.endsWith('&v=courier')));
  const cm = (await W.storage.get('o:' + o.id)).cm;
  assert.equal(cm.length, 2);
  const msgOf = uid => cm.find(m => m.chat_id === uid).message_id;
  // чужой нажать «Взял» не может
  tgLog = [];
  await cb(ANNA, 'k:' + o.id, 900);
  assert.equal(lastTg('answerCallbackQuery').payload.text, 'Ruxsat yoʻq\nНет доступа');
  // первый нажимает в чате
  tgLog = [];
  await cb(DRV, 'k:' + o.id, msgOf(DRV.id), DRV.id);
  assert.ok(lastTg('editMessageText', p => p.message_id === msgOf(DRV.id)).payload.text.includes('Вы взяли заказ'));
  assert.ok(lastTg('editMessageText', p => p.message_id === msgOf(DRV2.id) && p.chat_id === DRV2.id).payload.text.includes('уже взял Рустам'), 'сообщение второго обновилось');
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id && p.text.includes('🚚 Доставщик: Рустам')), 'карточка продавца показывает, кто везёт');
  const toClient = lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text;
  assert.ok(toClient.includes('Рустам') && toClient.includes(PH), toClient);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).crn, 'Рустам');
  const mine = (await jsonOf(await call('GET', '/api/my-orders', { init: A.init() }))).orders.find(x => x.id === o.id);
  assert.deepEqual([mine.crn, mine.cm, mine.cr], ['Рустам', undefined, undefined], 'клиент видит имя, но не служебные поля');
  // второй доставщик: кнопка и API говорят, что занято
  tgLog = [];
  await cb(DRV2, 'k:' + o.id, msgOf(DRV2.id), DRV2.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('уже взял Рустам'));
  const t2 = await drvTake(o.id, iR2());
  assert.equal(t2.status, 409); assert.equal((await jsonOf(t2)).error, 'taken');
  assert.equal((await drvTake(o.id)).status, 200, 'повторное «Взял» тем же доставщиком безвредно');
  // список доставщика: свой заказ помечен, чужой видно как занятый
  const l1 = (await jsonOf(await call('GET', '/api/courier/orders', { init: iR() }))).orders.find(x => x.id === o.id);
  const l2 = (await jsonOf(await call('GET', '/api/courier/orders', { init: iR2() }))).orders.find(x => x.id === o.id);
  assert.deepEqual([l1.mine, l2.mine, l2.crn], [true, false, 'Рустам']);
  assert.equal(l1.uid, undefined); assert.equal(l1.cm, undefined);
  // вернуть заказ может только тот, кто его взял
  assert.equal((await crq(null, 'POST', '/api/courier/release', iR2(), { id: o.id })).status, 409);
  tgLog = [];
  assert.equal((await crq(null, 'POST', '/api/courier/release', iR(), { id: o.id })).status, 200);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).crn, undefined);
  assert.ok(lastTg('editMessageText', p => p.chat_id === DRV2.id && p.text.includes('Готов к доставке')), 'у второго снова свободный заказ');
  assert.equal((await drvTake(o.id, iR2())).status, 200);
  // заказ не готов или не на доставку взять нельзя
  const pk = (await jsonOf(await place(A, ONE))).order;
  assert.equal((await drvTake(pk.id)).status, 409);
  assert.equal((await drvTake('Z-NOPE1')).status, 404);
});

await t('доставка: наличные оседают в кассе доставщика, карта нет; часть долга наличными тоже; сдача продавцу', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  const o1 = await readyDelivery(A, CART);                      // 1 394 000
  assert.equal((await drvDone(o1.id, { m: 'cash' })).status, 403, 'не взял — не может выдать');
  await drvTake(o1.id);
  assert.equal((await drvDone(o1.id, { m: 'gold' })).status, 400);
  assert.equal((await drvDone(o1.id, { m: 'credit', days: 0 })).status, 400);
  assert.equal((await drvCash()).cash, 0);
  tgLog = [];
  const r1 = await jsonOf(await drvDone(o1.id, { m: 'cash' }));
  assert.deepEqual([r1.order.status, r1.order.pay.m, r1.cash], ['done', 'cash', 1394000]);
  assert.ok(lastTg('sendMessage', p => p.chat_id === A.u.id && p.text.includes('доставлен')), 'клиент получил «доставлен»');
  assert.equal((await adminOrdersOf()).find(x => x.id === o1.id).status, 'done');
  assert.equal((await jsonOf(await drvDone(o1.id, { m: 'cash' }))).cash, 1394000, 'повтор не удваивает кассу');
  // карта и перечисление в кассу не идут
  const o2 = await readyDelivery(A, ONE);
  await drvTake(o2.id);
  assert.equal((await jsonOf(await drvDone(o2.id, { m: 'card' }))).cash, 1394000);
  // в долг, часть наличными
  const o3 = await readyDelivery(A, CART);
  await drvTake(o3.id);
  const r3 = await jsonOf(await drvDone(o3.id, { m: 'credit', days: 7, paid: 400000, pm: 'cash' }));
  assert.equal(r3.cash, 1794000);
  const db = await debtOf(A.u.id);
  assert.equal(db.bal, 994000);
  assert.equal(db.addr, 'Навои, ул. Галаба 12, склад 3', 'адрес магазина сохраняется для сборщика долгов');
  const rows = (await drvCash()).rows;
  // оплата картой в кассу не идёт, а ждёт сверки продавцом с банком
  assert.deepEqual(rows.map(r => [r.k, r.o]), [['in', o3.id], ['nv', o2.id], ['in', o1.id]]);
  const cw = await jsonOf(await call('GET', '/api/courier/cash', { init: iR() }));
  assert.deepEqual(cw.nv.map(x => [x.k, x.m, x.o]), [['o', 'card', o2.id]], 'доставщик видит, что не сверено');
  assert.equal(cw.cash, 1794000);
  // выдача в долг может быть закрыта для доставщика
  assert.equal((await call('PUT', '/api/admin/couriers/' + id, { init: iS(), body: { credit: false } })).status, 200);
  const o4 = await readyDelivery(A, CART);
  await drvTake(o4.id);
  const nc = await drvDone(o4.id, { m: 'credit', days: 7 });
  assert.equal(nc.status, 403); assert.equal((await jsonOf(nc)).error, 'no_credit');
  assert.equal((await jsonOf(await drvDone(o4.id, { m: 'cash' }))).cash, 3188000);
  // чужой заказ закрыть нельзя
  await hire(DRV2, 'Азиз');
  const o5 = await readyDelivery(A, ONE);
  await drvTake(o5.id);
  const bad = await drvDone(o5.id, { m: 'cash' }, iR2());
  assert.equal(bad.status, 403); assert.equal((await jsonOf(bad)).error, 'not_yours');
  assert.equal((await drvCash(iR2())).cash, 0);
  // сдача продавцу
  const hv = amount => call('POST', '/api/admin/couriers/' + id + '/handover', { init: iS(), body: { amount } });
  for (const x of [0, -5, 2.5, 3188001, 'много']) assert.equal((await hv(x)).status, 400, String(x));
  assert.equal((await call('POST', '/api/admin/couriers/' + id + '/handover', { init: iA(), body: { amount: 1000 } })).status, 403);
  const h1 = await jsonOf(await hv(1000000));
  assert.equal(h1.courier.cash, 2188000);
  assert.deepEqual([h1.rows[0].k, h1.rows[0].a, h1.rows[0].by], ['out', 1000000, SELLER.id]);
  assert.equal((await drvCash()).cash, 2188000);
  // с деньгами на руках доставщика не удалить
  const del = await call('DELETE', '/api/admin/couriers/' + id, { init: iS() });
  assert.equal(del.status, 409); assert.equal((await jsonOf(del)).error, 'has_cash');
  assert.equal((await hv(2188000)).status, 200);
  // безнал без сверки тоже мешает удалить доставщика
  const del2 = await call('DELETE', '/api/admin/couriers/' + id, { init: iS() });
  assert.equal(del2.status, 409); assert.equal((await jsonOf(del2)).error, 'has_nv');
  const nvid = (await jsonOf(await call('GET', '/api/admin/couriers/' + id, { init: iS() }))).nv[0].id;
  assert.equal((await call('POST', '/api/admin/couriers/' + id + '/verify', { init: iR(), body: { id: nvid } })).status, 403, 'сверять может только продавец');
  assert.equal((await call('POST', '/api/admin/couriers/' + id + '/verify', { init: iS(), body: { id: 9999 } })).status, 404);
  const vr = await jsonOf(await call('POST', '/api/admin/couriers/' + id + '/verify', { init: iS(), body: { id: nvid } }));
  assert.deepEqual([vr.nv.length, vr.rows[0].k, vr.rows[0].by], [0, 'vr', SELLER.id]);
  assert.equal((await call('POST', '/api/admin/couriers/' + id + '/verify', { init: iS(), body: { id: nvid } })).status, 404, 'второй раз нельзя');
  // пока доставщик не ответил на записанную сдачу, удалить его нельзя
  const hqd = await call('DELETE', '/api/admin/couriers/' + id, { init: iS() });
  assert.equal(hqd.status, 409); assert.equal((await jsonOf(hqd)).error, 'has_hq');
  for (const r of (await drvCash()).rows.filter(x => x.k === 'out')) await cb(DRV, 'h:' + r.n + ':y', 800, DRV.id);
  assert.equal((await call('DELETE', '/api/admin/couriers/' + id, { init: iS() })).status, 200);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR() })).status, 403);
  assert.deepEqual((await crList()).map(c => c.name), ['Азиз']);
  // заказ, который он вёз, снова свободен
  assert.equal((await adminOrdersOf()).find(x => x.id === o5.id).crn, undefined, 'после удаления доставщика заказ свободен');
  assert.equal((await drvTake(o5.id, iR2())).status, 200);
});

await t('доставка: доставщик видит всех должников, принимает оплату, наличные идут в кассу; отмена продавцом возвращает', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });               // продавец выдал в долг, самовывоз
  const dl = await jsonOf(await call('GET', '/api/courier/debts', { init: iR() }));
  assert.deepEqual([dl.n, dl.total, dl.debtors[0].uid], [1, 1394000, A.u.id]);
  assert.equal((await call('GET', '/api/courier/debts', { init: iA() })).status, 403, 'обычному клиенту список закрыт');
  // карточка должника у доставщика тоже содержит состав заказов
  const dcard = (await jsonOf(await call('GET', '/api/courier/debts/' + A.u.id, { init: iR() }))).debt;
  assert.deepEqual(dcard.ords[o.id].items.map(i => [i.id, i.qty]), [['p1', 2], ['p2', 3]]);
  assert.equal(dcard.ords[o.id].total, 1394000);
  assert.equal((await call('GET', '/api/courier/debts/' + A.u.id, { init: iA() })).status, 403);
  const pay = (amount, m, init) => call('POST', '/api/courier/debts/' + A.u.id + '/pay', { init: init || iR(), body: { amount, m } });
  assert.equal((await pay(0, 'cash')).status, 400);
  assert.equal((await pay(5, 'gold')).status, 400);
  assert.equal((await pay(5, 'cash', iA())).status, 403);
  assert.equal((await jsonOf(await pay(500000, 'cash'))).debt.bal, 894000);
  assert.equal((await jsonOf(await pay(100000, 'card'))).debt.bal, 794000);
  assert.equal((await drvCash()).cash, 500000, 'только наличные идут в кассу');
  const rows = (await debtOf(A.u.id)).rows.filter(r => r.k === 'pay');
  assert.deepEqual(rows.map(r => [r.m, r.by]), [['card', DRV.id], ['cash', DRV.id]]);
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/void', { init: iR(), body: { n: rows[1].n } })).status, 404, 'отменять оплаты доставщик не может');
  // продавец отменяет запись о наличных: касса доставщика уменьшается
  assert.equal((await debtAct(A.u.id, 'void', { n: rows[1].n, reason: 'принёс меньше' })).status, 200);
  const c = await drvCash();
  assert.equal(c.cash, 0);
  assert.deepEqual(c.rows.map(r => r.k), ['rv', 'nv', 'in']);
  assert.equal(c.nv.length, 1, 'оплата картой ещё ждёт сверки');
  // оплата, принятая самим продавцом, кассу доставщика не трогает
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1000, m: 'cash' })).status, 200);
  assert.equal((await drvCash()).cash, 0);
  // напоминание магазину: можно и доставщику, но не чаще раза в час
  tgLog = [];
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/remind', { init: iR(), body: {} })).status, 200);
  assert.ok(lastTg('sendMessage', p => p.chat_id === A.u.id));
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/remind', { init: iR(), body: {} })).status, 429);
});

await t('доставка: новая ссылка передаёт место другому, отключённый и удалённый доставщик теряют доступ', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyDelivery(A, CART);
  await drvTake(o.id);
  // отключение: доступа и сообщений нет, касса и заказы остаются
  assert.equal((await call('PUT', '/api/admin/couriers/' + id, { init: iS(), body: { on: false } })).status, 200);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR() })).status, 403);
  assert.equal((await jsonOf(await call('GET', '/api/bootstrap', { init: iR() }))).me.courier, null);
  tgLog = [];
  await readyDelivery(A, ONE);
  assert.equal(tgAll('sendMessage', p => p.chat_id === DRV.id).length, 0, 'отключённому заказы не приходят');
  assert.equal((await call('PUT', '/api/admin/couriers/' + id, { init: iS(), body: { on: true } })).status, 200);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR() })).status, 200);
  // потерял телефон: новая ссылка, вошёл другой аккаунт
  const nl = (await jsonOf(await call('POST', '/api/admin/couriers/' + id + '/link', { init: iS() }))).courier;
  assert.ok(nl.link.includes('c_main_'));
  await startMsg(DRV2, 'c_' + nl.link.split('c_')[1]);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR2() })).status, 200);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR() })).status, 403, 'старый аккаунт доступ потерял');
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).crn, 'Рустам', 'заказ остался за этим доставщиком');
  assert.equal((await jsonOf(await call('GET', '/api/shops', { init: iR() }))).me.delivers, undefined);
  assert.equal(await W.hubStorage.get('dls:' + DRV.id), undefined, 'площадка забыла старый аккаунт');
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops', { init: iR2() }))).me.delivers.map(x => x.id), ['main']);
  // удаление освобождает заказ
  assert.equal((await call('DELETE', '/api/admin/couriers/' + id, { init: iS() })).status, 200);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).crn, undefined);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR2() })).status, 403);
  assert.equal((await call('GET', '/api/admin/couriers/' + id, { init: iS() })).status, 404);
});

await t('доставка: у второго дистрибьютора ссылка и кнопка «Взял» ведут в его хранилище', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  await hire(DRV, 'Рустам', sid);
  const A = newUser();
  const o = await readyDelivery(A, CART, sid);
  const m = lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes(o.id)).payload;
  const take = m.reply_markup.inline_keyboard.flat().find(b => b.callback_data);
  assert.equal(take.callback_data, 'k:' + sid + ':' + o.id);
  assert.ok(take.callback_data.length <= 64);
  assert.ok(m.reply_markup.inline_keyboard.flat().some(b => b.web_app && b.web_app.url.endsWith('/?d=' + sid + '&v=courier')));
  const cm = (await W.getShop(sid).storage.get('o:' + o.id)).cm;
  await cb(DRV, take.callback_data, cm[0].message_id, DRV.id);
  const ord = (await jsonOf(await callS(sid, 'GET', '/api/admin/orders', { init: iD() }))).orders.find(x => x.id === o.id);
  assert.equal(ord.crn, 'Рустам');
  assert.equal((await callS(sid, 'GET', '/api/courier/orders', { init: iR() })).status, 200);
  assert.equal((await call('GET', '/api/courier/orders', { init: iR() })).status, 403, 'у первого дистрибьютора он не доставщик');
  assert.deepEqual((await jsonOf(await call('GET', '/api/shops', { init: iR() }))).me.delivers.map(x => x.id), [sid]);
  assert.equal((await jsonOf(await drvDone(o.id, { m: 'cash' }, iR(), sid))).cash, 1394000);
});

await t('доставка: резервная копия и Excel знают доставщика, ссылка-приглашение в копию не попадает', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам');
  await call('POST', '/api/admin/couriers', { init: iS(), body: { name: 'Азиз', phone: PH } });
  const o = await readyDelivery(newUser(), ONE);
  await drvTake(o.id);
  const bk = await call('POST', '/api/admin/export', { init: iS(), body: { kind: 'backup' } });
  assert.equal(bk.status, 200, JSON.stringify(await bk.clone().json()));
  const f = lastTg('sendDocument').file;
  const txt = Buffer.from(f.bytes).toString('latin1');
  assert.ok(txt.includes('"couriers"'), 'в копии есть доставщики');
  assert.ok(!/"tok":"[a-z0-9]{8}"/.test(txt), 'ключи приглашений в копию не попадают');
  assert.ok(!txt.includes('"cm"'), 'номера сообщений доставщиков в копию не попадают');
});

await t('мой долг: магазин видит свой долг по всем дистрибьюторам, без заметок продавца, чужого не видит', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);                                          // у первого дистрибьютора тоже есть каталог
  const A = newUser(), B = newUser();
  const o1 = await readyOrder(A, CART);                                                              // первый дистрибьютор, 1 394 000
  await doneWith(o1.id, { m: 'credit', days: 7, paid: 394000, pm: 'cash' });                        // в долг 1 000 000
  const o2 = await readyDelivery(A, CART, sid);                                                      // второй, 1 394 000
  assert.equal((await crq(sid, 'POST', '/api/admin/status', iD(), { id: o2.id, to: 'done', pay: { m: 'credit', days: 3 } })).status, 200);
  const dj = async (u, q) => jsonOf(await call('GET', '/api/hub/debts' + (q || ''), { init: u.init() }));
  const brief = await dj(A);
  assert.deepEqual([brief.n, brief.total, brief.over, brief.late], [2, 2394000, 0, 0]);
  assert.ok(brief.debts.every(d => d.rows === undefined && d.ords === undefined), 'краткий ответ без заказов и оплат');
  const full = await dj(A, '?full=1');
  assert.deepEqual(full.debts.map(d => [d.did, d.shopName, d.bal]), [[sid, 'Альфа Трейд', 1394000], ['main', DEFAULT_NAME, 1000000]], 'сначала больший долг');
  assert.deepEqual(full.debts[1].ords[o1.id].items.map(i => [i.id, i.qty]), [['p1', 2], ['p2', 3]]);
  assert.equal(typeof full.debts[0].contact.phone, 'string');
  // оплата с заметкой продавца: клиент видит способ и сумму, заметку нет
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 100000, m: 'cash', note: 'секрет продавца' })).status, 200);
  const f2 = (await dj(A, '?full=1')).debts.find(d => d.did === 'main');
  assert.equal(f2.bal, 900000);
  assert.deepEqual(f2.rows.filter(r => r.k === 'pay').map(r => [r.a, r.m]), [[100000, 'cash'], [394000, 'cash']], 'видна и оплата при выдаче');
  assert.ok(!JSON.stringify(f2).includes('секрет'), 'заметки продавца клиенту не отдаются');
  assert.ok(f2.rows.every(r => !('by' in r) && !('note' in r) && !('cid' in r) && !('of' in r)));
  assert.deepEqual(f2.open.map(q => [q.ref, q.r]), [[o1.id, 900000]]);
  // отменённая оплата остаётся в истории зачёркнутой, служебной записи об отмене клиент не видит
  const n = f2.rows.find(r => r.k === 'pay' && r.a === 100000).n;
  assert.equal((await debtAct(A.u.id, 'void', { n, reason: 'записали дважды' })).status, 200);
  const f3 = (await dj(A, '?full=1')).debts.find(d => d.did === 'main');
  assert.equal(f3.bal, 1000000);
  assert.deepEqual(f3.rows.map(r => [r.k, !!r.void]), [['pay', true], ['pay', false], ['ch', false]]);
  // чужой магазин долга не видит, без входа закрыто
  assert.deepEqual(await dj(B), { debts: [], n: 0, total: 0, over: 0, late: 0, ask: 0 });
  assert.equal((await call('GET', '/api/hub/debts')).status, 401);
  // долг погашен полностью: дистрибьютор пропадает из списка
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1000000, m: 'bank' })).status, 200);
  const left = (await dj(A)).debts.find(d => d.did === 'main');
  assert.deepEqual([left.bal, left.ask > 0], [0, true], 'долга нет, но есть записи, которые магазин ещё не подтвердил');
  for (const g of new Set((await dj(A, '?full=1')).debts.find(d => d.did === 'main').rows.filter(r => r.cf === 'wait' && !r.void).map(r => r.g)))
    assert.equal((await call('POST', '/api/hub/debts/confirm', { init: A.init(), body: { did: 'main', n: g, ok: true } })).status, 200);
  assert.deepEqual((await dj(A)).debts.map(d => d.did), [sid]);
});

await t('мой долг: просрочка попадает в сводку, а сообщение об оплате приходит с остатком, на языке магазина', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });
  await backdate(A.u.id, o.id, '2020-01-01');
  const d = await jsonOf(await call('GET', '/api/hub/debts', { init: A.init() }));
  assert.deepEqual([d.total, d.over, d.late, d.debts[0].days > 0, d.debts[0].due], [1394000, 1394000, 1, true, '2020-01-01']);
  // оплата продавцом: остаток и кнопка «Мой долг»
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 500000, m: 'cash' })).status, 200);
  const m = lastTg('sendMessage', p => p.chat_id === A.u.id).payload;
  assert.ok(norm(m.text).includes('принята оплата 500 000 сум (наличные)') && norm(m.text).includes('Остаток долга: 894 000 сум'), m.text);
  assert.ok(m.reply_markup.inline_keyboard.flat().some(b => b.web_app && b.web_app.url.endsWith('/?v=debt') && b.text === 'Мой долг'));
  // отмена записи сообщений не шлёт
  const pn = (await debtOf(A.u.id)).rows.find(r => r.k === 'pay').n;
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'void', { n: pn, reason: 'не те деньги' })).status, 200);
  const vm = lastTg('sendMessage', p => p.chat_id === A.u.id).payload;
  assert.ok(norm(vm.text).includes('отменена') && vm.text.includes('Причина: не те деньги') && norm(vm.text).includes('500 000'), 'магазин узнаёт об отмене и причине: ' + vm.text);
  // Telegram не отвечает: оплата всё равно записана
  tgFail = true;
  const r = await debtAct(A.u.id, 'pay', { amount: 94000, m: 'card' });
  tgFail = false;
  assert.equal(r.status, 200);
  assert.equal((await debtOf(A.u.id)).bal, 1300000);
  // закрытие долга и переплата
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1300000, m: 'bank' })).status, 200);
  assert.ok(norm(lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text).includes('Долг погашен, спасибо!'));
  assert.ok(lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text.includes('Всё верно?'), 'под оплатой — вопрос магазину');
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 1000, m: 'cash' })).status, 200);
  assert.ok(norm(lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text).includes('Переплата (аванс): 1 000 сум'));
  // узбекский магазин получает всё по-узбекски
  const U = newUser();
  const o3 = (await jsonOf(await place(U, ONE, { lang: 'uz' }))).order;
  for (const to of ['accepted', 'ready']) assert.equal((await setStatus(o3.id, to)).status, 200);
  await doneWith(o3.id, { m: 'credit', days: 5 });
  tgLog = [];
  assert.equal((await debtAct(U.u.id, 'pay', { amount: 2500, m: 'card' })).status, 200);
  const um = lastTg('sendMessage', p => p.chat_id === U.u.id).payload;
  assert.ok(norm(um.text).includes('toʻlov qabul qilindi: 2 500') && norm(um.text).includes('(karta)') && norm(um.text).includes('Qarz qoldigʻi: 5 000') && !/[А-Яа-я]/.test(um.text.replace(DEFAULT_NAME, '')), um.text);
  assert.ok(um.text.includes('Hammasi toʻgʻrimi?'));
  assert.deepEqual(um.reply_markup.inline_keyboard[0].map(b => b.text), ['✅ Toʻgʻri', '❌ Notoʻgʻri']);
  assert.equal(um.reply_markup.inline_keyboard[1][0].text, 'Mening qarzim');
  // напоминание тоже открывает «Мой долг»
  const A2 = newUser();
  const o4 = await readyOrder(A2, ONE);
  await doneWith(o4.id, { m: 'credit', days: 5 });
  tgLog = [];
  assert.equal((await debtAct(A2.u.id, 'remind', {})).status, 200);
  assert.ok(lastTg('sendMessage', p => p.chat_id === A2.u.id).payload.reply_markup.inline_keyboard.flat().some(b => b.web_app && b.web_app.url.endsWith('/?v=debt')));
});

await t('мой долг: оплату, принятую доставщиком, магазин тоже получает сообщением', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });
  tgLog = [];
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/pay', { init: iR(), body: { amount: 400000, m: 'cash' } })).status, 200);
  const t3 = norm(lastTg('sendMessage', p => p.chat_id === A.u.id).payload.text);
  assert.ok(t3.includes('принята оплата 400 000 сум (наличные)') && t3.includes('Остаток долга: 994 000 сум'), t3);
});

/* ---------- контроль денег: магазин подтверждает, безнал сверяется, спорное видно ---------- */
/* Первое сообщение магазину с вопросом «Всё верно?» и его кнопки. */
const askOf = uid => { const m = lastTg('sendMessage', p => p.chat_id === uid && p.text.includes('Всё верно?')); return m ? m.payload : null; };
const tap = (uid, data, from) => cb(from || { id: uid, first_name: 'Магазин' }, data);
const dispOf = async () => (await jsonOf(await call('GET', '/api/admin/disputes', { init: iS() }))).items;

await t('контроль денег: выдача в долг и оплата ждут ответа магазина «Верно»; «Верно» окончательно, чужой нажать не может', async () => {
  await stockWorld();
  const A = newUser(), Z = newUser();
  const o = await readyOrder(A, CART);
  tgLog = [];
  assert.equal((await doneWith(o.id, { m: 'credit', days: 7, paid: 394000, pm: 'cash' })).status, 200);
  const q = askOf(A.u.id);
  assert.ok(q, 'магазину пришёл вопрос');
  const tx = norm(q.text);
  assert.ok(tx.includes('выдан вам в долг на 1 394 000 сум') && tx.includes('Сразу оплачено: 394 000 сум (наличные)') && tx.includes('Принял: Jasur'), tx);
  const [yes, no] = q.reply_markup.inline_keyboard[0];
  assert.deepEqual([yes.text, no.text], ['✅ Верно', '❌ Не так']);
  assert.ok(/^q:\d+:y$/.test(yes.callback_data) && /^q:\d+:n$/.test(no.callback_data) && yes.callback_data.length <= 64);
  assert.equal(q.reply_markup.inline_keyboard[1][0].text, 'Мой долг');
  // записи выдачи и оплаты у продавца пока «ждут ответа»; магазин в списке
  let db = await debtOf(A.u.id);
  assert.deepEqual(db.rows.map(r => [r.k, r.cf]), [['pay', 'wait'], ['ch', 'wait']]);
  assert.equal(db.rows[0].bn, 'Jasur');
  assert.equal((await debtsOf()).debtors[0].wt, 1);
  // чужой человек нажать за магазин не может: у него нет такой записи
  tgLog = [];
  await tap(Z.u.id, yes.callback_data);
  assert.equal(lastTg('answerCallbackQuery').payload.show_alert, true);
  assert.equal((await debtOf(A.u.id)).rows[0].cf, 'wait');
  // магазин нажал «Верно»: обе записи заказа подтверждены сразу, сообщение обновилось
  tgLog = [];
  await tap(A.u.id, yes.callback_data);
  db = await debtOf(A.u.id);
  assert.deepEqual(db.rows.map(r => r.cf), ['ok', 'ok']);
  const ed = lastTg('editMessageText').payload;
  assert.ok(ed.text.includes('✅ Вы подтвердили') && ed.reply_markup.inline_keyboard.flat().every(b => !b.callback_data), 'после «Верно» кнопок ответа нет');
  assert.equal((await debtsOf()).debtors[0].wt, 0);
  // «Верно» окончательно: «Не так» после него не принимается
  tgLog = [];
  await tap(A.u.id, no.callback_data);
  assert.equal(lastTg('answerCallbackQuery').payload.show_alert, true);
  assert.deepEqual((await debtOf(A.u.id)).rows.map(r => r.cf), ['ok', 'ok']);
  assert.equal(tgAll('sendMessage', p => p.text.includes('Не так')).length, 0, 'продавцам ничего не пришло');
  assert.equal((await debtsOf()).fl, 0);
});

await t('контроль денег: «Не так» — продавцы и доставщик узнают сразу, запись спорная; магазин может передумать, продавец закрывает с комментарием', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });
  tgLog = [];
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/pay', { init: iR(), body: { amount: 400000, m: 'cash' } })).status, 200);
  const adm = lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes('Рустам'));
  assert.ok(adm && norm(adm.payload.text).includes('принял оплату долга') && norm(adm.payload.text).includes('400 000'), 'продавец узнал, что доставщик принял оплату');
  const q = askOf(A.u.id), no = q.reply_markup.inline_keyboard[0][1].callback_data, yes = q.reply_markup.inline_keyboard[0][0].callback_data;
  assert.ok(norm(q.text).includes('Принял: Рустам'));
  tgLog = [];
  await tap(A.u.id, no);
  const warn = lastTg('sendMessage', p => p.chat_id === SELLER.id).payload;
  assert.ok(warn.text.includes('отметил запись «Не так»') && norm(warn.text).includes('оплата долга 400 000') && warn.text.includes('Рустам'), warn.text);
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes('Не так')), 'доставщик, принявший оплату, тоже узнал');
  const ed = lastTg('editMessageText').payload;
  assert.ok(ed.text.includes('❌ Вы отметили «Не так»') && ed.reply_markup.inline_keyboard[0][0].callback_data === yes, 'можно передумать');
  // повторное «Не так» не шлёт повторных сообщений
  tgLog = [];
  await tap(A.u.id, no);
  assert.equal(tgAll('sendMessage', p => p.chat_id === SELLER.id).length, 0);
  // в списке должников и в спорных
  const list = await debtsOf();
  assert.equal(list.fl, 1); assert.equal(list.debtors[0].fl, 1);
  let ds = await dispOf();
  assert.deepEqual(ds.map(x => [x.uid, x.k, x.a, x.cf, x.bn]), [[A.u.id, 'pay', 400000, 'no', 'Рустам']]);
  // закрыть можно только с комментарием; свежую «ждёт ответа» без причины закрывать нельзя
  const n = ds[0].n;
  assert.equal((await debtAct(A.u.id, 'resolve', { n })).status, 400);
  assert.equal((await debtAct(A.u.id, 'resolve', { n, note: 'ab' })).status, 400);
  assert.equal((await debtAct(A.u.id, 'resolve', { n, note: 'сверились по телефону' }, iA())).status, 403);
  assert.equal((await debtAct(A.u.id, 'resolve', { n: 99999, note: 'сверились по телефону' })).status, 404);
  tgLog = [];
  const rs = await jsonOf(await debtAct(A.u.id, 'resolve', { n, note: 'сверились по телефону' }));
  assert.deepEqual(rs.debt.rows.find(r => r.n === n).rsl, { bn: 'Jasur', why: 'сверились по телефону', t: rs.debt.rows.find(r => r.n === n).rsl.t });
  assert.ok(lastTg('sendMessage', p => p.chat_id === A.u.id && p.text.includes('сверились по телефону')), 'магазин видит комментарий');
  assert.deepEqual(await dispOf(), []);
  assert.equal((await debtsOf()).fl, 0);
  assert.equal((await debtAct(A.u.id, 'resolve', { n, note: 'ещё раз' })).status, 409);
  // после закрытия магазин «Не так» уже не нажимает, «Верно» можно
  tgLog = [];
  await tap(A.u.id, no);
  assert.equal(lastTg('answerCallbackQuery').payload.show_alert, true);
  await tap(A.u.id, yes);
  assert.equal((await debtOf(A.u.id)).rows.find(r => r.n === n).cf, 'ok');
  // магазин передумал ДО закрытия: «Не так» → «Верно» снимает спор
  const o2 = await readyOrder(A, ONE);
  tgLog = [];
  await doneWith(o2.id, { m: 'credit', days: 3 });
  const q2 = askOf(A.u.id);
  await tap(A.u.id, q2.reply_markup.inline_keyboard[0][1].callback_data);
  assert.equal((await debtsOf()).fl, 1);
  await tap(A.u.id, q2.reply_markup.inline_keyboard[0][0].callback_data);
  assert.equal((await debtsOf()).fl, 0);
  assert.deepEqual(await dispOf(), []);
});

await t('контроль денег: сообщение не дошло — запись сразу спорная; молчание больше суток — тоже; магазин отвечает и в приложении', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  tgFail = true;
  assert.equal((await doneWith(o.id, { m: 'credit', days: 7 })).status, 200);
  tgFail = false;
  let ds = await dispOf();
  assert.deepEqual(ds.map(x => [x.k, x.cf, x.ref]), [['ch', 'na', o.id]], 'не получил — спорная сразу');
  // магазин открывает приложение и подтверждает там
  const my = await jsonOf(await call('GET', '/api/hub/debts?full=1', { init: A.init() }));
  assert.equal(my.debts[0].rows[0].cf, 'na');
  const conf = (n, ok) => call('POST', '/api/hub/debts/confirm', { init: A.init(), body: { did: 'main', n, ok } });
  assert.equal((await conf(my.debts[0].rows[0].g, true)).status, 200);
  assert.deepEqual(await dispOf(), []);
  assert.equal((await conf(my.debts[0].rows[0].g, false)).status, 409, 'после «Верно» менять нельзя');
  assert.equal((await call('POST', '/api/hub/debts/confirm', { init: iB(), body: { did: 'main', n: 1, ok: true } })).status, 404, 'чужой журнал недоступен');
  assert.equal((await call('POST', '/api/hub/debts/confirm', { init: A.init(), body: { did: 'main', n: 1, ok: 'да' } })).status, 400);
  // молчание: Telegram дошёл, но ответа нет; через сутки запись попадает в спорные
  const o2 = await readyOrder(A, ONE);
  await doneWith(o2.id, { m: 'credit', days: 7 });
  assert.deepEqual(await dispOf(), [], 'пока не прошли сутки — просто ждёт');
  const n2 = (await debtOf(A.u.id)).rows.find(r => r.ref === o2.id).n;
  assert.equal((await debtAct(A.u.id, 'resolve', { n: n2, note: 'рано закрывать' })).status, 409, 'свежую запись закрывать нечего');
  const lg = await W.storage.get('lg:' + A.u.id), lh = await W.storage.get('lh:' + A.u.id);
  const old = new Date(Date.now() - 25 * 3600000).toISOString();
  lg.rows.forEach(r => { if (r.cf === 'wait') r.t = old; });
  lh.cwt = lh.cwt.map(() => old);
  await W.storage.put('lg:' + A.u.id, lg); await W.storage.put('lh:' + A.u.id, lh);
  ds = await dispOf();
  assert.deepEqual(ds.map(x => [x.ref, x.cf]), [[o2.id, 'late']]);
  assert.equal((await debtsOf()).fl, 1);
  assert.equal((await debtOf(A.u.id)).rows.find(r => r.n === n2).late, true);
  assert.equal((await debtAct(A.u.id, 'resolve', { n: n2, note: 'магазин не отвечает, звонил' })).status, 200);
  assert.deepEqual(await dispOf(), []);
  assert.equal((await debtsOf()).fl, 0);
});

await t('контроль денег: отмена оплаты только продавцом и с причиной; магазин и доставщик получают причину; запись остаётся в журнале', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/pay', { init: iR(), body: { amount: 300000, m: 'cash' } })).status, 200);
  const pn = (await debtOf(A.u.id)).rows.find(r => r.k === 'pay').n;
  assert.equal((await call('POST', '/api/courier/debts/' + A.u.id + '/void', { init: iR(), body: { n: pn, reason: 'хочу отменить' } })).status, 404);
  assert.equal((await debtAct(A.u.id, 'void', { n: pn, reason: '   ' })).status, 400);
  tgLog = [];
  const r = await jsonOf(await debtAct(A.u.id, 'void', { n: pn, reason: 'деньги не получены' }));
  const rv = r.debt.rows.find(x => x.k === 'rv');
  assert.deepEqual([rv.of, rv.bn, rv.why], [pn, 'Jasur', 'деньги не получены']);
  assert.equal(r.debt.bal, 1394000);
  assert.ok(lastTg('sendMessage', p => p.chat_id === A.u.id && p.text.includes('Причина: деньги не получены')));
  const dm = lastTg('sendMessage', p => p.chat_id === DRV.id);
  assert.ok(dm && dm.payload.text.includes('Причина: деньги не получены'), 'доставщик, принявший оплату, получил причину');
  assert.equal((await drvCash()).cash, 0, 'наличные из кассы доставщика вернулись');
  // отменённая запись не требует ответа магазина и не считается спорной
  assert.equal((await debtsOf()).debtors[0].wt, 1, 'ждёт ответа только сама выдача в долг');
  tgLog = [];
  await tap(A.u.id, 'q:' + pn + ':n');
  assert.equal(lastTg('answerCallbackQuery').payload.show_alert, true);
  assert.equal(tgAll('sendMessage', p => p.chat_id === SELLER.id).length, 0);
  // в «Мой долг» у магазина видно, что запись отменена и почему
  const my = (await jsonOf(await call('GET', '/api/hub/debts?full=1', { init: A.init() }))).debts[0];
  const mine = my.rows.find(x => x.n === pn);
  assert.deepEqual([mine.void, mine.vwhy], [true, 'деньги не получены']);
  assert.ok(my.rows.every(x => !('why' in x)));
});

await t('контроль денег: доставщик принимает любые способы; карта и перечисление не идут в его наличные, а ждут сверки продавцом', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });
  const pay = (amount, m) => call('POST', '/api/courier/debts/' + A.u.id + '/pay', { init: iR(), body: { amount, m } });
  assert.equal((await pay(200000, 'cash')).status, 200);
  assert.equal((await pay(300000, 'card')).status, 200);
  assert.equal((await pay(100000, 'bank')).status, 200);
  let c = await drvCash();
  assert.equal(c.cash, 200000, 'только наличные в кассе');
  assert.deepEqual(c.nv.map(x => [x.k, x.m, x.a]), [['d', 'bank', 100000], ['d', 'card', 300000]]);
  assert.deepEqual((await debtOf(A.u.id)).rows.filter(r => r.k === 'pay').map(r => [r.m, r.vr || '']), [['bank', 'wait'], ['card', 'wait'], ['cash', '']]);
  assert.equal((await debtOf(A.u.id)).bal, 794000, 'долг уменьшился сразу');
  const cd = (await jsonOf(await call('GET', '/api/admin/couriers/' + id, { init: iS() })));
  assert.equal(cd.nv.length, 2); assert.equal(cd.courier.nvn, 2); assert.equal(cd.courier.nva, 400000);
  assert.equal((await crList())[0].nvn, 2);
  // продавец проверил банк: «Деньги пришли»; запись у должника тоже сверена
  const vr = await jsonOf(await call('POST', '/api/admin/couriers/' + id + '/verify', { init: iS(), body: { id: cd.nv.find(x => x.m === 'card').id } }));
  assert.equal(vr.nv.length, 1);
  const rows = (await debtOf(A.u.id)).rows.filter(r => r.k === 'pay');
  assert.deepEqual(rows.map(r => [r.m, r.vr || '']), [['bank', 'wait'], ['card', 'ok'], ['cash', '']]);
  assert.equal(rows.find(r => r.m === 'card').vb, 'Jasur');
  // продавец отменил неподтверждённый перевод: из списка сверки он уходит
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'void', { n: rows.find(r => r.m === 'bank').n, reason: 'на счёт не пришло' })).status, 200);
  c = await drvCash();
  assert.deepEqual([c.nv.length, c.cash], [0, 200000]);
  assert.deepEqual(c.rows.slice(0, 2).map(r => r.k), ['nx', 'vr']);
  // выдача заказа картой на доставке: тоже в «не сверено», в кассу не идёт
  const o2 = await readyDelivery(A, ONE);
  await drvTake(o2.id);
  assert.equal((await jsonOf(await drvDone(o2.id, { m: 'bank' }))).cash, 200000);
  c = await drvCash();
  assert.deepEqual(c.nv.map(x => [x.k, x.m, x.o]), [['o', 'bank', o2.id]]);
  // часть долга картой при выдаче в долг: запись оплаты ждёт сверки и ответа магазина
  const o3 = await readyDelivery(A, CART);
  await drvTake(o3.id);
  await drvDone(o3.id, { m: 'credit', days: 5, paid: 100000, pm: 'card' });
  c = await drvCash();
  assert.deepEqual(c.nv.map(x => [x.k, x.m]), [['o', 'card'], ['o', 'bank']]);
  assert.equal(c.nv[0].a, 100000);
  const pr = (await debtOf(A.u.id)).rows.find(r => r.ref === o3.id && r.k === 'pay');
  assert.deepEqual([pr.cf, pr.vr, pr.bn, pr.cid], ['wait', 'wait', 'Рустам', id]);
});

await t('контроль денег: лимит наличных у доставщика — с деньгами выше лимита новые заказы и наличные оплаты долга не берёт, безнал берёт', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 7 });
  const put = body => call('PUT', '/api/admin/couriers/' + id, { init: iS(), body });
  for (const lim of [-1, 1.5, 'много', 2e11]) assert.equal((await put({ lim })).status, 400, String(lim));
  assert.equal((await call('PUT', '/api/admin/couriers/' + id, { init: iA(), body: { lim: 5 } })).status, 403);
  assert.equal((await put({ lim: 500000 })).status, 200);
  assert.equal((await crList())[0].lim, 500000);
  const pay = (amount, m) => call('POST', '/api/courier/debts/' + A.u.id + '/pay', { init: iR(), body: { amount, m } });
  assert.equal((await pay(500000, 'cash')).status, 200, 'пока на руках меньше лимита, принимает');
  const stop = await pay(1000, 'cash');
  assert.equal(stop.status, 409); assert.equal((await jsonOf(stop)).error, 'cash_limit');
  assert.equal((await pay(1000, 'card')).status, 200, 'безнал в кассу не идёт, поэтому лимит его не останавливает');
  const o2 = await readyDelivery(A, ONE);
  const tk = await drvTake(o2.id);
  assert.equal(tk.status, 409); assert.equal((await jsonOf(tk)).error, 'cash_limit');
  assert.equal((await adminOrdersOf()).find(x => x.id === o2.id).crn, undefined, 'заказ остался свободным');
  const cq = await call('GET', '/api/courier/orders', { init: iR() });
  const cqj = await jsonOf(cq);
  assert.deepEqual([cqj.cash, cqj.lim], [500000, 500000]);
  // нажатие «Взял» в Telegram тоже останавливается и объясняет
  tgLog = [];
  await cb(DRV, 'k:' + o2.id, 555, DRV.id);
  const al = lastTg('answerCallbackQuery').payload;
  assert.ok(al.show_alert && norm(al.text).includes('Сначала сдайте деньги') && norm(al.text).includes('500 000'), al.text);
  // сдал деньги — снова может
  assert.equal((await call('POST', '/api/admin/couriers/' + id + '/handover', { init: iS(), body: { amount: 300000 } })).status, 200);
  assert.equal((await drvTake(o2.id)).status, 200);
  // лимит снимается нулём
  assert.equal((await put({ lim: 0 })).status, 200);
  assert.equal((await pay(1000, 'cash')).status, 200);
});

await t('контроль денег: владелец видит спорные записи всех дистрибьюторов и может закрыть с комментарием; чужим закрыто', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  assert.equal((await putProd(SAMPLE_PROD())).status, 200);
  const A = newUser();
  const o1 = await readyOrder(A, CART);
  await doneWith(o1.id, { m: 'credit', days: 7 });
  const o2 = await readyDelivery(A, CART, sid);
  tgLog = [];
  assert.equal((await crq(sid, 'POST', '/api/admin/status', iD(), { id: o2.id, to: 'done', pay: { m: 'credit', days: 3 } })).status, 200);
  for (const m of tgAll('sendMessage', p => p.chat_id === A.u.id && p.text.includes('Всё верно?'))) {
    assert.ok(/^q:alfa|^q:[a-z0-9]+:\d+:[yn]$/.test(m.payload.reply_markup.inline_keyboard[0][0].callback_data), m.payload.reply_markup.inline_keyboard[0][0].callback_data);
  }
  const q2 = askOf(A.u.id);
  const dataNo = q2.reply_markup.inline_keyboard[0][1].callback_data;
  assert.ok(dataNo.startsWith('q:' + sid + ':'), 'кнопка второго дистрибьютора несёт его номер: ' + dataNo);
  await cb({ id: A.u.id, first_name: 'Магазин' }, dataNo);
  assert.equal((await jsonOf(await crq(sid, 'GET', '/api/admin/debts', iD()))).fl, 1, 'спор виден продавцу второго дистрибьютора');
  assert.equal((await debtsOf()).fl, 0, 'продавец первого чужого спора не видит');
  // владелец видит спорные по всем
  const hd = async init => call('GET', '/api/hub/admin/disputes', { init });
  assert.equal((await hd(iA())).status, 403);
  assert.equal((await hd(iD())).status, 403, 'продавец дистрибьютора — не владелец');
  const own = (await jsonOf(await hd(iS()))).items;
  assert.deepEqual(own.map(x => [x.did, x.shopName, x.uid, x.cf, x.ref]), [[sid, 'Альфа Трейд', A.u.id, 'no', o2.id]]);
  const rs = body => call('POST', '/api/hub/admin/disputes/resolve', { init: iS(), body });
  assert.equal((await rs({ did: sid, uid: A.u.id, n: own[0].n })).status, 400, 'без комментария нельзя');
  assert.equal((await call('POST', '/api/hub/admin/disputes/resolve', { init: iD(), body: { did: sid, uid: A.u.id, n: own[0].n, note: 'проверил' } })).status, 403);
  assert.equal((await rs({ did: 'nope', uid: A.u.id, n: own[0].n, note: 'проверил' })).status, 404);
  tgLog = [];
  assert.equal((await rs({ did: sid, uid: A.u.id, n: own[0].n, note: 'владелец сверил с накладной' })).status, 200);
  assert.deepEqual((await jsonOf(await hd(iS()))).items, []);
  const row = (await jsonOf(await crq(sid, 'GET', '/api/admin/debts/' + A.u.id, iD()))).debt.rows.find(r => r.n === own[0].n);
  assert.equal(row.rsl.why, 'владелец сверил с накладной');
  assert.equal(row.rsl.bn, 'Jasur', 'видно, кто закрыл');
});

/* ---------- сдача денег доставщиком: подтверждение и срок ---------- */
const hand = (id, amount) => call('POST', '/api/admin/couriers/' + id + '/handover', { init: iS(), body: { amount } });
const handSay = (id, sub, body, init) => call('POST', '/api/admin/couriers/' + id + '/' + sub, { init: init || iS(), body });
const drvAsk = () => { const m = lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes('Всё верно?')); return m ? m.payload : null; };
const drvPay = (uid, amount, m) => call('POST', '/api/courier/debts/' + uid + '/pay', { init: iR(), body: { amount, m: m || 'cash' } });
const crOf = async id => (await crList()).find(c => c.id === id);

await t('сдача денег: доставщик подтверждает «Верно» в Telegram; чужой нажать не может; «Верно» окончательно', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  assert.equal((await drvPay(A.u.id, 500000)).status, 200);
  tgLog = [];
  const h = await jsonOf(await hand(id, 200000));
  assert.equal(h.courier.cash, 300000);
  assert.deepEqual([h.rows[0].k, h.rows[0].a, h.rows[0].cf, h.rows[0].left, h.rows[0].bn], ['out', 200000, 'wait', 300000, 'Jasur']);
  const q = drvAsk();
  assert.ok(q, 'доставщику пришёл вопрос');
  const tx = norm(q.text);
  assert.ok(tx.includes('вы сдали 200 000 сум') && tx.includes('Записал: Jasur') && tx.includes('Остаток на руках: 300 000'), tx);
  assert.deepEqual(q.reply_markup.inline_keyboard[0].map(b => b.callback_data), ['h:' + h.rows[0].n + ':y', 'h:' + h.rows[0].n + ':n']);
  assert.equal((await drvCash()).rows[0].cf, 'wait', 'в кассе у доставщика запись ждёт его ответа');
  // чужой человек нажать не может
  tgLog = [];
  await cb(ANNA, 'h:' + h.rows[0].n + ':y', 900);
  assert.equal(lastTg('answerCallbackQuery').payload.text, 'Ruxsat yoʻq\nНет доступа');
  assert.equal((await drvCash()).rows[0].cf, 'wait');
  // доставщик отвечает «Верно»
  tgLog = [];
  await cb(DRV, 'h:' + h.rows[0].n + ':y', 901, DRV.id);
  assert.ok(lastTg('editMessageText', p => p.message_id === 901).payload.text.includes('Вы подтвердили'));
  assert.equal((await drvCash()).rows[0].cf, 'ok');
  assert.equal((await crOf(id)).hf, 0);
  // после «Верно» менять нельзя
  tgLog = [];
  await cb(DRV, 'h:' + h.rows[0].n + ':n', 901, DRV.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('уже подтвердили'));
  assert.equal((await drvCash()).rows[0].cf, 'ok');
  assert.deepEqual(await dispOf(), []);
  // записи, которой нет, нажать нельзя
  tgLog = [];
  await cb(DRV, 'h:999:y', 902, DRV.id);
  assert.equal(lastTg('answerCallbackQuery').payload.text, 'Yozuv topilmadi\nЗапись не найдена');
});

await t('сдача денег: «Не так» — продавцы узнают сразу, запись спорная; доставщик может передумать; продавец закрывает с комментарием', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  assert.equal((await drvPay(A.u.id, 600000)).status, 200);
  tgLog = [];
  const h1 = await jsonOf(await hand(id, 100000));
  const n1 = h1.rows[0].n;
  await cb(DRV, 'h:' + n1 + ':n', 910, DRV.id);
  const al = lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes('отметил «Не так»'));
  assert.ok(al && norm(al.payload.text).includes('Рустам') && norm(al.payload.text).includes('сдача 100 000') && al.payload.text.includes('Записал: Jasur'), al && al.payload.text);
  assert.ok(lastTg('editMessageText', p => p.message_id === 910).payload.reply_markup.inline_keyboard[0][0].text.includes('Всё-таки верно'));
  let ds = await dispOf();
  assert.deepEqual(ds.map(x => [x.h, x.cid, x.cn, x.n, x.a, x.cf]), [[1, id, 'Рустам', n1, 100000, 'no']]);
  assert.equal((await crOf(id)).hf, 1);
  // спорную запись доставщик может изменить на «Верно»
  await cb(DRV, 'h:' + n1 + ':y', 910, DRV.id);
  assert.deepEqual(await dispOf(), []);
  assert.equal((await crOf(id)).hf, 0);
  // второй вопрос: «Не так», продавец закрывает с комментарием
  const h2 = await jsonOf(await hand(id, 50000));
  const n2 = h2.rows[0].n;
  await cb(DRV, 'h:' + n2 + ':n', 911, DRV.id);
  assert.equal((await dispOf()).length, 1);
  assert.equal((await handSay(id, 'hresolve', { n: n2 })).status, 400, 'без комментария нельзя');
  assert.equal((await handSay(id, 'hresolve', { n: n2, note: 'ок' })).status, 400, 'слишком короткий');
  assert.equal((await handSay(id, 'hresolve', { n: n2, note: 'пересчитали вместе' }, iA())).status, 403);
  assert.equal((await handSay(id, 'hresolve', { n: n1, note: 'пересчитали вместе' })).status, 404, 'подтверждённую закрывать нечего');
  tgLog = [];
  const rs = await jsonOf(await handSay(id, 'hresolve', { n: n2, note: 'пересчитали вместе' }));
  assert.equal(rs.rows.find(r => r.n === n2).rsl.why, 'пересчитали вместе');
  assert.equal(rs.rows.find(r => r.n === n2).rsl.bn, 'Jasur');
  assert.ok(!rs.rows.some(r => r.k === 'hr'), 'служебная строка закрытия не показывается отдельно');
  const note = lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes('закрыл вопрос'));
  assert.ok(note && norm(note.payload.text).includes('сдача 50 000') && note.payload.text.includes('пересчитали вместе'), note && note.payload.text);
  assert.deepEqual(await dispOf(), []);
  assert.equal((await handSay(id, 'hresolve', { n: n2, note: 'ещё раз' })).status, 409);
  // после закрытия «Не так» уже не принимается
  tgLog = [];
  await cb(DRV, 'h:' + n2 + ':n', 911, DRV.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('уже закрыл'));
});

await t('сдача денег: не дошло в Telegram — сразу спорная; молчание больше суток — тоже; доставщик отвечает и в приложении; пока вопрос открыт, доставщика не удалить', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  assert.equal((await drvPay(A.u.id, 500000)).status, 200);
  tgFail = true;
  let h1;
  try { h1 = await jsonOf(await hand(id, 100000)); } finally { tgFail = false; }
  const n1 = h1.rows[0].n;
  assert.equal((await crOf(id)).hf, 1);
  assert.deepEqual((await dispOf()).map(x => [x.cn, x.cf]), [['Рустам', 'na']]);
  // отвечает в приложении
  const cf = (n, ok) => call('POST', '/api/courier/confirm', { init: iR(), body: { n, ok } });
  assert.equal((await cf('x', true)).status, 404);
  assert.equal((await call('POST', '/api/courier/confirm', { init: iA(), body: { n: n1, ok: true } })).status, 403);
  tgLog = [];
  const no = await jsonOf(await cf(n1, false));
  assert.equal(no.rows.find(r => r.n === n1).cf, 'no');
  assert.ok(lastTg('sendMessage', p => p.chat_id === SELLER.id && p.text.includes('отметил «Не так»')), 'продавец узнал');
  const yes = await jsonOf(await cf(n1, true));
  assert.equal(yes.rows.find(r => r.n === n1).cf, 'ok');
  assert.equal((await cf(n1, false)).status, 409, 'после «Верно» менять нельзя');
  assert.deepEqual(await dispOf(), []);
  // молчание: дошло, но ответа нет
  const h2 = await jsonOf(await hand(id, 100000));
  const n2 = h2.rows[0].n;
  assert.deepEqual(await dispOf(), [], 'пока не прошли сутки — просто ждёт');
  assert.equal((await handSay(id, 'hresolve', { n: n2, note: 'рано закрывать' })).status, 409);
  const c = await W.storage.get('cr:' + id), lg = await W.storage.get('cc:' + id);
  const old = new Date(Date.now() - 25 * 3600000).toISOString();
  lg.rows.forEach(r => { if (r.cf === 'wait') r.t = old; });
  c.hwt = c.hwt.map(() => old);
  await W.storage.put('cc:' + id, lg); await W.storage.put('cr:' + id, c);
  assert.deepEqual((await dispOf()).map(x => [x.cn, x.n, x.cf]), [['Рустам', n2, 'late']]);
  assert.equal((await crOf(id)).hf, 1);
  assert.equal((await drvCash()).rows.find(r => r.n === n2).late, true);
  // пока вопрос открыт, доставщика не удалить; деньги сданы целиком
  assert.equal((await hand(id, 300000)).status, 200);
  await cb(DRV, 'h:' + (await drvCash()).rows[0].n + ':y', 920, DRV.id);
  const del = await call('DELETE', '/api/admin/couriers/' + id, { init: iS() });
  assert.equal(del.status, 409); assert.equal((await jsonOf(del)).error, 'has_hq');
  assert.equal((await handSay(id, 'hresolve', { n: n2, note: 'доставщик не отвечает, звонил' })).status, 200);
  assert.equal((await call('DELETE', '/api/admin/couriers/' + id, { init: iS() })).status, 200);
});

await t('сдача денег: продавец отменяет ошибочную сдачу с причиной; деньги снова на руках; доставщик подтверждает отмену; повторно нельзя', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  assert.equal((await drvPay(A.u.id, 400000)).status, 200);
  const h = await jsonOf(await hand(id, 400000));
  const n = h.rows[0].n;
  assert.equal(h.courier.cash, 0);
  assert.equal((await handSay(id, 'hvoid', { n })).status, 400, 'причина обязательна');
  assert.equal((await handSay(id, 'hvoid', { n, reason: 'ой' })).status, 400);
  assert.equal((await handSay(id, 'hvoid', { n, reason: 'ввёл лишний ноль' }, iA())).status, 403);
  assert.equal((await handSay(id, 'hvoid', { n: 999, reason: 'ввёл лишний ноль' })).status, 404);
  tgLog = [];
  const v = await jsonOf(await handSay(id, 'hvoid', { n, reason: 'ввёл лишний ноль' }));
  assert.equal(v.courier.cash, 400000, 'деньги снова числятся на руках');
  const ox = v.rows.find(r => r.k === 'ox');
  assert.deepEqual([ox.a, ox.cf, ox.left, ox.why, ox.bn], [400000, 'wait', 400000, 'ввёл лишний ноль', 'Jasur']);
  const orig = v.rows.find(r => r.n === n);
  assert.deepEqual([orig.vwhy, orig.vbn], ['ввёл лишний ноль', 'Jasur'], 'запись о сдаче осталась в журнале, помечена отменой');
  const q = drvAsk();
  assert.ok(q && norm(q.text).includes('отменил вашу сдачу 400 000') && q.text.includes('ввёл лишний ноль') && norm(q.text).includes('На руках теперь 400 000'), q && q.text);
  assert.equal((await handSay(id, 'hvoid', { n, reason: 'ещё раз' })).status, 409);
  assert.equal((await handSay(id, 'hvoid', { n: ox.n, reason: 'отменить отмену' })).status, 404, 'отмену отменить нельзя');
  // доставщик подтверждает отмену
  await cb(DRV, 'h:' + ox.n + ':y', 930, DRV.id);
  assert.equal((await drvCash()).rows.find(r => r.k === 'ox').cf, 'ok');
  // отменённую сдачу доставщик уже не оспаривает
  tgLog = [];
  await cb(DRV, 'h:' + n + ':n', 931, DRV.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('отменена'));
  // отмена, которую доставщик оспорил, попадает в спорные; закрыть можно с комментарием
  const h2 = await jsonOf(await hand(id, 100000));
  const v2 = await jsonOf(await handSay(id, 'hvoid', { n: h2.rows[0].n, reason: 'деньги не пришли' }));
  const ox2 = v2.rows.find(r => r.k === 'ox' && r.why === 'деньги не пришли');
  await cb(DRV, 'h:' + ox2.n + ':n', 932, DRV.id);
  const ds = await dispOf();
  assert.deepEqual(ds.map(x => [x.k, x.a, x.why]), [['ox', 100000, 'деньги не пришли']]);
  assert.equal((await handSay(id, 'hresolve', { n: ox2.n, note: 'пересчитали, деньги были' })).status, 200);
  assert.deepEqual(await dispOf(), []);
});

await t('сдача денег: владелец видит спорные сдачи и просрочку доставщиков по всем дистрибьюторам и закрывает спор с комментарием', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  assert.equal((await drvPay(A.u.id, 300000)).status, 200);
  const h = await jsonOf(await hand(id, 100000));
  await cb(DRV, 'h:' + h.rows[0].n + ':n', 940, DRV.id);
  const hd = init => call('GET', '/api/hub/admin/disputes', { init });
  const own = (await jsonOf(await hd(iS()))).items;
  assert.deepEqual(own.map(x => [x.h, x.did, x.cid, x.cn, x.a, x.cf]), [[1, 'main', id, 'Рустам', 100000, 'no']]);
  const rs = body => call('POST', '/api/hub/admin/disputes/resolve', { init: iS(), body });
  assert.equal((await rs({ did: 'main', cid: id, n: own[0].n })).status, 400, 'без комментария нельзя');
  assert.equal((await rs({ did: 'main', cid: 'kzzzzz', n: own[0].n, note: 'проверил' })).status, 404);
  assert.equal((await call('POST', '/api/hub/admin/disputes/resolve', { init: iD(), body: { did: 'main', cid: id, n: own[0].n, note: 'проверил' } })).status, 403);
  assert.equal((await rs({ did: 'main', cid: id, n: own[0].n, note: 'владелец пересчитал кассу' })).status, 200);
  assert.deepEqual((await jsonOf(await hd(iS()))).items, []);
  const row = (await drvCash()).rows.find(r => r.n === h.rows[0].n);
  assert.deepEqual([row.rsl.why, row.rsl.bn], ['владелец пересчитал кассу', 'Jasur']);
});

await t('срок сдачи: по умолчанию в тот же день; просрочка блокирует новые заказы и наличные оплаты долга, безнал берёт; сдача закрывает самые старые деньги', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  const c0 = await crOf(id);
  assert.deepEqual([c0.dl, c0.late, c0.cs], [0, 0, ''], 'срок по умолчанию — в тот же день');
  const put = body => call('PUT', '/api/admin/couriers/' + id, { init: iS(), body });
  for (const dl of [-2, 31, 1.5, 'неделя', null, '3']) assert.equal((await put({ dl })).status, 400, String(dl));
  assert.equal((await call('PUT', '/api/admin/couriers/' + id, { init: iA(), body: { dl: 1 } })).status, 403);
  // старые деньги: приняты два дня назад
  assert.equal((await drvPay(A.u.id, 100000)).status, 200);
  const c1 = await crOf(id);
  assert.equal(c1.late, 0, 'принял сегодня — ещё вовремя');
  assert.ok(c1.cs, 'видно, с какого времени деньги на руках');
  const two = new Date(Date.now() - 48 * 3600000).toISOString();
  let c = await W.storage.get('cr:' + id), lg = await W.storage.get('cc:' + id);
  lg.rows.forEach(r => { if (r.k === 'in') r.t = two; }); c.cs = two;
  await W.storage.put('cc:' + id, lg); await W.storage.put('cr:' + id, c);
  assert.equal((await put({ dl: -1 })).status, 200);
  assert.equal((await crOf(id)).late, 0, 'без срока просрочки нет');
  // свежие деньги принимает, пока срока нет
  assert.equal((await drvPay(A.u.id, 50000)).status, 200);
  assert.equal((await put({ dl: 0 })).status, 200);
  const c2 = await crOf(id);
  assert.equal(c2.late, 2);
  assert.equal(c2.cash, 150000);
  const cq = await jsonOf(await call('GET', '/api/courier/orders', { init: iR() }));
  assert.deepEqual([cq.late, cq.dl, cq.cash], [2, 0, 150000]);
  assert.equal((await drvCash()).late, 2);
  // блокировки
  const o2 = await readyDelivery(A, ONE);
  const tk = await drvTake(o2.id);
  assert.equal(tk.status, 409);
  const tkj = await jsonOf(tk);
  assert.deepEqual([tkj.error, tkj.late], ['cash_late', 2]);
  assert.equal((await adminOrdersOf()).find(x => x.id === o2.id).crn, undefined, 'заказ остался свободным');
  tgLog = [];
  await cb(DRV, 'k:' + o2.id, 555, DRV.id);
  const al = lastTg('answerCallbackQuery').payload;
  assert.ok(al.show_alert && norm(al.text).includes('Сначала сдайте деньги') && al.text.includes('просрочка 2'), al.text);
  const pc = await drvPay(A.u.id, 1000, 'cash');
  assert.equal(pc.status, 409); assert.equal((await jsonOf(pc)).error, 'cash_late');
  assert.equal((await drvPay(A.u.id, 1000, 'card')).status, 200, 'безнал в кассу не идёт, его просрочка не останавливает');
  // владелец видит просрочку
  const own = (await jsonOf(await call('GET', '/api/hub/admin/disputes', { init: iS() }))).items;
  assert.deepEqual(own.map(x => [x.h, x.cid, x.cn, x.late, x.a]), [[2, id, 'Рустам', 2, 150000]]);
  // срок 3 дня: просрочки нет; 1 день: просрочка на 1
  assert.equal((await put({ dl: 3 })).status, 200);
  assert.equal((await crOf(id)).late, 0);
  assert.equal((await drvTake(o2.id)).status, 200);
  assert.equal((await put({ dl: 1 })).status, 200);
  assert.equal((await crOf(id)).late, 1);
  // сдача закрывает самые старые деньги: 100 000 сдано, остались свежие 50 000 — просрочка снимается
  assert.equal((await put({ dl: 0 })).status, 200);
  assert.equal((await crOf(id)).late, 2);
  assert.equal((await hand(id, 100000)).status, 200);
  const c3 = await crOf(id);
  assert.deepEqual([c3.cash, c3.late], [50000, 0]);
  assert.ok(Date.now() - Date.parse(c3.cs) < 3600000, 'теперь самые старые деньги — свежие');
  const o3 = await readyDelivery(A, ONE);
  assert.equal((await drvTake(o3.id)).status, 200, 'после сдачи снова берёт заказы');
  // сдал всё — «с какого времени» пусто
  assert.equal((await hand(id, 50000)).status, 200);
  assert.deepEqual([(await crOf(id)).cs, (await crOf(id)).late], ['', 0]);
});

await t('срок сдачи: отменённая оплата долга не считается старыми деньгами', async () => {
  await stockWorld();
  const id = await hire(DRV, 'Рустам');
  const A = newUser();
  await doneWith((await readyOrder(A, CART)).id, { m: 'credit', days: 7 });
  assert.equal((await drvPay(A.u.id, 70000)).status, 200);
  const two = new Date(Date.now() - 48 * 3600000).toISOString();
  let c = await W.storage.get('cr:' + id), lg = await W.storage.get('cc:' + id);
  lg.rows.forEach(r => { if (r.k === 'in') r.t = two; });
  await W.storage.put('cc:' + id, lg);
  assert.equal((await drvPay(A.u.id, 30000)).status, 200);
  const d = await jsonOf(await call('GET', '/api/admin/debts/' + A.u.id, { init: iS() }));
  const old = d.debt.rows.find(r => r.k === 'pay' && r.a === 70000);
  assert.equal((await call('POST', '/api/admin/debts/' + A.u.id + '/void', { init: iS(), body: { n: old.n, reason: 'ошибся суммой' } })).status, 200);
  const c1 = await crOf(id);
  assert.equal(c1.cash, 30000);
  assert.ok(Date.now() - Date.parse(c1.cs) < 3600000, 'старая оплата отменена, остались свежие деньги');
  assert.equal(c1.late, 0);
});

/* ---------- люди: список для владельца и сообщения о входе по коду ---------- */
const peopleOf = async init => call('GET', '/api/hub/admin/people/list', { init: init || iS() });
const loginMsgs = () => tgAll('sendMessage', p => p.chat_id === SELLER.id && String(p.text).startsWith('🔑'));

await t('люди: список только у владельца; заходившие видны с ролями, имя и логин берутся из Telegram', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  assert.equal((await peopleOf(iD())).status, 403, 'продавец дистрибьютора не владелец');
  assert.equal((await peopleOf(iA())).status, 403, 'клиент тем более');
  assert.equal((await call('GET', '/api/hub/admin/people/list')).status, 401);
  // клиент открывает приложение, дистрибьютор пишет боту
  await call('GET', '/api/shops', { init: iA() });
  await send({ update_id: 9101, message: { message_id: 9101, from: BOB, chat: { id: BOB.id, type: 'private' }, text: '/start' } });
  const d = await jsonOf(await peopleOf());
  const by = id => d.people.find(x => x.id === id);
  assert.deepEqual(by(ANNA.id).roles, [], 'у клиента ролей нет');
  assert.equal(by(ANNA.id).nm, 'Анна');
  assert.equal(by(ANNA.id).un, 'anna_k');
  assert.ok(by(BOB.id), 'написавший боту тоже в списке');
  assert.deepEqual(by(SELLER.id).roles.map(r => r.r).sort(), ['owner', 'seller']);
  assert.deepEqual(by(DIL.id).roles, [{ r: 'seller', n: 'Альфа Трейд' }]);
  assert.ok(by(SELLER.id).last && by(SELLER.id).first, 'у владельца есть даты');
  assert.equal(d.total, d.people.length);
  // держатель роли, которого после появления списка ещё не видели: в списке есть, но ниже заходивших
  await W.hubStorage.put('adm:7777', ['main']);
  const d2 = await jsonOf(await peopleOf());
  const ghost = d2.people.find(x => x.id === 7777);
  assert.ok(ghost && ghost.last === '' && ghost.nm === '' && ghost.roles[0].r === 'seller', JSON.stringify(ghost));
  assert.equal(d2.people[d2.people.length - 1].id, 7777, 'невидимка в конце');
});

await t('люди: повторные заходы не плодят записей, имя и логин обновляются', async () => {
  await shopWorld('Альфа Трейд');
  await call('GET', '/api/shops', { init: iA() });
  const first = (await jsonOf(await peopleOf())).people.find(x => x.id === ANNA.id);
  const ANNA2 = Object.assign({}, ANNA, { first_name: 'Анна-Мария', username: 'anna_m' });
  await call('GET', '/api/shops', { init: initDataFor(ANNA2) });
  const d = await jsonOf(await peopleOf());
  assert.equal(d.people.filter(x => x.id === ANNA.id).length, 1);
  const a = d.people.find(x => x.id === ANNA.id);
  assert.equal(a.first, first.first, 'первый заход не меняется');
});

await t('люди: агент и доставщик с ролями и именами, магазин из базы с названием', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [] }));
  await send(agentMsg(AGT, made.code, 3));
  await hire(DRV, 'Рустам', sid);
  const A = newUser();
  await ordBase(sid, A, { name: 'Магазин Мадина', phone: '+998 90 111 22 33' }, 'delivery');
  const d = await jsonOf(await peopleOf());
  const by = id => d.people.find(x => x.id === id);
  assert.deepEqual(by(AGT.id).roles, [{ r: 'agent', n: 'Азиз' }]);
  assert.deepEqual(by(DRV.id).roles, [{ r: 'courier', n: 'Альфа Трейд' }]);
  const shop = by(A.u.id);
  assert.ok(shop && shop.shop && shop.shop.name === 'Магазин Мадина', 'название магазина из базы: ' + JSON.stringify(shop));
  assert.equal(JSON.stringify(d).includes('hash'), false, 'хэши кодов не уходят');
});

await t('вход по коду: владелец получает сообщение при первом входе продавца, агента и доставщика; повтор молчит', async () => {
  await hubWorld();
  const d = await addShop('Альфа Трейд');
  tgLog = [];
  await send(adminMsg(DIL, d.code, 2));
  let m = loginMsgs();
  assert.equal(m.length, 1, 'одно сообщение владельцу');
  assert.ok(m[0].payload.text.includes('Dilshod (@dil_alfa), ID ' + DIL.id) && m[0].payload.text.includes('продавец «Альфа Трейд»'), m[0].payload.text);
  tgLog = [];
  await send(adminMsg(DIL, d.code, 3));
  assert.equal(loginMsgs().length, 0, 'повторная команда не шумит');
  // второй человек с тем же кодом — новое сообщение
  tgLog = [];
  await send(adminMsg(JAS2, d.code, 4));
  assert.equal(loginMsgs().length, 1);
  assert.ok(loginMsgs()[0].payload.text.includes('Sardor (@sardor_b)'));
  // неверный код ничего не присылает
  tgLog = [];
  await send(adminMsg(ANNA, 'wrong-wrong-wrong', 5));
  assert.equal(loginMsgs().length, 0);
  // агент
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [] }));
  tgLog = [];
  await send(agentMsg(AGT, made.code, 6));
  m = loginMsgs();
  assert.equal(m.length, 1);
  assert.ok(m[0].payload.text.includes('вошёл как агент «Азиз»') && !m[0].payload.text.includes('раньше был'), m[0].payload.text);
  tgLog = [];
  await send(agentMsg(AGT, made.code, 7));
  assert.equal(loginMsgs().length, 0, 'тот же аккаунт повторно: тихо');
  // тот же код с другого Telegram: сообщение с пометкой про прежний аккаунт
  tgLog = [];
  await send(agentMsg(AGT2, made.code, 8));
  m = loginMsgs();
  assert.equal(m.length, 1);
  assert.ok(m[0].payload.text.includes('Botir (@botir_ag)') && m[0].payload.text.includes('ID ' + AGT.id) && m[0].payload.text.includes('отключён'), m[0].payload.text);
  assert.equal((await meHub(AGT)).agent, undefined, 'прежний аккаунт потерял роль');
  // доставщик по приглашению
  tgLog = [];
  await hire(DRV, 'Рустам', d.shop.id);
  m = loginMsgs();
  assert.equal(m.length, 1);
  assert.ok(m[0].payload.text.includes('стал доставщиком «Альфа Трейд»') && m[0].payload.text.includes('ID ' + DRV.id), m[0].payload.text);
});

await t('вход по коду: код владельца с нового аккаунта извещает прежних владельцев, а сам вошедший сообщения не получает', async () => {
  await hubWorld();
  const OWN2 = { id: 9301, first_name: 'Бахром', username: 'bahrom_2', language_code: 'ru' };
  tgLog = [];
  await send(adminMsg(OWN2, CODE, 2));
  const m = loginMsgs();
  assert.equal(m.length, 1);
  assert.ok(m[0].payload.text.includes('вошёл как владелец площадки') && m[0].payload.text.includes('Бахром (@bahrom_2)'), m[0].payload.text);
  assert.equal(tgAll('sendMessage', p => p.chat_id === OWN2.id && String(p.text).startsWith('🔑')).length, 0, 'себе не пишем');
  tgLog = [];
  await send(adminMsg(OWN2, CODE, 3));
  assert.equal(loginMsgs().length, 0, 'повторный вход молчит');
  // самый первый вход владельца: получателей нет, ошибок нет
  W = makeWorld(); tgLog = [];
  await send(adminMsg(SELLER, CODE, 1));
  assert.equal(tgAll('sendMessage', p => String(p.text).startsWith('🔑')).length, 0);
});

/* ---------- утреннее напоминание о просрочке ---------- */
const runMorning = async () => { const jobs = []; await mod.default.scheduled({ cron: '0 4 * * *' }, W.env, { waitUntil: p => jobs.push(p) }); await Promise.all(jobs); };
const morningMsgs = to => tgAll('sendMessage', p => p.chat_id === to && String(p.text).startsWith('⏰'));
/* заказ выдан в долг и просрочен на days дней */
async function overdueDebt(days, cart) {
  const u = newUser(), o = await readyOrder(u, cart || ONE);
  await doneWith(o.id, { m: 'credit', days: 3 });
  await backdate(u.u.id, o.id, plusDays(shopDay(), -days));
  return u;
}

await t('утреннее напоминание: продавцу список просроченных, самые давние первыми; без просрочки молчит; в тот же день не повторяется', async () => {
  await stockWorld();
  tgLog = [];
  await runMorning();
  assert.equal(morningMsgs(SELLER.id).length, 0, 'долгов нет: тихо');
  const a = await overdueDebt(4), b = await overdueDebt(10, CART);
  const c = newUser(); { const o = await readyOrder(c, ONE); await doneWith(o.id, { m: 'credit', days: 5 }); }
  const dd = newUser(); { const o = await readyOrder(dd, ONE); await doneWith(o.id, { m: 'cash' }); }
  tgLog = [];
  await runMorning();
  const m = morningMsgs(SELLER.id);
  assert.equal(m.length, 1, 'одно сообщение продавцу');
  const text = m[0].payload.text.replace(/[\u00a0\u202f]/g, ' ');
  assert.ok(text.includes('просрочка на сегодня') && text.includes('Магазинов: 2'), text);
  const [uzT, ruT] = text.split('\n\n⏰');
  assert.ok(uzT.startsWith('⏰ ') && uzT.includes('bugungi kechikishlar') && uzT.includes('Doʻkonlar: 2') && ruT.includes('просрочка на сегодня'), 'сверху узбекский, ниже русский: ' + text);
  const rowsOf = x => x.split('\n').filter(y => /^\d+\. /.test(y));
  const rows = rowsOf(ruT), rowsUz = rowsOf(uzT);
  assert.equal(rows.length, 2, 'в списке только просроченные: ' + text);
  assert.equal(rowsUz.length, 2);
  assert.ok(rows[0].includes('10 дн.') && rows[0].includes('1 394 000') && rows[1].includes('4 дн.') && rows[1].includes('7 500'), rows.join(' | '));
  assert.ok(rowsUz[0].includes('10 kun') && rowsUz[0].includes('1 394 000') && rowsUz[1].includes('4 kun') && rowsUz[1].includes('7 500'), rowsUz.join(' | '));
  assert.ok(ruT.includes('просрочено 1 401 500') && uzT.includes('muddati oʻtgan 1 401 500'), 'общая сумма: ' + text);
  assert.equal(m[0].payload.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?d=main&v=seller', 'кнопка в приложение');
  assert.equal(tgAll('sendMessage', p => p.chat_id === a.u.id || p.chat_id === b.u.id).filter(x => String(x.payload.text).startsWith('⏰')).length, 0, 'магазинам автоматически не пишем');
  tgLog = [];
  await runMorning();
  assert.equal(morningMsgs(SELLER.id).length, 0, 'в тот же день второй раз не шлём');
});

await t('утреннее напоминание: переключатель выключает рассылку, включает обратно; доступен только продавцу', async () => {
  await stockWorld();
  await overdueDebt(3);
  const sw = (on, init) => call('POST', '/api/admin/debts/morning', { init: init || iS(), body: on });
  assert.equal((await jsonOf(await call('GET', '/api/admin/debts', { init: iS() }))).morning, true, 'по умолчанию включено');
  assert.equal((await sw({ on: false }, iA())).status, 403, 'клиент не может');
  assert.equal((await call('POST', '/api/admin/debts/morning', { body: { on: false } })).status, 401);
  for (const bad of [{}, { on: 'no' }, { on: 1 }, null]) assert.equal((await sw(bad)).status, 400, JSON.stringify(bad));
  assert.equal((await sw({ on: false })).status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/admin/debts', { init: iS() }))).morning, false);
  tgLog = [];
  await runMorning();
  assert.equal(morningMsgs(SELLER.id).length, 0, 'выключено: тихо');
  assert.equal((await sw({ on: true })).status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/admin/debts', { init: iS() }))).morning, true);
  await runMorning();
  assert.equal(morningMsgs(SELLER.id).length, 1, 'включили снова: сообщение пришло');
});

await t('утреннее напоминание: длинный список сокращается до 10 строк, сообщение укладывается в лимит Telegram', async () => {
  await stockWorld();
  for (let i = 0; i < 12; i++) await overdueDebt(2 + i);
  tgLog = [];
  await runMorning();
  const text = morningMsgs(SELLER.id)[0].payload.text.replace(/[\u00a0\u202f]/g, ' ');
  const [uzT, ruT] = text.split('\n\n⏰');
  const rowsOf = x => x.split('\n').filter(y => /^\d+\. /.test(y));
  assert.equal(rowsOf(uzT).length, 10); assert.equal(rowsOf(ruT).length, 10, 'в каждом языке по 10 строк');
  assert.ok(text.includes('Магазинов: 12') && text.trimEnd().endsWith('и ещё 2') && uzT.trimEnd().endsWith('va yana 2'), text);
  assert.ok(text.length < 3000);
  assert.ok(rowsOf(ruT)[0].includes('13 дн.') && rowsOf(uzT)[0].includes('13 kun'), 'самый давний первым');
});

await t('утреннее напоминание: у каждого дистрибьютора своё, чужие продавцы не получают, отключённые пропускаются', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  tgLog = [];
  await runMorning();
  assert.equal(morningMsgs(SELLER.id).length + morningMsgs(DIL.id).length, 0, 'долгов нигде нет: тихо');
  // долг у второго дистрибьютора: сообщение именно с его названием и только его продавцу
  const U = newUser();
  const o = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: U.init(), body: { cart: CART, form: formFor(S.DEFAULT, 'pickup', {}), lang: 'ru', expectTotal: 1394000 } }))).order;
  for (const to of ['accepted', 'ready']) assert.equal((await callS(sid, 'POST', '/api/admin/status', { init: iD(), body: { id: o.id, to } })).status, 200);
  assert.equal((await callS(sid, 'POST', '/api/admin/status', { init: iD(), body: { id: o.id, to: 'done', pay: { m: 'credit', days: 3 } } })).status, 200);
  const sh = W.getShop(sid).storage, lg = await sh.get('lg:' + U.u.id), lh = await sh.get('lh:' + U.u.id);
  lg.rows.forEach(r => { if (r.k === 'ch') r.due = plusDays(shopDay(), -7); }); lh.open.forEach(q => { q.due = plusDays(shopDay(), -7); });
  await sh.put('lg:' + U.u.id, lg); await sh.put('lh:' + U.u.id, lh);
  await W.storage.delete('mrd');
  tgLog = [];
  await runMorning();
  const md = morningMsgs(DIL.id), mt = md.length ? md[0].payload.text.replace(/[\u00a0\u202f]/g, ' ') : '';
  assert.equal(md.length, 1);
  assert.ok(mt.includes('Альфа Трейд') && mt.includes('7 дн.') && mt.includes('1 394 000'), mt);
  assert.equal(morningMsgs(SELLER.id).length, 0, 'у первого дистрибьютора просрочки нет, его продавцу не пишем');
  // отключённый дистрибьютор пропускается
  const recs = await W.hubStorage.get('d:' + sid);
  recs.on = false; await W.hubStorage.put('d:' + sid, recs);
  await sh.delete('mrd'); tgLog = [];
  await runMorning();
  assert.equal(morningMsgs(DIL.id).length, 0, 'отключён: тихо');
});

await t('утреннее напоминание: расписание в wrangler.toml и обработчик scheduled на месте', async () => {
  const toml = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
  assert.match(toml, /\[triggers\]\s*\ncrons = \["0 4 \* \* \*"\]/);
  assert.equal(typeof mod.default.scheduled, 'function');
  // без токена бота не падает и ничего не шлёт
  W = makeWorld({ BOT_TOKEN: '' }); tgLog = [];
  await runMorning();
  assert.equal(tgAll('sendMessage').length, 0);
});

/* ---------- вид: рамки и поля ---------- */
await t('вид: рамка --edge задана во всех темах, поля и карточки не прозрачные, товар в корзине получает зелёную рамку', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  assert.equal((html.match(/--edge:#[0-9A-Fa-f]{6};/g) || []).length, 3, 'токен в светлой теме и в двух тёмных блоках');
  assert.ok(/input\[type=text\][^{]*\{[^}]*background:var\(--bg\);border:1\.5px solid var\(--edge\)/.test(html), 'поля: фон страницы и рамка');
  for (const sel of ['.card', '.stat', '.lbox', '.drow', '.dvc', '.dcard', '.mcard', '.rcard', '.pcard', '.chip', '.payb']) {
    const m = html.match(new RegExp('^' + sel.replace('.', '\\.') + '\\{[^}]*\\}', 'm'));
    assert.ok(m, 'правило ' + sel);
    assert.ok(/border:(1|1\.5|2)px (solid|dashed) var\(--edge\)/.test(m[0]), sel + ' без заметной рамки: ' + m[0].slice(0, 120));
  }
  assert.ok(/\.pcard\.incart\{border-color:var\(--accent\)\}/.test(html), 'зелёная рамка в корзине');
  assert.ok(html.includes("(!off&&S.cart[p.id]>0?' incart':'')") && html.includes("classList.toggle('incart'"), 'класс ставится при отрисовке и при смене количества');
  assert.ok(/\.pf>div:not\(\.full\)\{display:flex;flex-direction:column;justify-content:flex-end\}/.test(html), 'пары полей формы товара выровнены по нижнему краю');
});

/* ---------- акт сверки ---------- */
const actMsgs = to => tgAll('sendMessage', p => p.chat_id === to && /^📄/.test(String(p.text)));
const flat = x => String(x).replace(/[  ]/g, ' ');
const actReq = (uid, period, init) => debtAct(uid, 'act', { period }, init);
const dmyOf = d => d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4);
/* акт магазину можно слать раз в час: тест сдвигает время прошлых актов назад */
async function ageActs(uid) {
  const lg = await W.storage.get('lg:' + uid);
  lg.rows.forEach(r => { if (r.k === 'ac') r.t = new Date(Date.now() - 2 * 3600000).toISOString(); });
  await W.storage.put('lg:' + uid, lg);
}
const acRows = async uid => (await W.storage.get('lg:' + uid)).rows.filter(r => r.k === 'ac');

await t('акт сверки: магазин получает выписку с составом заказов и кнопками, долг не меняется, запись видна в истории', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 14 });
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 100000, m: 'cash' })).status, 200);
  await confirmAll(A.u.id);
  const before = await debtOf(A.u.id);
  assert.equal(before.bal, 1294000);
  assert.equal((await actReq(A.u.id, 'all', iA())).status, 403, 'клиент не может');
  assert.equal((await call('POST', '/api/admin/debts/' + A.u.id + '/act', { body: { period: 'all' } })).status, 401);
  for (const bad of [{}, { period: 'week' }, { period: 1 }]) assert.equal((await debtAct(A.u.id, 'act', bad)).status, 400, JSON.stringify(bad));
  assert.equal((await actReq(777000111, 'all')).status, 404, 'магазина без долговой истории нет');
  assert.notEqual((await call('POST', '/api/courier/debts/' + A.u.id + '/act', { init: iR(), body: { period: 'all' } })).status, 200, 'доставщик акт не шлёт');
  assert.equal((await acRows(A.u.id)).length, 0);
  tgLog = [];
  const r = await actReq(A.u.id, 'all');
  assert.equal(r.status, 200, JSON.stringify(await jsonOf(r)));
  const m = actMsgs(A.u.id);
  assert.equal(m.length, 1, 'одно сообщение');
  const text = flat(m[0].payload.text);
  assert.ok(text.startsWith('📄 Акт сверки — '), text);
  assert.ok(text.includes('Период: с начала записей – ' + dmyOf(shopDay())), text);
  assert.ok(text.includes('Остаток на начало: 0 сум'), text);
  assert.ok(text.includes('Заказ ' + o.id), text);
  for (const it of o.items) assert.ok(text.includes('• ' + it.name) && text.includes(' × ' + it.qty), 'товар в акте: ' + it.name + '\n' + text);
  assert.ok(text.includes('В долг: +1 394 000 сум (срок ' + dmyOf(plusDays(shopDay(), 14)) + ')'), text);
  assert.ok(text.includes('Оплата (наличные)\n−100 000 сум'), text);
  assert.ok(text.includes('Итого за период: в долг +1 394 000 сум, оплачено −100 000 сум'), text);
  assert.ok(text.includes('Долг на ' + dmyOf(shopDay()) + ': 1 294 000 сум'), text);
  assert.ok(text.trimEnd().endsWith('Всё верно?'), text);
  const ac = (await acRows(A.u.id))[0];
  assert.ok(ac && ac.cf === 'wait' && ac.d === 0 && ac.a === 0 && ac.f === '' && ac.e === shopDay() && ac.ob === 0 && ac.cb === 1294000 && ac.pr === 'all', JSON.stringify(ac));
  assert.deepEqual(m[0].payload.reply_markup.inline_keyboard[0].map(b => b.callback_data), ['q:' + ac.n + ':y', 'q:' + ac.n + ':n']);
  const after = await debtOf(A.u.id);
  assert.equal(after.bal, 1294000, 'акт долг не меняет');
  assert.deepEqual(after.open, before.open);
  assert.ok(after.rows.some(x => x.k === 'ac' && x.cb === 1294000 && x.cf === 'wait'), 'акт в истории расчётов');
  assert.equal((await actReq(A.u.id, 'all')).status, 429, 'чаще раза в час нельзя');
  // магазин видит акт среди записей, на которые нужно ответить
  const full = (await jsonOf(await call('GET', '/api/hub/debts?full=1', { init: A.init() }))).debts.find(d => d.did === 'main');
  assert.equal(full.ask, 1);
  assert.ok(full.rows.some(x => x.k === 'ac' && x.e === shopDay() && x.cb === 1294000 && x.cf === 'wait'), JSON.stringify(full.rows));
});

await t('акт сверки: «этот месяц», «прошлый месяц», «всё время»; остаток на начало считается по записям до периода', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 30 });
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 400000, m: 'card' })).status, 200);
  const [y, mo] = shopDay().split('-').map(Number), iso = (yy, mm, dd) => new Date(Date.UTC(yy, mm, dd)).toISOString().slice(0, 10);
  const pFirst = iso(y, mo - 2, 1), pLast = iso(y, mo - 1, 0), cFirst = iso(y, mo - 1, 1);
  const setT = async (chAt, payAt) => {
    const lg = await W.storage.get('lg:' + A.u.id);
    lg.rows.forEach(r => { if (r.k === 'ch') r.t = chAt.toISOString(); if (r.k === 'pay') r.t = payAt.toISOString(); });
    await W.storage.put('lg:' + A.u.id, lg);
  };
  await setT(new Date(Date.UTC(y, mo - 2, 10, 7)), new Date(Date.UTC(y, mo - 1, 1, 7)));      // заказ в прошлом месяце, оплата в этом
  const run = async per => {
    await ageActs(A.u.id); tgLog = [];
    const r = await actReq(A.u.id, per);
    assert.equal(r.status, 200, per + ' ' + JSON.stringify(await jsonOf(r)));
    return flat(actMsgs(A.u.id).map(x => x.payload.text).join('\n'));
  };
  const prev = await run('prev');
  assert.ok(prev.includes('Период: ' + dmyOf(pFirst) + ' – ' + dmyOf(pLast)), prev);
  assert.ok(prev.includes('Остаток на ' + dmyOf(pFirst) + ': 0 сум') && prev.includes('Заказ ' + o.id) && !prev.includes('Оплата'), prev);
  assert.ok(prev.includes('Долг на ' + dmyOf(pLast) + ': 1 394 000 сум'), prev);
  const cur = await run('this');
  assert.ok(cur.includes('Период: ' + dmyOf(cFirst) + ' – ' + dmyOf(shopDay())), cur);
  assert.ok(cur.includes('Остаток на ' + dmyOf(cFirst) + ': 1 394 000 сум') && !cur.includes('Заказ ' + o.id) && cur.includes('Оплата (карта)\n−400 000 сум'), cur);
  assert.ok(cur.includes('Долг на ' + dmyOf(shopDay()) + ': 994 000 сум'), cur);
  const all = await run('all');
  assert.ok(all.includes('Остаток на начало: 0 сум') && all.includes('Заказ ' + o.id) && all.includes('Оплата (карта)') && all.includes('Долг на ' + dmyOf(shopDay()) + ': 994 000 сум'), all);
  assert.equal((await acRows(A.u.id)).length, 1, 'акт без ответа заменяется новым, а не копится');
  assert.equal((await debtOf(A.u.id)).bal, 994000);
  // в периоде движений нет, но остаток есть: выписка всё равно имеет смысл
  await setT(new Date(Date.UTC(y, mo - 3, 10, 7)), new Date(Date.UTC(y, mo - 3, 12, 7)));
  const quiet = await run('prev');
  assert.ok(quiet.includes('Остаток на ' + dmyOf(pFirst) + ': 994 000 сум') && quiet.includes('За период записей нет.') && quiet.includes('Долг на ' + dmyOf(pLast) + ': 994 000 сум'), quiet);
  // нет ни остатка, ни движений: акт слать не о чем
  const B = newUser(), ob = await readyOrder(B, ONE);
  await doneWith(ob.id, { m: 'credit', days: 5 });
  assert.equal((await actReq(B.u.id, 'prev')).status, 404);
  assert.equal((await acRows(B.u.id)).length, 0);
});

await t('акт сверки: «Не так» делает долг спорным и сообщает продавцу, продавец закрывает с комментарием, «Верно» окончательно', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 5 });
  await confirmAll(A.u.id);
  assert.equal((await actReq(A.u.id, 'all')).status, 200);
  const n = (await acRows(A.u.id))[0].n;
  tgLog = [];
  await cb({ id: A.u.id, first_name: 'Магазин' }, 'q:' + n + ':n', 4242);
  assert.equal((await acRows(A.u.id))[0].cf, 'no');
  const warn = tgAll('sendMessage', p => p.chat_id === SELLER.id && String(p.text).includes('«Не так»'));
  assert.equal(warn.length, 1, 'продавцу пришло предупреждение');
  assert.ok(flat(warn[0].payload.text).includes('акт сверки по ' + dmyOf(shopDay()) + ', долг 1 394 000 сум'), flat(warn[0].payload.text));
  assert.ok(tgLog.some(x => /edit/i.test(x.method) && String(x.payload.text).includes('Не так')), 'сообщение магазина обновилось');
  assert.equal((await debtOf(A.u.id)).fl, 1, 'долг спорный');
  assert.equal((await debtsOf()).fl, 1);
  const disp = (await jsonOf(await call('GET', '/api/admin/disputes', { init: iS() }))).items.find(x => x.k === 'ac');
  assert.ok(disp && disp.cf === 'no' && disp.cb === 1394000 && disp.e === shopDay() && disp.n === n && disp.uid === A.u.id, JSON.stringify(disp));
  assert.equal((await debtAct(A.u.id, 'resolve', { n, note: '' })).status, 400, 'комментарий обязателен');
  tgLog = [];
  assert.equal((await debtAct(A.u.id, 'resolve', { n, note: 'сверили по телефону' })).status, 200);
  assert.ok(flat(tgAll('sendMessage', p => p.chat_id === A.u.id)[0].payload.text).includes('Продавец закрыл вопрос по записи: акт сверки'), 'магазин узнал, что вопрос закрыт');
  assert.equal((await debtOf(A.u.id)).fl, 0, 'спор закрыт');
  // новый акт, «Верно»: ответ окончательный
  await ageActs(A.u.id);
  assert.equal((await actReq(A.u.id, 'all')).status, 200);
  const n2 = (await acRows(A.u.id)).pop().n;
  assert.notEqual(n2, n);
  await cb({ id: A.u.id, first_name: 'Магазин' }, 'q:' + n2 + ':y', 4243);
  assert.equal((await acRows(A.u.id)).find(r => r.n === n2).cf, 'ok');
  assert.equal((await debtOf(A.u.id)).fl, 0);
  tgLog = [];
  await cb({ id: A.u.id, first_name: 'Магазин' }, 'q:' + n2 + ':n', 4243);
  assert.equal((await acRows(A.u.id)).find(r => r.n === n2).cf, 'ok', 'после «Верно» передумать нельзя');
  assert.equal(tgAll('sendMessage', p => p.chat_id === SELLER.id && String(p.text).includes('«Не так»')).length, 0);
  assert.equal((await debtOf(A.u.id)).bal, 1394000, 'долг за всё время не менялся');
});

await t('акт сверки: длинная выписка делится на сообщения, кнопки только под последним; слишком длинная отклоняется', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, ONE);
  await doneWith(o.id, { m: 'credit', days: 5 });
  const fill = async count => {
    const lg = await W.storage.get('lg:' + A.u.id);
    lg.rows = []; lg.seq = 0;
    for (let i = 0; i < count; i++) { lg.seq++; lg.rows.push({ n: lg.seq, t: new Date().toISOString(), k: 'ch', d: 7500, a: 7500, ref: 'Z-T' + (1000 + i), due: '2099-01-01', cf: 'ok' }); }
    await W.storage.put('lg:' + A.u.id, lg);
  };
  await fill(120);
  tgLog = [];
  assert.equal((await actReq(A.u.id, 'all')).status, 200);
  const m = actMsgs(A.u.id), texts = m.map(x => flat(x.payload.text));
  assert.ok(m.length >= 2 && m.length <= 6, 'сообщений: ' + m.length);
  texts.forEach((x, i) => assert.ok(x.length <= 4096, 'сообщение ' + (i + 1) + ' длиной ' + x.length));
  assert.ok(texts[0].split('\n')[0].endsWith('(1/' + m.length + ')'), texts[0].split('\n')[0]);
  texts.slice(1).forEach((x, i) => assert.ok(x.startsWith('📄 Акт сверки · ' + (i + 2) + '/' + m.length + '\n'), x.slice(0, 40)));
  assert.deepEqual(m.map(x => !!x.payload.reply_markup), m.map((x, i) => i === m.length - 1), 'кнопки только под последним');
  const all = texts.join('\n');
  assert.equal((all.match(/Заказ Z-T/g) || []).length, 120, 'все записи на месте');
  assert.equal((all.match(/В долг: \+/g) || []).length, 120, 'ни одна запись не разорвана между сообщениями');
  assert.ok(texts[m.length - 1].trimEnd().endsWith('Всё верно?'));
  assert.ok(all.includes('Долг на ' + dmyOf(shopDay()) + ': 900 000 сум'), 'итог верный: 120 × 7 500');
  await fill(500);
  tgLog = [];
  const r = await actReq(A.u.id, 'all');
  assert.equal(r.status, 413);
  assert.equal(actMsgs(A.u.id).length, 0, 'слишком длинное не отправляется');
  assert.equal((await acRows(A.u.id)).length, 0);
});

await t('акт сверки: если Telegram не принял сообщение, записи в журнале нет и продавец получает ошибку', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 5 });
  tgFail = true;
  let r;
  try { r = await actReq(A.u.id, 'all'); } finally { tgFail = false; }
  assert.equal(r.status, 502);
  assert.equal((await acRows(A.u.id)).length, 0, 'неотправленный акт в журнале не остаётся');
  assert.equal((await debtOf(A.u.id)).bal, 1394000);
  assert.equal((await actReq(A.u.id, 'all')).status, 200, 'после ошибки повторить можно сразу');
});

await t('акт сверки: узбекский магазин получает текст по-узбекски; у второго дистрибьютора кнопки несут его номер', async () => {
  const { sid } = await shopWorld('Альфа Трейд');
  const V = newUser();
  const o2 = await readyDelivery(V, CART, sid);
  assert.equal((await crq(sid, 'POST', '/api/admin/status', iD(), { id: o2.id, to: 'done', pay: { m: 'credit', days: 3 } })).status, 200);
  const sh = W.getShop(sid).storage;
  const lh = await sh.get('lh:' + V.u.id); lh.lang = 'uz'; await sh.put('lh:' + V.u.id, lh);
  tgLog = [];
  const r = await callS(sid, 'POST', '/api/admin/debts/' + V.u.id + '/act', { init: iD(), body: { period: 'all' } });
  assert.equal(r.status, 200, JSON.stringify(await jsonOf(r)));
  const mm = actMsgs(V.u.id)[0], text = flat(mm.payload.text);
  assert.ok(text.startsWith('📄 Hisob-kitoblarni solishtirish dalolatnomasi — Альфа Трейд'), text);
  assert.ok(text.includes('Davr: yozuvlar boshidan – ') && text.includes('Qarzga: +1 394 000 soʻm') && text.includes('Qarz ' + dmyOf(shopDay()) + ': 1 394 000 soʻm') && text.trimEnd().endsWith('Hammasi toʻgʻrimi?'), text);
  assert.deepEqual(mm.payload.reply_markup.inline_keyboard[0].map(b => b.text), ['✅ Toʻgʻri', '❌ Notoʻgʻri']);
  const data = mm.payload.reply_markup.inline_keyboard[0].map(b => b.callback_data);
  assert.ok(data.every(x => x.startsWith('q:' + sid + ':')), 'кнопки несут номер второго дистрибьютора: ' + data.join(' '));
  assert.equal((await sh.get('lg:' + V.u.id)).rows.filter(x => x.k === 'ac').length, 1);
  await cb({ id: V.u.id, first_name: 'Магазин' }, data[1], 5151);
  assert.equal((await sh.get('lg:' + V.u.id)).rows.find(x => x.k === 'ac').cf, 'no', '«Не так» дошло до хранилища второго дистрибьютора');
  assert.equal(tgAll('sendMessage', p => p.chat_id === DIL.id && String(p.text).includes('акт сверки')).length, 1, 'его продавец получил предупреждение');
});

await t('акт сверки: запись об акте попадает в Excel «История» и не ломает подсчёт долга', async () => {
  await stockWorld();
  const A = newUser();
  const o = await readyOrder(A, CART);
  await doneWith(o.id, { m: 'credit', days: 5 });
  await confirmAll(A.u.id);
  assert.equal((await actReq(A.u.id, 'all')).status, 200);
  tgLog = [];
  assert.equal((await exportReq('debts', { f: 'all' })).status, 200);
  const x = readXlsx(lastDoc().file.bytes), hist = x['История'], hc = n => hist[0].indexOf(n);
  const row = hist.slice(1).find(r => String(r[hc('Запись')]).startsWith('Акт сверки'));
  assert.ok(row, 'строка акта в истории: ' + JSON.stringify(hist));
  assert.equal(row[hc('Сумма, сум')], 1394000, 'в сумме — долг на конец периода');
  assert.equal(row[hc('Ответ магазина')], 'ждём ответа');
  assert.equal(x['Долги'][1][x['Долги'][0].indexOf('Долг, сум')], 1394000);
});

/* ---------- каталог продавца: сворачивание товаров ---------- */
await t('каталог: товары сворачиваются, всё свёрнуто на старте, ▲▼ и удаление только в раскрытой карточке', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  const fn = name => { const i = html.indexOf('function ' + name + '('); assert.ok(i > 0, 'функция ' + name); const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j > 0 ? j : i + 4000); };
  assert.equal((html.match(/medit:\{\},pxo:\{\}/g) || []).length, 2, 'S.pxo есть в начальном состоянии и при сбросе');
  const row = fn('prodRow'), sum = fn('pxSumInner'), body = fn('prodBody');
  assert.ok(/open=!!S\.pxo\[p\.id\]/.test(row) && /\(open\?'<div class="pfbody"/.test(row), 'форма рисуется только у раскрытого товара, по умолчанию свёрнут');
  assert.ok(!/pmove|pdel/.test(row + sum), 'в свёрнутой строке нет ▲▼ и удаления');
  assert.ok(/data-act="pmove"/.test(body) && /data-act="pdel"/.test(body) && /data-act="pfold"/.test(body), 'в раскрытой карточке есть ▲▼, удаление и «Свернуть»');
  assert.ok(/aria-expanded="'\+open/.test(row), 'состояние читается и для экранных дикторов');
  assert.ok(/a==='pfold'\)pxSet\(/.test(html) && /a==='pfoldall'\)pxAll\(/.test(html), 'обработчики одной карточки и «все»');
  assert.ok(/data-act="pfoldall" data-v="0"/.test(html) && /data-act="pfoldall" data-v="1"/.test(html), 'кнопки «Свернуть все» и «Развернуть все»');
  assert.ok(/S\.prod\.items\.push\(p\);S\.pxo\[p\.id\]=true/.test(html), 'новый товар открывается сам');
  assert.ok(/bad\.forEach\(b=>\{S\.pxo\[b\.id\]=true\}\)/.test(html), 'товар, которому не хватает данных, открывается сам');
  assert.ok(/S\.medit\[t\.dataset\.id\]=true;S\.pxo\[t\.dataset\.id\]=true/.test(html), '«Исправить» открывает форму');
  assert.ok(/delete S\.pxo\[id\]/.test(html), 'при удалении товара состояние чистится');
  assert.ok(/pxLive\(p\);\s*queueSave\('prod'\)/.test(html), 'заголовок обновляется при правке полей');
  assert.ok(!/S\.pxo/.test(fs.readFileSync(path.join(root, 'src/worker-src.js'), 'utf8')), 'раскрытость не уходит на сервер');
});

await t('каталог: класс блока формы товара не пересекается с .pbody карточки клиента', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  assert.equal((html.match(/^\.pbody\{/gm) || []).length, 1, 'правило .pbody (нижняя часть карточки клиента) одно, без второго с тем же именем');
  assert.ok(/^\.pfbody\{/m.test(html), 'у формы товара свой класс .pfbody');
  assert.ok(!/class="pbody" id=/.test(html), 'форма продавца не использует класс .pbody');
  assert.equal((html.match(/class="pbody"/g) || []).length, 2, '.pbody есть только в двух клиентских карточках (обычной и «на проверке»)');
});

/* ---------- два языка: форма товара, категории, прайс ---------- */
// маленькая книга Excel из строк: нужна, чтобы подать в загрузку файл с нужными заголовками
const miniXlsx = rows => {
  const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const col = i => String.fromCharCode(65 + i);
  const sheet = '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
    + rows.map((r, ri) => '<row r="' + (ri + 1) + '">' + r.map((v, ci) => typeof v === 'number'
      ? '<c r="' + col(ci) + (ri + 1) + '"><v>' + v + '</v></c>'
      : '<c r="' + col(ci) + (ri + 1) + '" t="inlineStr"><is><t>' + esc(v) + '</t></is></c>').join('') + '</row>').join('') + '</sheetData></worksheet>';
  const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const files = [
    ['[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'],
    ['xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="' + R + '"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + R + '/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
    ['xl/worksheets/sheet1.xml', sheet]
  ].map(([n, t]) => ({ nm: Buffer.from(n), d: Buffer.from(t) }));
  let body = Buffer.alloc(0), cd = Buffer.alloc(0);
  for (const f of files) {
    const crc = zlib.crc32(f.d), lh = Buffer.alloc(30), ch = Buffer.alloc(46);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(f.d.length, 18); lh.writeUInt32LE(f.d.length, 22); lh.writeUInt16LE(f.nm.length, 26);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(f.d.length, 20); ch.writeUInt32LE(f.d.length, 24); ch.writeUInt16LE(f.nm.length, 28); ch.writeUInt32LE(body.length, 42);
    body = Buffer.concat([body, lh, f.nm, f.d]); cd = Buffer.concat([cd, ch, f.nm]);
  }
  const eo = Buffer.alloc(22); eo.writeUInt32LE(0x06054b50, 0); eo.writeUInt16LE(files.length, 8); eo.writeUInt16LE(files.length, 10); eo.writeUInt32LE(cd.length, 12); eo.writeUInt32LE(body.length, 16);
  return new Uint8Array(Buffer.concat([body, cd, eo]));
};

await t('прайс из Excel по-узбекски: заголовки, «ha/yoʻq», категории и единицы на узбекском; выгрузка читается обратно без изменений', async () => {
  await stockWorld();
  tgLog = [];
  assert.equal((await exportReq('catalog', { lang: 'uz' })).status, 200);
  const doc = lastDoc();
  assert.ok(/Katalog: mahsulotlar 4/.test(doc.payload.caption || ''), doc.payload.caption);
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Katalog', 'Qanday toʻldirish']);
  assert.deepEqual(x['Katalog'][0], ['Kod', 'Kategoriya', 'Nomi (rus.)', 'Nomi (uzb.)', 'Tavsif (rus.)', 'Tavsif (uzb.)', 'Ogʻirlik / hajm', 'Birlik', 'Narx, soʻm', 'Mavjud', 'Belgi', 'Eski narx, soʻm']);
  const row = x['Katalog'].find(r => r[0] === 'p1');
  assert.deepEqual([row[1], row[2], row[3], row[8], row[9]], ['Yogʻlar', 'Масло подсолнечное', 'Kungaboqar yogʻi', 82000, 'ha']);
  assert.equal(x['Katalog'].find(r => r[0] === 'p3')[9], 'yoʻq');
  assert.ok(x['Qanday toʻldirish'][0][0].startsWith('Prays'), 'памятка тоже по-узбекски');
  assert.ok(!x['Qanday toʻldirish'].some(r => /[а-яё]/i.test(r[0].replace(/«Название»|«Цена»/g, ''))), 'в узбекской памятке нет русского текста, кроме названий колонок-синонимов');
  // русский остаётся как был
  tgLog = [];
  assert.equal((await exportReq('catalog')).status, 200);
  assert.deepEqual(Object.keys(readXlsx(lastDoc().file.bytes)), ['Каталог', 'Как заполнять']);
  assert.deepEqual(readXlsx(lastDoc().file.bytes)['Каталог'][0].slice(0, 3), ['Код', 'Категория', 'Название']);
  // узбекская выгрузка читается обратно: 4 товара без изменений, новых категорий нет
  const d = await jsonOf(await importReq(doc.file.bytes, true));
  assert.equal(d.applied, false);
  assert.deepEqual(d.summary, { added: 0, updated: 0, same: 4, errors: 0, newCats: [] });
});

await t('прайс из Excel: достаточно колонок «Nomi» и «Narx»; русское название не затирается, новый товар получает название на обоих языках', async () => {
  await stockWorld();
  const file = miniXlsx([
    ['Kod', 'Kategoriya', 'Nomi', 'Narx'],
    ['p1', 'Yogʻlar', 'Kungaboqar yogʻi (yangi)', 90000],   // по коду: цена и узбекское название меняются, русское остаётся
    ['', 'Yorma va makaron', 'Guruch', 415000],             // по узбекскому названию находится «Рис», категория узбекская — совпадает с «Крупы и макароны»
    ['', 'Shirinliklar', 'Pechenye', 12000]                 // нового нет: создаётся, категория латиницей = узбекская
  ]);
  const d = await jsonOf(await importReq(file, true));
  assert.equal(d.applied, true, JSON.stringify(d));
  assert.deepEqual([d.summary.added, d.summary.updated, d.summary.errors], [1, 2, 0]);
  const prod = await catalogNow(), by = id => prod.items.find(i => i.id === id);
  assert.deepEqual([by('p1').name, by('p1').uz, by('p1').price], ['Масло подсолнечное', 'Kungaboqar yogʻi (yangi)', 90000]);
  assert.deepEqual([by('p2').name, by('p2').uz, by('p2').price], ['Рис', 'Guruch', 415000]);
  assert.equal(by('p2').cat, 'groats', 'категория в файле по-узбекски находит существующую, дубль не создаётся');
  assert.deepEqual(prod.cats.map(c => c.id).filter(c => c === 'oil' || c === 'groats'), ['oil', 'groats']);
  const nw = prod.items.find(i => i.name === 'Pechenye');
  assert.ok(nw && nw.uz === 'Pechenye', 'новый товар: одно название и в русском, и в узбекском поле');
  const cat = prod.cats.find(c => c.id === nw.cat);
  assert.deepEqual([cat.name, cat.uz], ['Shirinliklar', 'Shirinliklar']);
});

await t('прайс из Excel: ошибки приходят по-русски и по-узбекски, строки с ошибками пропускаются', async () => {
  await stockWorld();
  const before = JSON.stringify(await catalogNow());
  const file = miniXlsx([
    ['Kod', 'Nomi', 'Narx', 'Birlik', 'Mavjud', 'Belgi'],
    ['p1', '', 1000, '', '', ''],
    ['p2', 'Guruch', 'qimmat', '', '', ''],
    ['p4', 'Makaron', 7600, 'tonna', '', ''],
    ['p4', 'Makaron', 7600, 'g', 'balki', ''],
    ['p4', 'Makaron', 7600, 'g', 'ha', 'super']
  ]);
  const r = await importReq(file, false);
  const d = await jsonOf(r);
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.errors.length, 5);
  assert.ok(d.errors.every(e => e.msg && e.uz && !/[а-яё]/i.test(e.uz)), 'у каждой ошибки есть узбекский текст без кириллицы: ' + JSON.stringify(d.errors));
  assert.ok(d.errors.every(e => /[а-яё]/i.test(e.msg)), 'и русский');
  assert.deepEqual(d.errors.map(e => e.row), [2, 3, 4, 5, 6]);
  assert.equal(JSON.stringify(await catalogNow()), before);
  // нет нужных колонок: понятная причина, а узбекский текст в приложении называет «Nomi» и «Narx»
  const nh = await importReq(miniXlsx([['A', 'B'], ['x', 1]]), false);
  assert.equal((await jsonOf(nh)).why, 'no_header');
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  assert.ok(/«Название» и «Цена» \(или «Nomi» и «Narx»\)/.test(html) && /«Nomi» va «Narx» \(yoki «Название» va «Цена»\)/.test(html), 'подсказка при ошибке называет колонки на обоих языках');
  assert.ok(/esc\(L\(e\.msg,e\.uz\|\|e\.msg\)\)/.test(html), 'приложение показывает ошибку строки на языке интерфейса');
  assert.ok(/Object\.assign\(\{kind,lang:LANG\},extra\|\|\{\}\)/.test(html), 'выгрузка просит язык интерфейса');
});

await t('форма товара и категорий: поля подписаны на двух языках, под полями мелкие подсказки, названия не зависят от языка при создании', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  const fn = name => { const i = html.indexOf('function ' + name + '('); assert.ok(i > 0, 'функция ' + name); const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j > 0 ? j : i + 4000); };
  const cst = name => { const i = html.indexOf('const ' + name + '=()=>({'); assert.ok(i > 0, name); return html.slice(i, html.indexOf('\n});', i) + 4); };
  const body = fn('prodBody'), rv = fn('rvEditHTML'), labs = cst('PF_LAB'), hints = cst('PF_HINT');
  assert.ok(/\.hint\{[^}]*font-size:12px[^}]*color:var\(--ink-2\)/.test(html), 'подсказка: 12 px, серый цвет темы');
  assert.ok(/\.ltag\{/.test(html) && /\.ltag\.uz\{/.test(html), 'метки RU / UZ у подписей');
  for (const k of ['name', 'uz', 'desc', 'descUz']) assert.ok(new RegExp('\\b' + k + ':').test(labs), 'подпись ' + k);
  assert.ok(/Название по-русски/.test(labs) && /Ruscha nomi/.test(labs) && /Название по-узбекски/.test(labs) && /Oʻzbekcha nomi/.test(labs), 'подписи: по-русски / по-узбекски на двух языках');
  for (const k of ['name', 'uz', 'desc', 'descUz', 'cat', 'amount', 'price', 'old']) assert.ok(new RegExp('\\b' + k + ':L\\(').test(hints), 'подсказка к полю ' + k + ' на двух языках');
  assert.ok(/pfLab\(k,lab\)/.test(body) && /pfHint\(k\)/.test(body) && /pfHintRow\('amount'\)/.test(body) && /pfHintRow\('price'\)/.test(body) && /pfHintRow\('old'\)/.test(body), 'форма продавца: подписи и подсказки');
  assert.ok(/pfLab\(k,lab\)/.test(rv) && /pfHint\(k\)/.test(rv) && /pfHintRow\('amount'\)/.test(rv) && /pfHintRow\('price'\)/.test(rv) && /pfHintRow\('oldS'\)/.test(rv), 'форма владельца при проверке: то же');
  // категории показываются на языке интерфейса: и в выпадающих списках, и в фильтре
  assert.equal((html.match(/esc\(nm\(c\)\)/g) || []).length >= 2, true, 'списки категорий в формах товара');
  assert.ok(/P\.cats\.map\(c=>\[c\.id,nm\(c\)\]\)/.test(html), 'фильтр категорий в редакторе');
  // новые товар и категория создаются с обоими названиями, независимо от языка интерфейса
  assert.ok(/name:'Новый товар',uz:'Yangi mahsulot'/.test(html) && /name:'Новая категория',uz:'Yangi kategoriya'/.test(html), 'названия по умолчанию на обоих языках');
  assert.ok(!/name:L\('Новый товар'/.test(html) && !/name:L\('Новая категория'/.test(html), 'русское название не зависит от языка интерфейса');
  // строка категории: у каждого поля подпись с меткой языка
  const crow = html.slice(html.indexOf('class="crow"><div><label'), html.indexOf('class="crow"><div><label') + 900);
  assert.ok(/data-cp="name"/.test(crow) && /data-cp="uz"/.test(crow) && (crow.match(/class="ltag/g) || []).length === 2, 'в строке категории две подписанные колонки RU и UZ');
});

/* ---------- подсказки под полями во всех формах ---------- */
await t('подсказки под полями: в каждой форме приложения у полей есть мелкая серая подсказка на двух языках', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  const fn = name => { const i = html.indexOf('function ' + name + '('); assert.ok(i > 0, 'функция ' + name); const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j > 0 ? j : i + 6000); };
  // сколько подсказок минимум должно быть в каждой форме (по числу полей)
  const need = { formHTML: 6, terrFieldHTML: 1, regionFieldHTML: 1, renderProfile: 4, settingsHTML: 6, payBlockHTML: 2, crPickHTML: 1, voidFormHTML: 1, resFormHTML: 1, debtorHTML: 2, hdVoidForm: 1, hdResForm: 1, couriersHTML: 1, dvCardHTML: 2, stockRowHTML: 1, clientSheetHTML: 2, baseFormHTML: 8, ownAddHTML: 2, cmShopHTML: 3, commSellerHTML: 2, cmPayHTML: 1, commOwnerHTML: 1, ownPeopleHTML: 3, dispHandHTML: 1, dispCardHTML: 1 };
  for (const [name, n] of Object.entries(need)) {
    const body = fn(name);
    const k = (body.match(/hintD\(/g) || []).length;
    assert.ok(k >= n, name + ': подсказок ' + k + ', нужно не меньше ' + n);
  }
  // настройки: каждое числовое поле получает подсказку через пятый параметр
  const st = fn('settingsHTML');
  const nums = st.match(/\+num\('[a-z]+',L\(/g) || [];
  assert.equal(nums.length, 7);
  assert.equal((st.match(/,\[\s*'[^']+','[^']+'\]\)/g) || []).length, 7, 'у всех семи числовых полей настроек есть подсказка');
  assert.ok(/num=\(id,lab,k,min,max,hint\)=>/.test(st) && /hintD\(hint\[0\],hint\[1\]\)/.test(st));
  // тексты: обе версии заданы, русская по-русски, узбекская без кириллицы (кроме примеров в «кавычках» и после «Masalan»/«Misol»)
  const all = [...html.matchAll(/hintD\('([^']*)','([^']*)'\)/g)].map(m => [m[1], m[2]]);
  for (const m of st.matchAll(/,\[\s*'([^']+)','([^']+)'\]\)/g)) all.push([m[1], m[2]]);
  assert.ok(all.length >= 50, 'всего подсказок: ' + all.length);
  const cy = x => /[А-Яа-яЁё]/.test(x);
  for (const [ru, uz] of all) {
    assert.ok(ru.length > 10 && uz.length > 10, 'пустая подсказка: ' + ru);
    assert.ok(cy(ru), 'русская подсказка без русского текста: ' + ru);
    assert.ok(!cy(uz.replace(/(Misol|Masalan):.*$/, '').replace(/«[^»]*»/g, '')), 'в узбекской подсказке русский текст: ' + uz);
    assert.ok(ru.length <= 140 && uz.length <= 170, 'подсказка слишком длинная для мелкого текста: ' + ru);
  }
  assert.ok(/const hintD=\(ru,uz\)=>'<div class="hint">'\+esc\(L\(ru,uz\)\)\+'<\/div>'/.test(html), 'общий помощник hintD: текст экранируется и берётся на языке интерфейса');
  assert.ok(/\.payb>\.hint\{/.test(html), 'в блоках оплаты подсказка стоит вплотную к полю');
});

/* ---------- сообщения персоналу на двух языках ---------- */
const splitBi = (text, mark) => { const i = text.indexOf('\n\n' + mark); assert.ok(i > 0, 'нет второй части «' + mark + '» в: ' + text); return [text.slice(0, i), text.slice(i + 2)]; };

await t('сообщения продавцу: карточка заказа — узбекский сверху, русский ниже, кнопки «uz · ru», в данных клиента ничего не теряется', async () => {
  await stockWorld();
  const A = newUser();
  tgLog = [];
  const o = (await jsonOf(await place(A, CART, { form: formFor(S.DEFAULT, 'delivery', {}) }))).order;
  const card = lastTg('sendMessage', p => p.chat_id === SELLER.id && String(p.text).includes(o.id)).payload;
  const [uzB, ruB] = splitBi(card.text, '🆕 Заказ');
  assert.ok(uzB.startsWith('🆕 Buyurtma ' + o.id) && uzB.includes('Mahsulotlar:') && uzB.includes('Jami:') && uzB.includes('Holat: Yangi') && !/Товары|Итого|Статус/.test(uzB), uzB);
  assert.ok(ruB.startsWith('🆕 Заказ ' + o.id) && ruB.includes('Товары:') && ruB.includes('Итого:') && ruB.includes('Статус: Новый') && !/Mahsulotlar|Jami|Holat/.test(ruB), ruB);
  for (const b of [uzB, ruB]) assert.ok(b.includes('ООО Ориент') && b.includes('Навои, ул. Галаба 12') && b.includes('Позвоните за час') && norm(b).includes('1 394 000'), 'имя, адрес и комментарий в обеих частях: ' + b);
  assert.ok(card.text.length <= 4096);
  const btns = card.reply_markup.inline_keyboard.flat().filter(b => b.callback_data || b.web_app);
  assert.ok(btns.length >= 3 && btns.every(b => / · /.test(b.text)), btns.map(b => b.text).join(' | '));
  assert.ok(btns.some(b => b.text === '✅ Ishga olish · Принять в работу') && btns.some(b => b.text === '❌ Bekor qilish · Отменить'));
  // кнопка меняет карточку: статус и кнопки на двух языках
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':accepted', 555);
  const ed = lastTg('editMessageText', p => p.message_id === 555).payload;
  const [uz2, ru2] = splitBi(ed.text, '🛠 Заказ');
  assert.ok(uz2.includes('Holat: Ishlanmoqda') && ru2.includes('Статус: В работе'), ed.text);
  const kb2 = ed.reply_markup.inline_keyboard.flat();
  assert.ok(kb2.some(b => b.text === '📦 Joʻnatishga tayyor · Готов к отправке'), kb2.map(b => b.text).join(' | '));
  // выбор оплаты: способы и вопрос на двух языках
  await cb(SELLER, 's:' + o.id + ':ready', 555);
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':done', 555);
  const pay = lastTg('editMessageText', p => p.message_id === 555).payload;
  assert.ok(pay.text.includes('Mijoz buyurtma uchun qanday toʻladi?') && pay.text.includes('Как клиент оплатил заказ?'), pay.text);
  const pb = pay.reply_markup.inline_keyboard.flat().map(b => b.text);
  assert.ok(pb.includes('💵 Naqd · Наличные') && pb.includes('💳 Karta · Карта') && pb.includes('📒 Qarzga · В долг'), pb.join(' | '));
  await cb(SELLER, 'p:' + o.id + ':credit', 555);
  const dy = lastTg('editMessageText', p => p.message_id === 555).payload;
  assert.ok(dy.text.includes('Qarzni necha kunga yozamiz?') && dy.text.includes('На сколько дней записать долг?'));
  assert.ok(dy.reply_markup.inline_keyboard[0].every(b => /^\d+ kun · дн\.$/.test(b.text)), dy.reply_markup.inline_keyboard[0].map(b => b.text).join('|'));
});

await t('ответы на кнопки: узбекский и русский на соседних строках, не длиннее 190 знаков', async () => {
  await stockWorld();
  const A = newUser();
  const o = (await jsonOf(await place(A, ONE))).order;
  tgLog = [];
  await cb(ANNA, 's:' + o.id + ':accepted', 556);                       // чужой
  await cb(SELLER, 's:' + o.id + ':accepted', 556);
  await cb(SELLER, 's:' + o.id + ':accepted', 556);                     // повтор: статус уже стоит
  await cb(SELLER, 's:' + o.id + ':ready', 556);
  await cb(SELLER, 's:' + o.id + ':done', 556);
  await cb(SELLER, 'p:' + o.id + ':cash', 556);
  await cb(SELLER, 's:' + o.id + ':accepted', 556);                     // назад нельзя
  const ans = tgAll('answerCallbackQuery').map(x => x.payload.text).filter(Boolean);
  assert.ok(ans.length >= 3, JSON.stringify(ans));
  ans.forEach(x => assert.ok(x.length <= 190, 'ответ длиннее лимита: ' + x));
  assert.ok(ans.every(x => x.includes('\n')), 'каждый ответ с двумя языками: ' + JSON.stringify(ans));
  assert.ok(ans[0] === 'Ruxsat yoʻq\nНет доступа', ans[0]);
  ans.forEach(x => { const [uz, ru] = x.split('\n'); assert.ok(!/[А-Яа-яЁё]/.test(uz.replace(/«[^»]*»/g, '')), 'в первой строке русские слова: ' + uz); assert.ok(/[А-Яа-яЁё]/.test(ru), 'во второй строке нет русского: ' + ru); });
});

await t('сообщения доставщику: «Oldim · Взял», вход доставщика и карточка — узбекский сверху, русский ниже', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам');
  const hi = lastTg('sendMessage', p => p.chat_id === DRV.id).payload;
  assert.ok(hi.text.startsWith('Tayyor, siz «Оптовая база» yetkazib beruvchisisiz.') && hi.text.includes('\n\nГотово, вы доставщик «Оптовая база».') && hi.text.includes('«Oldim»') && hi.text.includes('«Взял»'), hi.text);
  assert.equal(hi.reply_markup.inline_keyboard[0][0].text, 'Yetkazib berishni ochish · Открыть доставку');
  const A = newUser();
  tgLog = [];
  const o = await readyDelivery(A, CART);
  const m = lastTg('sendMessage', p => p.chat_id === DRV.id && String(p.text).includes(o.id)).payload;
  const [uzB, ruB] = splitBi(m.text, '🚚 Готов к доставке');
  assert.ok(uzB.startsWith('🚚 Yetkazishga tayyor: buyurtma ' + o.id) && uzB.includes('Manzil:') && uzB.includes('Summa:') && !/Адрес|Сумма/.test(uzB), uzB);
  assert.ok(ruB.includes('Адрес:') && ruB.includes('Сумма:') && !/Manzil|Summa/.test(ruB), ruB);
  const kb = m.reply_markup.inline_keyboard.flat();
  assert.ok(kb.some(b => b.callback_data === 'k:' + o.id && b.text === '🚚 Oldim · Взял'), kb.map(b => b.text).join(' | '));
  assert.ok(kb.some(b => b.web_app && b.text === 'Yetkazib berishni ochish · Открыть доставку'));
  // после того как заказ взяли, второму доставщику карточка обновляется на обоих языках
  await hire(DRV2, 'Азиз');
  tgLog = [];
  const o2 = await readyDelivery(A, ONE);
  const mid2 = (await W.storage.get('o:' + o2.id)).cm.find(x => x.chat_id === DRV2.id).message_id;
  tgLog = [];
  await cb(DRV, 'k:' + o2.id, (await W.storage.get('o:' + o2.id)).cm.find(x => x.chat_id === DRV.id).message_id, DRV.id);
  const upd = lastTg('editMessageText', p => p.message_id === mid2 && p.chat_id === DRV2.id).payload;
  assert.ok(upd.text.startsWith('✔ Buyurtma ' + o2.id) && upd.text.includes('\n\n✔ Заказ ' + o2.id) && upd.text.includes('Рустам'), upd.text);
  // повторное нажатие «Взял» у второго: ответ на двух языках
  tgLog = [];
  await cb(DRV2, 'k:' + o2.id, mid2, DRV2.id);
  const an = lastTg('answerCallbackQuery').payload.text;
  assert.ok(an.includes('\n') && an.length <= 190 && /[А-Яа-я]/.test(an.split('\n')[1]), an);
});

await t('команды /admin и /agent: ответы и сообщения владельцу — узбекский сверху, русский ниже', async () => {
  await hubWorld();
  const d = await addShop('Альфа Трейд');
  tgLog = [];
  await send(adminMsg(ANNA, 'wrong-wrong-wrong', 2));
  assert.equal(lastTg('sendMessage', p => p.chat_id === ANNA.id).payload.text, 'Kod notoʻgʻri.\n\nНеверный код.');
  await send({ update_id: 8801, message: { message_id: 3, from: ANNA, chat: { id: ANNA.id, type: 'private' }, text: '/agent' } });
  const ag0 = lastTg('sendMessage', p => p.chat_id === ANNA.id).payload.text;
  assert.ok(ag0.startsWith('«/agent KOD» yuboring.') && ag0.includes('\n\nОтправьте «/agent КОД».'), ag0);
  tgLog = [];
  await send(adminMsg(DIL, d.code, 4));
  const ok = lastTg('sendMessage', p => p.chat_id === DIL.id).payload;
  assert.ok(ok.text.startsWith('Tayyor, siz «Альфа Трейд» sotuvchisisiz.') && ok.text.includes('\n\nГотово, вы продавец «Альфа Трейд».') && ok.text.includes('«Qabul qilish»') && ok.text.includes('«Принять»'), ok.text);
  assert.equal(ok.reply_markup.inline_keyboard[0][0].text, 'Ilovani ochish · Открыть приложение');
  const note = loginMsgs()[0].payload.text;
  assert.ok(note.startsWith('🔑 Kod bilan kirish:') && note.includes('«Альфа Трейд» sotuvchisi sifatida kirdi') && note.includes('\n\n🔑 Вход по коду:') && note.includes('продавец «Альфа Трейд»'), note);
  const made = await jsonOf(await adm('POST', '/agents', { name: 'Азиз', terr: [] }));
  tgLog = [];
  await send(agentMsg(AGT, made.code, 6));
  const ag = lastTg('sendMessage', p => p.chat_id === AGT.id).payload;
  assert.ok(ag.text.startsWith('Tayyor, siz «Азиз» agentisiz.') && ag.text.includes('\n\nГотово, вы агент «Азиз».'), ag.text);
  assert.equal(ag.reply_markup.inline_keyboard[0][0].text, 'Bazani ochish · Открыть базу');
  const an = loginMsgs()[0].payload.text;
  assert.ok(an.startsWith('🔑 Kod bilan kirish:') && an.includes('«Азиз» agenti sifatida kirdi') && an.includes('\n\n🔑 Вход по коду:') && an.includes('вошёл как агент «Азиз»'), an);
});

await t('утро, остатки, проверка товаров и спорные записи: у продавца всегда узбекский блок сверху и русский ниже', async () => {
  await stockWorld();
  await overdueDebt(4);
  tgLog = [];
  await runMorning();
  const mm = morningMsgs(SELLER.id)[0];
  assert.equal(mm.payload.reply_markup.inline_keyboard[0][0].text, 'Qarzlar · Долги');
  assert.ok(mm.payload.text.startsWith('⏰ ') && mm.payload.text.indexOf('kechikishlar') < mm.payload.text.indexOf('просрочка'), mm.payload.text);
  // всё, что уходит продавцу в Telegram за этот тест, имеет обе части
  await setSt('p2', 30, 10);
  tgLog = [];
  await place(newUser(), [{ id: 'p2', qty: 25 }]);
  const sent = tgAll('sendMessage', p => p.chat_id === SELLER.id).map(x => x.payload);
  assert.ok(sent.length >= 2, 'заказ и предупреждение об остатке');
  sent.forEach(x => { assert.ok(/[A-Za-z]/.test(x.text.split('\n')[0]) && /[А-Яа-я]/.test(x.text) && x.text.includes('\n\n'), 'нет двух частей: ' + x.text); assert.ok(x.text.length <= 4096); });
  const st = stockAlerts()[0].payload.text;
  assert.ok(st.startsWith('Ombordagi qoldiqlar:') && st.includes('ta qoldi (chegara 10)') && st.includes('\n\nОстатки на складе:'), st);
});

/* ---------- Excel и сборочный лист на языке интерфейса ---------- */
const hasRu = x => /[А-Яа-яЁё]/.test(String(x));
const noRuCells = (rows, skipCols) => rows.forEach((r, i) => r.forEach((c, j) => { if (!(skipCols || []).includes(j) && typeof c === 'string' && hasRu(c)) assert.fail('русский текст в узбекском файле, строка ' + (i + 1) + ', колонка ' + (j + 1) + ': ' + c); }));

await t('Excel по-узбекски: заказы и клиенты — листы, заголовки, статусы, способ оплаты и названия товаров на узбекском; данные клиента как введены', async () => {
  await stockWorld();
  const A = newUser();
  const o = (await jsonOf(await place(A, [{ id: 'p1', qty: 2 }, { id: 'p2', qty: 1 }], { form: formFor(S.DEFAULT, 'delivery', { comment: 'Позвоните за час' }) }, 'delivery'))).order;
  for (const to of ['accepted', 'ready']) assert.equal((await setStatus(o.id, to)).status, 200);
  assert.equal((await doneWith(o.id, { m: 'credit', days: 7, paid: 100000, pm: 'cash' })).status, 200);
  tgLog = [];
  const r = await exportReq('orders', { lang: 'uz' });
  assert.equal(r.status, 200);
  const doc = lastDoc();
  assert.ok(doc.payload.caption.startsWith('Buyurtmalar: 1') && doc.payload.caption.includes('Excelda oching'), doc.payload.caption);
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Buyurtmalar', 'Buyurtmadagi mahsulotlar']);
  const head = x['Buyurtmalar'][0], row = x['Buyurtmalar'].find(q => q[0] === o.id), col = n => head.indexOf(n);
  assert.deepEqual(head.slice(0, 6), ['Buyurtma №', 'Yaratilgan', 'Holat', 'Olish usuli', 'Qachon', 'Mijoz']);
  assert.equal(row[col('Holat')], 'Yetkazildi');
  assert.equal(row[col('Olish usuli')], 'Yetkazib berish');
  assert.ok(String(row[col('Toʻlov')]).startsWith('Naqd 100000 + Qarzga ') && String(row[col('Toʻlov')]).endsWith(' gacha'), row[col('Toʻlov')]);
  assert.equal(row[col('Izoh')], 'Позвоните за час');
  assert.equal(row[col('Mijoz')], 'ООО Ориент');
  const items = x['Buyurtmadagi mahsulotlar'];
  assert.deepEqual(items[0].slice(0, 6), ['Buyurtma №', 'Holat', 'Qachon', 'Mijoz', 'Mahsulot', 'Ogʻirlik / hajm']);
  const names = items.slice(1).map(q => q[4]).sort();
  assert.deepEqual(names, ['Guruch', 'Kungaboqar yogʻi'], 'названия товаров по-узбекски');
  assert.ok(items.slice(1).every(q => /\b(kg|l)\b/.test(q[5])), 'вес с узбекскими единицами: ' + JSON.stringify(items.slice(1).map(q => q[5])));
  noRuCells(x['Buyurtmalar'], [col('Izoh'), col('Mijoz'), col('Manzil'), col('Yetkazib berish manzili')].filter(i => i >= 0).concat([5, 9, 10]));
  noRuCells(items, [3]);
  // клиенты
  tgLog = [];
  assert.equal((await exportReq('clients', { lang: 'uz' })).status, 200);
  const cdoc = lastDoc();
  assert.ok(cdoc.payload.caption.startsWith('Mijozlar: 1'), cdoc.payload.caption);
  const cx = readXlsx(cdoc.file.bytes);
  assert.deepEqual(Object.keys(cx), ['Mijozlar']);
  assert.deepEqual(cx['Mijozlar'][0].slice(0, 7), ['Ism', 'Telefon', 'Tashkilot', 'Turi', 'Guruh', 'Yetkazib berish manzillari', 'Eslatma']);
  assert.equal(cx['Mijozlar'][1][cx['Mijozlar'][0].indexOf('Til')], 'ruscha');
  // без lang по-прежнему русский
  tgLog = [];
  await exportReq('orders');
  assert.deepEqual(Object.keys(readXlsx(lastDoc().file.bytes)), ['Заказы', 'Товары в заказах']);
  tgLog = [];
  await exportReq('orders', { lang: 'xx' });
  assert.deepEqual(Object.keys(readXlsx(lastDoc().file.bytes)), ['Заказы', 'Товары в заказах'], 'неизвестный язык = русский');
});

await t('Excel по-узбекски: долги — листы «Qarzlar» и «Tarix», статусы, способы оплаты, записи журнала и подпись файла', async () => {
  await stockWorld();
  const A = await overdueDebt(4, CART);
  assert.equal((await debtAct(A.u.id, 'pay', { amount: 100000, m: 'cash', note: 'принёс директор' })).status, 200);
  tgLog = [];
  const r = await exportReq('debts', { f: 'all', lang: 'uz' });
  assert.equal(r.status, 200);
  const doc = lastDoc();
  assert.ok(doc.payload.caption.startsWith('Qarzlar (hammasi): doʻkonlar 1') && doc.payload.caption.includes('Excelda oching'), doc.payload.caption);
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Qarzlar', 'Tarix']);
  const head = x['Qarzlar'][0], col = n => head.indexOf(n);
  assert.deepEqual(head.slice(0, 5), ['Doʻkon', 'Tashkilot', 'Telefon', 'Manzil', 'Qarz, soʻm']);
  assert.equal(x['Qarzlar'][1][col('Holat')], 'Muddati oʻtgan');
  const hist = x['Tarix'], hc = n => hist[0].indexOf(n);
  assert.deepEqual(hist[0].slice(0, 5), ['Doʻkon', 'Telefon', 'Sana', 'Yozuv', 'Yozuv №']);
  const kinds = hist.slice(1).map(q => q[hc('Yozuv')]);
  assert.ok(kinds.includes('Qarzga berildi') && kinds.includes('Toʻlov'), kinds.join(', '));
  assert.deepEqual(hist.slice(1).filter(q => q[hc('Yozuv')] === 'Toʻlov').map(q => q[hc('Usul')]), ['Naqd']);
  noRuCells(x['Qarzlar'], [0, 1, 3]);
  noRuCells(hist, [0, hc('Izoh')]);
  // свёрнутые старые записи
  const lg = await W.storage.get('lg:' + A.u.id); lg.base = { d: 5000, due: '2026-01-01' }; await W.storage.put('lg:' + A.u.id, lg);
  await exportReq('debts', { f: 'over', lang: 'uz' });
  assert.ok(lastDoc().payload.caption.startsWith('Qarzlar (muddati oʻtgan)'));
  const hx = readXlsx(lastDoc().file.bytes)['Tarix'];
  assert.ok(hx.some(q => q[hx[0].indexOf('Yozuv')] === 'Dastlabki yozuvlar jamlangan'));
  // и по-русски по умолчанию
  await exportReq('debts', { f: 'all' });
  assert.deepEqual(Object.keys(readXlsx(lastDoc().file.bytes)), ['Долги', 'История']);
});

await t('Excel по-узбекски: отчёт — листы, заголовки, месяц, названия и вес товаров, текст сводки и «Что закупать»', async () => {
  await stockWorld();
  const st = W.storage, ago = n => new Date(Date.now() + 5 * 3600000 - n * 86400000).toISOString().slice(0, 10);
  await st.put('rp0', ago(9));
  const days = [];
  for (let i = 9; i >= 0; i--) {
    days.push(ago(i));
    await st.put('rp:' + ago(i), { n: 1, sum: 37500, disc: 0, fee: 0, items: [{ id: 'p4', name: 'Макароны', qty: 5, sum: 37500 }], cl: [{ uid: 7, name: 'ООО Ориент', org: '', n: 1, sum: 37500 }] });
  }
  await st.put('rpx', days);
  assert.equal((await setSt('p4', 30, 10)).status, 200);
  tgLog = [];
  const r = await exportReq('report', { days: 30, lang: 'uz' });
  assert.equal(r.status, 200);
  const doc = lastDoc();
  assert.ok(doc.payload.caption.startsWith('Hisobot, 30 kun: buyurtmalar 10') && doc.payload.caption.includes('Excelda oching'), doc.payload.caption);
  const x = readXlsx(doc.file.bytes);
  assert.deepEqual(Object.keys(x), ['Xulosa', 'Kunlar boʻyicha', 'Oylar boʻyicha', 'Mahsulotlar', 'Mijozlar', 'Nimani sotib olish']);
  assert.ok(x['Xulosa'][0][0].startsWith('Hisobot: ') && x['Xulosa'][3][0].startsWith('Buyurtmalar: 10. Summa: ') && x['Xulosa'][3][0].includes(' soʻm.'), JSON.stringify(x['Xulosa']));
  assert.deepEqual(x['Kunlar boʻyicha'][0], ['Sana', 'Buyurtmalar', 'Summa, soʻm']);
  assert.equal(x['Kunlar boʻyicha'][x['Kunlar boʻyicha'].length - 1][0], 'Jami');
  assert.ok(/^(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentyabr|oktyabr|noyabr|dekabr) \d{4}$/.test(x['Oylar boʻyicha'][1][0]), x['Oylar boʻyicha'][1][0]);
  assert.deepEqual(x['Mahsulotlar'][1].slice(0, 3), ['Makaron', '400 g', 50]);
  assert.deepEqual(x['Nimani sotib olish'][0].slice(0, 5), ['Mahsulot', 'Ogʻirlik / hajm', 'Boʻsh, dona', 'Kuniga sotiladi, dona', 'Necha kunga yetadi']);
  assert.equal(x['Nimani sotib olish'][0][5], '14 kunga sotib olish, dona');
  assert.deepEqual(x['Nimani sotib olish'][1].slice(0, 2), ['Makaron', '400 g']);
  noRuCells(x['Xulosa'].concat(x['Kunlar boʻyicha'], x['Oylar boʻyicha'], x['Mahsulotlar'], x['Nimani sotib olish']), []);
  tgLog = [];
  await exportReq('report', { days: 30 });
  const ru = readXlsx(lastDoc().file.bytes);
  assert.deepEqual(Object.keys(ru), ['Сводка', 'По дням', 'По месяцам', 'Товары', 'Клиенты', 'Что закупать']);
  assert.deepEqual(ru['Товары'][1].slice(0, 3), ['Макароны', '400 г', 50]);
});

await t('сборочный лист и резервная копия по-узбекски: язык листа и файла-пояснения, названия товаров; без lang — русский', async () => {
  await stockWorld();
  const A = newUser(), B = newUser();
  await place(A, [{ id: 'p1', qty: 2 }], { form: formFor(S.DEFAULT, 'delivery', { comment: 'Позвоните за час' }) }, 'delivery');
  await place(B, [{ id: 'p2', qty: 1 }, { id: 'p1', qty: 1 }]);
  const uzP = await jsonOf(await pickReq({ lang: 'uz' }));
  assert.equal(uzP.n, 2);
  assert.ok(uzP.html.includes('<html lang="uz">') && uzP.html.includes('<h1>Yigʻish roʻyxati</h1>') && uzP.html.includes('Ombordan jami yigʻish') && uzP.html.includes('Olganda toʻlanadi:') && uzP.html.includes('Yigʻdi:'), 'узбекские подписи');
  assert.ok(uzP.html.includes('Guruch') && uzP.html.includes('Kungaboqar yogʻi') && uzP.html.includes('Yetkazib berish') && uzP.html.includes('Olib ketish') && uzP.html.includes('Yangi'), 'названия товаров, получение и статус по-узбекски');
  assert.ok(uzP.html.includes('Позвоните за час'), 'комментарий клиента как есть');
  const visible = uzP.html.replace(/<style>[\s\S]*?<\/style>/, '').replace(/Позвоните за час/g, '').replace(/ООО Ориент|Оптовая база|Навои, ул. Галаба 12, склад 3/g, '');
  assert.ok(!hasRu(visible), 'в узбекском листе остался русский: ' + (visible.match(/[^<>]{0,30}[А-Яа-яЁё]+[^<>]{0,30}/) || [''])[0]);
  const ruP = await jsonOf(await pickReq({}));
  assert.ok(ruP.html.includes('<html lang="ru">') && ruP.html.includes('<h1>Сборочный лист</h1>') && ruP.html.includes('Всего собрать со склада'));
  // файлом в чат
  tgLog = [];
  assert.equal((await exportReq('pick', { lang: 'uz' })).status, 200);
  const pd = lastDoc();
  assert.ok(pd.payload.caption.startsWith('Yigʻish roʻyxati: buyurtmalar 2') && pd.payload.caption.includes('Ctrl+P'), pd.payload.caption);
  assert.ok(new TextDecoder().decode(pd.file.bytes).includes('<h1>Yigʻish roʻyxati</h1>'));
  // резервная копия: пояснение и подпись
  tgLog = [];
  assert.equal((await exportReq('backup', { lang: 'uz' })).status, 200);
  const bd = lastDoc();
  assert.ok(bd.payload.caption.startsWith('Zaxira nusxasi: buyurtmalar 2'), bd.payload.caption);
  const readme = new TextDecoder().decode(unzip(bd.file.bytes)['README.txt']);
  assert.ok(readme.includes('doʻkonining zaxira nusxasi') && readme.includes('backup.json — sozlamalar') && !hasRu(readme.replace(/«[^»]*»/, '')), readme);
  tgLog = [];
  await exportReq('backup');
  assert.ok(new TextDecoder().decode(unzip(lastDoc().file.bytes)['README.txt']).startsWith('Резервная копия магазина'));
});

/* ---------- оплата комиссии: дистрибьютор отмечает платёж, владелец подтверждает ---------- */
/* дистрибьютор с процентом 5 и двумя выданными заказами: начислено 139 400 */
async function commWorld() {
  const { sid } = await shopWorld();
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { pct: 5 } })).status, 200);
  const A = newUser();
  for (let i = 0; i < 2; i++) {
    const o = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) }))).order;
    for (const to of ['accepted', 'ready', 'done']) assert.equal((await callS(sid, 'POST', '/api/admin/status', { init: iD(), body: { id: o.id, to } })).status, 200);
  }
  tgLog = [];
  return { sid, A };
}
const cGet = (sid, init, q) => callS(sid, 'GET', '/api/admin/comm' + (q || ''), { init: init || iD() });
const cPay = (sid, body, init) => callS(sid, 'POST', '/api/admin/comm', { init: init || iD(), body });
const cOwn = (body, init) => call('POST', '/api/hub/admin/comm', { init: init || iS(), body });
const cState = async sid => (await jsonOf(await cGet(sid))).comm;
const sentTo = (id, from) => tgLog.slice(from || 0).filter(x => x.method === 'sendMessage' && x.payload.chat_id === id);

await t('комиссия: «К оплате» — начислено минус подтверждённое; платёж ждёт, пока владелец не нажмёт «Получил»', async () => {
  const { sid, A } = await commWorld();
  let c = await cState(sid);
  assert.deepEqual([c.pct, c.acc, c.paid, c.due, c.nw, c.ws, c.bad, c.pays.length], [5, 139400, 0, 139400, 0, 0, 0, 0]);
  // платёж отмечает продавец дистрибьютора; сумма и комментарий сохраняются
  let r = await cPay(sid, { a: 40000, note: '  Click, чек 123  ' });
  assert.equal(r.status, 200);
  const id = (await jsonOf(r)).id;
  c = await cState(sid);
  assert.deepEqual([c.acc, c.paid, c.due, c.nw, c.ws], [139400, 0, 139400, 1, 40000], 'пока не подтверждён, «К оплате» не меняется');
  assert.deepEqual([c.pays[0].a, c.pays[0].st, c.pays[0].note, c.pays[0].src, c.pays[0].bn], [40000, 'wait', 'Click, чек 123', 's', 'Dilshod']);
  assert.equal(JSON.stringify(c).includes('"ms"'), false, 'номера сообщений наружу не уходят');
  // владельцу пришло сообщение с кнопками (узбекский сверху, русский ниже) и кнопкой открытия экрана
  const m = sentTo(SELLER.id)[0];
  assert.ok(m, 'владельцу ушло сообщение');
  const [uzT, ruT] = norm(m.payload.text).split('\n\n');
  assert.ok(uzT.startsWith('💰 Альфа Трейд: komissiya toʻlovi\nDilshod toʻlovni belgiladi: 40 000 soʻm\nIzoh: Click, чек 123\nTasdiqlashdan oldin toʻlanishi kerak: 139 400 soʻm'), uzT);
  assert.ok(ruT.startsWith('💰 Альфа Трейд: оплата комиссии\nDilshod отметил оплату: 40 000 сум\nКомментарий: Click, чек 123\nК оплате до подтверждения: 139 400 сум'), ruT);
  const kb = m.payload.reply_markup.inline_keyboard;
  assert.deepEqual(kb[0].map(b => [b.text, b.callback_data]), [['✅ Qabul qildim · Получил', 'cp:' + sid + ':' + id + ':ok'], ['❌ Kelmadi · Не получил', 'cp:' + sid + ':' + id + ':no']]);
  assert.equal(kb[1][0].web_app.url, HOST + '/?v=comm');
  assert.ok(Buffer.byteLength(kb[0][0].callback_data) <= 64);
  // владелец нажимает «Получил»
  tgLog = [];
  await cb(SELLER, 'cp:' + sid + ':' + id + ':ok', 777, SELLER.id);
  const ans = lastTg('answerCallbackQuery').payload.text;
  assert.equal(norm(ans), 'Tasdiqlandi: 40 000 soʻm\nПодтверждено: 40 000 сум');
  c = await cState(sid);
  assert.deepEqual([c.paid, c.due, c.nw, c.pays[0].st, c.pays[0].dn], [40000, 99400, 0, 'ok', 'Jasur']);
  // сообщение владельцу получило итог и потеряло кнопки подтверждения
  const ed = lastTg('editMessageText').payload;
  assert.ok(ed.text.includes('✅ Tasdiqlandi (Jasur)') && ed.text.includes('✅ Подтверждено (Jasur)'), ed.text);
  assert.ok(norm(ed.text).includes('Endi toʻlanishi kerak: 99 400 soʻm') && norm(ed.text).includes('К оплате теперь: 99 400 сум'));
  assert.deepEqual((await W.shops.get(sid).storage.get('cpay'))[0].ms, [{ chat_id: SELLER.id, message_id: ed.message_id }], 'правится то самое сообщение');
  assert.equal(ed.chat_id, SELLER.id);
  assert.equal(ed.reply_markup.inline_keyboard.length, 1);
  assert.equal(ed.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?v=comm');
  // продавцу — сообщение о подтверждении и новая сумма
  const toD = sentTo(DIL.id);
  assert.equal(toD.length, 1);
  assert.ok(norm(toD[0].payload.text).startsWith('✅ Komissiya toʻlovi tasdiqlandi: 40 000 soʻm.\nHozir toʻlanishi kerak: 99 400 soʻm\n\n✅ Оплата комиссии подтверждена: 40 000 сум.\nК оплате сейчас: 99 400 сум'));
  assert.equal(toD[0].payload.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/?d=' + sid + '&v=comm');
  // повторное нажатие ничего не меняет и не шлёт сообщений заново
  tgLog = [];
  await cb(SELLER, 'cp:' + sid + ':' + id + ':ok', 777, SELLER.id);
  assert.ok(norm(lastTg('answerCallbackQuery').payload.text).startsWith('Allaqachon tasdiqlangan: 40 000 soʻm\nУже подтверждено: 40 000 сум'));
  await cb(SELLER, 'cp:' + sid + ':' + id + ':no', 777, SELLER.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Этот платёж уже обработан'));
  assert.equal(tgLog.filter(x => x.method === 'sendMessage' || x.method === 'editMessageText').length, 0);
  c = await cState(sid);
  assert.deepEqual([c.paid, c.due], [40000, 99400]);
  // жать кнопки может только владелец; чужой платёж и выдуманный номер не находятся
  tgLog = [];
  await cb(DIL, 'cp:' + sid + ':' + id + ':no', 777, DIL.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Нет доступа'));
  await cb(A.u, 'cp:' + sid + ':' + id + ':no', 777, A.u.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Нет доступа'));
  await cb(SELLER, 'cp:' + sid + ':NOPE1234:ok', 777, SELLER.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('Платёж не найден'));
  assert.deepEqual((({ paid, due }) => [paid, due])(await cState(sid)), [40000, 99400]);
});

await t('комиссия: «Не получил» не меняет «К оплате»; продавец видит отклонённый платёж, пока не откроет экран', async () => {
  const { sid } = await commWorld();
  const id = (await jsonOf(await cPay(sid, { a: 500000 }))).id;
  tgLog = [];
  await cb(SELLER, 'cp:' + sid + ':' + id + ':no', 777, SELLER.id);
  assert.equal(norm(lastTg('answerCallbackQuery').payload.text), 'Belgilandi: olinmadi\nОтмечено: не получено');
  let c = await cState(sid);
  assert.deepEqual([c.paid, c.due, c.nw, c.pays[0].st, c.bad], [0, 139400, 0, 'no', 1]);
  const ed = lastTg('editMessageText').payload;
  assert.ok(ed.text.includes('❌ Olinmadi (Jasur)') && ed.text.includes('❌ Не получено (Jasur)'));
  const toD = sentTo(DIL.id)[0].payload.text;
  assert.ok(norm(toD).includes('❌ Komissiya toʻlovi tasdiqlanmadi: 500 000 soʻm') && norm(toD).includes('❌ Оплата комиссии не подтверждена: 500 000 сум. Владелец не получил эти деньги. Проверьте и введите сумму заново.'));
  // открытие экрана (seen=1) снимает отметку «новое»; обычное чтение её не трогает
  assert.equal((await cState(sid)).bad, 1);
  c = (await jsonOf(await cGet(sid, iD(), '?seen=1'))).comm;
  assert.equal(c.bad, 1, 'при открытии экрана продавец ещё видит, что есть новое');
  assert.equal((await cState(sid)).bad, 0);
  // продавец может ввести сумму заново
  assert.equal((await cPay(sid, { a: 50000 })).status, 200);
  assert.equal((await cState(sid)).nw, 1);
});

await t('комиссия: переплата — «аванс»; владелец решает и из приложения, отменяет подтверждённый платёж и записывает полученное сам', async () => {
  const { sid } = await commWorld();
  const id1 = (await jsonOf(await cPay(sid, { a: 200000, note: 'вперёд' }))).id;
  // из приложения: тот же результат, что и кнопка в Telegram, сообщение владельцу получает итог
  tgLog = [];
  let r = await cOwn({ did: sid, act: 'ok', id: id1 });
  assert.equal(r.status, 200);
  let c = await cState(sid);
  assert.deepEqual([c.paid, c.due], [200000, -60600], 'переплата — отрицательная сумма к оплате (аванс)');
  assert.ok(lastTg('editMessageText').payload.text.includes('✅ Подтверждено (Jasur)'));
  assert.ok(norm(sentTo(DIL.id)[0].payload.text).includes('Avans: 60 600 soʻm') && norm(sentTo(DIL.id)[0].payload.text).includes('Аванс: 60 600 сум'));
  // повтор из приложения — без повторных сообщений
  tgLog = [];
  r = await cOwn({ did: sid, act: 'ok', id: id1 });
  assert.equal(r.status, 200); assert.equal((await jsonOf(r)).same, true);
  assert.equal(tgLog.length, 0);
  // отмена подтверждённого платежа: «К оплате» возвращается, запись остаётся со статусом «Отменён»
  r = await cOwn({ did: sid, act: 'void', id: id1 });
  assert.equal(r.status, 200);
  c = await cState(sid);
  assert.deepEqual([c.paid, c.due, c.pays[0].st, c.pays[0].vo, c.bad], [0, 139400, 'void', 1, 1]);
  assert.ok(lastTg('editMessageText').payload.text.includes('↩️ Egasi bekor qildi (Jasur)'));
  assert.ok(norm(sentTo(DIL.id).pop().payload.text).includes('↩️ Владелец отменил подтверждённую оплату: 200 000 сум.'));
  assert.equal((await cOwn({ did: sid, act: 'void', id: id1 })).status, 200, 'повторная отмена — не ошибка');
  assert.equal((await cOwn({ did: sid, act: 'ok', id: id1 })).status, 409, 'отменённый платёж подтвердить нельзя');
  // владелец записывает оплату, полученную мимо приложения
  tgLog = [];
  r = await cOwn({ did: sid, act: 'add', a: 100000, note: 'наличными' });
  assert.equal(r.status, 200);
  c = await cState(sid);
  assert.deepEqual([c.paid, c.due, c.pays[0].st, c.pays[0].src, c.pays[0].note, c.pays[0].dn], [100000, 39400, 'ok', 'o', 'наличными', 'Jasur']);
  assert.equal(sentTo(SELLER.id).length, 0, 'владельцу о его же записи не пишем');
  assert.ok(norm(sentTo(DIL.id)[0].payload.text).includes('💰 Владелец записал полученную оплату комиссии: 100 000 сум.') && norm(sentTo(DIL.id)[0].payload.text).includes('К оплате сейчас: 39 400 сум'));
  // неверные суммы, номера и действия
  for (const a of [0, -1, 1.5, '100', null, 1e12]) assert.equal((await cOwn({ did: sid, act: 'add', a })).status, 400, 'сумма ' + a);
  assert.equal((await cOwn({ did: sid, act: 'ok', id: 'NOPE1234' })).status, 404);
  assert.equal((await cOwn({ did: sid, act: 'boom', id: id1 })).status, 400);
  assert.equal((await cOwn({ did: 'zz', act: 'ok', id: id1 })).status, 404);
  assert.equal((await cOwn({ act: 'ok', id: id1 })).status, 400);
});

await t('комиссия: продавец отзывает свой ждущий платёж; не больше пяти ждущих; неверные суммы отклоняются', async () => {
  const { sid } = await commWorld();
  for (const a of [0, -5, 1.5, '100', null, 1e12, undefined]) {
    const r = await cPay(sid, a === undefined ? {} : { a });
    assert.equal(r.status, 400, 'сумма ' + a);
    assert.equal((await jsonOf(r)).error, 'bad_amount');
  }
  assert.equal((await cPay(sid, { a: 100000000000 })).status, 200, 'верхняя граница 1e11 допустима');
  const ids = [];
  for (let i = 0; i < 4; i++) ids.push((await jsonOf(await cPay(sid, { a: 1000 + i, note: 'x'.repeat(300) }))).id);
  assert.equal((await cState(sid)).pays[0].note.length, 120, 'комментарий обрезается');
  const r6 = await cPay(sid, { a: 1 });
  assert.equal(r6.status, 429); assert.equal((await jsonOf(r6)).error, 'too_many');
  // отзыв: платёж «Отменён», владельцу сообщение с итогом, о своём отзыве продавцу не пишем
  tgLog = [];
  let r = await callS(sid, 'POST', '/api/admin/comm/cancel', { init: iD(), body: { id: ids[0] } });
  assert.equal(r.status, 200);
  const c = await cState(sid);
  assert.deepEqual([c.nw, c.bad, c.pays.find(p => p.id === ids[0]).st, c.pays.find(p => p.id === ids[0]).vo], [4, 0, 'void', 0]);
  assert.ok(lastTg('editMessageText').payload.text.includes('↩️ Distribyutor toʻlovni qaytarib oldi') && lastTg('editMessageText').payload.text.includes('↩️ Дистрибьютор отозвал платёж'));
  assert.equal(sentTo(DIL.id).length, 0);
  assert.equal((await callS(sid, 'POST', '/api/admin/comm/cancel', { init: iD(), body: { id: ids[0] } })).status, 200, 'повтор — не ошибка');
  assert.equal((await cPay(sid, { a: 2000 })).status, 200, 'место освободилось');
  // отозванный платёж владелец уже подтвердить не может; подтверждённый продавец отозвать не может
  await cb(SELLER, 'cp:' + sid + ':' + ids[0] + ':ok', 777, SELLER.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('уже обработан'));
  await cOwn({ did: sid, act: 'ok', id: ids[1] });
  assert.equal((await callS(sid, 'POST', '/api/admin/comm/cancel', { init: iD(), body: { id: ids[1] } })).status, 409);
  assert.equal((await callS(sid, 'POST', '/api/admin/comm/cancel', { init: iD(), body: { id: 'NOPE1234' } })).status, 404);
});

await t('комиссия: список для владельца по всем дистрибьюторам; права доступа', async () => {
  const { sid, A } = await commWorld();
  const id = (await jsonOf(await cPay(sid, { a: 30000 }))).id;
  await cOwn({ did: sid, act: 'add', a: 10000 });
  let d = await jsonOf(await call('GET', '/api/hub/admin/comm', { init: iS() }));
  const row = d.rows.find(x => x.id === sid), main = d.rows.find(x => x.id === 'main');
  assert.deepEqual([row.name, row.pct, row.acc, row.paid, row.due, row.nw, row.ws, row.err], ['Альфа Трейд', 5, 139400, 10000, 129400, 1, 30000, false]);
  assert.deepEqual(row.pays.map(p => [p.st, p.a]), [['ok', 10000], ['wait', 30000]]);
  assert.deepEqual([main.pct, main.acc, main.due, main.pays.length], [0, 0, 0, 0]);
  assert.deepEqual(d.total, { acc: 139400, paid: 10000, due: 129400, nw: 1, ws: 30000 });
  assert.equal(JSON.stringify(d).includes('"ms"'), false);
  // чужие: владелец — только владелец площадки; продавец дистрибьютора и клиент отвечают отказом
  assert.equal((await call('GET', '/api/hub/admin/comm', { init: iD() })).status, 403);
  assert.equal((await call('GET', '/api/hub/admin/comm', { init: A.init() })).status, 403);
  assert.equal((await call('GET', '/api/hub/admin/comm')).status, 401);
  assert.equal((await cOwn({ did: sid, act: 'ok', id }, iD())).status, 403);
  assert.equal((await cOwn({ did: sid, act: 'add', a: 1 }, A.init())).status, 403);
  assert.equal((await call('POST', '/api/hub/admin/comm', { body: { did: sid, act: 'ok', id } })).status, 401);
  // экран продавца: только продавцы этого дистрибьютора
  assert.equal((await cGet(sid, A.init())).status, 403);
  assert.equal((await callS(sid, 'GET', '/api/admin/comm')).status, 401);
  assert.equal((await cPay(sid, { a: 1 }, A.init())).status, 403);
  assert.equal((await callS(sid, 'POST', '/api/admin/comm/cancel', { init: A.init(), body: { id } })).status, 403);
  // у дистрибьютора без процента (первый) начисленного нет
  const mc = (await jsonOf(await call('GET', '/api/admin/comm', { init: iS() }))).comm;
  assert.deepEqual([mc.pct, mc.acc, mc.due], [0, 0, 0]);
});

await t('комиссия: начисленное считается один раз по записям дней и дальше растёт с заказами; удаление старых дней его не уменьшает', async () => {
  const { sid } = await shopWorld();
  assert.equal((await call('PUT', '/api/hub/admin/shops/' + sid, { init: iS(), body: { pct: 5 } })).status, 200);
  const st = W.shops.get(sid).storage, days = [], put = {};
  for (let i = 0; i < 400; i++) {
    const d = new Date(Date.UTC(2023, 0, 1) + i * 86400000).toISOString().slice(0, 10);
    days.push(d); put['rp:' + d] = { n: 1, sum: 21000, disc: 0, fee: 1000, cb: 20000, cm: 1000, items: [], cl: [] };
  }
  put.rpx = days; put.rp0 = days[0];
  await st.put(put);
  // первый же заказ после обновления: прежнее начисленное берётся из записей дней, заказ не считается дважды
  const A = newUser();
  const o = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) }))).order;
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await callS(sid, 'POST', '/api/admin/status', { init: iD(), body: { id: o.id, to } })).status, 200);
  assert.equal(await st.get('ctot'), 469700, '400 000 прежних + 69 700 нового заказа');
  // индекс держит 400 дней: самый старый день вытеснен, а начисленное осталось
  assert.equal((await st.get('rpx')).length, 400);
  assert.equal(await st.get('rp:' + days[0]), undefined);
  const c = await cState(sid);
  assert.deepEqual([c.acc, c.due], [469700, 469700]);
  // дальше число растёт с каждым выданным заказом
  const o2 = (await jsonOf(await callS(sid, 'POST', '/api/order', { init: A.init(), body: ob(CART) }))).order;
  for (const to of ['accepted', 'ready', 'done']) assert.equal((await callS(sid, 'POST', '/api/admin/status', { init: iD(), body: { id: o2.id, to } })).status, 200);
  assert.equal((await cState(sid)).acc, 539400);
  // первое обращение без заказов тоже считает по записям: у первого дистрибьютора с нулевым процентом начислено 0
  assert.equal((await jsonOf(await call('GET', '/api/admin/comm', { init: iS() }))).comm.acc, 0);
});

await t('комиссия: больше 500 платежей — самые старые подтверждённые сворачиваются, «К оплате» не меняется', async () => {
  const { sid } = await commWorld();
  const st = W.shops.get(sid).storage, now = new Date().toISOString();
  const rows = [];
  for (let i = 0; i < 500; i++) rows.push({ id: 'P' + String(i).padStart(7, '0'), a: 100, note: '', st: 'ok', at: now, dt: now, bn: '', dn: '', src: 'o' });
  await st.put('cpay', rows);
  let c = await cState(sid);
  assert.deepEqual([c.paid, c.due, c.pays.length], [50000, 89400, 100], 'на экране не больше 100 последних');
  await cOwn({ did: sid, act: 'add', a: 400 });
  c = await cState(sid);
  assert.deepEqual([c.paid, c.due], [50400, 89000]);
  assert.equal((await st.get('cpay')).length, 500);
  assert.equal(await st.get('cpo'), 100, 'самый старый платёж свернулся в сумму');
});

/* ---------- доставка: продавец выбирает доставщика ---------- */
const placeAccepted = async (c, cart, mode) => {
  const r = await call('POST', '/api/order', { init: c.init(), body: ob(cart, {}, mode) });
  assert.equal(r.status, 200, JSON.stringify(await r.clone().json()));
  const o = (await jsonOf(r)).order;
  assert.equal((await call('POST', '/api/admin/status', { init: iS(), body: { id: o.id, to: 'accepted' } })).status, 200);
  return o;
};
const sellerStatus = (id, to, extra) => call('POST', '/api/admin/status', { init: iS(), body: Object.assign({ id, to }, extra || {}) });
const setCr = (id, cid, init) => call('POST', '/api/admin/order-courier', { init: init || iS(), body: { id, cid } });
const kbOf = p => p.reply_markup.inline_keyboard.flat();

await t('выбор доставщика: «Готов к отправке» с выбранным доставщиком — заказ сразу за ним, остальным ничего не приходит, клиент узнаёт имя', async () => {
  await stockWorld();
  const c1 = await hire(DRV, 'Рустам'), c2 = await hire(DRV2, 'Азиз');
  // для списка выбора сервер отдаёт только имена и номера, без касс и ссылок
  const lst = (await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).crs;
  assert.deepEqual(lst.map(x => [x.id, x.name, x.phone]), [[c1, 'Рустам', PH], [c2, 'Азиз', PH]]);
  assert.deepEqual(Object.keys(lst[0]).sort(), ['id', 'name', 'phone']);
  const A = newUser();
  const o = await placeAccepted(A, CART, 'delivery');
  // выбрать можно только настоящего включённого доставщика
  assert.deepEqual([(await sellerStatus(o.id, 'ready', { cid: 'kzzzzzz' })).status, (await jsonOf(await sellerStatus(o.id, 'ready', { cid: 'kzzzzzz' }))).error], [409, 'no_courier']);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'accepted', 'неверный доставщик ничего не меняет');
  tgLog = [];
  const r = await sellerStatus(o.id, 'ready', { cid: c1 });
  assert.equal(r.status, 200);
  const ord = (await jsonOf(r)).order;
  assert.deepEqual([ord.status, ord.cr, ord.crn, ord.crp], ['ready', c1, 'Рустам', PH]);
  // доставщику приходит карточка «назначен», без кнопки «Взял», но с «Открыть доставку»
  const m1 = lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes(o.id)).payload;
  assert.ok(m1.text.includes('Вам назначен заказ') && m1.text.includes('Sizga buyurtma tayinlandi') && m1.text.includes('Навои, ул. Галаба 12'), m1.text);
  assert.ok(!kbOf(m1).some(b => b.callback_data), 'кнопки «Взял» нет: заказ уже его');
  assert.ok(kbOf(m1).some(b => b.web_app && b.web_app.url.endsWith('&v=courier')));
  assert.equal(tgAll('sendMessage', p => p.chat_id === DRV2.id).length, 0, 'второй доставщик ничего не получил');
  // клиент сразу узнаёт, кто везёт, а не «собран»
  const toClient = tgAll('sendMessage', p => p.chat_id === A.u.id).map(x => x.payload.text);
  assert.equal(toClient.length, 1, toClient.join(' | '));
  assert.ok(toClient[0].includes('Рустам') && toClient[0].includes(PH) && !toClient[0].includes('собран'), toClient[0]);
  // карточка продавца: кто везёт, кнопки «Доставлен» нет
  const card = lastTg('editMessageText', p => p.chat_id === SELLER.id && p.text.includes('Доставщик: Рустам')).payload;
  assert.ok(card.text.includes('🚚 Доставщик: Рустам'));
  assert.ok(!kbOf(card).some(b => /:done$/.test(b.callback_data || '')), 'продавец не закрывает доставку');
  assert.ok(kbOf(card).some(b => /^c:/.test(b.callback_data || '')), 'отменить заказ можно');
  // у доставщиков в приложении: свой заказ помечен, у второго он занят
  const l1 = (await jsonOf(await call('GET', '/api/courier/orders', { init: iR() }))).orders.find(x => x.id === o.id);
  const l2 = (await jsonOf(await call('GET', '/api/courier/orders', { init: iR2() }))).orders.find(x => x.id === o.id);
  assert.deepEqual([l1.mine, l2.mine, l2.crn], [true, false, 'Рустам']);
  assert.equal((await drvTake(o.id, iR2())).status, 409);
  // доставщик закрывает доставку с оплатой, наличные идут в его кассу
  const done = await drvDone(o.id, { m: 'cash' });
  assert.equal(done.status, 200, JSON.stringify(await done.clone().json()));
  assert.equal((await drvCash()).cash, 1394000);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'done');
});

await t('выбор доставщика: «Всем, кто первый» работает как раньше, самовывоз и заказ без доставщиков не меняются', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам'); await hire(DRV2, 'Азиз');
  const A = newUser();
  const o = await placeAccepted(A, CART, 'delivery');
  tgLog = [];
  assert.equal((await sellerStatus(o.id, 'ready')).status, 200);       // без cid: всем
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes('Готов к доставке')), 'первый получил');
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV2.id && p.text.includes('Готов к доставке')), 'второй получил');
  assert.ok(kbOf(lastTg('sendMessage', p => p.chat_id === DRV.id).payload).some(b => b.callback_data === 'k:' + o.id));
  assert.ok(tgAll('sendMessage', p => p.chat_id === A.u.id).some(x => x.payload.text.includes('собран')), 'клиенту «собран и скоро будет доставлен»');
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).cr, undefined);
  // карточка продавца: «Ждёт доставщика»
  const card = lastTg('editMessageText', p => p.chat_id === SELLER.id && p.text.includes(o.id)).payload;
  assert.ok(card.text.includes('Ждёт доставщика') && card.text.includes('Yetkazuvchi kutilmoqda'), card.text);
  // самовывоз: cid игнорируется, никто из доставщиков не получает заказ
  const pk = await placeAccepted(A, ONE, 'pickup');
  tgLog = [];
  const rp = await sellerStatus(pk.id, 'ready', { cid: (await crList())[0].id });
  assert.equal(rp.status, 200);
  assert.equal((await jsonOf(rp)).order.cr, undefined);
  assert.equal(tgAll('sendMessage', p => p.chat_id === DRV.id || p.chat_id === DRV2.id).length, 0);
  assert.equal((await sellerStatus(pk.id, 'done', { pay: { m: 'cash' } })).status, 200, 'самовывоз продавец выдаёт сам');
  // нет доставщиков: cid не принимается, а доставку продавец закрывает сам
  await stockWorld();
  const B = newUser();
  const o2 = await placeAccepted(B, CART, 'delivery');
  assert.equal((await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).crs.length, 0);
  assert.equal((await sellerStatus(o2.id, 'ready', { cid: 'kabcdefg' })).status, 409);
  assert.equal((await sellerStatus(o2.id, 'ready')).status, 200);
  assert.equal((await sellerStatus(o2.id, 'done', { pay: { m: 'cash' } })).status, 200, 'без доставщиков продавец доставляет сам');
});

await t('выбор доставщика: продавец меняет доставщика — прежний узнаёт, новый получает карточку, у остальных сообщения обновляются; «Вернуть всем»', async () => {
  await stockWorld();
  const c1 = await hire(DRV, 'Рустам'), c2 = await hire(DRV2, 'Азиз');
  const A = newUser();
  const o = await placeAccepted(A, CART, 'delivery');
  assert.equal((await sellerStatus(o.id, 'ready', { cid: c1 })).status, 200);
  const cm1 = (await W.storage.get('o:' + o.id)).cm;
  assert.equal(cm1.length, 1);
  // смена на второго
  tgLog = [];
  const r = await setCr(o.id, c2);
  assert.equal(r.status, 200);
  const ord = (await jsonOf(r)).order;
  assert.deepEqual([ord.cr, ord.crn, ord.cm], [c2, 'Азиз', undefined]);
  const nw = lastTg('sendMessage', p => p.chat_id === DRV2.id && p.text.includes(o.id)).payload;
  assert.ok(nw.text.includes('Вам назначен заказ'), nw.text);
  const gone = lastTg('sendMessage', p => p.chat_id === DRV.id).payload.text;
  assert.ok(gone.includes('Sotuvchi') && gone.includes('Продавец снял с вас заказ ' + o.id) && gone.includes('Азиз'), gone);
  assert.ok(lastTg('editMessageText', p => p.chat_id === DRV.id && p.message_id === cm1[0].message_id).payload.text.includes('уже взял Азиз'), 'старая карточка прежнего доставщика обновилась');
  assert.ok(tgAll('sendMessage', p => p.chat_id === A.u.id).some(x => x.payload.text.includes('Азиз')), 'клиент узнал нового доставщика');
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id && p.text.includes('Доставщик: Азиз')), 'карточка продавца');
  // тот же доставщик повторно: ничего не рассылается
  tgLog = [];
  const same = await setCr(o.id, c2);
  assert.equal(same.status, 200);
  assert.equal(tgAll('sendMessage').length, 0);
  // прежний доставщик больше не может закрыть заказ
  assert.equal((await drvDone(o.id, { m: 'cash' }, iR())).status, 403);
  // неверные запросы
  assert.deepEqual([(await setCr(o.id, 'kzzzzzz')).status, (await jsonOf(await setCr(o.id, 'kzzzzzz'))).error], [409, 'no_courier']);
  assert.equal((await setCr('Z-NOPE1', c1)).status, 404);
  assert.equal((await setCr(o.id, c1, iA())).status, 403, 'меняет только продавец');
  assert.equal((await call('PUT', '/api/admin/couriers/' + c1, { init: iS(), body: { on: false } })).status, 200);
  assert.equal((await jsonOf(await setCr(o.id, c1))).error, 'no_courier', 'отключённому доставщику заказ не передать');
  assert.equal((await call('PUT', '/api/admin/couriers/' + c1, { init: iS(), body: { on: true } })).status, 200);
  const pk = await placeAccepted(A, ONE, 'pickup');
  await sellerStatus(pk.id, 'ready');
  assert.equal((await setCr(pk.id, c1)).status, 409, 'самовывоз доставщику не передать');
  const nw0 = await placeAccepted(A, CART, 'delivery');
  assert.equal((await setCr(nw0.id, c1)).status, 409, 'пока заказ не готов, назначить нельзя');
  // «Вернуть всем»: заказ снова свободный и у обоих с кнопкой «Взял»
  tgLog = [];
  const back = await setCr(o.id, '');
  assert.equal(back.status, 200);
  const backOrd = (await jsonOf(back)).order;
  assert.deepEqual([backOrd.cr, backOrd.crn], [undefined, undefined]);
  const free = lastTg('editMessageText', p => p.chat_id === DRV2.id && p.text.includes('Готов к доставке')).payload;
  assert.ok(kbOf(free).some(b => b.callback_data === 'k:' + o.id), 'у второго снова «Взял»');
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV2.id && p.text.includes('Продавец снял с вас заказ')), 'второй узнал, что заказ с него снят');
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id && p.text.includes('Ждёт доставщика')));
  // после этого любой доставщик берёт «Взял» как обычно
  assert.equal((await drvTake(o.id)).status, 200);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).crn, 'Рустам');
});

await t('выбор доставщика: пока есть доставщики, продавец не отмечает доставку выданной ни в приложении, ни в Telegram; без них и при самовывозе может', async () => {
  await stockWorld();
  const c1 = await hire(DRV, 'Рустам');
  const A = newUser();
  const o = await readyDelivery(A, CART);                              // без выбора: всем
  // приложение
  const r = await sellerStatus(o.id, 'done', { pay: { m: 'cash' } });
  assert.deepEqual([r.status, (await jsonOf(r)).error], [409, 'use_courier']);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'ready');
  // Telegram: кнопка «Доставлен» в старом сообщении, оплата, оплата в долг
  for (const data of ['s:' + o.id + ':done', 'p:' + o.id + ':cash', 'p:' + o.id + ':credit:7']) {
    tgLog = [];
    await cb(SELLER, data, 800, SELLER.id);
    const ans = lastTg('answerCallbackQuery').payload;
    assert.ok(ans.text.includes('Buyurtmani yetkazilgan deb yetkazuvchi belgilaydi') && ans.text.includes('Доставленным заказ отмечает доставщик'), data + ': ' + ans.text);
    assert.equal(ans.show_alert, true);
    const ed = lastTg('editMessageText', p => p.chat_id === SELLER.id && p.message_id === 800).payload;
    assert.ok(!kbOf(ed).some(b => /^p:|:done$/.test(b.callback_data || '')), 'карточка обновилась без кнопки «Доставлен»: ' + data);
    assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'ready');
  }
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).pay, undefined);
  // доставщика отключили: доставщиков нет, продавец закрывает сам
  assert.equal((await call('PUT', '/api/admin/couriers/' + c1, { init: iS(), body: { on: false } })).status, 200);
  assert.equal((await jsonOf(await call('GET', '/api/admin/orders', { init: iS() }))).crs.length, 0);
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':done', 801, SELLER.id);
  assert.ok(lastTg('editMessageText', p => p.chat_id === SELLER.id && p.message_id === 801).payload.text.includes('Как клиент оплатил заказ'), 'без доставщиков вопрос об оплате как раньше');
  await cb(SELLER, 'p:' + o.id + ':cash', 801, SELLER.id);
  assert.equal((await adminOrdersOf()).find(x => x.id === o.id).status, 'done');
});

await t('выбор доставщика: карточка заказа в Telegram — без «Доставлен» при доставщиках, «Готов к отправке» из Telegram уходит всем', async () => {
  await stockWorld();
  await hire(DRV, 'Рустам'); await hire(DRV2, 'Азиз');
  const A = newUser();
  const o = await placeAccepted(A, CART, 'delivery');
  tgLog = [];
  await cb(SELLER, 's:' + o.id + ':ready', 810, SELLER.id);
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV.id && p.text.includes('Готов к доставке')));
  assert.ok(lastTg('sendMessage', p => p.chat_id === DRV2.id && p.text.includes('Готов к доставке')));
  const ed = lastTg('editMessageText', p => p.chat_id === SELLER.id && p.message_id === 810).payload;
  assert.ok(ed.text.includes('Ждёт доставщика'), ed.text);
  assert.ok(!kbOf(ed).some(b => /:done$/.test(b.callback_data || '')));
  assert.ok(kbOf(ed).some(b => b.web_app), 'панель продавца для смены доставщика');
  // самовывоз: кнопка «Выдан клиенту» на месте
  const pk = await placeAccepted(A, ONE, 'pickup');
  await cb(SELLER, 's:' + pk.id + ':ready', 811, SELLER.id);
  assert.ok(kbOf(lastTg('editMessageText', p => p.message_id === 811).payload).some(b => /:done$/.test(b.callback_data || '')));
  // «Взял» после выбора доставщика недоступен другим, а у выбранного кнопки нет — но старое сообщение с «Взял» безвредно
  assert.equal((await setCr(o.id, (await crList())[1].id)).status, 200);
  tgLog = [];
  await cb(DRV, 'k:' + o.id, 812, DRV.id);
  assert.ok(lastTg('answerCallbackQuery').payload.text.includes('уже взял Азиз'));
});

/* ---------- карточка товара: отправка на проверку внизу, значок вместо «Свернуть» ---------- */
await t('карточка товара: «Отправить на проверку» внизу карточки, а не вверху; вместо слова «Свернуть» значок', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf8');
  const fn = name => { const i = html.indexOf('function ' + name + '('); assert.ok(i > 0, 'функция ' + name); const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j > 0 ? j : i + 4000); };
  const head = fn('modHeadInner'), foot = fn('modFootInner'), body = fn('prodBody'), bits = fn('paintModBits');
  assert.ok(!/msub1/.test(head), 'вверху карточки кнопки отправки больше нет');
  assert.ok(/modTag\(p\)/.test(head) && /modReasonHTML\(p\)/.test(head), 'вверху остались метка и причина возврата');
  assert.ok(/«Отправить на проверку» внизу/.test(head) && /«Tekshiruvga yuborish»/.test(head), 'подсказка вверху говорит, где кнопка, на двух языках');
  assert.ok(/data-act="msub1"/.test(foot) && /Отправить на проверку/.test(foot) && /Tekshiruvga yuborish/.test(foot) && /Отправить снова/.test(foot) && /Qayta yuborish/.test(foot), 'внизу кнопка «Отправить на проверку» и «Отправить снова»');
  assert.ok(/p\.ms!=='draft'&&p\.ms!=='ret'\)return ''/.test(foot), 'у одобренных и ждущих проверки кнопки нет');
  assert.ok(/S\.msubBusy\?' disabled'/.test(foot), 'при отправке кнопка блокируется');
  // порядок в карточке: поля → ▲▼ и удаление → кнопка отправки последней
  assert.ok(body.indexOf('data-act="pmove"') < body.indexOf('id="mf-') && body.indexOf('data-act="pdel"') < body.indexOf('id="mf-') && body.indexOf('data-act="pfold"') < body.indexOf('id="mf-'), 'кнопка отправки под рядом ▲ ▼ Удалить');
  assert.ok(/^id="mf-'\+id\+'">'\+modFootInner\(p\)\+'<\/div>'\s*\+'<\/div>';\s*\}/.test(body.slice(body.indexOf('id="mf-'))), 'кнопка отправки последняя в форме');
  assert.ok(/mf-'\+p\.id/.test(bits) && /modFootInner\(p\)/.test(bits), 'нижняя кнопка обновляется вместе с верхней меткой');
  // значок вместо слова
  const fold = body.slice(body.indexOf('pfoldbtn') - 80, body.indexOf('pfoldbtn') + 520);
  assert.ok(/data-act="pfold"/.test(fold) && /<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"\/><\/svg>/.test(fold), 'значок-шеврон');
  assert.ok(/aria-label="'\+esc\(L\('Свернуть','Yigʻish'\)\)/.test(fold) && /title="'\+esc\(L\('Свернуть','Yigʻish'\)\)/.test(fold), 'подпись для экранных дикторов и подсказка на двух языках');
  assert.ok(!/>'\+L\('Свернуть','Yigʻish'\)\+'<\/button>/.test(body), 'слова на кнопке нет');
  assert.ok(/data-act="pfoldall" data-v="0"/.test(html), '«Свернуть все» над списком остаётся словами');
});

/* ---------- итог ---------- */
let bad = 0;
for (const r of results) {
  if (r[0]) console.log('  ok   ' + r[1]);
  else { bad++; console.log('  FAIL ' + r[1] + '\n       ' + String(r[2] && r[2].stack || r[2]).split('\n').slice(0, 6).join('\n       ')); }
}
console.log('\n' + (results.length - bad) + ' из ' + results.length + ' проверок пройдено (часовой пояс: ' + (process.env.TZ || 'системный') + ')');
process.exit(bad ? 1 : 0);
