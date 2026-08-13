// Vérificateur de l'espace fondateur — outil de développement.
//
// 🔴 POURQUOI. Cette page est un composant à gabarit maison (`<sc-if>`, `<sc-for>`,
// `{{ clé }}`) dont les valeurs viennent d'un unique `renderVals()`. Une clé du gabarit
// qui n'existe pas dans `renderVals` **ne produit AUCUNE erreur** : la zone reste
// simplement vide. Une coquille passe donc inaperçue jusqu'à ce qu'un utilisateur
// constate un tableau de bord amputé — et c'est le pire endroit pour cela, puisque cette
// page sert précisément à surveiller le produit.
//
// Deux contrôles, et le second est le vrai :
//   1. le script du composant PARSE (une erreur de syntaxe casse la page entière) ;
//   2. toute clé `{{ … }}` du gabarit est bien rendue par `renderVals()`, et réciproquement
//      aucune clé rendue n'est inutilisée.
//
// Le composant est EXÉCUTÉ contre un `DCLogic` de substitution, ce qui permet en outre de
// vérifier la mise en forme sur des données de test.
//
// Usage :  node scripts/check-espace-fondateur.mjs
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const FILE = path.join(ROOT, 'espace-fondateur.html');
const html = fs.readFileSync(FILE, 'utf8');

