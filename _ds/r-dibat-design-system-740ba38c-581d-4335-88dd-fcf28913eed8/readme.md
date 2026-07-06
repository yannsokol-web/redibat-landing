# Rédibat — Design System

A design system for **Rédibat**, a Windows desktop application for construction (BTP) professionals — *maîtres d'œuvre*, *bureaux d'études*, *économistes de la construction*. Rédibat helps them **write CCTP** (Cahiers des Clauses Techniques Particulières) and **analyse price offers** (DPGF, TCO, ouverture des plis).

The surface this system is built for is the **public landing page** (presentation + download/trial) — a sober, premium, modern-SaaS marketing page (think Linear / Stripe) deliberately opposed to the dated look of legacy BTP software. The system also captures the **light desktop-product surface** so mockups of the app itself stay on-brand.

> **Two surfaces, one brand.** The marketing site is a **dark navy "blueprint" surface**; the product is a **light Windows surface**. Both share the navy→cyan brand gradient and the three typefaces. Tokens for each are namespaced (`--marine-*` / `--text-*` for dark, `--a-*` for the app).

---

## Sources

Everything here was reverse-engineered from real, production assets — not invented.

- **GitHub — production landing page (source of truth):** [`yannsokol-web/redibat-landing`](https://github.com/yannsokol-web/redibat-landing). The single `index.html` is the canonical reference for colours (oklch navy scale, brand gradient), type (Newsreader / Hanken Grotesk / IBM Plex Mono), the blueprint grid + glow background, registration-corner frames, feature cards and the interactive app mockup. Explore it further to extend this system faithfully.
- **GitHub — related product:** [`yannsokol-web/EDITEUR2PDF`](https://github.com/yannsokol-web/EDITEUR2PDF) (a PDF editor; not used here but part of the same author's stack).
- **Brand assets (uploaded):** logo lockups (horizontal/vertical, on-light & on-dark), app icon set (16→512, `.png`/`.ico`), favicons.
- **Product screenshots (uploaded):** real captures of the Windows app — *Accueil*, *Page de travail*, *Bibliothèque*, *Page de garde*, génération CCTP/DPGF/TCO, ouverture des plis. Stored in `assets/screens/`.

Publisher: **YSCORP** · site: redibat.fr

---

## Content fundamentals

**Language:** French (`fr-FR`), B2B, addressed to construction professionals who want to **save time**.

**Tone:** professional, expert, reassuring. Clear and concrete — *no hollow marketing jargon*. The promise is method and control, not hype.

**Voice & address:** speaks to the reader with **vous** ("structurez vos affaires", "rédigez vos descriptifs", "capitalisez votre bibliothèque"). Verbs are imperative and action-led. The product is described plainly: "Une application de bureau pour les professionnels du bâtiment".

**Casing:**
- Headlines — sentence case, serif, with a single italic gradient word for emphasis ("rédigés avec *méthode*").
- Eyebrows, labels, badges, buttons, footer — **UPPERCASE mono**, letter-spaced (e.g. `LOGICIEL DE RÉDACTION DE CCTP`, `BIENTÔT DISPONIBLE`, `ESPACE CLIENT — TÉLÉCHARGER`).
- Body — normal sentence case.

**Domain vocabulary (use correctly):** CCTP, DPGF, TCO, lots, articles, affaire, bibliothèque, maître d'œuvre, ouverture des plis, page de garde. Acronyms stay uppercase.

**Emoji:** none. **Punctuation flourishes:** a mono "▸" tick and "—" em-dashes for asides; a pulsing dot for status. Numbers are used sparingly and only when concrete (e.g. feature indices `01–04`). No invented stats.

**Examples (verbatim from production):**
- H1: *"Vos cahiers des clauses techniques, rédigés avec méthode."*
- Lead: *"Une application de bureau pour les professionnels du bâtiment : structurez vos affaires par lots et articles, rédigez vos descriptifs plus facilement et capitalisez votre bibliothèque — sans jamais perdre la main sur vos données."*
- CTA note: *"Réservé aux clients disposant d'un compte."*
- Audience line: *"Conçu pour les maîtres d'œuvre, bureaux d'études, économistes de la construction et entreprises du BTP."*

---

## Visual foundations

**Overall feeling:** sober, premium, lots of breathing room, strong typographic hierarchy. Engineered/"blueprint" precision rather than decoration.

**Colour:**
- Marketing surface is **dark navy** — an oklch `--marine-*` ramp (≈ `oklch(0.15–0.34 …)`), background defaults to `--marine-800`.
- One signature gradient everywhere: **navy → mid-blue → cyan** `linear-gradient(135deg, #0b317c, #185fcb, #30c5ec)`. Used on the primary CTA and, as a text-clip variant, on the one emphasised hero word.
- Accents are cool: a brand blue `--accent` and a bright cyan `--accent-bright` / `--cyan`.
- Text ramp on dark: `--text` (#EAF2FB) → `--text-soft` → `--text-faint` → `--text-dim`.
- The **app surface is light**: warm-neutral greys (`--a-bg` #EEF1F4, white panels), navy headings (#1F3A5C), a functional blue (`--a-blue` #2F63D4), plus teal (success/date) and red (destructive / format marks).

**Type:** three families, all Google Fonts.
- **Newsreader** (serif) — display/headings, weight **400** (set light), `letter-spacing: -0.022em`, italic for emphasis.
- **Hanken Grotesk** — body & UI, line-height 1.6.
- **IBM Plex Mono** — eyebrows, labels, badges, buttons, coordinates, captions; uppercase, letter-spaced.
- **Segoe UI** — only inside app/product mockups (native Windows).

**Background system:** a fixed **58 px blueprint grid** (`--line` hairlines) masked by a radial gradient so it fades at the edges, layered over **soft radial brand glows** (navy + cyan) and a vertical marine gradient. No images or photos in the marketing chrome — the texture is all CSS.

**Frames & media:** product screenshots and the app mockup sit in a **Frame** with four **technical registration corner marks** (L-shaped brackets, `--accent-line`) and a soft brand-tinted glow shadow (`--shadow-frame`). Moderate radius (16 px).

**Cards:** marketing cards have a 1 px translucent border (`--card-border`), a near-transparent fill (`--card` ≈ 2% white), radius 14 px; on hover they **lift 4 px**, the border warms to cyan, and a faint radial glow fades in from the top. Light app cards are white with a hairline border, radius 12–14 px, a very soft shadow, and a blue underline that reveals on hover.

**Buttons:**
- Marketing primary — gradient **pill** (radius 100 px), mono uppercase, soft glow; hover lifts 1 px + brightens + larger glow.
- App primary ("Générer") — vertical blue gradient, radius 9 px, subtle shadow; hover brightens, active nudges down 1 px.

**Borders & radii:** thin hairlines only (no heavy rules, no relief). Radii are moderate — `8 / 9 / 12 / 14 / 16` px — pills (100 px) reserved for badges and CTAs.

**Shadows:** soft and diffuse. On dark, shadows are **glows** tinted with brand colour. On light, low-elevation, low-opacity navy shadows. Never harsh or beveled.

**Motion:** content **rises in** (`translateY(18px)` → 0, opacity 0 → 1) over ~0.85 s on `cubic-bezier(0.2,0.8,0.2,1)`, staggered with `.d1`–`.d7` delays. Hover transitions are fast (0.15–0.35 s). One ambient loop only: the status badge's pulsing dot. Everything respects `prefers-reduced-motion: reduce` (animations off, smooth-scroll off).

**Transparency & blur:** translucent surfaces (2–3% white) and `backdrop-filter: blur(6px)` on badges/secondary buttons against the textured background. Used sparingly.

**Layout:** centred wraps — `--wrap` 1200 / `--wrap-narrow` 1060 / `--wrap-wide` 1460 px — 32 px gutters, generous vertical rhythm. The background grid + glow are `position: fixed`. Imagery is cool-toned (the navy product UI itself); no stock photography.

---

## Iconography

- **Inline SVG, 24×24, stroke-based** (`stroke-width` ≈ 1.5–1.7, `fill="none"`, round caps/joins) — a Lucide/Feather-style line set, drawn inline. This is the brand's icon language across both the landing page and the app mockup (download arrow, folder, document, grid, image, gear, plus, chevron, search, save).
- A few **filled** glyphs for emphasis: the lightning bolt on "Générer", the status dots.
- **No icon font, no sprite sheet** in the source — icons are hand-written SVG paths per use. When you need an icon not already present, use **[Lucide](https://lucide.dev)** (matching stroke weight) so the set stays consistent. *(Flagged substitution: Lucide is the nearest match to the bespoke inline set; the originals are not packaged as a library.)*
- **No emoji**, no unicode pictographs. The only non-icon glyphs are the mono "▸" caption tick and "×" close marks.
- **Logos** live in `assets/`: `redibat-lockup-h(.png)` / `-h-white`, `-v` / `-v-white` (horizontal & vertical, light/dark), plus the app-icon set (`redibat-icon-64/128/256/512.png`) — a navy→cyan squircle with a bold white "R".

---

## Index / manifest

**Root**
- `styles.css` — the consumer entry point (an `@import` manifest only).
- `tokens/` — `fonts.css` (Google Fonts), `colors.css`, `typography.css`, `spacing.css` (radii, shadows, motion).
- `assets/` — logos, app icons, `logo-redibat.webp`, and `assets/screens/` product captures.
- `SKILL.md` — Agent-Skill wrapper.

**Foundation cards** (`guidelines/*.card.html`) — Design System tab specimens: brand gradient, marine scale, accents & text, app surface; Newsreader / Hanken / mono type; radii, shadows, spacing scale; logos, app icon, blueprint motifs.

**Components** (`components/`)
- `core/` (marketing, dark surface) — **Button**, **Badge**, **Eyebrow**, **FeatureCard**, **Frame**.
- `app/` (light Windows surface) — **AppButton**, **AppCard**.

Mount components via the compiled bundle: `const { Button } = window.RDibatDesignSystem_740ba3` after `<script src=".../_ds_bundle.js">`.

**UI kit** (`ui_kits/landing/`) — the marketing landing page recreated from the production source (`index.html` + `Header`/`Hero`/`Showcase`/`Features`/`SiteFooter` JSX). Also registered as a Starting Point.

> **Extend faithfully:** the production landing page at [`yannsokol-web/redibat-landing`](https://github.com/yannsokol-web/redibat-landing) is the reference. When in doubt about a value or treatment, read it there.
