# Design System - Rédibat

Charte visuelle du site **redibat.fr**, extraite des pages réellement en ligne
(`index`, `a-propos`, `faq`, pages produits…). Objectif : **toute nouvelle page
part de ce dossier** et reste cohérente avec le reste du site.

> ⚠️ **Règle d'or** - Pour créer une page, **copiez `template.html`**. Ne
> reconstruisez jamais une page sur une autre base CSS. C'est ce qui avait fait
> diverger les pages légales (bâties par erreur sur `assets/css/site.css`).

## Fichiers

| Fichier | Rôle |
|---|---|
| **`template.html`** | Gabarit x-dc vierge à copier pour une nouvelle page (en-tête, fond, pied, script déjà en place). Chemins absolus → fonctionne partout. |
| **`styleguide.html`** | Référence visuelle vivante (couleurs, typo, composants). En ligne : `/design-system/styleguide`. |
| **`README.md`** | Ce document : tokens, composants, méthode, pièges. |

La **source de vérité des tokens** est le paquet du design system, chargé par
chaque page via `<helmet>` :
`_ds/r-dibat-design-system-740ba38c-581d-4335-88dd-fcf28913eed8/tokens/{fonts,colors,typography,spacing}.css`.

---

## Le système de rendu du site

Toutes les pages sont désormais en **x-dc** (`support.js`, runtime React + tokens `_ds/`) :
`index`, `cctp`, `dpgf`, `ouverture-des-plis`, `tco`, `rao`, `faq`, `a-propos`,
`espace-client`, `espace-fondateur`, `mentions-legales`, `confidentialite`, `404`.

> L'ancien gabarit statique (`assets/css/site.css` + `assets/js/site.js`, ex-pages
> `guides/*` et ancienne `404`) a été **supprimé en juillet 2026** avec les guides.

Ce design system documente **le système x-dc**.

---

## 1. Couleurs

### Surface claire (corps des pages)
Le corps des pages est **clair** (fond `#ffffff`). 

| Token | Valeur | Usage |
|---|---|---|
| `--a-panel` | `#ffffff` | cartes, panneaux |
| `--a-bg` | `#eef1f4` | fond alterné |
| `--a-navy-deep` | `#16314f` | **titres** |
| `--a-navy` | `#1f3a5c` | titres secondaires, nav |
| `--a-text` | `#3c4654` | **corps de texte** |
| `--a-muted` | `#8a94a3` | texte atténué, légendes |
| `--a-blue` | `#2f63d4` | **action / liens** |
| `--a-blue-deep` | `#2350bd` | survol de lien |
| `--a-sel` | `#e6effb` | fond de survol |
| `--a-border` | `#e3e7ec` | bordures |
| `--a-border-soft` | `#edf0f3` | filets discrets |

### Surface marketing (pied de page, héros sombres)
| Token | Valeur | Usage |
|---|---|---|
| `--marine-900` / `--marine-800` | `oklch(0.18…)` / `oklch(0.235…)` | dégradé du **pied de page** |
| `--brand-grad` | `linear-gradient(135deg,#0b317c,#185fcb,#30c5ec)` | **CTA**, pastilles |
| `--brand-cyan` | `#30c5ec` | pointe du dégradé |
| `--cyan` | `oklch(0.80 0.115 224)` | **survol** sur fond sombre |
| `--text-soft` | `#a6bdd6` | texte sur fond sombre |
| `--text-faint` | `#6c84a1` | labels sur fond sombre |
| `--line` | `rgba(150,195,240,.085)` | filet sur fond sombre |

## 2. Typographie

| Famille | Token | Usage |
|---|---|---|
| **Newsreader** (serif) | `--display` | Titres. Poids 500, `letter-spacing:-.02em`. Emphase en *italique* avec dégradé `text`. |
| **Hanken Grotesk** | `--body` | Corps, lede, UI. |
| **IBM Plex Mono** | `--mono` | Eyebrows, labels, mentions (`letter-spacing:.14-.18em; text-transform:uppercase`). |

Échelle : `--fs-hero` clamp(2.6rem, 6.2vw, 4.3rem) · `--fs-h2` clamp(2rem, 4vw,
2.8rem) · `--fs-h3` 1.24rem · `--fs-lead` clamp(1.05rem, 2vw, 1.2rem) ·
`--fs-body` 1rem · eyebrow ~12px. Interligne corps `--lh-body` 1.6.

## 3. Espacements, rayons, ombres, motion

