// Собирает dist/worker.js: общий код + страница приложения + сервер в одном файле.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const shared = read('src/shared.js');
let app = read('src/app.html');
if (!app.includes('/*SHARED*/')) throw new Error('В src/app.html нет метки /*SHARED*/');
app = app.replace('/*SHARED*/', () => shared);

// Скриншоты для экрана «О нас» (src/about/*.webp, их делает tools/shots.cjs): уходят в worker и отдаются по /about/<имя>.
// Страница получает короткий отпечаток набора, чтобы браузер брал новые картинки после обновления.
const aboutDir = path.join(root, 'src/about');
const aboutNames = fs.existsSync(aboutDir) ? fs.readdirSync(aboutDir).filter(f => /^[a-z0-9-]+\.webp$/.test(f)).sort() : [];
const aboutImg = {};
const aboutHash = crypto.createHash('sha1');
for (const f of aboutNames) {
  const buf = fs.readFileSync(path.join(aboutDir, f));
  aboutImg[f] = buf.toString('base64');
  aboutHash.update(f).update(buf);
}
const aboutV = aboutNames.length ? aboutHash.digest('hex').slice(0, 8) : '0';
if (!app.includes('/*ABOUTV*/dev')) throw new Error('В src/app.html нет метки /*ABOUTV*/dev');
app = app.replace('/*ABOUTV*/dev', () => aboutV);

const worker = read('src/worker-src.js');
const out =
  '// Файл собран автоматически (node build.js). Править нужно файлы в src/.\n'
  + 'const APP_HTML = ' + JSON.stringify(app) + ';\n'
  + 'const ABOUT_IMG = ' + JSON.stringify(aboutImg) + ';\n\n'
  + shared + '\n\n' + worker;

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/worker.js'), out);
console.log('dist/worker.js: ' + Math.round(out.length / 1024) + ' КБ, страница ' + Math.round(app.length / 1024) + ' КБ, скриншотов «О нас»: ' + aboutNames.length);
