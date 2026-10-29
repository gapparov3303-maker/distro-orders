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
  + '\n;return {DEFAULT,pickupInfo,shopNow,ymd,mergeCfg,setLang,STATUS,stOf,leadFor,orderText,fmtWhen}')();

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
  async delete(k) {
    const list = Array.isArray(k) ? k : [k];
    let n = 0;
    list.forEach(x => { if (this.m.delete(x)) n++; });
    return Array.isArray(k) ? n : n > 0;
  }
}
let tgLog = [], tgFail = false, msgSeq = 1000;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  assert.ok(u.startsWith('https://api.telegram.org/bot' + TOKEN + '/'), 'запрос ушёл не в Telegram: ' + u);
  if (tgFail) throw new Error('сеть недоступна');
  const method = u.split('/').pop();
  const payload = JSON.parse(init.body);
  tgLog.push({ method, payload });
  const res = { ok: true, result: true };
  if (method === 'sendMessage') res.result = { message_id: ++msgSeq, chat: { id: payload.chat_id } };
  if (method === 'getMe') res.result = { id: 123456, username: 'distro_test_bot' };
  return new Response(JSON.stringify(res), { headers: { 'content-type': 'application/json' } });
};

function makeWorld(envExtra) {
  const storage = new MockStorage();
  const shop = new mod.Shop({ storage }, Object.assign({ BOT_TOKEN: TOKEN, ADMIN_CODE: CODE }, envExtra));
  const env = { BOT_TOKEN: TOKEN, ADMIN_CODE: CODE, SHOP: { idFromName: () => 'main', get: () => ({ fetch: r => shop.fetch(r) }) } };
  Object.assign(env, envExtra);
  return { storage, shop, env };
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

await t('бот: /start зовёт открыть каталог, по-узбекски для uz', async () => {
  tgLog = [];
  await send({ update_id: 1, message: { message_id: 1, from: ANNA, chat: { id: ANNA.id, type: 'private' }, text: '/start' } });
  let m = lastTg('sendMessage');
  assert.equal(m.payload.chat_id, ANNA.id);
  assert.ok(m.payload.text.includes('каталог') && m.payload.text.includes('самовывоз или доставка'));
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].text, '🛒 Открыть каталог');
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].web_app.url, HOST + '/');
  await send({ update_id: 2, message: { message_id: 2, from: BOB, chat: { id: BOB.id, type: 'private' }, text: 'salom' } });
  m = lastTg('sendMessage');
  assert.ok(m.payload.text.includes('Katalogni oching'));
  assert.equal(m.payload.reply_markup.inline_keyboard[0][0].text, '🛒 Katalogni ochish');
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
  tgLog = [];
  await send({ update_id: 1, message: { message_id: 1, from: SELLER, chat: { id: SELLER.id, type: 'private' }, text: '/admin ' + CODE } });
  assert.ok(lastTg('sendMessage').payload.text.includes('Слишком много'));
  assert.equal((await call('GET', '/api/admin/orders', { init: iS() })).status, 403);
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
const stockAlerts = () => tgAll('sendMessage', p => String(p.text).startsWith('Остатки на складе:'));
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

await t('остатки: покупатель видит число только когда мало или нет; точные остатки и резерв ему не отдаются', async () => {
  await stockWorld();
  await setSt('p2', 40, 10);
  const clean = async () => {
    const txt = await (await call('GET', '/api/config')).text();
    assert.ok(!txt.includes('"stk"') && !txt.includes('"q"') && !txt.includes('"r"') && !txt.includes('"low"'), 'в каталог попали внутренние данные остатков');
    const b = await jsonOf(await call('GET', '/api/bootstrap', { init: iA() }));
    assert.equal(JSON.stringify(b.prod), JSON.stringify((await jsonOf(await call('GET', '/api/config'))).prod));
    return (await pubItem('p2')).av;
  };
  assert.equal(await clean(), undefined);                         // 40 — много: просто «В наличии»
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 29 }])).status, 200);   // свободно 11 — ещё выше порога 10
  assert.equal(await clean(), undefined);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 2 }])).status, 200);    // свободно 9 — «Мало (осталось 9)»
  assert.equal(await clean(), 9);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 9 }])).status, 200);
  assert.equal(await clean(), 0);                                 // свободно 0 — «Нет в наличии»
  const r = await place(newUser(), [{ id: 'p2', qty: 1 }]);
  const d = await jsonOf(r);
  assert.equal(r.status, 409);
  assert.equal(d.error, 'stock');
  assert.deepEqual(d.short, [{ id: 'p2', avail: 0 }]);
  assert.equal(d.prod.items.find(x => x.id === 'p2').av, 0, 'ответ об ошибке несёт свежий каталог');
  // приход возвращает товар в продажу
  await stockOp({ id: 'p2', op: 'in', n: 100 });
  assert.equal(await clean(), undefined);
  assert.equal((await place(newUser(), [{ id: 'p2', qty: 1 }])).status, 200);
  // порог 0: число не показываем, пока не закончится совсем
  await setSt('p4', 50, 0);
  assert.equal((await pubItem('p4')).av, undefined);
  assert.equal((await place(newUser(), [{ id: 'p4', qty: 49 }])).status, 200);
  assert.equal((await pubItem('p4')).av, undefined);
  assert.equal((await place(newUser(), [{ id: 'p4', qty: 1 }])).status, 200);
  assert.equal((await pubItem('p4')).av, 0);
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
  for (const to of ['accepted', 'ready', 'done']) await cb(SELLER, 's:' + oe.id + ':' + to);
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
  prod.items.forEach(x => { x.stock = 999; x.q = 999; x.r = 0; x.low = 1; x.rs = { p2: 1 }; if (x.id === 'p4') x.av = 0; });
  prod.items.find(x => x.id === 'p2').price = 415000;
  const r = await putProd(prod);
  const saved = (await jsonOf(r)).prod;
  assert.equal(saved.items.find(x => x.id === 'p2').price, 415000);
  assert.equal(saved.items.find(x => x.id === 'p2').av, 3, 'ответ сохранения содержит актуальное «осталось»');
  assert.equal(saved.items.find(x => x.id === 'p4').av, undefined, 'av от клиента не принимается');
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

/* ---------- итог ---------- */
let bad = 0;
for (const r of results) {
  if (r[0]) console.log('  ok   ' + r[1]);
  else { bad++; console.log('  FAIL ' + r[1] + '\n       ' + String(r[2] && r[2].stack || r[2]).split('\n').slice(0, 6).join('\n       ')); }
}
console.log('\n' + (results.length - bad) + ' из ' + results.length + ' проверок пройдено (часовой пояс: ' + (process.env.TZ || 'системный') + ')');
process.exit(bad ? 1 : 0);
