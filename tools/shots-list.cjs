// Список экранов для tools/shots.cjs: имя файла, под какой ролью открыть, адрес и что нажать перед снимком.
// Имена совпадают с img: в ABOUT_ROLES (src/app.html).
const D = require('./shots-data.cjs');
const { WH_ORDERS, FB_ITEMS, DID, SHOP_ORDERS, MY_DEBT, SELLER_ORDERS, STK, DEBTORS, COURIERS, COURIER_ORDERS, COURIER_CASH, BASE_ITEMS, BASE_META, OWN_SHOPS, MOD_ITEMS, OWN_PPL, dayStr, when, created } = D;
const SELL_ORD = { '/api/admin/orders': () => ({ orders: SELLER_ORDERS, stats: { doneSum: 3420000, doneCount: 7 }, crs: COURIERS.map(c => ({ id: c.id, name: c.name, phone: c.phone })) }) };

const click = (page, sel) => page.locator(sel).first().click();
// прокрутить так, чтобы нужный блок оказался у верхнего края (под шапкой)
const scrollTo = (page, sel, off) => page.locator(sel).first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o), off == null ? 64 : off);
const wait = (page, ms) => page.waitForTimeout(ms || 400);
const CR_ORD = { '/api/courier/orders': () => ({ orders: COURIER_ORDERS, soon: 0, cash: 640000, lim: 2000000, nvn: 0, late: 0, dl: 1, ask: 0 }) };
const baseApi = role => (req, u) => {
  const q = (u.searchParams.get('q') || '').toLowerCase(), qd = q.replace(/\D/g, '');
  const rows = BASE_ITEMS.filter(b => !q || b.name.toLowerCase().includes(q) || D.toUz(b.name).toLowerCase().includes(q) || (qd.length >= 3 && [b.phone].concat(b.ph || []).some(x => x.replace(/\D/g, '').includes(qd))));
  return Object.assign({}, BASE_META, { role, total: rows.length, items: rows });
};
const BASE_MERGE = (req, u, st) => {
  let b = {}; try { b = req.postDataJSON() || {}; } catch (e) {}
  return { preview: { keep: { name: 'Магазин «Нур»', phone: '+998 90 123 45 06', addr: 'ул. Беруни, 3' }, gone: { name: 'Нур, склад', phone: '+998 94 400 00 04', addr: 'ул. Беруни, 3а' }, phones: ['+998 90 123 45 06', '+998 93 300 00 03', '+998 94 400 00 04'], moved: 2, accounts: 1, gAccounts: 0, fill: ['ty'] } };
};
const OWNER_API = {
  '/api/hub/admin/shops': () => ({ title: 'Sarbon', max: 50, shops: OWN_SHOPS }),
  '/api/hub/admin/people': () => OWN_PPL,
  '/api/hub/admin/people/list': () => ({ people: [], total: 0 }),
  '/api/hub/admin/disputes': () => ({ items: [] }),
  '/api/hub/admin/stats': () => ({ period: '30d', rows: [], total: { n: 0, base: 0 } }),
  '/api/hub/admin/mod': (req, u) => {
    const seg = u.searchParams.get('seg') || 'wait';
    const items = seg === 'wait' ? MOD_ITEMS : [];
    const cats = { oltindon: [{ id: 'c1', name: 'Мука', uz: 'Un' }], mevazor: [{ id: 'c1', name: 'Фрукты', uz: 'Mevalar' }] };
    const shops = [...new Set(items.map(i => i.did))].map(d => ({ id: d, name: items.find(i => i.did === d).dname, n: items.filter(i => i.did === d).length, cats: cats[d] }));
    return { seg, items, counts: { wait: MOD_ITEMS.length, ret: 1, ok: 12 }, shops };
  }
};
const OWNER_SHOPS = () => ({ title: 'Sarbon', about: { ru: '', uz: '', phone: '', tg: '', ig: '' }, shops: [{ id: 'main', name: 'Навои Фуд', items: 24, cats: [], delivery: true, minOrder: 0, regions: [], home: '' }], terrs: [], me: { id: 7, owner: true, region: '', sells: [{ id: 'main', name: 'Навои Фуд', link: '' }], delivers: [], card: null, modN: MOD_ITEMS.length } });
const U = '/?d=' + DID + '&v=';

