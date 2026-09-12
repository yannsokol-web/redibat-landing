// Vérificateur des pages x-dc : outil de développement, exécuté en CI AVANT publication.
//
// 🔴 POURQUOI. Chaque page est un composant à gabarit maison (`<sc-if>`, `<sc-for>`,
// `{{ clé }}`) dont les valeurs viennent d'un unique `renderVals()`. Une clé du gabarit
// qui n'existe pas dans `renderVals` **ne produit AUCUNE erreur** : la zone reste
// simplement vide. Une coquille passe donc inaperçue jusqu'à ce qu'un utilisateur
// constate une page amputée. L'espace communautaire compte dix pages de ce type, plus
// l'espace fondateur et la page de connexion : le contrôle s'applique à TOUTES.
//
// Contrôles, pour chaque page qui porte un `data-dc-script` :
//   1. le script du composant PARSE et s'évalue (une erreur de syntaxe casse la page) ;
//   2. toute clé `{{ … }}` du gabarit est rendue par `renderVals()` sur l'état initial, et
//      aucune clé rendue n'est inutilisée ;
//   3. aucun `dangerouslySetInnerHTML` (le runtime le transmettrait à React : interdit) ;
//   4. dans communaute/ : liens et sources ABSOLUS (la page porte <base href="/">), et un
//      même `?v=` pour community.js et community.css sur toutes les pages.
// Puis : les tests historiques de mise en forme de l'espace fondateur (télémétrie), et des
// tests unitaires du socle communautaire (RDB.parseLite, linkify, safeNext, formats).
//
// Usage :  node scripts/check-dc-pages.mjs

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let ok = 0; const fails = [];
const check = (label, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  ✓ ${label}`); }
  else { fails.push(label + (detail ? ` : ${detail}` : '')); console.log(`  ✗ ${label}${detail ? '\n      ' + detail : ''}`); }
};

// --- Socle communautaire (window.RDB), évalué sous Node ------------------------------
const rdbSrc = fs.readFileSync(path.join(ROOT, 'communaute', 'community.js'), 'utf8');
try {
  new Function(rdbSrc)();
  check('communaute/community.js s\'évalue sous Node', typeof globalThis.RDB === 'object');
} catch (err) {
  check('communaute/community.js s\'évalue sous Node', false, err.message);
}
const RDB = globalThis.RDB;

// --- Pages à vérifier -------------------------------------------------------------------
const pages = [];
for (const f of fs.readdirSync(ROOT)) if (f.endsWith('.html')) pages.push(f);
for (const f of fs.readdirSync(path.join(ROOT, 'communaute'))) if (f.endsWith('.html')) pages.push('communaute/' + f);
pages.sort();

// `DCLogic` de substitution : on n'a besoin que de `setState` et d'un `state` mutable.
const stub = 'class DCLogic { setState(p) { Object.assign(this.state, typeof p === "function" ? p(this.state) : p); } }\n';

function splitPage(html) {
  const tplStart = html.indexOf('<x-dc');
  const tplEnd = html.indexOf('</x-dc>');
  const scriptStart = html.indexOf('<script type="text/x-dc"');
  const scriptOpen = html.indexOf('>', scriptStart) + 1;
  const scriptEnd = html.indexOf('</script>', scriptOpen);
  if (!(tplStart > 0 && tplEnd > tplStart && scriptStart > tplEnd && scriptEnd > scriptOpen)) return null;
  return { template: html.slice(tplStart, tplEnd), source: html.slice(scriptOpen, scriptEnd) };
}

function templateKeys(template) {
  const alias = new Set([...template.matchAll(/as="([A-Za-z_$][\w$]*)"/g)].map((m) => m[1]));
  const used = new Set();
  for (const m of template.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
    let expr = m[1].trim();
    // Comparaisons `a === 'x'` : chaque côté est une expression à part.
    for (const side of expr.split(/[!=]==?/)) {
      let e = side.trim().replace(/^!+/, '');
      if (!e || /^(true|false|null|undefined|\d|'|")/.test(e)) continue;      // littéral
      const root = e.split(/[.\s([]/)[0];
      if (root && !alias.has(root) && root !== '$index') used.add(root);
    }
  }
  return used;
}

const versions = new Set();
const founderResults = {};

for (const rel of pages) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!html.includes('data-dc-script')) continue;
  console.log(`\n■ ${rel}`);
  const parts = splitPage(html);
  check('gabarit et script repérés', !!parts);
  if (!parts) continue;
  const { template, source } = parts;
  check('aucun dangerouslySetInnerHTML', !/dangerouslySetInnerHTML/i.test(template));

  if (rel.startsWith('communaute/')) {
    const relative = [...template.matchAll(/\s(?:href|src|action)="([^"]*)"/g)]
      .map((m) => m[1]).filter((v) => v && !/^(\/|#|https?:|mailto:|data:|\{\{)/.test(v));
    check('liens et sources absolus (base href="/")', relative.length === 0, relative.slice(0, 5).join(', '));
    for (const m of html.matchAll(/\/communaute\/community\.(?:js|css)\?v=(\d+)/g)) versions.add(m[1]);
    check('en-tête communautaire présent', template.includes('class="cm-header"') && template.includes('{{ hdrIsFounder }}'));
    // Le navigateur analyse le gabarit brut (masqué) avant React : une image sans loading="lazy"
    // ou un média préchargé demanderait l'URL littérale « {{ … }} ». Interdit.
    const eagerImg = [...template.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => /src="[^"]*\{\{/.test(t) && !/loading="lazy"/.test(t));
    check('toute image interpolée du gabarit est loading="lazy"', eagerImg.length === 0, eagerImg.slice(0, 3).join(' '));
    const eagerMedia = [...template.matchAll(/<(?:video|audio|source)\b[^>]*>/g)].map((m) => m[0]).filter((t) => /\s(?:src|poster|on[a-z]+)=/i.test(t));
    check('aucun média du gabarit ne porte src, poster ni on*', eagerMedia.length === 0, eagerMedia.slice(0, 3).join(' '));
    check('robots noindex dans le head et le helmet', (html.match(/name="robots" content="noindex, nofollow"/g) || []).length >= 2);
    check('CSP présente, sans frame, médias limités à l\'API', /Content-Security-Policy/.test(html) && /frame-src 'none'/.test(html) && /media-src https:\/\/api\.redibat\.fr/.test(html));
  }

  let Cls = null;
  try {
    Cls = new Function(`${stub}${source}\nreturn Component;`)();
    check('le script parse et s\'évalue', typeof Cls === 'function');
  } catch (err) {
    check('le script parse et s\'évalue', false, err.message);
  }
  if (!Cls) continue;

  const used = templateKeys(template);
  // Les pages marketing ont un composant vide (renderVals() { return {}; }) : le contrôle
  // bidirectionnel STRICT ne s'applique qu'aux pages applicatives (communauté, compte).
  const strict = rel.startsWith('communaute/') || rel === 'espace-client.html' || rel === 'espace-fondateur.html';
  console.log(`  · ${used.size} clé(s) employée(s) dans le gabarit`);
  if (strict) check('le gabarit emploie des clés', used.size > 3, String(used.size));
  const inst = new Cls();
  if (rel === 'espace-fondateur.html') founderResults.Cls = Cls;
  let vals = null;
  try { vals = inst.renderVals(); check('renderVals() s\'exécute sur l\'état initial', !!vals); }
  catch (err) { check('renderVals() s\'exécute sur l\'état initial', false, err.message); }
  if (!vals) continue;
  const rendered = new Set(Object.keys(vals));
  const manquantes = [...used].filter((k) => !rendered.has(k));
  check('toute clé du gabarit est rendue', manquantes.length === 0, 'absente(s) de renderVals : ' + manquantes.join(', '));
  const inutiles = [...rendered].filter((k) => !used.has(k));
  if (strict) check('aucune clé rendue n\'est inutilisée', inutiles.length === 0, 'jamais employée(s) : ' + inutiles.join(', '));
  else if (inutiles.length) console.log(`  · clé(s) rendue(s) non employée(s) (toléré hors pages applicatives) : ${inutiles.join(', ')}`);
}

console.log('\n■ Cohérence des pages communautaires');
check('un seul ?v= pour community.js et community.css', versions.size === 1, [...versions].join(', '));

// --- Espace fondateur : tests historiques de mise en forme (télémétrie) -----------------
if (founderResults.Cls) {
  const Cls = founderResults.Cls;
  console.log('\n■ espace-fondateur.html : la télémétrie est mise en forme correctement');
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
  const vals = inst.renderVals();
  check('le résumé se lit sans cliquer', vals.telemSummary === '3 postes actifs sur 48 h · 1.1.0', vals.telemSummary);
  check('les crashes sont annoncés au pluriel', vals.telemCrashes === '5 crashes', vals.telemCrashes);
  check('accent ROUGE quand les crashes dépassent les postes', vals.telemAccent === 'var(--a-red)', vals.telemAccent);
  check('deux versions listées', vals.telemVersions.length === 2, JSON.stringify(vals.telemVersions.map((v) => v.version)));
  const v110 = vals.telemVersions.find((v) => v.version === '1.1.0');
  check('les crashes sont agrégés par version', v110.crashes === '4 crashes', v110.crashes);
  check('les jours-postes sont sommés et NOMMÉS comme tels', v110.postes.startsWith('4 jours-postes'), v110.postes);
  check('la médiane de démarrage est reprise', v110.detail.includes('172 ms') && v110.detail.includes('70 battements'), v110.detail);
  const v1010 = vals.telemVersions.find((v) => v.version === '1.0.10');
  check('une version à 1 poste se dit au singulier', v1010.postes.startsWith('1 jour-poste'), v1010.postes);
  check('un crash unique se dit au singulier', v1010.crashes === '1 crash', v1010.crashes);
  check('l\'usage exclut les crashes', !vals.telemEvents.some((e) => e.name.startsWith('crash.')), JSON.stringify(vals.telemEvents));
  check('l\'usage est trié du plus employé au moins', vals.telemEvents[0].name === 'export.dpgf', JSON.stringify(vals.telemEvents));
  check('le seau « autre » est signalé', vals.telemEvents.find((e) => e.name === 'autre').color === '#b7791f', JSON.stringify(vals.telemEvents));
  check('la fenêtre est datée en français', vals.telemWindow === 'depuis le 14/07/2026', vals.telemWindow);

  console.log('\n■ espace-fondateur.html : les états dégradés');
  const vide = new Cls();
  vide.state = { ...vide.state, loading: false, stats: {
    users_total: 0, users_week: 0, downloads_total: 0, downloads_week: 0,
    bugs_open: 0, bugs_high: 0, messages_unread: 0,
    telemetry_devices_48h: 0, telemetry_crashes_48h: 0, telemetry_top_version: '' } };
  const vv = vide.renderVals();
  check('aucun poste : le bandeau le DIT', vv.telemSummary === 'aucun poste ne remonte de données', vv.telemSummary);
  check('aucun crash : accent apaisé', vv.telemAccent === 'var(--a-teal)', vv.telemAccent);
  check('overlay vide détecté', vv.isTelemEmpty === true, String(vv.isTelemEmpty));
  const neuf = new Cls();
  let nv = null;
  try { nv = neuf.renderVals(); } catch (err) { /* signalé plus bas */ }
  check('renderVals() survit à stats = null (premier rendu)', !!nv);
  if (nv) check('et n\'annonce rien de faux', nv.telemSummary === 'aucun poste ne remonte de données', nv.telemSummary);

  console.log('\n■ espace-fondateur.html : un backend EN ARRIÈRE ne fait pas afficher « undefined »');
  const vieux = new Cls();
  vieux.state = { ...vieux.state, loading: false, stats: {
    users_total: 4, users_week: 1, downloads_total: 9, downloads_week: 2,
    bugs_open: 1, bugs_high: 0, messages_unread: 0 },
    users: [{ id: 1, email: 'a@b.c', role: 'pro', license_active: 1, password_set: 1 }] };   // sans display_name ni web_sessions_active
  const ov = vieux.renderVals();
  check('aucun « undefined » dans le bandeau', !String(ov.telemSummary).includes('undefined') && !String(ov.telemCrashes).includes('undefined'), `${ov.telemSummary} / ${ov.telemCrashes}`);
  check('il annonce l\'absence de données, pas un faux chiffre', ov.telemSummary === 'aucun poste ne remonte de données', ov.telemSummary);
  check('et le reste du tableau de bord est intact', ov.stats.length === 4 && ov.stats[0].value === '4', JSON.stringify(ov.stats.map((c) => c.value)));
  check('un compte sans pseudo ni sessions (backend ancien) s\'affiche proprement', ov.users.length === 1 && ov.users[0].pseudo === '-' && ov.users[0].hasWebSessions === false, JSON.stringify(ov.users[0]));
  check('… et sans colonne badges : trois badges à délivrer, aucun attribué', ov.users[0].badgeToggles.length === 3 && ov.users[0].badgeToggles.every((b) => !b.label.startsWith('✓')), JSON.stringify(ov.users[0].badgeToggles));
  vieux.state.users[0].badges = '["expert"]';
  check('un badge attribué s\'affiche coché', vieux.renderVals().users[0].badgeToggles.find((b) => b.label.includes('Expert')).label.startsWith('✓'));
  vieux.state.users[0].badges = '{pas du json';
  check('une colonne badges abîmée ne casse pas le tableau', vieux.renderVals().users[0].badgeToggles.length === 3);
}

// --- Socle communautaire : tests unitaires --------------------------------------------
if (RDB) {
  console.log('\n■ community.js : adresse de retour (anti open-redirect)');
  check('chemin communautaire accepté', RDB.safeNext('/communaute/videos?v=3') === '/communaute/videos?v=3');
  check('espace fondateur accepté', RDB.safeNext('/espace-fondateur') === '/espace-fondateur');
  check('//evil.com refusé', RDB.safeNext('//evil.com') === '/communaute/');
  check('https://x refusé', RDB.safeNext('https://x.example/communaute') === '/communaute/');
  check('javascript: refusé', RDB.safeNext('javascript:alert(1)') === '/communaute/');
  check('chemin hors espace refusé', RDB.safeNext('/tarifs') === '/communaute/');
  check('vide → accueil', RDB.safeNext('') === '/communaute/' && RDB.safeNext(undefined) === '/communaute/');

  console.log('\n■ community.js : badges');
  check('libellés des badges connus, inconnus ignorés', RDB.badges(['early', 'expert', 'ambassador', 'x']).map((b) => b.label).join(', ') === 'Membre fondateur, Expert, Ambassadeur');
  check('les badges délivrables ont tous un libellé', RDB.badges(RDB.GRANTABLE_BADGES).length === RDB.GRANTABLE_BADGES.length);

  console.log('\n■ community.js : « se souvenir de moi » (préférence et e-mail, jamais de mot de passe)');
  const fake = new Map();
  globalThis.localStorage = { getItem: (k) => (fake.has(k) ? fake.get(k) : null), setItem: (k, v) => fake.set(k, String(v)), removeItem: (k) => fake.delete(k) };
  check('cochée par défaut, sans e-mail mémorisé', RDB.rememberOn() === true && RDB.rememberedEmail() === '');
  RDB.setRemember(true, '  Alice@Example.test ');
  check('un login réussi mémorise l\'adresse (nettoyée)', RDB.rememberedEmail() === 'Alice@Example.test' && fake.get('rdb_remember') === '1');
  check('… et rien d\'autre', [...fake.keys()].sort().join(',') === 'rdb_login_email,rdb_remember');
  RDB.setRemember(false);
  check('décochée : préférence gardée, e-mail effacé', RDB.rememberOn() === false && RDB.rememberedEmail() === '' && !fake.has('rdb_login_email'));
  RDB.setRemember(true);
  check('recochée sans e-mail : rien à pré-remplir', RDB.rememberOn() === true && RDB.rememberedEmail() === '');
  fake.set('rdb_login_email', 'x@y.z'); fake.set('rdb_remember', '0');
  check('un e-mail résiduel n\'est pas pré-rempli quand la case est décochée', RDB.rememberedEmail() === '');
  delete globalThis.localStorage;
  check('sans stockage : cochée par défaut, aucune exception', RDB.rememberOn() === true && RDB.rememberedEmail() === '' && (RDB.setRemember(true, 'a@b.c'), true));

  console.log('\n■ community.js : mise en forme légère');
  const b = RDB.parseLite('## Titre\n\nUn paragraphe avec **du gras**, du `code` et un lien [Rédibat](https://redibat.fr).\nSuite de ligne.\n\n- un\n- deux\n\n1. premier\n2. second\n\n```\nconst x = 1;\n```\n\n![Schéma](file:12)\n\n[video:7]\n\nhttp://exemple.fr/page.');
  check('titre h2', b[0].type === 'h2' && b[0].text === 'Titre');
  check('paragraphe avec gras, code, lien', b[1].type === 'p' && b[1].runs.some((r) => r.isBold && r.s === 'du gras') && b[1].runs.some((r) => r.isCode && r.s === 'code') && b[1].runs.some((r) => r.isLink && r.h === 'https://redibat.fr' && r.s === 'Rédibat'), JSON.stringify(b[1].runs));
  check('les retours à la ligne d\'un paragraphe sont conservés', b[1].runs.some((r) => r.s.includes('\nSuite de ligne.')));
  check('liste à puces', b[2].type === 'ul' && b[2].items.length === 2 && b[2].items[1].runs[0].s === 'deux');
  check('liste numérotée', b[3].type === 'ol' && b[3].items.length === 2);
  check('bloc de code brut', b[4].type === 'code' && b[4].text === 'const x = 1;');
  check('image interne uniquement', b[5].type === 'img' && b[5].src.endsWith('/v1/community/files/12/inline') && b[5].alt === 'Schéma');
  check('carte vidéo', b[6].type === 'video' && b[6].href === '/communaute/videos?v=7');
  check('URL nue liée sans la ponctuation finale', b[7].runs.some((r) => r.isLink && r.h === 'http://exemple.fr/page'));
  const evil = RDB.parseLite('<script>alert(1)</script>\n\n![x](https://evil.example/a.png)\n\n[x](javascript:alert(1))');
  check('aucun HTML, aucune image externe, aucun lien javascript:', !evil.some((b) => b.isImg) && !JSON.stringify(evil).includes('"src":"http') && !evil.some((b) => b.runs.some((r) => r.isLink && /^javascript:/i.test(r.h))) && evil[0].runs[0].s.startsWith('<script>'), JSON.stringify(evil));
  check('un texte vide donne zéro bloc', RDB.parseLite('').length === 0 && RDB.parseLite(null).length === 0);

  console.log('\n■ community.js : liens et formats');
  const runs = RDB.linkify('Voir https://redibat.fr/faq, et rien d\'autre.');
  check('linkify découpe texte et lien', runs.length === 3 && runs[1].isLink && runs[1].h === 'https://redibat.fr/faq' && runs[2].s === ', et rien d\'autre.', JSON.stringify(runs));
  check('fmtDate en français', RDB.fmtDate('2026-09-12T10:00:00.000Z') === '12/09/2026');
  check('fmtRelative', RDB.fmtRelative(new Date(Date.now() - 5 * 60000).toISOString()) === 'il y a 5 min' && RDB.fmtRelative(new Date(Date.now() - 30 * 3600000).toISOString()) === 'hier');
  check('fmtSize', RDB.fmtSize(1536) === '2 Ko' && RDB.fmtSize(2.5 * 1048576) === '2,5 Mo');
  check('fmtDuration', RDB.fmtDuration(754) === '12 min' && RDB.fmtDuration(3900) === '1 h 05' && RDB.fmtDuration(45) === '45 s');
  check('badges connus seulement', RDB.badges(['founder', 'x', 'early']).map((x) => x.label).join('|') === 'Fondateur|Membre fondateur');
  const hv = RDB.headerVals({ display_name: 'Alice', is_founder: false }, 'forum');
  check('headerVals marque la page active', hv.hdrForum === 'cm-link is-active' && hv.hdrHome === 'cm-link' && hv.hdrName === 'Alice' && hv.hdrIsFounder === false);
}

console.log(`\n${ok} contrôle(s) réussi(s), ${fails.length} en échec.`);
if (fails.length) { fails.forEach((f) => console.log('  - ' + f)); process.exit(1); }
console.log('✓ toutes les pages x-dc se chargent, aucune clé de gabarit ne manque.');
