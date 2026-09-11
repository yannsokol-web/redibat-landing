// Amorce la base locale d'essai : trois comptes (fondateur, membre avec licence, membre
// sans licence) avec de vrais hashes, puis du contenu via l'API (guides, nouveautés, sujets,
// un document, une vidéo factice). À lancer APRÈS le démarrage de l'API locale.
import fs from 'node:fs';

const API = 'http://localhost:3000';
const MDP = 'un-mot-de-passe-de-test-solide';
process.env.DB_PATH = process.env.DB_PATH || '/tmp/rdb-local/test.db';
// Dépôt backend voisin (REDIBAT_AUTH), pour créer les comptes avec de vrais hashes.
const AUTH = process.env.REDIBAT_AUTH || new URL('../../../redibat-auth/', import.meta.url).pathname;
const db = await import(AUTH + 'src/db.js');
const { hashPassword } = await import(AUTH + 'src/auth.js');

const hash = await hashPassword(MDP);
function ensure(email, role) {
  const u = db.getUserByEmail(email);
  if (u) return u;
  return db.createUser({ email, passwordHash: hash, role });
}
const founder = ensure('fondateur@example.test', 'max');
const alice = ensure('alice@example.test', 'pro');
const bob = ensure('bob@example.test', 'pro');
db.setLicense(bob.email, false);
db.closeDb();

function browser() {
  let cookie = null;
  return async (method, path, body, raw, extraHeaders) => {
    const h = { accept: 'application/json', origin: 'http://localhost:8100', 'sec-fetch-site': 'same-site', ...(extraHeaders || {}) };
    if (cookie) h.cookie = cookie;
    let payload;
    if (raw) payload = raw; else if (body !== undefined) { h['content-type'] = 'application/json'; payload = JSON.stringify(body); }
    const r = await fetch(API + path, { method, headers: h, body: payload });
    const set = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    if (set.length) cookie = set[0].split(';')[0];
    let json = null; try { json = await r.json(); } catch (_) {}
    return { status: r.status, json };
  };
}

const F = browser();
console.log('login fondateur', (await F('POST', '/v1/login', { email: founder.email, password: MDP, client: 'web' })).status);
await F('POST', '/v1/me/profile', { display_name: 'Yann', company: 'YSCORP', job_title: 'Éditeur de Rédibat', region: 'Bretagne', directory_visible: true });
const A = browser();
console.log('login alice', (await A('POST', '/v1/login', { email: alice.email, password: MDP, client: 'web' })).status);
await A('POST', '/v1/me/profile', { display_name: 'Alice Métreur', company: 'Cabinet Dupont', job_title: 'Économiste de la construction', region: 'Île-de-France', bio: 'Métrés et DPGF depuis 12 ans.', directory_visible: true });

// Guides
for (const g of [
  { title: 'Créer sa première affaire', module: 'general', summary: 'De la création du dossier au premier export.', body: '## Créer le dossier\n\nDepuis l\'accueil, cliquez sur **Nouvelle affaire**. Renseignez le nom du chantier et le maître d\'ouvrage.\n\n### Organiser les lots\n\n- Un lot par corps d\'état\n- Numérotez les lots dans l\'ordre du CCTP\n- Utilisez les modèles de la bibliothèque\n\n## Exporter\n\n1. Ouvrez l\'onglet Pièces\n2. Choisissez le format\n3. Vérifiez l\'aperçu\n\n```\nRaccourci : Ctrl+E ouvre directement l\'export.\n```\n\nPour aller plus loin, voir la vidéo :\n\n[video:1]\n\nQuestions ? Le forum est là : https://redibat.fr/communaute/forum', published: true },
  { title: 'Tracer un mur sur un plan PDF', module: 'quantitatif', summary: 'Calibrer l\'échelle puis mesurer.', body: '## Calibrer\n\nMesurez une cote connue, saisissez sa longueur réelle.\n\n## Tracer\n\nCliquez point par point, double-clic pour fermer.', published: true },
  { title: 'Brouillon TCO', module: 'tco', summary: 'En cours.', body: 'À rédiger.', published: false },
]) console.log('guide', (await F('POST', '/v1/founder/community/guides', g)).status);

// Nouveautés
for (const a of [
  { title: 'Version 1.3 : export DPGF corrigé', version: '1.3.0', body: '## Corrections\n\n- L\'export DPGF ne plante plus sur les lots vides\n- Les métrés se recalculent après suppression d\'une pièce\n\n## Nouveautés\n\n- Bibliothèque de prix : import CSV', is_pinned: true, published: true },
  { title: 'Bienvenue dans la communauté', body: 'Cet espace est réservé aux utilisateurs de Rédibat. Posez vos questions, partagez vos méthodes, et retrouvez les vidéos explicatives.', published: true },
]) console.log('nouveauté', (await F('POST', '/v1/founder/community/announcements', a)).status);

// Forum
let r = await A('POST', '/v1/community/forum/threads', { category: 'bugs', title: 'Le métré plante à l\'export', body: 'Quand je clique sur Exporter,\nla fenêtre se ferme. Version 1.2, Windows 11.\n\nCapture : https://exemple.fr/capture.png' });
console.log('sujet', r.status, r.json);
const tid = r.json && r.json.id;
if (tid) {
  console.log('réponse fondateur', (await F('POST', `/v1/community/forum/threads/${tid}/posts`, { body: 'Merci Alice, c\'est corrigé dans la **1.3** (voir les nouveautés). Pouvez-vous confirmer ?' })).status);
}
await new Promise((res) => setTimeout(res, 100));
console.log('sujet 2', (await F('POST', '/v1/community/forum/threads', { category: 'methodes', title: 'Comment organisez-vous vos modèles de CCTP ?', body: 'Je cherche des retours sur l\'organisation de la bibliothèque : par lot, par type d\'ouvrage, par client ?' })).status);

// Document
const pdf = Buffer.from('%PDF-1.4\n% Tutoriel Rédibat (factice)\n');
r = await F('POST', '/v1/founder/community/files', { title: 'Guide de démarrage (PDF)', description: 'Les 10 premières minutes avec Rédibat.', size: pdf.length, filename: 'guide-demarrage.pdf' });
if (r.json && r.json.id) {
  await F('POST', `/v1/founder/community/files/${r.json.id}/chunk`, undefined, pdf, { 'content-type': 'application/octet-stream', 'x-chunk-index': '0' });
  await F('POST', `/v1/founder/community/files/${r.json.id}/finalize`, {});
  console.log('document publié', (await F('POST', `/v1/founder/community/files/${r.json.id}`, { published: true })).status);
}

// Vidéo factice (ftyp, non lisible mais présente dans le catalogue)
const mp4 = Buffer.alloc(4096, 0x41); mp4.write('    ftypisom', 0, 'latin1');
r = await F('POST', '/v1/founder/community/videos', { title: 'Découvrir le module Quantitatif', description: 'Calibrage, tracé, export du métré en 8 minutes.', module: 'quantitatif', size: mp4.length, filename: 'quantitatif.mp4' });
if (r.json && r.json.id) {
  await F('POST', `/v1/founder/community/videos/${r.json.id}/chunk`, undefined, mp4, { 'content-type': 'application/octet-stream', 'x-chunk-index': '0' });
  await F('POST', `/v1/founder/community/videos/${r.json.id}/finalize`, {});
  console.log('vidéo publiée', (await F('POST', `/v1/founder/community/videos/${r.json.id}`, { published: true })).status);
}
console.log('amorçage terminé');