let ok = 0; const fails = [];
const check = (label, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  ✓ ${label}`); }
  else { fails.push(label + (detail ? ` — ${detail}` : '')); console.log(`  ✗ ${label}${detail ? '\n      ' + detail : ''}`); }
};

// --- Découpage : gabarit (<x-dc>…</x-dc>) et script du composant -------------
const tplStart = html.indexOf('<x-dc');
const tplEnd = html.indexOf('</x-dc>');
const scriptStart = html.indexOf('<script type="text/x-dc"');
const scriptOpen = html.indexOf('>', scriptStart) + 1;
const scriptEnd = html.indexOf('</script>', scriptOpen);
check('gabarit et script repérés',
  tplStart > 0 && tplEnd > tplStart && scriptStart > tplEnd && scriptEnd > scriptOpen);
const template = html.slice(tplStart, tplEnd);
const source = html.slice(scriptOpen, scriptEnd);

console.log('\n1. Le composant se charge');
// `DCLogic` de substitution : on n'a besoin que de `setState` et d'un `state` mutable.
const stub = 'class DCLogic { setState(p) { Object.assign(this.state, p); } }\n';
let Cls = null;
try {
  Cls = new Function(`${stub}${source}\nreturn Component;`)();
  check('le script parse et s\'évalue', typeof Cls === 'function');
} catch (err) {
  check('le script parse et s\'évalue', false, err.message);
}
if (!Cls) { console.log('\nAbandon : le composant ne se charge pas.'); process.exit(1); }

console.log('\n2. Aucune clé de gabarit ne manque (ni ne traîne)');
// Toutes les clés `{{ … }}` du gabarit. On ignore les expressions littérales (`{{ false }}`)
// et on ne retient que la RACINE d'un accès pointé (`s.label` -> `s`), les alias de `sc-for`
// étant locaux au gabarit.
const alias = new Set([...template.matchAll(/as="([A-Za-z_$][\w$]*)"/g)].map((m) => m[1]));
const used = new Set();
for (const m of template.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
  const expr = m[1].trim();
  if (/^(true|false|null|\d|'|")/.test(expr)) continue;      // littéral
  const root = expr.split(/[.\s([]/)[0];
  if (!alias.has(root)) used.add(root);
}
check(`${used.size} clé(s) employée(s) dans le gabarit`, used.size > 20, String(used.size));

// `renderVals()` sur un état RÉALISTE : c'est aussi ce qui éprouve la mise en forme.
const inst = new Cls();
inst.state = {
  ...inst.state,
  loading: false,
  stats: {
    users_total: 4, users_week: 1, downloads_total: 9, downloads_week: 2,
    bugs_open: 1, bugs_high: 0, messages_unread: 0,
    telemetry_devices_48h: 3, telemetry_crashes_48h: 5, telemetry_top_version: '1.1.0',
  },
  telem: {
    since: '2026-07-14',
    counters: [
      { day: '2026-08-13', version: '1.1.0', os: 'win32', event: 'export.dpgf', count: 12 },
      { day: '2026-08-13', version: '1.1.0', os: 'win32', event: 'crash.python', count: 4 },
      { day: '2026-08-12', version: '1.0.10', os: 'darwin', event: 'crash.natif', count: 1 },
      { day: '2026-08-12', version: '1.0.10', os: 'darwin', event: 'autre', count: 3 },
    ],
    devices: [
      { day: '2026-08-13', version: '1.1.0', os: 'win32', devices: 2, beats: 40, uptime_max_s: 3600 },
      { day: '2026-08-12', version: '1.1.0', os: 'win32', devices: 2, beats: 30, uptime_max_s: 1800 },
      { day: '2026-08-12', version: '1.0.10', os: 'darwin', devices: 1, beats: 5, uptime_max_s: 60 },
    ],
    startupMedian: [{ version: '1.1.0', samples: 4, median_ms: 172 }],
  },
};
let vals = null;
try { vals = inst.renderVals(); check('renderVals() s\'exécute', !!vals); }
catch (err) { check('renderVals() s\'exécute', false, err.message); }
if (!vals) { console.log('\nAbandon.'); process.exit(1); }

const rendered = new Set(Object.keys(vals));
const manquantes = [...used].filter((k) => !rendered.has(k));
check('toute clé du gabarit est rendue', manquantes.length === 0,
  'absente(s) de renderVals : ' + manquantes.join(', '));
const inutiles = [...rendered].filter((k) => !used.has(k));
check('aucune clé rendue n\'est inutilisée', inutiles.length === 0,
  'jamais employée(s) : ' + inutiles.join(', '));

console.log('\n3. La télémétrie est mise en forme correctement');
check('le résumé se lit sans cliquer',
  vals.telemSummary === '3 postes actifs sur 48 h · 1.1.0', vals.telemSummary);
check('les crashes sont annoncés au pluriel', vals.telemCrashes === '5 crashes', vals.telemCrashes);
// 5 crashes pour 3 postes : plus de crashes que de postes -> rouge.
check('accent ROUGE quand les crashes dépassent les postes',
  vals.telemAccent === 'var(--a-red)', vals.telemAccent);
check('deux versions listées', vals.telemVersions.length === 2,
  JSON.stringify(vals.telemVersions.map((v) => v.version)));
const v110 = vals.telemVersions.find((v) => v.version === '1.1.0');
check('les crashes sont agrégés par version', v110.crashes === '4 crashes', v110.crashes);
check('les jours-postes sont sommés et NOMMÉS comme tels',
  v110.postes.startsWith('4 jours-postes'), v110.postes);
check('la médiane de démarrage est reprise',
  v110.detail.includes('172 ms') && v110.detail.includes('70 battements'), v110.detail);
const v1010 = vals.telemVersions.find((v) => v.version === '1.0.10');
check('une version à 1 poste se dit au singulier',
  v1010.postes.startsWith('1 jour-poste'), v1010.postes);
check('un crash unique se dit au singulier', v1010.crashes === '1 crash', v1010.crashes);
// Les crashes ne doivent PAS figurer dans l'usage (ils ont leur propre ligne).
check('l\'usage exclut les crashes',
  !vals.telemEvents.some((e) => e.name.startsWith('crash.')),
  JSON.stringify(vals.telemEvents));
check('l\'usage est trié du plus employé au moins',
  vals.telemEvents[0].name === 'export.dpgf', JSON.stringify(vals.telemEvents));
// 🔴 Le seau « autre » est TEINTÉ : il signale un événement que le serveur ne nomme pas.
check('le seau « autre » est signalé',
  vals.telemEvents.find((e) => e.name === 'autre').color === '#b7791f',
  JSON.stringify(vals.telemEvents));
check('la fenêtre est datée en français', vals.telemWindow === 'depuis le 14/07/2026',
  vals.telemWindow);

console.log('\n4. Les états dégradés');
const vide = new Cls();
vide.state = { ...vide.state, loading: false, stats: {
  users_total: 0, users_week: 0, downloads_total: 0, downloads_week: 0,
  bugs_open: 0, bugs_high: 0, messages_unread: 0,
  telemetry_devices_48h: 0, telemetry_crashes_48h: 0, telemetry_top_version: '' } };
const vv = vide.renderVals();
check('aucun poste : le bandeau le DIT',
  vv.telemSummary === 'aucun poste ne remonte de données', vv.telemSummary);
check('aucun crash : accent apaisé', vv.telemAccent === 'var(--a-teal)', vv.telemAccent);
check('overlay vide détecté', vv.isTelemEmpty === true, String(vv.isTelemEmpty));
// ⚠ Le cas AVANT chargement des stats : `stats` est null au premier rendu.
const neuf = new Cls();
neuf.state = { ...neuf.state };
let nv = null;
try { nv = neuf.renderVals(); } catch (err) { /* signalé plus bas */ }
check('renderVals() survit à stats = null (premier rendu)', !!nv,
  'exception au premier rendu : le tableau de bord ne s\'afficherait jamais');
if (nv) check('et n\'annonce rien de faux', nv.telemSummary === 'aucun poste ne remonte de données',
  nv.telemSummary);

console.log(`\n${ok} contrôle(s) réussi(s), ${fails.length} en échec.`);
if (fails.length) { fails.forEach((f) => console.log('  - ' + f)); process.exit(1); }
console.log('✓ l\'espace fondateur se charge, et aucune clé de gabarit ne manque.');
