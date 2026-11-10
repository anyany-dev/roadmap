import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { applyBasePath, productionBasePath } from '../site.config.mjs';

const root = resolve(process.argv[2] || '.');
const isProductionPreview = process.argv[2] === 'dist';
const mountPath = isProductionPreview ? productionBasePath : '/';
const port = Number(process.env.PORT || 5173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

const responseHeaders = (file, contentType) => ({
  ...securityHeaders,
  'Content-Type': contentType,
  'Cache-Control': ['.css', '.js', '.png', '.svg'].includes(extname(file))
    ? 'public, max-age=86400, stale-while-revalidate=604800'
    : 'no-cache'
});

const readResponseBody = async file => {
  const content = await readFile(file);
  if (extname(file) !== '.html') return content;
  return applyBasePath(content.toString('utf8'), mountPath);
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    if (isProductionPreview && (pathname === '/' || pathname === mountPath.slice(0, -1))) {
      response.writeHead(302, { ...securityHeaders, Location: mountPath });
      response.end();
      return;
    }
    if (!pathname.startsWith(mountPath)) throw new Error('Invalid base path');
    const relativePath = pathname.slice(mountPath.length);
    let file = resolve(join(root, relativePath || 'index.html'));
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.writeHead(200, responseHeaders(file, mime[extname(file)] || 'application/octet-stream'));
    response.end(request.method === 'HEAD' ? undefined : await readResponseBody(file));
  } catch {
    try {
      const notFoundFile = join(root, '404.html');
      response.writeHead(404, responseHeaders(notFoundFile, 'text/html; charset=utf-8'));
      response.end(request.method === 'HEAD' ? undefined : await readResponseBody(notFoundFile));
    } catch {
      response.writeHead(404, { ...securityHeaders, 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  }
}).listen(port, '127.0.0.1', () => console.log(`AnyRoadmap disponível em http://127.0.0.1:${port}${mountPath}`));
