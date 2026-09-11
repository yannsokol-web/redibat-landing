// Pilote Chrome headless par le protocole DevTools (WebSocket natif de Node 22) : se connecte
// via la vraie page /espace-client, puis ouvre chaque page demandée, relève les erreurs de
// console et capture un écran (1280 px et 400 px). Usage :
//   node shoot.mjs <compte> <dossier-de-sortie> <chemin1> <chemin2> …
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [,, who, outDir, ...paths] = process.argv;
const MDP = 'un-mot-de-passe-de-test-solide';
const EMAIL = { founder: 'fondateur@example.test', alice: 'alice@example.test', bob: 'bob@example.test', anon: '' }[who];
const BASE = 'http://localhost:8100';
const port = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync('/tmp/rdb-chrome-');
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1280,900', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(url) { const r = await fetch(url, { method: 'PUT' }); return r.json(); }
let target;
for (let i = 0; i < 40; i += 1) { try { target = await json(`http://localhost:${port}/json/new?about:blank`); break; } catch (_) { await wait(200); } }
if (!target) { console.error('Chrome injoignable'); chrome.kill(); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map(); const events = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  else if (d.method) events.push(d);
};
function send(method, params = {}) {
  return new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result && r.result.result ? r.result.result.value : undefined;
}
async function navigate(url, settleMs = 1800) {
  events.length = 0;
  await send('Page.navigate', { url });
  await wait(settleMs);
  return evaluate('location.href');
}
async function shot(name, width) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  await wait(300);
  const h = await evaluate('Math.min(document.documentElement.scrollHeight, 4000)');
  await send('Emulation.setDeviceMetricsOverride', { width, height: Math.max(600, h || 900), deviceScaleFactor: 1, mobile: width < 600 });
  await wait(200);
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(outDir, `${name}-${width}.png`), Buffer.from(r.result.data, 'base64'));
}
function consoleErrors() {
  return events.filter((e) => (e.method === 'Runtime.exceptionThrown') || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error') || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'))
    .map((e) => e.method === 'Runtime.exceptionThrown' ? (e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text)
      : e.method === 'Log.entryAdded' ? `${e.params.entry.source}: ${e.params.entry.text} ${e.params.entry.url || ''}`
        : e.params.args.map((a) => a.value || a.description).join(' '));
}

await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

if (EMAIL) {
  const at = await navigate(`${BASE}/espace-client?next=%2Fcommunaute%2F`);
  console.log('page de connexion :', at);
  const ok = await evaluate(`(async () => {
    const f = document.querySelector('form'); if (!f) return 'pas de formulaire';
    f.email.value = ${JSON.stringify(EMAIL)}; f.password.value = ${JSON.stringify(MDP)};
    f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    return 'soumis';
  })()`);
  console.log('connexion :', ok);
  await wait(2500);
  console.log('après connexion :', await evaluate('location.href'));
  const errs = consoleErrors(); if (errs.length) console.log('  erreurs console (connexion) :', errs);
}

for (const p of paths) {
  const at = await navigate(`${BASE}${p}`);
  const name = p.replace(/^\//, '').replace(/[\/?=&]+/g, '_') || 'racine';
  const title = await evaluate('document.title');
  const text = await evaluate('(document.querySelector("main")||document.body).innerText.slice(0, 160).replace(/\\s+/g, " ")');
  console.log(`\n${p} -> ${at}\n  titre : ${title}\n  texte : ${text}`);
  const errs = consoleErrors();
  if (errs.length) console.log('  erreurs console :', errs);
  await shot(name, 1280);
  await shot(name, 400);
}

ws.close(); chrome.kill();
await wait(500); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
