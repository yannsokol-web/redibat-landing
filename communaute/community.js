/* Espace communautaire Rédibat : socle partagé des pages /communaute/*.
 *
 * Script classique (pas de module), chargé AVANT support.js par chaque page et exposé sous
 * window.RDB. Il ne touche pas au DOM au chargement : le vérificateur CI (scripts/check-dc-pages.mjs)
 * l'évalue sous Node pour éprouver ses fonctions pures (parseLite, linkify, safeNext, formats).
 *
 * Règles de sécurité de ce fichier :
 *   - tous les appels à l'API partent avec le cookie de session (credentials: 'include') ;
 *     aucun jeton n'est jamais manipulé par le JavaScript ;
 *   - un 401 renvoie IMMÉDIATEMENT vers la page de connexion, avec l'adresse de retour ;
 *   - l'adresse de retour (?next=) n'est acceptée que si elle pointe dans l'espace
 *     communautaire ou vers l'espace fondateur (pas d'open redirect) ;
 *   - la mise en forme légère (parseLite) ne produit jamais de HTML : des blocs et des
 *     segments que les pages rendent en nœuds texte via sc-for / sc-if.
 */
(function (global) {
  'use strict';

  const RDB = {};
  const hasLocation = typeof location !== 'undefined' && location && typeof location.hostname === 'string';
  // Développement local : landing sur http://localhost:8100 et API sur http://localhost:3000
  // (même site « localhost » : le cookie SameSite=Strict est accepté).
  RDB.API_BASE = hasLocation && location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.redibat.fr';
  RDB.HOME = '/communaute/';
  RDB.LOGIN = '/espace-client';
  RDB.VERSION = '3';

  RDB.MODULES = {
    cctp: 'CCTP et DPGF',
    quantitatif: 'Quantitatif',
    estimation: 'Estimation',
    plis: 'Ouverture des plis',
    tco: 'TCO',
    rao: 'RAO',
    general: 'Général',
  };
  RDB.moduleName = function (code) { return RDB.MODULES[code] || (code ? String(code) : 'Général'); };
  RDB.moduleList = function () {
    return Object.keys(RDB.MODULES).map(function (code) { return { code: code, name: RDB.MODULES[code] }; });
  };

  // ---------------------------------------------------------------------------
  // Navigation, session, appels API
  // ---------------------------------------------------------------------------

  RDB.params = function () {
    try { return new URLSearchParams(hasLocation ? location.search : ''); } catch (_) { return new URLSearchParams(''); }
  };

  /** Adresse de retour admissible après connexion : uniquement l'espace communautaire ou fondateur. */
  RDB.safeNext = function (raw) {
    if (typeof raw !== 'string') return RDB.HOME;
    const s = raw.trim();
    if (!/^\/(communaute(\/[A-Za-z0-9._~-]*)?|espace-fondateur)(\?[A-Za-z0-9=&%._~-]*)?$/.test(s)) return RDB.HOME;
    return s;
  };

  /** Renvoie vers la connexion en mémorisant la page demandée. */
  RDB.toLogin = function () {
    if (!hasLocation) return;
    const next = location.pathname + (location.search || '');
    location.replace(RDB.LOGIN + '?next=' + encodeURIComponent(next));
  };

  /**
   * Appel API. Renvoie { status, data, headers } ; status 0 = réseau injoignable.
   * Sur 401 (sauf opts.noRedirect) : redirection vers la connexion.
   */
  RDB.api = async function (path, opts) {
    opts = opts || {};
    const init = {
      method: opts.method || 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    };
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    let resp;
    try {
      resp = await fetch(RDB.API_BASE + path, init);
    } catch (_) {
      return { status: 0, data: null, headers: null };
    }
    let data = null;
    try { data = await resp.json(); } catch (_) { data = null; }
    if (resp.status === 401 && !opts.noRedirect) RDB.toLogin();
    return { status: resp.status, data: data, headers: resp.headers };
  };

  RDB._me = null;
  /** Identité de l'appelant (mémorisée pour la page). null = redirigé vers la connexion. */
  RDB.requireSession = async function () {
    if (RDB._me) return RDB._me;
    const r = await RDB.api('/v1/me');
    if (r.status === 200 && r.data) { RDB._me = r.data; return r.data; }
    if (r.status === 401) return null;
    // Réseau ou serveur : on ne redirige pas (la page affichera l'erreur).
    return { __error: r.status };
  };

  RDB.logout = async function () {
    await RDB.api('/v1/logout', { method: 'POST', body: {}, noRedirect: true });
    RDB._me = null;
    if (hasLocation) location.replace(RDB.LOGIN);
  };

  // « Se souvenir de moi » (page de connexion) : deux clés locales, comme l'application de
  // bureau sépare la PRÉFÉRENCE du SECRET. rdb_remember vaut '0' seulement quand la case a
  // été décochée explicitement (absente = cochée par défaut) ; rdb_login_email n'existe que
  // si la case est cochée. Jamais de mot de passe ici : c'est le rôle du gestionnaire de
  // mots de passe du navigateur. Tout est en try/catch : le stockage peut être indisponible
  // (navigation privée stricte), la page doit fonctionner sans.
  const REMEMBER_KEY = 'rdb_remember';
  const EMAIL_KEY = 'rdb_login_email';
  function store() { try { return global.localStorage || null; } catch (_) { return null; } }
  RDB.rememberOn = function () {
    try { const st = store(); return !st || st.getItem(REMEMBER_KEY) !== '0'; } catch (_) { return true; }
  };
  RDB.rememberedEmail = function () {
    try { const st = store(); return (st && RDB.rememberOn() && st.getItem(EMAIL_KEY)) || ''; } catch (_) { return ''; }
  };
  /** Enregistre la préférence ; `email` (facultatif) n'est mémorisé que si la case est cochée. */
  RDB.setRemember = function (on, email) {
    try {
      const st = store(); if (!st) return;
      if (on) { st.setItem(REMEMBER_KEY, '1'); if (typeof email === 'string' && email) st.setItem(EMAIL_KEY, email.trim().slice(0, 254)); }
      else { st.setItem(REMEMBER_KEY, '0'); st.removeItem(EMAIL_KEY); }
    } catch (_) { /* stockage indisponible : la page fonctionne sans */ }
  };

  /** Téléchargement par navigation directe : le cookie part, le serveur répond en attachment. */
  RDB.goDownload = function (path) {
    if (hasLocation) location.assign(RDB.API_BASE + path);
  };

  /** Message d'erreur générique en français selon le statut et le code renvoyé. */
  RDB.errorMessage = function (status, data, fallback) {
    const code = data && data.error;
    if (status === 0) return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    if (status === 403 && code === 'community_banned') return 'Votre accès à la communauté a été suspendu.';
    if (status === 403 && code === 'csrf') return 'Requête refusée. Rechargez la page et réessayez.';
    if (status === 403) return 'Action non autorisée.';
    if (status === 404) return 'Introuvable.';
    if (status === 409 && code === 'display_name_required') return 'Choisissez d\'abord un pseudo.';
    if (status === 409 && code === 'display_name_taken') return 'Ce pseudo est déjà pris.';
    if (status === 409 && code === 'thread_locked') return 'Ce sujet est verrouillé.';
    if (status === 409 && code === 'slug_taken') return 'Cette adresse (slug) est déjà utilisée.';
    if (status === 409) return 'Action impossible dans l\'état actuel.';
    if (status === 429 && code === 'too_fast') return 'Un instant : attendez ' + ((data && data.retry_after) || 20) + ' s entre deux messages.';
    if (status === 429 && code === 'daily_limit') return 'Vous avez atteint la limite quotidienne de messages.';
    if (status === 429) return 'Trop de requêtes. Réessayez dans quelques minutes.';
    if (status === 400 && data && data.field) return 'Champ invalide : ' + data.field + '.';
    if (status === 413) return 'Contenu trop volumineux.';
    return fallback || 'Une erreur est survenue. Réessayez.';
  };

  // ---------------------------------------------------------------------------
  // Formats
  // ---------------------------------------------------------------------------

  function pad(n) { return String(n).padStart(2, '0'); }

  RDB.fmtDate = function (iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return String(iso).slice(0, 10);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  };
  RDB.fmtDateTime = function (iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return String(iso);
    return RDB.fmtDate(iso) + ' à ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };
  RDB.fmtRelative = function (iso, now) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const diff = Math.max(0, ((now || Date.now()) - d.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + ' h';
    if (diff < 172800) return 'hier';
    if (diff < 30 * 86400) return 'il y a ' + Math.floor(diff / 86400) + ' j';
    return 'le ' + RDB.fmtDate(iso);
  };
  RDB.fmtMonth = function (ym) {
    if (!ym) return '';
    const p = String(ym).slice(0, 7).split('-');
    return p.length === 2 ? p[1] + '/' + p[0] : String(ym);
  };
  RDB.fmtSize = function (bytes) {
    const n = Number(bytes);
    if (!isFinite(n) || n < 0) return '';
    if (n < 1024) return n + ' o';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' Ko';
    if (n < 1073741824) return (n / 1048576).toFixed(1).replace('.', ',') + ' Mo';
    return (n / 1073741824).toFixed(2).replace('.', ',') + ' Go';
  };
  RDB.fmtDuration = function (s) {
    const n = Number(s);
    if (!isFinite(n) || n <= 0) return '';
    const h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), sec = Math.round(n % 60);
    if (h) return h + ' h ' + pad(m);
    if (m) return m + ' min' + (sec && m < 5 ? ' ' + pad(sec) : '');
    return sec + ' s';
  };
  RDB.plural = function (n, one, many) {
    return n + ' ' + (n > 1 ? many : one);
  };

  // ---------------------------------------------------------------------------
  // Mise en forme : segments inline et blocs (jamais de HTML)
  // ---------------------------------------------------------------------------

  const URL_RE = /https?:\/\/[^\s<>"']+/g;
  function trimUrl(u) {
    // La ponctuation qui termine une phrase ne fait pas partie du lien.
    const m = /[.,;:!?)\]]+$/.exec(u);
    return m ? u.slice(0, u.length - m[0].length) : u;
  }
  function run(t, s, h) { return { t: t, s: s, h: h || '', isText: t === 'text', isLink: t === 'link', isBold: t === 'bold', isCode: t === 'code' }; }

  /** Texte brut -> segments { t:'text'|'link', s, h }. Les URL http(s) deviennent cliquables. */
  RDB.linkify = function (text) {
    const out = [];
    const src = String(text == null ? '' : text);
    let last = 0;
    let m;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(src)) !== null) {
      const url = trimUrl(m[0]);
      if (m.index > last) out.push(run('text', src.slice(last, m.index)));
      out.push(run('link', url, url));
      last = m.index + url.length;
      URL_RE.lastIndex = last;
    }
    if (last < src.length) out.push(run('text', src.slice(last)));
    if (!out.length) out.push(run('text', ''));
    return out;
  };

  const INLINE_RE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\((https?:\/\/[^)\s]+)\)|https?:\/\/[^\s<>"']+)/g;
  /** Segments inline de la mise en forme légère : **gras**, `code`, [texte](url), URL nues. */
  RDB.inline = function (text) {
    const out = [];
    const src = String(text == null ? '' : text);
    let last = 0;
    let m;
    INLINE_RE.lastIndex = 0;
    while ((m = INLINE_RE.exec(src)) !== null) {
      let tok = m[0];
      let piece;
      if (tok.startsWith('**')) piece = run('bold', tok.slice(2, -2));
      else if (tok.startsWith('`')) piece = run('code', tok.slice(1, -1));
      else if (tok.startsWith('[')) piece = run('link', tok.slice(1, tok.indexOf(']')), m[2]);
      else { tok = trimUrl(tok); piece = run('link', tok, tok); }
      if (m.index > last) out.push(run('text', src.slice(last, m.index)));
      out.push(piece);
      last = m.index + tok.length;
      INLINE_RE.lastIndex = last;
    }
    if (last < src.length) out.push(run('text', src.slice(last)));
    if (!out.length) out.push(run('text', ''));
    return out;
  };

  function block(type, extra) {
    const b = {
      type: type, isH2: type === 'h2', isH3: type === 'h3', isP: type === 'p', isUl: type === 'ul',
      isOl: type === 'ol', isCode: type === 'code', isImg: type === 'img', isVideo: type === 'video',
      runs: [], items: [], text: '', src: '', alt: '', href: '', label: '',
    };
    return Object.assign(b, extra || {});
  }

  /**
   * Mise en forme légère -> blocs. Grammaire : `## Titre`, `### Sous-titre`, `- item`, `1. item`,
   * blocs ``` ```, ligne `![alt](file:ID)` (image interne), ligne `[video:ID]` (vidéo de
   * l'espace), paragraphes séparés par une ligne vide. Aucune URL externe d'image, aucun HTML.
   */
  RDB.parseLite = function (text) {
    const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let para = [];
    let list = null;
    let code = null;
    function flushPara() {
      if (para.length) { blocks.push(block('p', { runs: RDB.inline(para.join('\n')) })); para = []; }
    }
    function flushList() {
      if (list) { blocks.push(list); list = null; }
    }
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (code) {
        if (/^```/.test(line)) { blocks.push(block('code', { text: code.join('\n') })); code = null; }
        else code.push(line);
        continue;
      }
      let m;
      if (/^```/.test(line)) { flushPara(); flushList(); code = []; continue; }
      if (!line.trim()) { flushPara(); flushList(); continue; }
      if ((m = /^(#{1,3})\s+(.+)$/.exec(line))) {
        flushPara(); flushList();
        blocks.push(block(m[1].length >= 3 ? 'h3' : 'h2', { runs: RDB.inline(m[2].trim()), text: m[2].trim() }));
        continue;
      }
      if ((m = /^!\[([^\]]*)\]\(file:(\d+)\)\s*$/.exec(line))) {
        flushPara(); flushList();
        blocks.push(block('img', { src: RDB.API_BASE + '/v1/community/files/' + m[2] + '/inline', alt: m[1] }));
        continue;
      }
      if ((m = /^\[video:(\d+)\]\s*$/.exec(line))) {
        flushPara(); flushList();
        blocks.push(block('video', { href: '/communaute/videos?v=' + m[1], label: 'Voir la vidéo' }));
        continue;
      }
      if ((m = /^\s*[-*]\s+(.+)$/.exec(line))) {
        flushPara();
        if (!list || list.type !== 'ul') { flushList(); list = block('ul'); }
        list.items.push({ runs: RDB.inline(m[1].trim()) });
        continue;
      }
      if ((m = /^\s*\d+[.)]\s+(.+)$/.exec(line))) {
        flushPara();
        if (!list || list.type !== 'ol') { flushList(); list = block('ol'); }
        list.items.push({ runs: RDB.inline(m[1].trim()) });
        continue;
      }
      flushList();
      para.push(line);
    }
    if (code) blocks.push(block('code', { text: code.join('\n') }));
    flushPara(); flushList();
    return blocks;
  };

  /** Extrait en texte brut d'un contenu en mise en forme légère (pour les listes). */
  RDB.plainText = function (text, max) {
    let s = String(text == null ? '' : text).replace(/\r\n?/g, '\n');
    s = s.replace(/```[\s\S]*?```/g, ' ').replace(/```/g, '');
    s = s.replace(/^\s{0,3}#{1,3}\s+/gm, '').replace(/^\s*(?:[-*]|\d+[.)])\s+/gm, '');
    s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[video:\d+\]/g, '');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1');
    s = s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
    s = s.replace(/\s+/g, ' ').trim();
    if (max && s.length > max) s = s.slice(0, max).replace(/\s+\S*$/, '') + '…';
    return s;
  };

  // ---------------------------------------------------------------------------
  // Badges et auteurs
  // ---------------------------------------------------------------------------

  const BADGES = {
    founder: { label: 'Fondateur', color: '#ffffff', bg: 'linear-gradient(135deg, #185fcb, #30c5ec)' },
    early: { label: 'Membre fondateur', color: '#1f6f57', bg: 'rgba(47,138,114,0.12)' },
    expert: { label: 'Expert', color: '#5b3fb5', bg: 'rgba(107,70,193,0.12)' },
    ambassador: { label: 'Ambassadeur', color: '#0b6e82', bg: 'rgba(11,114,133,0.12)' },
    contributor: { label: 'Contributeur', color: '#b7791f', bg: 'rgba(183,121,31,0.12)' },
  };
  // Badges que le fondateur délivre à la main (tableau de bord) ; les autres sont calculés.
  RDB.GRANTABLE_BADGES = ['early', 'expert', 'ambassador'];
  RDB.badges = function (codes) {
    return (Array.isArray(codes) ? codes : []).filter(function (c) { return BADGES[c]; })
      .map(function (c) { return { code: c, label: BADGES[c].label, color: BADGES[c].color, bg: BADGES[c].bg }; });
  };
  RDB.initial = function (name) {
    const s = String(name || '').trim();
    return s ? s.charAt(0).toUpperCase() : '?';
  };
  /** Vue d'un auteur pour les gabarits (pseudo, initiale, société, badges, drapeau éditeur). */
  RDB.author = function (a) {
    a = a || {};
    const name = a.display_name || 'Membre';
    return {
      name: name,
      initial: RDB.initial(name),
      company: a.company || '',
      hasCompany: !!a.company,
      isFounder: a.is_founder === true,
      badges: RDB.badges(a.badges),
      hasBadges: Array.isArray(a.badges) && a.badges.length > 0,
    };
  };

  // ---------------------------------------------------------------------------
  // Coquille commune des pages : en-tête, modale du pseudo, états
  // ---------------------------------------------------------------------------

  const PAGES = ['home', 'videos', 'forum', 'guides', 'news', 'downloads', 'members', 'publish', 'dash'];

  /** Clés de l'en-tête commun (les mêmes sur toutes les pages). */
  RDB.headerVals = function (me, active) {
    me = me || {};
    const vals = {
      hdrName: me.display_name || (me.email ? me.email.split('@')[0] : 'Membre'),
      hdrInitial: RDB.initial(me.display_name || me.email),
      hdrIsFounder: me.is_founder === true,
      onHdrSearch: RDB.onHeaderSearch,
      onHdrLogout: RDB.onHeaderLogout,
    };
    PAGES.forEach(function (p) {
      vals['hdr' + p.charAt(0).toUpperCase() + p.slice(1)] = p === active ? 'cm-link is-active' : 'cm-link';
    });
    return vals;
  };
  RDB.onHeaderSearch = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const form = e && (e.currentTarget || e.target);
    const q = form && form.q ? String(form.q.value || '').trim() : '';
    if (!q || !hasLocation) return;
    location.assign('/communaute/recherche?q=' + encodeURIComponent(q));
  };
  RDB.onHeaderLogout = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    RDB.logout();
  };

  const LATER_KEY = 'rdb_name_later';
  function askedLater() { try { return sessionStorage.getItem(LATER_KEY) === '1'; } catch (_) { return false; } }

  /**
   * Branche la modale « Choisissez votre pseudo » sur un composant de page : gestionnaires,
   * et ouverture automatique au premier accès sans pseudo (sauf report « plus tard »).
   */
  RDB.bindNameModal = function (component, options) {
    options = options || {};
    component.openName = function (forced) {
      component.setState({ nameOpen: true, nameError: '', nameForced: !!forced });
    };
    component.onLaterName = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      try { sessionStorage.setItem(LATER_KEY, '1'); } catch (_) {}
      component.setState({ nameOpen: false, nameError: '' });
    };
    component.onSubmitName = async function (e) {
      if (e && e.preventDefault) e.preventDefault();
      if (component.state.nameBusy) return;
      const form = e && (e.currentTarget || e.target);
      const value = form && form.display_name ? String(form.display_name.value || '').trim() : '';
      if (value.length < 3) { component.setState({ nameError: 'Trois caractères au minimum.' }); return; }
      component.setState({ nameBusy: true, nameError: '' });
      const r = await RDB.api('/v1/me/profile', { method: 'POST', body: { display_name: value } });
      if (r.status === 200 && r.data && r.data.me) {
        RDB._me = r.data.me;
        component.setState({ nameBusy: false, nameOpen: false, nameError: '', me: r.data.me });
        if (typeof options.onSaved === 'function') options.onSaved(r.data.me);
        return;
      }
      const msg = r.status === 400 ? 'Pseudo invalide : 3 à 30 caractères, lettres, chiffres, espaces, points ou tirets.'
        : RDB.errorMessage(r.status, r.data, 'Enregistrement impossible. Réessayez.');
      component.setState({ nameBusy: false, nameError: msg });
    };
  };
  RDB.shouldAskName = function (me) {
    return !!me && !me.display_name && !me.community_banned && !askedLater();
  };

  /** Clés communes de la coquille (à fusionner dans renderVals de chaque page). */
  RDB.shellVals = function (component, active) {
    const s = component.state || {};
    const me = s.me || {};
    const ready = s.ready === true;
    return Object.assign({
      ready: ready,
      notReady: !ready,
      banned: !!s.banned,
      notBanned: !s.banned,
      hasLoadError: !!s.loadError,
      loadError: s.loadError || '',
      nameOpen: !!s.nameOpen,
      nameNotForced: !s.nameForced,
      nameError: s.nameError || '',
      hasNameError: !!s.nameError,
      nameLabel: s.nameBusy ? 'Enregistrement…' : 'Enregistrer',
      onSubmitName: component.onSubmitName || function () {},
      onLaterName: component.onLaterName || function () {},
    }, RDB.headerVals(me, active));
  };

  /**
   * Démarrage commun d'une page : session, bannissement, modale du pseudo, puis `load()`.
   * `component.load(me)` doit renvoyer une promesse ; toute exception devient loadError.
   */
  RDB.bootPage = async function (component, options) {
    options = options || {};
    RDB.bindNameModal(component, options);
    const me = await RDB.requireSession();
    if (!me) return;
    if (me.__error !== undefined) {
      component.setState({ ready: true, loadError: 'Impossible de joindre le serveur. Rechargez la page dans un instant.' });
      return;
    }
    if (options.founderOnly && !me.is_founder) { if (hasLocation) location.replace(RDB.HOME); return; }
    const patch = { me: me, ready: true, banned: !!me.community_banned };
    if (!options.noNamePrompt && RDB.shouldAskName(me)) { patch.nameOpen = true; patch.nameForced = false; }
    component.setState(patch);
    if (me.community_banned || typeof component.load !== 'function') return;
    try {
      await component.load(me);
    } catch (err) {
      component.setState({ loadError: 'Impossible de charger cette page. Rechargez-la dans un instant.' });
    }
  };

  /** Une réponse API de chargement -> état ; 403 banni et erreurs deviennent loadError. */
  RDB.loadFailed = function (component, r) {
    if (r.status === 403 && r.data && r.data.error === 'community_banned') { component.setState({ banned: true }); return true; }
    if (r.status !== 200) { component.setState({ loadError: RDB.errorMessage(r.status, r.data, 'Impossible de charger cette page.') }); return true; }
    return false;
  };

  global.RDB = RDB;
})(typeof window !== 'undefined' ? window : globalThis);
