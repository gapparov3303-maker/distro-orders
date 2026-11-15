// Скриншоты для экрана «О нас».
// Открывает настоящее приложение (src/app.html) в браузере, подставляет выдуманные данные
// и снимает экраны на двух языках. Результат: src/about/<имя>-<ru|uz>.webp
// (360×680 при 1,5× = 540×1020, светлая тема). Потом: node build.js (картинки вшиваются в worker).
//
//   export NODE_PATH=$(npm root -g)          # нужны playwright и sharp, в репозиторий они не входят
//   node tools/shots.cjs                     # все экраны
//   node tools/shots.cjs shop-list ow-dist   # только названные
//   SHOTS_OUT=/tmp/x node tools/shots.cjs    # писать в другую папку (png для просмотра: SHOTS_PNG=1)
//
// Данные лежат в tools/shots-data.cjs и tools/shots-mock.cjs, экраны описаны ниже. Поменял экран в приложении — перегенерируй.
const D = require('./shots-data.cjs');
const { mockApi } = require('./shots-mock.cjs');
const { fs, path, chromium, OUT, VIEW, DPR, html, DID } = D;
const SHOTS = require('./shots-list.cjs');

let sharp = null;
try { sharp = require('sharp'); } catch (e) { /* запасной путь через Python (Pillow) ниже */ }
const { execFileSync } = require('child_process');
async function toWebp(png, file) {
  if (sharp) { await sharp(png).webp({ quality: Number(process.env.SHOTS_Q || 62), effort: 6, smartSubsample: true }).toFile(file); return; }
  const tmp = file + '.png';
  fs.writeFileSync(tmp, png);
  execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=int(sys.argv[3]),method=6)', tmp, file, process.env.SHOTS_Q || '62']);
  fs.unlinkSync(tmp);
}

(async () => {
  const want = process.argv.slice(2);
  const list = want.length ? SHOTS.filter(s => want.includes(s.name)) : SHOTS;
  if (want.length && list.length !== want.length) { console.error('Нет такого экрана: ' + want.filter(w => !SHOTS.some(s => s.name === w)).join(', ')); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  let total = 0;
  for (const sh of list) {
    for (const lang of ['ru', 'uz']) {
      const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DPR, hasTouch: true, colorScheme: 'light' });
      await ctx.addInitScript(([uz]) => {
        window.Telegram = { WebApp: { initData: 'fake', ready() {}, expand() {}, isVersionAtLeast: () => true, showConfirm(m, cb) { cb(true); }, initDataUnsafe: { user: { language_code: 'ru' } } } };
        try { localStorage.setItem('sh-lang', uz ? 'uz' : 'ru'); } catch (e) {}
      }, [lang === 'uz']);
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      const st = {};
      await mockApi(page, sh.role, st, sh.data, lang);
      await page.goto('http://app.test' + sh.url);
      await page.waitForTimeout(sh.wait || 1300);
      if (sh.prep) await sh.prep(page, st, lang);
      await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
      await page.waitForTimeout(250);
      const png = await page.screenshot({ type: 'png' });
      const file = path.join(OUT, sh.name + '-' + lang + '.webp');
      await toWebp(png, file);
      if (process.env.SHOTS_PNG) fs.writeFileSync(path.join(OUT, sh.name + '-' + lang + '.png'), png);
      const kb = fs.statSync(file).size / 1024;
      total += kb;
      console.log((errs.length ? 'ОШИБКА ' : 'ok     ') + sh.name + '-' + lang + '  ' + kb.toFixed(1) + ' КБ' + (errs.length ? '  ' + errs.join(' | ') : ''));
      await ctx.close();
    }
  }
  await browser.close();
  console.log('Всего: ' + total.toFixed(0) + ' КБ, файлов: ' + list.length * 2);
})();
