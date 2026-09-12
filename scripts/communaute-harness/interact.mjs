// Scénarios interactifs dans Chrome headless (protocole DevTools) : connexion par la vraie
// page, puis étapes { goto | eval | expect | shot | wait }. Usage :
//   node interact.mjs <compte> <dossier-de-sortie> <scenario.json>
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [,, who, outDir, scenarioFile] = process.argv;
const MDP = 'un-mot-de-passe-de-test-solide';
const EMAIL = { founder: 'fondateur@example.test', alice: 'alice@example.test', bob: 'bob@example.test', anon: '' }[who];
const BASE = 'http://localhost:8100';
const steps = JSON.parse(fs.readFileSync(scenarioFile, 'utf8'));
// Double authentification : le banc calcule les codes TOTP comme le ferait l'application.
process.env.TOTP_ENC_KEY = process.env.TOTP_ENC_KEY || 'ab'.repeat(32);
const AUTH = process.env.REDIBAT_AUTH || new URL('../../../redibat-auth/', import.meta.url).pathname;
const totp = await import(AUTH + 'src/totp.js');
const mem = {};
const port = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync('/tmp/rdb-chrome-');
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=' + (process.env.W || '1280') + ',900', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40; i += 1) { try { target = await (await fetch(`http://localhost:${port}/json/new?about:blank`, { method: 'PUT' })).json(); break; } catch (_) { await wait(200); } }
if (!target) { console.error('Chrome injoignable'); chrome.kill(); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map(); const events = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else if (d.method) events.push(d); };
const send = (method, params = {}) => new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result && r.result.exceptionDetails) return 'EXCEPTION: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result && r.result.result ? r.result.result.value : undefined;
}
function consoleErrors() {
  return events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error') || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'))
    .map((e) => e.method === 'Runtime.exceptionThrown' ? (e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text) : e.method === 'Log.entryAdded' ? `${e.params.entry.text}` : e.params.args.map((a) => a.value || a.description).join(' '))
    .filter((t) => !/v1\/me|favicon/.test(t));
}
// Saisie compatible React (champs contrôlés) : passe par le setter natif puis un événement input.
const HELPERS = `window.__type = (sel, value) => { const el = document.querySelector(sel); if (!el) return 'absent: ' + sel;
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  if (el.type === 'checkbox') { el.click(); return 'coché ' + el.checked; }
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return 'saisi'; };
window.__submit = (sel) => { const f = document.querySelector(sel); if (!f) return 'absent: ' + sel; f.requestSubmit(); return 'soumis'; };
window.__click = (sel) => { const el = [...document.querySelectorAll(sel)].find((x) => x.offsetParent !== null) || document.querySelector(sel); if (!el) return 'absent: ' + sel; el.click(); return 'cliqué'; };
window.__clickText = (text) => { const el = [...document.querySelectorAll('button, a')].find((x) => x.textContent.trim() === text); if (!el) return 'absent: ' + text; el.click(); return 'cliqué'; };
window.__text = () => document.body.innerText.replace(/\\s+/g, ' ');`;

await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: HELPERS });

let failures = 0;
async function goto(p) { events.length = 0; await send('Page.navigate', { url: p.startsWith('http') ? p : BASE + p }); await wait(1800); }
if (EMAIL) {
  await goto('/espace-client?next=%2Fcommunaute%2F');
  await evaluate(`(() => { const f = document.querySelector('form'); f.email.value = ${JSON.stringify(EMAIL)}; f.password.value = ${JSON.stringify(MDP)}; f.requestSubmit(); return 1; })()`);
  await wait(2500);
  console.log('connecté :', await evaluate('location.href'));
}
for (const step of steps) {
  if (step.goto) { await goto(step.goto); console.log(`\n→ ${step.goto} : ${await evaluate('location.href')}`); }
  if (step.setFile) {
    const doc = await send('DOM.getDocument', { depth: 1 });
    const node = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: step.setFile.selector });
    if (!node.result || !node.result.nodeId) { console.log('  ✗ champ fichier absent : ' + step.setFile.selector); failures += 1; }
    else { await send('DOM.setFileInputFiles', { nodeId: node.result.nodeId, files: [step.setFile.path] }); console.log('  fichier posé : ' + step.setFile.path); }
  }
  if (step.capture) {
    const v = await evaluate(`(document.querySelector(${JSON.stringify(step.capture.selector)}) || {}).innerText || ''`);
    mem[step.capture.into] = String(v).replace(/\s+/g, '');
    console.log(`  capture ${step.capture.into} : ${mem[step.capture.into].slice(0, 6)}… (${mem[step.capture.into].length} car.)`);
  }
  if (step.waitNextStep) {
    const c0 = totp.currentCounter();
    while (totp.currentCounter() === c0) await wait(500);
    console.log('  (pas de 30 s suivant atteint)');
  }
  if (step.typeTotp) {
    const code = totp.hotp(mem.secret, totp.currentCounter() + (step.typeTotp.delta || 0));
    const r = await evaluate(`window.__type(${JSON.stringify(step.typeTotp.selector)}, ${JSON.stringify(code)})`);
    console.log(`  code TOTP saisi (${r})`);
  }
  if (step.typeRecovery) {
    const raw = (mem.recovery || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
    const r = await evaluate(`window.__type(${JSON.stringify(step.typeRecovery.selector)}, ${JSON.stringify(raw.slice(0, 5) + '-' + raw.slice(5))})`);
    console.log(`  code de secours saisi (${r})`);
  }
  if (step.eval) { const r = await evaluate(step.eval); console.log(`  eval ${step.label || ''}: ${JSON.stringify(r)}`); if (typeof r === 'string' && /^(EXCEPTION|absent)/.test(r)) failures += 1; }
  if (step.wait) await wait(step.wait);
  if (step.expect) {
    const text = await evaluate('window.__text()');
    const ok = text.toLowerCase().includes(step.expect.toLowerCase());
    console.log(`  ${ok ? '✓' : '✗'} attendu « ${step.expect} »${ok ? '' : ' | texte : ' + text.slice(0, 300)}`);
    if (!ok) failures += 1;
  }
  if (step.expectUrl) { const u = await evaluate('location.href'); const ok = u.includes(step.expectUrl); console.log(`  ${ok ? '✓' : '✗'} URL contient « ${step.expectUrl} » (${u})`); if (!ok) failures += 1; }
  if (step.shot) {
    await send('Emulation.setDeviceMetricsOverride', { width: step.width || 1280, height: 900, deviceScaleFactor: 1, mobile: (step.width || 1280) < 600 });
    await wait(200);
    const h = await evaluate('Math.min(document.documentElement.scrollHeight, 4000)');
    await send('Emulation.setDeviceMetricsOverride', { width: step.width || 1280, height: Math.max(600, h || 900), deviceScaleFactor: 1, mobile: (step.width || 1280) < 600 });
    await wait(150);
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(path.join(outDir, step.shot + '.png'), Buffer.from(r.result.data, 'base64'));
  }
  const errs = consoleErrors();
  if (errs.length) { console.log('  erreurs console :', errs); events.length = 0; }
}
ws.close(); chrome.kill();
await wait(500); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
console.log(failures ? `\n${failures} étape(s) en échec.` : '\n✓ scénario terminé sans échec.');
process.exit(failures ? 1 : 0);
