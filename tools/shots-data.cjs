// Выдуманные данные для скриншотов «О нас» (см. tools/shots.cjs). Все имена, телефоны и суммы вымышлены.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const repo = path.resolve(__dirname, '..');
const OUT = process.env.SHOTS_OUT || path.join(repo, 'src', 'about');
const VIEW = { width: 360, height: 680 }, DPR = 1.5;
const shared = fs.readFileSync(path.join(repo, 'src/shared.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'src/app.html'), 'utf8').replace('/*SHARED*/', () => shared);

/* ---------- выдуманные данные ---------- */
const DID = 'navoifood';
const dayStr = n => new Date(Date.now() + 5 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
const TODAY = dayStr(0);
const when = (h, m, d) => dayStr(d || 0) + 'T' + String(h).padStart(2, '0') + ':' + String(m || 0).padStart(2, '0');
const created = (h, m, d) => new Date(Date.parse(dayStr(d || 0) + 'T00:00:00Z') + ((h - 5) * 60 + (m || 0)) * 60e3).toISOString();

const CATS = [
  { id: 'c1', name: 'Крупы и мука', uz: 'Yorma va un' },
  { id: 'c2', name: 'Масло и сахар', uz: 'Yogʻ va shakar' },
  { id: 'c3', name: 'Консервы', uz: 'Konservalar' }
];
const P = (id, cat, name, uz, amount, unit, price, o) => Object.assign({ id, cat, name, uz, amount, unit, price, on: true, tag: '', old: 0, pv: '1', pv2: '', pv3: '', tiers: [], blk: 0, box: 0, desc: '', descUz: '' }, o || {});
const ITEMS = [
  P('p1', 'c1', 'Рис «Лазер»', 'Guruch «Lazer»', 25, 'kg', 410000, { tag: 'new', av: 8, lw: 1 }),
  P('p2', 'c1', 'Мука высшего сорта', 'Un, oliy navli', 50, 'kg', 285000),
  P('p3', 'c2', 'Масло подсолнечное', 'Kungaboqar yogʻi', 5, 'l', 98000, { tag: 'sale', old: 112000 }),
  P('p4', 'c2', 'Сахар белый', 'Shakar', 50, 'kg', 520000),
  P('p5', 'c3', 'Говядина тушёная', 'Dudlangan mol goʻshti', 325, 'g', 38000),
  P('p6', 'c3', 'Горошек зелёный', 'Yashil no‘xat', 400, 'g', 12500)
];
const PROD = () => ({ cats: CATS, items: ITEMS });
const SHOPS = [
  { id: DID, name: 'Навои Фуд', items: 24, cats: CATS.slice(0, 3), delivery: true, minOrder: 300000, regions: [], home: '', cat: 'wholesale' },
  { id: 'oltindon', name: 'Олтин Дон', items: 18, cats: [{ id: 'x1', name: 'Мука', uz: 'Un' }, { id: 'x2', name: 'Макароны', uz: 'Makaron' }], delivery: true, minOrder: 0, regions: [], home: '', cat: 'maker' },
  { id: 'mevazor', name: 'Мевазор', items: 31, cats: [{ id: 'y1', name: 'Овощи', uz: 'Sabzavot' }, { id: 'y2', name: 'Фрукты', uz: 'Mevalar' }], delivery: false, minOrder: 0, regions: [], home: '', cat: 'bazaar' }
];
const it = (id, name, uz, qty, price, amount, unit) => ({ id, name, uz, qty, price, amount, unit });
const SHOP_ORDERS = [
  { id: 'N-4821', status: 'new', mode: 'delivery', address: 'ул. Галаба, 12', pickupAt: when(16, 0), createdAt: created(10, 20), name: 'Малика', org: 'Магазин «Малика»', phone: '+998901234501', items: [it('p1', 'Рис «Лазер»', 'Guruch «Lazer»', 2, 410000, 25, 'kg'), it('p3', 'Масло подсолнечное', 'Kungaboqar yogʻi', 4, 98000, 5, 'l')], total: 1212000, did: DID, shopName: 'Навои Фуд' },
  { id: 'N-4807', status: 'ready', mode: 'pickup', pickupAt: when(14, 0), createdAt: created(8, 45), name: 'Малика', org: 'Магазин «Малика»', phone: '+998901234501', items: [it('w1', 'Мука «Олтин»', 'Un «Oltin»', 5, 240000, 50, 'kg')], total: 1200000, did: 'oltindon', shopName: 'Олтин Дон' },
  { id: 'N-4790', status: 'done', mode: 'delivery', address: 'ул. Галаба, 12', pickupAt: when(11, 0, -2), createdAt: created(9, 0, -2), name: 'Малика', org: 'Магазин «Малика»', phone: '+998901234501', items: [it('p2', 'Мука высшего сорта', 'Un, oliy navli', 3, 285000, 50, 'kg')], total: 855000, did: DID, shopName: 'Навои Фуд', pay: { m: 'cash' } }
];
// долг магазина перед дистрибьютором (экран «Мой долг»)
const MY_DEBT = {
  did: DID, shopName: 'Навои Фуд', bal: 1650000, over: 650000, days: 3, due: dayStr(-3), ask: 1,
  contact: { telegram: 'navoifood_sales', phone: '+998 90 555 01 01' },
  open: [{ ref: 'N-4731', due: dayStr(-3), r: 650000 }, { ref: 'N-4766', due: dayStr(5), r: 1000000 }],
  rows: [
    { n: 4, g: 4, k: 'ch', a: 1000000, d: 1000000, ref: 'N-4766', due: dayStr(5), t: created(9, 10, -1), bn: 'Навои Фуд', cf: 'wait' },
    { n: 3, g: 3, k: 'pay', m: 'cash', a: 300000, d: -300000, t: created(15, 30, -4), bn: 'Рустам', cf: 'ok' },
    { n: 1, g: 1, k: 'ch', a: 950000, d: 950000, ref: 'N-4731', due: dayStr(-3), t: created(11, 0, -10), bn: 'Навои Фуд', cf: 'ok' }
  ]
};

// заказы глазами продавца
const sellerOrder = (id, status, mode, name, org, phone, items, o) => Object.assign({ id, status, mode, address: mode === 'delivery' ? 'ул. Галаба, 12' : '', pickupAt: when(14, 0), createdAt: created(9, 30), name, org, phone, tg: { username: 'shop_' + id.slice(-4) }, items, total: items.reduce((t, x) => t + x.qty * x.price, 0) }, o || {});
const SELLER_ORDERS = [
  sellerOrder('N-4821', 'new', 'delivery', 'Малика', 'Магазин «Малика»', '+998901234501', [it('p1', 'Рис «Лазер»', 'Guruch «Lazer»', 2, 410000, 25, 'kg'), it('p3', 'Масло подсолнечное', 'Kungaboqar yogʻi', 4, 98000, 5, 'l')], { pickupAt: when(13, 0), createdAt: created(10, 20), comment: 'Позвоните за полчаса до приезда' }),
  sellerOrder('N-4825', 'new', 'pickup', 'Дилором', 'Магазин «Бахор»', '+998901234502', [it('p2', 'Мука высшего сорта', 'Un, oliy navli', 3, 285000, 50, 'kg')], { pickupAt: when(14, 30), createdAt: created(10, 40) }),
  sellerOrder('N-4807', 'accepted', 'pickup', 'Шахло', 'Магазин «Гулистон»', '+998901234503', [it('p5', 'Говядина тушёная', 'Dudlangan mol goʻshti', 24, 38000, 325, 'g')], { pickupAt: when(15, 0) }),
  sellerOrder('N-4799', 'ready', 'pickup', 'Бахтиёр', 'Магазин «Навруз»', '+998901234504', [it('p4', 'Сахар белый', 'Shakar', 2, 520000, 50, 'kg'), it('p6', 'Горошек зелёный', 'Yashil no‘xat', 12, 12500, 400, 'g')], { pickupAt: when(17, 0), createdAt: created(8, 15) })
];
const STK = {
  p1: { q: 20, r: 12, low: 10 }, p2: { q: 140, r: 30, low: 30 }, p3: { q: 60, r: 0, low: 20 },
  p4: { q: 12, r: 12, low: 5 }, p5: { q: 480, r: 96, low: 100 }
};
const DEBTORS = [
  { uid: 11, name: 'Дилором', org: 'Магазин «Бахор»', phone: '+998901234502', bal: 2100000, due: dayStr(-4), over: 2100000, days: 4 },
  { uid: 12, name: 'Малика', org: 'Магазин «Малика»', phone: '+998901234501', bal: 1650000, due: dayStr(-3), over: 650000, days: 3 },
  { uid: 13, name: 'Шахло', org: 'Магазин «Гулистон»', phone: '+998901234503', bal: 830000, due: dayStr(2), over: 0, days: 0 }
];
const COURIERS = [
  { id: 'k1', name: 'Рустам', phone: '+998 90 777 01 01', joined: true, on: true, cash: 640000, lim: 2000000, dl: 1, credit: true, late: 0, hf: 0, hw: 0, nvn: 1, nva: 240000, cs: created(9, 30, -1) },
  { id: 'k2', name: 'Азиз', phone: '+998 90 777 02 02', joined: true, on: true, cash: 0, lim: 0, dl: 0, credit: false, late: 0, hf: 0, hw: 0, nvn: 0, nva: 0 }
];

// доставщик: заказы с данными из общей базы магазинов
const BS_MALIKA = { name: 'Малика, оптовая точка', phone: '+998901234501', ph: ['+998 91 555 33 22'], addr: 'Рынок «Навоий», ряд 4, место 12', loc: { lat: 40.1033, lng: 65.3731 } };
const COURIER_ORDERS = [
  sellerOrder('N-4821', 'ready', 'delivery', 'Малика', 'Магазин «Малика»', '+998901234501', [it('p1', 'Рис «Лазер»', 'Guruch «Lazer»', 2, 410000, 25, 'kg'), it('p3', 'Масло подсолнечное', 'Kungaboqar yogʻi', 4, 98000, 5, 'l')], { pickupAt: when(16, 0), mine: true, crn: 'Рустам', bs: BS_MALIKA, debt: { bal: 1650000, over: 650000, days: 3, due: dayStr(-3) } }),
  sellerOrder('N-4830', 'ready', 'delivery', 'Дилором', 'Магазин «Бахор»', '+998901234502', [it('p2', 'Мука высшего сорта', 'Un, oliy navli', 3, 285000, 50, 'kg')], { pickupAt: when(17, 30), address: 'ул. Мирзо Улугбека, 5' }),
  sellerOrder('N-4793', 'done', 'delivery', 'Шахло', 'Магазин «Гулистон»', '+998901234503', [it('p5', 'Говядина тушёная', 'Dudlangan mol goʻshti', 24, 38000, 325, 'g')], { pickupAt: when(10, 0), mine: true, crn: 'Рустам', pay: { m: 'cash' } })
];
const COURIER_CASH = {
  cash: 640000, lim: 2000000, dl: 1, late: 0, cs: created(9, 30, -1), ask: 0, nv: [],
  rows: [
    { k: 'in', o: 'N-4793', nm: 'Шахло', a: 912000, t: created(10, 40) },
    { k: 'in', nm: 'Малика', a: 300000, t: created(9, 50, -1) },
    { k: 'out', a: 572000, t: created(18, 10, -2), bn: 'Навои Фуд' },
    { k: 'in', o: 'N-4760', nm: 'Бахтиёр', a: 572000, t: created(13, 20, -2) }
  ]
};

// общая база магазинов (агент, владелец)
const TERRS = [{ id: 't1', name: 'Навои, центр' }, { id: 't2', name: 'Кармана' }];
const bi = (id, name, phone, addr, o) => Object.assign({ id, name, phone, addr, terr: 't1', st: 'new', note: '', agent: 'a1', app: false, chk: true, src: 'agent', ty: 'shop' }, o || {});
const BASE_ITEMS = [
  bi('b1', 'Магазин «Малика»', '+998 90 123 45 01', 'ул. Галаба, 12', { st: 'talk', app: true, ph: ['+998 91 555 33 22'], loc: { lat: 40.1033, lng: 65.3731 }, note: 'Просят прайс на масло и сахар' }),
  bi('b2', 'Магазин «Бахор»', '+998 90 123 45 02', 'ул. Мирзо Улугбека, 5', { app: true, loc: { lat: 40.0998, lng: 65.3794 } }),
  bi('b3', 'Супермаркет «Навруз»', '+998 90 123 45 04', 'ул. Ислома Каримова, 40', { ty: 'super', chk: false, note: 'Директор на месте с 10 до 12' }),
  bi('b4', 'Кафе «Лола»', '+998 90 123 45 05', 'ул. Навои, 18', { ty: 'horeca', chk: false }),
  bi('b5', 'Магазин «Нур»', '+998 90 123 45 06', 'ул. Беруни, 3', { chk: false, ph: ['+998 93 300 00 03'] }),
  bi('b6', 'Нур, склад', '+998 94 400 00 04', 'ул. Беруни, 3а', { chk: false, ty: 'whole' })
];
const BASE_META = { total: BASE_ITEMS.length, all: BASE_ITEMS.length, counts: { t1: BASE_ITEMS.length }, tcounts: { '-': 0, shop: 4, super: 1, whole: 1, horeca: 1 }, more: false, terrs: TERRS, mine: ['t1'], unchk: 4, agents: [{ id: 'a1', name: 'Азиз' }], sh: DID };

// владелец площадки
const OWN_SHOPS = [
  { id: 'main', name: 'Навои Фуд', items: 24, sellers: 2, on: true, own: true, link: 'https://t.me/sarbon_optom_bot?start=d_main', cat: 'wholesale' },
  { id: 'oltindon', name: 'Олтин Дон', items: 18, sellers: 1, on: true, own: true, link: 'https://t.me/sarbon_optom_bot?start=d_oltindon', cat: 'maker' },
  { id: 'mevazor', name: 'Мевазор', items: 31, sellers: 0, on: true, own: false, link: '', cat: 'bazaar' }
];
const mod = (did, dname, id, name, uz, catName, catUz, price, days) => ({ did, dname, id, name, uz, cat: 'c1', catName, catUz, ms: 'wait', mt: new Date(Date.now() - days * 864e5).toISOString(), amount: 1, unit: 'kg', price, on: true, tag: '', old: 0, pv: 'x' + id, pv2: '', pv3: '', tiers: [], blk: 0, box: 0, desc: '', descUz: '' });
const MOD_ITEMS = [
  mod('oltindon', 'Олтин Дон', 'w1', 'Мука «Олтин»', 'Un «Oltin»', 'Мука', 'Un', 240000, 0),
  mod('oltindon', 'Олтин Дон', 'w2', 'Макароны спагетти', 'Spagetti makaron', 'Макароны', 'Makaron', 9800, 1),
  mod('mevazor', 'Мевазор', 'w3', 'Яблоки «Семиренко»', 'Olma «Semirenko»', 'Фрукты', 'Mevalar', 14500, 2)
];
const OWN_PPL = {
  terr: [{ id: 't1', name: 'Навои', n: 4 }, { id: 't2', name: 'Кармана', n: 2 }, { id: 't3', name: 'Зарафшан', n: 0 }],
  agents: [
    { id: 'a1', name: 'Азиз', on: true, used: true, n: 6, terr: ['t1'], link: 'https://t.me/sarbon_optom_bot?start=ag_k7f3q2' },
    { id: 'a2', name: 'Бобур', on: true, used: false, n: 0, terr: ['t2', 't3'], link: 'https://t.me/sarbon_optom_bot?start=ag_m2x9w4' }
  ],
  total: 6, free: 0, noagent: 0
};

// узбекская версия снимков: названия, имена, адреса и заметки в данных пишутся по-русски, здесь их перевод
const UZ_MAP = [
  ['Магазин «Малика»', 'Malika doʻkoni'], ['Магазин «Бахор»', 'Bahor doʻkoni'], ['Магазин «Гулистон»', 'Guliston doʻkoni'], ['Магазин «Навруз»', 'Navruz doʻkoni'],
  ['Супермаркет «Навруз»', 'Navruz supermarketi'], ['Кафе «Лола»', 'Lola kafesi'], ['Магазин «Нур»', 'Nur doʻkoni'], ['Нур, склад', 'Nur, ombor'],
  ['Навои Фуд', 'Navoiy Fud'], ['Олтин Дон', 'Oltin Don'], ['Мевазор', 'Mevazor'],
  ['Малика, оптовая точка', 'Malika, ulgurji nuqta'], ['Малика', 'Malika'], ['Дилором', 'Dilorom'], ['Шахло', 'Shahlo'], ['Бахтиёр', 'Baxtiyor'],
  ['Рустам', 'Rustam'], ['Азиз', 'Aziz'], ['Бобур', 'Bobur'],
  ['ул. Галаба, 12', 'Gʻalaba koʻchasi, 12'], ['ул. Мирзо Улугбека, 5', 'Mirzo Ulugʻbek koʻchasi, 5'], ['ул. Ислома Каримова, 40', 'Islom Karimov koʻchasi, 40'],
  ['ул. Навои, 18', 'Navoiy koʻchasi, 18'], ['ул. Беруни, 3а', 'Beruniy koʻchasi, 3a'], ['ул. Беруни, 3', 'Beruniy koʻchasi, 3'],
  ['Рынок «Навоий», ряд 4, место 12', 'Navoiy bozori, 4-qator, 12-oʻrin'],
  ['Навои, центр', 'Navoiy, markaz'], ['Навои', 'Navoiy'], ['Кармана', 'Karmana'], ['Зарафшан', 'Zarafshon'],
  ['Позвоните за полчаса до приезда', 'Yetib kelishdan yarim soat oldin qoʻngʻiroq qiling'], ['Просят прайс на масло и сахар', 'Yogʻ va shakar narxini soʻrashdi'],
  ['Директор на месте с 10 до 12', 'Direktor soat 10 dan 12 gacha joyida']
].sort((a, b) => b[0].length - a[0].length);
const toUz = text => UZ_MAP.reduce((t, [ru, uz]) => t.split(ru).join(uz), text);

/* ---------- фото товаров (рисуются кодом, без внешних файлов) ---------- */
const SVG = {
  bag: (a, b, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-35 0 270 200"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="-40" width="280" height="200" fill="#f3efe8"/><ellipse cx="100" cy="176" rx="62" ry="9" fill="#00000018"/><path d="M52 52 q48 -14 96 0 l8 112 q-56 12 -112 0z" fill="url(#g)"/><path d="M52 52 q48 -14 96 0 l-2 14 q-46 -12 -92 0z" fill="#ffffff55"/><rect x="68" y="88" width="64" height="50" rx="8" fill="${c}"/><circle cx="100" cy="113" r="14" fill="#ffffffcc"/></svg>`,
  bottle: (a, b, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-35 0 270 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect x="-40" width="280" height="200" fill="#f3efe8"/><ellipse cx="100" cy="178" rx="46" ry="8" fill="#00000018"/><rect x="88" y="22" width="24" height="22" rx="4" fill="${c}"/><path d="M84 44 h32 q18 14 20 34 v86 q0 12 -12 12 h-48 q-12 0 -12 -12 v-86 q2 -20 20 -34z" fill="url(#g)"/><rect x="72" y="92" width="56" height="52" rx="8" fill="#fff" opacity=".88"/><rect x="82" y="104" width="36" height="8" rx="4" fill="${c}"/><rect x="82" y="120" width="26" height="6" rx="3" fill="${c}" opacity=".5"/></svg>`,
  can: (a, b, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-35 0 270 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect x="-40" width="280" height="200" fill="#f3efe8"/><ellipse cx="100" cy="176" rx="52" ry="9" fill="#00000018"/><rect x="50" y="48" width="100" height="120" rx="10" fill="url(#g)"/><ellipse cx="100" cy="48" rx="50" ry="11" fill="#e8e8ec"/><ellipse cx="100" cy="48" rx="38" ry="7" fill="#c9cad2"/><rect x="50" y="86" width="100" height="52" fill="${c}"/><circle cx="100" cy="112" r="15" fill="#ffffffdd"/></svg>`
};
const PHOTOS = {
  p1: SVG.bag('#f6efdd', '#dcc79a', '#2f7d4f'), p2: SVG.bag('#f7f7f4', '#d9d8d0', '#c4802a'),
  p3: SVG.bottle('#f1c40f', '#ffe27a', '#2f7d4f'), p4: SVG.bag('#ffffff', '#e1e4ea', '#2a6fb8'),
  p5: SVG.can('#b55a3c', '#d98a6a', '#8f2f2f'), p6: SVG.can('#6aa84f', '#9fd37f', '#2f7d4f')
};
PHOTOS.xw1 = SVG.bag('#f7f7f4', '#d9d8d0', '#2a6fb8'); PHOTOS.xw2 = SVG.bag('#f6efdd', '#e5c76b', '#c4802a'); PHOTOS.xw3 = SVG.can('#c0392b', '#e8776a', '#2f7d4f');
PHOTOS.w1 = PHOTOS.xw1; PHOTOS.w2 = PHOTOS.xw2; PHOTOS.w3 = PHOTOS.xw3;


// склад Sarbon (кладовщик): заказы продавцов Базара
const BAZAARS = [{ id: 'b1', name: 'Урикзор', uz: 'Oʻrikzor', how: '', howUz: '' }];
const whOrder = (id, name, org, phone, items, o) => Object.assign({ did: 'mevazor', shopName: 'Мевазор', bz: 'b1', id, name, org, phone, createdAt: created(9, 40), items, total: items.reduce((s, x) => s + x.price * x.qty, 0), comment: '', status: 'accepted' }, o || {});
const WH_ITEMS = [it('w3', 'Яблоки «Семиренко»', 'Olma «Semirenko»', 4, 145000, 10, 'kg'), it('w1', 'Лук репчатый', 'Piyoz', 2, 60000, 20, 'kg')];
const WH_ORDERS = [
  whOrder('N-4826', 'Дилором', 'Магазин «Бахор»', '+998901234502', WH_ITEMS.slice(0, 1), { createdAt: created(8, 15), comment: 'Позвоните за полчаса до приезда' }),
  whOrder('N-4830', 'Малика', 'Магазин «Малика»', '+998901234501', WH_ITEMS, { createdAt: created(9, 40) }),
  whOrder('N-4815', 'Шахло', 'Магазин «Гулистон»', '+998901234503', WH_ITEMS.slice(1), { createdAt: created(7, 5, -1), wh: { kg: 18.5, fee: 9250, at: created(10, 5), upd: created(10, 5) } }),
  whOrder('N-4809', 'Бахтиёр', 'Магазин «Навруз»', '+998901234504', WH_ITEMS.slice(0, 1), { createdAt: created(7, 5, -1), wh: { kg: 12, fee: 6000, at: created(10, 20), upd: created(10, 20) }, ship: { m: 'cash', at: created(11, 0) } }),
  whOrder('N-4797', 'Малика', 'Магазин «Малика»', '+998901234501', WH_ITEMS, { createdAt: created(7, 5, -2), wh: { kg: 31, fee: 15500, at: created(10, 20, -1), upd: created(10, 20, -1) }, ship: { m: 'credit', at: created(11, 0, -1) }, sent: true, sat: created(12, 10, -1) })
];

// обращения «Написать нам» глазами владельца (текст пишется на языке снимка)
const FB_TEXT = {
  ru: ['Не открывается корзина после выбора доставки', 'Хочу выгрузку заказов по дням и тёмную тему', 'Спасибо, всё работает'],
  uz: ['Yetkazib berishni tanlagach savat ochilmayapti', 'Buyurtmalarni kunlar boʻyicha yuklash va qora mavzu kerak', 'Rahmat, hammasi ishlayapti']
};
const FB_ITEMS = lang => {
  const t = FB_TEXT[lang === 'uz' ? 'uz' : 'ru'];
  return [
    { id: 'F-K3M7Q', uid: 11, nm: 'Малика', un: 'malika_shop', roles: [], k: 'bug', t: t[0], at: created(9, 20), st: 'new', shop: { name: 'Магазин «Малика»', phone: '+998 90 123 45 01' } },
    { id: 'F-P2X9D', uid: 12, nm: 'Дилором', un: 'dilorom_n', roles: [{ r: 'seller', n: 'Навои Фуд' }], k: 'idea', t: t[1], at: created(8, 5), st: 'new' },
    { id: 'F-R8T4B', uid: 13, nm: 'Шахло', un: '', roles: [], k: 'other', t: t[2], at: created(15, 30, -1), st: 'done', dt: created(9, 0), db: 'Азиз', shop: { name: 'Магазин «Гулистон»', phone: '+998 90 123 45 03' } }
  ];
};

/* ---------- сценарии: какие данные отдаёт «сервер» ---------- */
const ROLES = {
  shop: { sells: [], delivers: [], agent: null, owner: false },
  seller: { sells: [{ id: DID, name: 'Навои Фуд', link: '' }], delivers: [], agent: null, owner: false },
  courier: { sells: [], delivers: [{ id: DID, name: 'Навои Фуд' }], agent: null, owner: false },
  agent: { sells: [], delivers: [], agent: { id: 'a1', name: 'Азиз', link: 'https://t.me/sarbon_optom_bot?start=ag_k7f3q2' }, owner: false },
  owner: { sells: [{ id: DID, name: 'Навои Фуд', link: '' }], delivers: [], agent: null, owner: true },
  wh: { sells: [], delivers: [], agent: null, owner: false, wh: { id: 'w1', name: 'Салим', bz: '' } }
};

module.exports = { BAZAARS, WH_ORDERS, FB_ITEMS, fs, path, chromium, repo, OUT, VIEW, DPR, html, DID, dayStr, TODAY, when, created, CATS, ITEMS, PROD, SHOPS, SHOP_ORDERS, MY_DEBT, SELLER_ORDERS, STK, DEBTORS, COURIERS, COURIER_ORDERS, COURIER_CASH, TERRS, BASE_ITEMS, BASE_META, OWN_SHOPS, MOD_ITEMS, OWN_PPL, toUz, PHOTOS, ROLES, it, P };
