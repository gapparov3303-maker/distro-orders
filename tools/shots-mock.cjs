// «Сервер» для скриншотов: отвечает приложению выдуманными данными (см. tools/shots.cjs).
// Каждый экран может переопределить ответы через поле data: { '/api/путь': тело | функция(req, url, st) }.
const D = require('./shots-data.cjs');
const { DID, ROLES, PROD, SHOPS, PHOTOS } = D;

const ME = { shop: 'Малика', phone: '+998 90 123 45 01' };

async function mockApi(page, role, st, over, lang) {
  const R = ROLES[role] || ROLES.shop;
  over = over || {};
  const hubMe = () => ({ id: 7, owner: R.owner, region: '', sells: R.sells, delivers: R.delivers, agent: R.agent || undefined, card: null });
  const isSeller = R.sells.length > 0;
  const base = {
    '/api/shops': () => ({ title: 'Sarbon', about: { ru: '', uz: '', phone: '', tg: '', ig: '' }, shops: SHOPS, terrs: [{ id: 't1', name: 'Навои' }], me: hubMe() }),
    '/api/bootstrap': () => ({
      did: DID, off: false,
      cfg: { shop: { name: 'Навои Фуд', delivery: true, regions: [], home: '', minOrder: 300000, leadHours: 2, deliveryLeadHours: 4, openFrom: 9, openTo: 20 } },
      prod: PROD(),
      me: { id: 7, name: ME.shop, admin: isSeller, courier: R.delivers.length ? { id: 'k1', name: 'Рустам', credit: true } : null, profile: { name: ME.shop, phone: ME.phone, org: 'Магазин «Малика»', addrs: ['ул. Галаба, 12'] }, blocked: false, fav: [] },
      orders: []
    }),
    '/api/config': () => ({ cfg: { shop: { name: 'Навои Фуд', delivery: true, regions: [], home: '', minOrder: 300000, leadHours: 2, deliveryLeadHours: 4, openFrom: 9, openTo: 20 } }, prod: PROD(), off: false }),
    '/api/hub/orders': () => ({ orders: [] }),
    '/api/hub/debts': () => ({ debts: [], total: 0, over: 0, late: 0, n: 0, ask: 0 }),
    '/api/admin/orders': () => ({ orders: [], stats: { doneSum: 0, doneCount: 0 }, crs: [] }),
    '/api/admin/stock': () => ({ stk: {} }),
    '/api/admin/debts': () => ({ debtors: [], total: 0, overdue: 0, n: 0, late: 0, fl: 0 }),
    '/api/admin/comm': () => ({ comm: { pct: 0, acc: 0, paid: 0, due: 0, nw: 0, ws: 0, bad: 0, pays: [] } }),
    '/api/admin/couriers': () => ({ couriers: [] }),
    '/api/courier/orders': () => ({ orders: [], soon: 0, cash: 0, lim: 0, nvn: 0, late: 0, dl: 0, ask: 0 }),
    '/api/courier/debts': () => ({ debtors: [], total: 0, overdue: 0, n: 0, late: 0, fl: 0 }),
    '/api/courier/cash': () => ({ cash: 0, lim: 0, rows: [], list: [] })
  };
  await page.route('**/*', async (route) => {
    const req = route.request(), u = new URL(req.url()), p = u.pathname;
    const json = (b, s) => route.fulfill({ status: s || 200, contentType: 'application/json', body: JSON.stringify(b) });
    if (u.hostname !== 'app.test') return route.fulfill({ status: 200, body: '' });
    if (p === '/') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: D.html });
    const im = /^\/img\/[^/]+\/([^/]+)$/.exec(p);
    if (im) return PHOTOS[im[1]] ? route.fulfill({ status: 200, contentType: 'image/svg+xml', body: PHOTOS[im[1]] }) : route.fulfill({ status: 404, body: '' });
    const hit = k => over[k] !== undefined ? over[k] : base[k];
    let h = hit(p);
    if (h === undefined) {
      // шаблоны вида '/api/hub/base/*' из data
      const key = Object.keys(over).find(k => k.endsWith('*') && p.startsWith(k.slice(0, -1)));
      if (key) h = over[key];
    }
    if (h === undefined) return json({ error: 'not_found' }, 404);
    const body = typeof h === 'function' ? await h(req, u, st) : h;
    return route.fulfill({ status: 200, contentType: 'application/json', body: lang === 'uz' ? D.toUz(JSON.stringify(body)) : JSON.stringify(body) });
  });
}

module.exports = { mockApi, ME };
