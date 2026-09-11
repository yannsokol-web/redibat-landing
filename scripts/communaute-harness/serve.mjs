// Serveur statique de la landing pour les essais locaux : reproduit GitHub Pages
// (/x -> x.html, /dir/ -> dir/index.html) et remplace, dans la CSP des pages, l'API de
// production par l'API locale (http://localhost:3000). Ne sert JAMAIS en production.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const PORT = Number(process.argv[3] || 8100);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(ROOT, p);
  if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404'); return;
  }
  const ext = path.extname(file);
  let body = fs.readFileSync(file);
  if (ext === '.html') {
    body = Buffer.from(body.toString('utf8').replaceAll('https://api.redibat.fr', 'http://localhost:3000'));
  }
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
}).listen(PORT, 'localhost', () => console.log(`landing locale sur http://localhost:${PORT}`));