const SHOTS = [
  { name: 'shop-list', role: 'shop', url: '/?v=shops' },
  { name: 'shop-catalog', role: 'shop', url: U + 'shop' },
  { name: 'shop-cart', role: 'shop', url: U + 'shop', prep: async (page) => {
    await click(page, '#pc-p1 [data-act="padd"]'); await wait(page, 250);
    await click(page, '#pc-p3 [data-act="padd"]'); await wait(page, 250);
    await click(page, '[data-act="opencart"]'); await wait(page, 600);
  } },
  { name: 'shop-orders', role: 'shop', url: U + 'mine', data: { '/api/hub/orders': () => ({ orders: SHOP_ORDERS }) } },
  { name: 'shop-debt', role: 'shop', url: U + 'debt', data: { '/api/hub/debts': () => ({ debts: [MY_DEBT], total: MY_DEBT.bal, over: MY_DEBT.over, late: 1, n: 1, ask: 1 }) } },

  // продавец
  { name: 'sel-orders', role: 'seller', url: U + 'seller', data: SELL_ORD, prep: async (page) => { await scrollTo(page, '.filters', 62); } },
  { name: 'sel-pay', role: 'seller', url: U + 'seller', data: SELL_ORD, prep: async (page) => {
    await click(page, 'article.ord:has-text("N-4799") [data-act="payopen"]'); await wait(page, 400);
    await scrollTo(page, 'article.ord:has-text("N-4799")', 60);
  } },
  { name: 'sel-catalog', role: 'seller', url: U + 'seller', prep: async (page) => {
    await page.evaluate(() => sellerOpen('prod')); await wait(page, 500);
    // сначала открыть категорию с товаром p1 (список категорий — первый уровень), потом раскрыть сам товар
    await page.evaluate(() => { const c = (S.prod.cats.find(c => S.prod.items.some(p => p.id === 'p1' && p.cat === c.id)) || S.prod.cats[0]); const b = document.querySelector('[data-act="pcat"][data-id="' + c.id + '"]'); if (b) b.click(); }); await wait(page, 500);
    await click(page, '#psum-p1'); await wait(page, 400);
    await scrollTo(page, '#prow-p1', 64);
  } },
  { name: 'sel-stock', role: 'seller', url: U + 'seller', data: { '/api/admin/stock': () => ({ stk: STK }) }, prep: async (page) => {
    await page.evaluate(() => sellerOpen('stock')); await wait(page, 700);
  } },
  { name: 'sel-debts', role: 'seller', url: U + 'seller', data: { '/api/admin/debts': () => ({ debtors: DEBTORS, total: 4580000, overdue: 2750000, n: 3, late: 2, fl: 0 }) }, prep: async (page) => {
    await page.evaluate(() => sellerOpen('debts')); await wait(page, 700);
  } },
  { name: 'sel-couriers', role: 'seller', url: U + 'seller', data: { '/api/admin/couriers': () => ({ couriers: COURIERS }) }, prep: async (page) => {
    await page.evaluate(() => sellerOpen('dlv')); await wait(page, 700);
    await scrollTo(page, '.dvc', 70);
  } },

  // доставщик
  { name: 'cr-today', role: 'courier', url: U + 'courier', data: CR_ORD, prep: async (page) => { await scrollTo(page, '.dsub', 62); } },
  { name: 'cr-debts', role: 'courier', url: U + 'courier', data: Object.assign({ '/api/courier/debts': () => ({ debtors: DEBTORS, total: 4580000, overdue: 2750000, n: 3, late: 2, fl: 0 }) }, CR_ORD), prep: async (page) => {
    await page.evaluate(() => courierOpen('debts')); await wait(page, 700);
  } },
  { name: 'cr-cash', role: 'courier', url: U + 'courier', data: Object.assign({ '/api/courier/cash': () => COURIER_CASH }, CR_ORD), prep: async (page) => {
    await page.evaluate(() => courierOpen('cash')); await wait(page, 700);
  } },

  // агент
  { name: 'ag-base', role: 'agent', url: '/?v=base', data: { '/api/hub/base': baseApi('agent') } },
  { name: 'ag-form', role: 'agent', url: '/?v=base', data: { '/api/hub/base': baseApi('agent') }, prep: async (page) => {
    await click(page, '[data-act="baseedit"][data-id="b5"]'); await wait(page, 500);
    await scrollTo(page, '#bform', 62);
  } },
  { name: 'ag-merge', role: 'agent', url: '/?v=base', data: { '/api/hub/base': baseApi('agent'), '/api/hub/base/*': BASE_MERGE }, prep: async (page, st, lang) => {
    await click(page, '[data-act="baseedit"][data-id="b5"]'); await wait(page, 500);
    await click(page, '[data-act="mgopen"]'); await wait(page, 600);
    await page.fill('#mg-q', lang === 'uz' ? 'Nur' : 'Нур'); await wait(page, 900);
    await click(page, '.mgit[data-id="b6"]'); await wait(page, 900);
  } },

  // форма заказа у продавца Базара: две кнопки «Заберу сам в Навои» / «Доставка до двери», без даты и времени
  { name: 'bz-form', role: 'shop', url: U + 'shop', data: { '/api/bootstrap': (req, u, st, b) => { b.cfg.shop.category = 'bazaar'; b.cfg.shop.bz = 'b1'; b.cfg.shop.name = 'Мевазор'; return b; } }, prep: async (page) => {
    await click(page, '#pc-p1 [data-act="padd"]'); await wait(page, 250);
    await click(page, '#pc-p3 [data-act="padd"]'); await wait(page, 250);
    await click(page, '[data-act="opencart"]'); await wait(page, 600);
    await scrollTo(page, '.seg', 70);
  } },
  // «Написать нам»: тема и текст
  { name: 'fb-form', role: 'shop', url: '/?v=feedback', prep: async (page, st, lang) => {
    await page.locator('[data-act="fbkind"]').nth(1).click(); await wait(page, 200);
    await page.fill('#fb-t', lang === 'uz' ? 'Buyurtmalarni kunlar boʻyicha Excelga yuklash kerak edi' : 'Нужна выгрузка заказов по дням в Excel'); await wait(page, 300);
  } },

  // склад: заказ ждёт веса, перевозка считается на лету
  { name: 'wh-list', role: 'wh', url: '/?v=wh', data: { '/api/hub/wh': () => ({ wh: { id: 'w1', name: 'Салим', bz: '' }, rate: 500, orders: WH_ORDERS }) }, prep: async (page) => {
    await page.fill('input[data-whkg]', '12,5'); await wait(page, 300);
    await scrollTo(page, '.filters', 62);
  } },

  // владелец
  { name: 'ow-dist', role: 'owner', url: '/?v=owner', data: OWNER_API, prep: async (page) => { await page.evaluate(() => ownOpen('dist')); await wait(page, 500); } },
  { name: 'ow-review', role: 'owner', url: '/?v=review', data: Object.assign({}, OWNER_API, { '/api/shops': OWNER_SHOPS }) },
  { name: 'ow-people', role: 'owner', url: '/?v=owner', data: OWNER_API, prep: async (page) => { await page.evaluate(() => ownOpen('agents')); await wait(page, 500); } },
  { name: 'ow-fb', role: 'owner', url: '/?v=owner', data: Object.assign({}, OWNER_API, { '/api/hub/admin/feedback': (req, u, st) => ({ items: FB_ITEMS(st.lang), n: 3, max: 300 }) }), prep: async (page) => { await page.evaluate(() => ownOpen('fb')); await wait(page, 700); } }
];

module.exports = SHOTS;
module.exports.helpers = { click, scrollTo, wait, U };
