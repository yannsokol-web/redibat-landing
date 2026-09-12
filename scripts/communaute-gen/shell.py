# Générateur des pages /communaute/*.html : coquille commune (head, en-tête, modale du pseudo)
# + contenu et logique propres à chaque page. Les fichiers produits sont autonomes (l'en-tête
# est dupliqué dans chacun, convention du site : pas d'include, pas de build en CI).
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent / 'communaute'
DS = '/_ds/r-dibat-design-system-740ba38c-581d-4335-88dd-fcf28913eed8'
CSP = ("default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-src 'none'; "
       "img-src 'self' data: https://api.redibat.fr; media-src https://api.redibat.fr; "
       "font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.redibat.fr")

NAV_LINKS = [
    ('home', '/communaute/', 'Accueil'),
    ('videos', '/communaute/videos', 'Vidéos'),
    ('forum', '/communaute/forum', 'Forum'),
    ('guides', '/communaute/guides', 'Guides'),
    ('news', '/communaute/nouveautes', 'Nouveautés'),
    ('downloads', '/communaute/telechargements', 'Téléchargements'),
    ('members', '/communaute/membres', 'Membres'),
]
FOUNDER_LINKS = [
    ('publish', '/communaute/publier', 'Publier'),
    ('dash', '/espace-fondateur', 'Tableau de bord'),
]

def key(p):
    return 'hdr' + p[0].upper() + p[1:]

def head(title, description, extra_head=''):
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<!-- Espace communautaire : page réservée aux comptes. Cette coquille ne contient AUCUN contenu ;
     tout vient de l'API (api.redibat.fr) après vérification de la session (cookie HttpOnly).
     CSP : médias et images depuis l'API uniquement, aucun cadre, aucune autre destination.
     'unsafe-inline'/'unsafe-eval' requis par le runtime dc. -->
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- <base href="/"> : le runtime charge vendor/react*.js en relatif ; tous les liens de cette
     page sont donc ABSOLUS (/communaute/…). -->
<base href="/">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logos/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/logos/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/logos/favicon-256.png">
<script src="/communaute/community.js?v=2"></script>{extra_head}
<script src="/support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <title>{title} | Communauté Rédibat</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="{DS}/tokens/fonts.css">
  <link rel="stylesheet" href="{DS}/tokens/colors.css">
  <link rel="stylesheet" href="{DS}/tokens/typography.css">
  <link rel="stylesheet" href="{DS}/tokens/spacing.css">
  <link rel="stylesheet" href="/communaute/community.css?v=2">
</helmet>
'''

def header():
    desk = '\n'.join(f'      <a href="{h}" class="{{{{ {key(p)} }}}}">{l}</a>' for p, h, l in NAV_LINKS)
    fdesk = '\n'.join(f'        <a href="{h}" class="{{{{ {key(p)} }}}} is-founder">{l}</a>' for p, h, l in FOUNDER_LINKS)
    mob = '\n'.join(f'        <a href="{h}" class="rdb-mobile-link">{l}</a>' for p, h, l in NAV_LINKS)
    fmob = '\n'.join(f'          <a href="{h}" class="rdb-mobile-link">{l}</a>' for p, h, l in FOUNDER_LINKS)
    return f'''
