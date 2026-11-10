import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { applyBasePath, productionBasePath } from '../site.config.mjs';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
const notFoundHtml = await readFile('404.html', 'utf8');
await writeFile('dist/404.html', applyBasePath(notFoundHtml, productionBasePath));
await cp('robots.txt', 'dist/robots.txt');
await cp('site.webmanifest', 'dist/site.webmanifest');
await cp('src', 'dist/src', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
console.log(`Build concluído em dist/ com base path "${productionBasePath}".`);