- **Largeurs** : `--wrap` 1200px · `--wrap-narrow` 1060px · `--gutter` 32px. Contenu lu : 760-820px.
- **Rayons** : `--r-sm` 8px · `--r-xl` 14px · cartes 16-18px · `--r-pill` 100px (badges, CTA).
- **Ombres** : cartes `0 20px 50px -30px rgba(31,58,92,.3)` · CTA `0 8px 22px -8px rgba(24,95,203,.55)`.
- **Motion** : `--dur-med` .18s · `--ease-out` cubic-bezier(.2,.8,.2,1). Respecter `prefers-reduced-motion`.

---

## Composants (extraits à copier)

**Eyebrow / kicker**
```html
<div style="font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--a-blue);">Eyebrow</div>
```

**Titre héros (avec emphase dégradée)**
```html
<h1 style="font-family:'Newsreader',Georgia,serif;font-weight:500;letter-spacing:-.028em;line-height:1.06;font-size:clamp(36px,5.4vw,60px);color:#16314f;">Titre <em style="font-style:italic;font-weight:500;background:linear-gradient(100deg,#185fcb,#30c5ec) text;-webkit-text-fill-color:transparent;color:transparent;">accentué</em></h1>
```

**CTA principal (pilule dégradée)** - le survol passe par `style-hover` (voir Conventions)
```html
<a href="/#contact" style="display:inline-flex;align-items:center;text-decoration:none;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#0b317c 0%,#185fcb 55%,#30c5ec 100%);padding:14px 28px;border-radius:100px;box-shadow:0 8px 22px -8px rgba(24,95,203,0.55);transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;" style-hover="transform:translateY(-1px);filter:brightness(1.06);box-shadow:0 12px 30px -8px rgba(24,95,203,0.7);">Appel à l'action</a>
```

**Carte**
```html
<div style="background:#fff;border:1px solid var(--a-border);border-radius:18px;padding:clamp(28px,4vw,48px);box-shadow:0 20px 50px -30px rgba(31,58,92,0.3);">…</div>
```

Le **styleguide** (`styleguide.html`) rend ces composants en vrai - ouvrez-le pour voir.

---

## Créer une nouvelle page

1. **Copier** `design-system/template.html` à la racine → `ma-page.html`.
2. Renseigner les `<!-- TODO -->` du `<head>` : `title`, `description`, `canonical`, `og:*`, `robots`.
3. Remplacer le contenu de `<main>` (composants ci-dessus / styleguide).
4. **Ne pas toucher** à l'en-tête, au fond marine ni au pied de page.
5. GitHub Pages sert `ma-page.html` en URL propre `/ma-page` (déjà le cas pour toutes les pages).
6. Ajouter la page à `sitemap.xml` si elle est `index, follow`.

---

## Conventions x-dc (à connaître)

- **Runtime** : `support.js` compile le gabarit `<x-dc>…</x-dc>` en React. Le `<helmet>` est déplacé dans le `<head>` (tokens + polices). Un `Component` minimal (`renderVals(){return {}}`) suffit pour une page statique.
- **`style-hover` / `style-focus`** : attributs personnalisés convertis en vraies classes CSS par le runtime. **Indispensables pour les survols** - un `:hover` inline classique n'existe pas. Ils ne fonctionnent QUE via le runtime x-dc.
- **`class` / `for` / `on*`** : écrits normalement, le runtime les convertit (`className`, `htmlFor`, `onClick`…).
- **Blocs `<style>` du `<head>`** : ce sont de vraies feuilles de style (les media queries fonctionnent). C'est là que vivent le dropdown « Produits » et le menu burger mobile (`<details>`, pur CSS).
- **Pas d'interpolation** `{{ }}` dans une page statique (sinon le runtime tente de résoudre des variables).

## Pièges

- **En-tête dupliqué sur toutes les pages x-dc** (y compris `404.html`) : l'en-tête/pied n'est pas partagé par include - il est **copié à l'identique** dans chaque page. Une modif d'en-tête doit être répliquée partout (ou repartir de `template.html`).
- **`style-hover` sans runtime = pas de survol** : ne pas transposer ces pages en HTML statique sans `support.js`.
- **Chemins & `<base href="/">`** : `support.js` charge `vendor/react*.js` en chemin **relatif au document**. Une page servie **hors racine** (ex. `/design-system/`) le chercherait donc dans `/design-system/vendor/` → 404, et **React ne démarrerait pas** (contenu affiché en brut, tokens et `style-hover` inactifs). `template.html` et `styleguide.html` incluent donc `<base href="/">` (+ chemins absolus `/support.js`, `/_ds/…`, `/uploads/…`). À la racine, `<base href="/">` est neutre : une page copiée à la racine marche avec ou sans.