<div class="cm-page">
<sc-if value="{{{{ notReady }}}}"><div class="cm-loading">Chargement…</div></sc-if>
<sc-if value="{{{{ ready }}}}">
<header class="cm-header">
  <div class="cm-header-in">
    <a href="/communaute/" class="cm-brand" aria-label="Accueil de la communauté">
      <img src="/uploads/redibat-lockup-h.png" alt="Rédibat">
      <span class="cm-pill">Communauté</span>
    </a>
    <nav class="cm-nav" aria-label="Espace communautaire">
{desk}
      <sc-if value="{{{{ hdrIsFounder }}}}">
{fdesk}
      </sc-if>
    </nav>
    <div class="cm-spacer"></div>
    <form class="cm-search is-desktop" role="search" onSubmit="{{{{ onHdrSearch }}}}">
      <input type="search" name="q" placeholder="Rechercher" aria-label="Rechercher dans la communauté" maxlength="80">
    </form>
    <details class="cm-account">
      <summary aria-label="Mon compte"><span class="cm-avatar">{{{{ hdrInitial }}}}</span><span class="cm-account-name">{{{{ hdrName }}}}</span></summary>
      <div class="cm-account-menu">
        <a href="/communaute/profil" class="cm-menu-link">Mon profil</a>
        <button type="button" class="cm-menu-link is-danger" onClick="{{{{ onHdrLogout }}}}">Se déconnecter</button>
      </div>
    </details>
    <!-- Navigation mobile : menu déroulant natif (<details>), affiché sous 768px. Pur CSS. -->
    <details class="rdb-mobile">
      <summary class="rdb-burger" aria-label="Ouvrir le menu">
        <svg class="rdb-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="3" y1="7" x2="21" y2="7"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="17" x2="21" y2="17"></line></svg>
        <svg class="rdb-icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>
      </summary>
      <div class="rdb-mobile-panel">
        <form class="cm-search is-mobile" role="search" onSubmit="{{{{ onHdrSearch }}}}">
          <input type="search" name="q" placeholder="Rechercher" aria-label="Rechercher" maxlength="80">
        </form>
        <div class="rdb-mobile-label">Communauté</div>
{mob}
        <sc-if value="{{{{ hdrIsFounder }}}}">
          <div class="rdb-mobile-sep"></div>
          <div class="rdb-mobile-label">Fondateur</div>
{fmob}
        </sc-if>
        <div class="rdb-mobile-sep"></div>
        <a href="/communaute/profil" class="rdb-mobile-link">Mon profil ({{{{ hdrName }}}})</a>
        <button type="button" class="rdb-mobile-link" onClick="{{{{ onHdrLogout }}}}" style="width: 100%; text-align: left; border: none; background: none; cursor: pointer; color: var(--a-red);">Se déconnecter</button>
      </div>
    </details>
  </div>
</header>
<sc-if value="{{{{ banned }}}}">
  <main class="cm-main is-narrow">
    <div class="cm-alert" role="alert">Votre accès à la communauté a été suspendu. Si vous pensez qu'il s'agit d'une erreur, écrivez-nous depuis <a href="/#contact" style="color: inherit;">redibat.fr/#contact</a>.</div>
  </main>
</sc-if>
<sc-if value="{{{{ notBanned }}}}">
'''

FOOT = '''
</sc-if>
</sc-if>
<sc-if value="{{ nameOpen }}">
  <div class="cm-overlay">
    <div class="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-name-title">
      <div class="cm-modal-head"><h2 id="cm-name-title">Choisissez votre pseudo</h2></div>
      <p class="cm-lede" style="margin-bottom: 18px;">C'est le nom que verront les autres membres dans le forum et l'annuaire. Votre adresse e-mail n'est jamais affichée. Vous pourrez le changer depuis votre profil.</p>
      <form onSubmit="{{ onSubmitName }}">
        <label class="cm-field"><span>Pseudo</span><input class="cm-input" name="display_name" maxlength="30" placeholder="Ex. : Alice Métreur" autocomplete="nickname" autofocus="{{ true }}"></label>
        <p class="cm-help">3 à 30 caractères : lettres, chiffres, espaces, points, tirets ou apostrophes.</p>
        <sc-if value="{{ hasNameError }}"><div class="cm-alert" role="alert" style="margin-top: 12px;">{{ nameError }}</div></sc-if>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; flex-wrap: wrap;">
          <sc-if value="{{ nameNotForced }}"><button type="button" class="cm-btn is-ghost" onClick="{{ onLaterName }}">Plus tard</button></sc-if>
          <button type="submit" class="cm-btn">{{ nameLabel }}</button>
        </div>
      </form>
    </div>
  </div>
</sc-if>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
'''

TAIL = '''
</script>
</body>
</html>
'''

def build(name, title, description, main, script, extra_head=''):
    html = head(title, description, extra_head) + header() + main + FOOT + script + TAIL
    (ROOT / name).write_text(html)
    return html
