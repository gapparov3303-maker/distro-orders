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
  + '\n;return {DEFAULT,pickupInfo,shopNow,ymd,mergeCfg,setLang,STATUS,stOf,leadFor,orderText,fmtWhen,deliveryFee,unitPrice,nextTier,orderDiscount,nextDiscount,packText,packSplit}')();

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
  assert.equal((await clientOf(A.u.id)).ds, 2);
  assert.equal((await clientOf(A.u.id)).sum, 1394000 + 7500);
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
  for (const kind of ['orders', 'clients', 'backup', 'pick']) {
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
  assert.deepEqual(head.slice(0, 6), ['Имя', 'Телефон', 'Организация', 'Группа', 'Адреса доставки', 'Заметка']);
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
  const day = n => new Date(Date.now() + 5 * 3600000 - n * 86400000).toISOString();
  const mk = (id, ago, total, qty, st) => ({ id, createdAt: day(ago), status: st || 'done', statusAt: day(ago), name: 'Старый клиент', phone: '+998 90 000 00 00', mode: 'pickup', pickupAt: '2026-01-01T10:00', comment: '', uid: 777, items: [{ id: 'p4', name: 'Макароны', amount: 400, unit: 'g', price: 7500, qty }], total, msgs: [] });
  const olds = [mk('Z-OLD01', 12, 75000, 10), mk('Z-OLD02', 3, 30000, 4), mk('Z-OLD03', 3, 45000, 6), mk('Z-OLD04', 2, 7500, 1, 'cancelled')];
  const st = W.storage;
  for (const o of olds) await st.put('o:' + o.id, o);
  await st.put('hist', olds.map(o => o.id));
  assert.equal(await st.get('rpx'), undefined);
  let d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual([d.tot.n, d.tot.sum], [3, 150000]);
  assert.equal(d.since, day(12).slice(0, 10));
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
  assert.equal(r7.since, day(12).slice(0, 10));
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
  assert.deepEqual(d.buy.list, [{ id: 'p4', name: 'Макароны', w: '400 г', avail: 30, daily: 5, left: 6, need: 40 }]);
  // товар без учёта остатка в подсказку не попадает, а у товара с нулевым остатком «хватит на 0 дней»
  assert.equal((await setSt('p1', 0)).status, 200);
  d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual(d.buy.list.map(x => [x.id, x.left, x.need]), [['p1', 0, 14], ['p4', 6, 40]]);
  // свободный остаток: отложенное под заказ вычитается
  const A = newUser();
  const o = await placeP(A, [{ id: 'p4', qty: 10 }]);
  assert.equal(o.status, 200);
  d = (await jsonOf(await call('GET', '/api/admin/report?days=30', { init: iS() }))).report;
  assert.deepEqual(d.buy.list.find(x => x.id === 'p4'), { id: 'p4', name: 'Макароны', w: '400 г', avail: 20, daily: 5, left: 4, need: 50 });
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
  assert.deepEqual(bk.reports.days[days[0]].items, [{ id: 'p4', name: 'Макароны', qty: 12, sum: 84000 }]);
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

/* ---------- итог ---------- */
let bad = 0;
for (const r of results) {
  if (r[0]) console.log('  ok   ' + r[1]);
  else { bad++; console.log('  FAIL ' + r[1] + '\n       ' + String(r[2] && r[2].stack || r[2]).split('\n').slice(0, 6).join('\n       ')); }
}
console.log('\n' + (results.length - bad) + ' из ' + results.length + ' проверок пройдено (часовой пояс: ' + (process.env.TZ || 'системный') + ')');
process.exit(bad ? 1 : 0);
