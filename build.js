// Собирает dist/worker.js: общий код + страница приложения + сервер в одном файле.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const shared = read('src/shared.js');
let app = read('src/app.html');
if (!app.includes('/*SHARED*/')) throw new Error('В src/app.html нет метки /*SHARED*/');
app = app.replace('/*SHARED*/', () => shared);

const worker = read('src/worker-src.js');
const out =
  '// Файл собран автоматически (node build.js). Править нужно файлы в src/.\n'
  + 'const APP_HTML = ' + JSON.stringify(app) + ';\n\n'
  + shared + '\n\n' + worker;

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/worker.js'), out);
console.log('dist/worker.js: ' + Math.round(out.length / 1024) + ' КБ, страница ' + Math.round(app.length / 1024) + ' КБ');
