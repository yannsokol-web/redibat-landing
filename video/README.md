# Vidéo de présentation Rédibat

Motion design Remotion (React + TypeScript) : 16 scènes (intro + 14 + outro),
~85 s, 1920×1080 @ 30 fps, H.264. **Sans voix** — texte animé, musique de fond
et bruitages synchronisés.

**Direction artistique** (réf. « Axonaut en 1 minute ») : univers bleu vif
lumineux avec nuages flous et confettis géométriques, vraies captures de
l'app présentées en fenêtres flottantes en perspective 3D, typo blanche
punchy mot à mot, badges blancs en cascade, cartons de chapitre massifs
inclinés, flashs blancs de transition, orbite des livrables en finale.

## Démarrage

```bash
cd video
npm install
npm run studio     # prévisualisation interactive (Remotion Studio)
npm run render     # rendu MP4 1080p → out/redibat-presentation.mp4
npm run render:square   # variante 1:1 (1080×1080) pour le social
```

Équivalent direct : `npx remotion render RedibatPresentation out/redibat-presentation.mp4`.

## Structure

| Fichier | Rôle |
|---|---|
| [src/timeline.ts](src/timeline.ts) | Ordre des scènes, durées, chevauchement des fondus (15 frames), calage des bruitages |
| [src/scenes/configs.ts](src/scenes/configs.ts) | **Le fichier à éditer dans 90 % des cas** : textes, caméra, surbrillances, curseur, par scène |
| [src/scenes/CaptureScene.tsx](src/scenes/CaptureScene.tsx) | Moteur générique : fenêtre flottante, Ken Burns, anneaux, curseur, overlays spéciaux (drag fantôme, fichiers volants, coche) |
| [src/scenes/Intro.tsx](src/scenes/Intro.tsx) / [Chapter.tsx](src/scenes/Chapter.tsx) / [Outro.tsx](src/scenes/Outro.tsx) | Cartons de marque et de chapitre |
| [src/theme.ts](src/theme.ts) | Charte : couleurs navy/cyan, polices (Newsreader, Hanken Grotesk, IBM Plex Mono — chargées via Google Fonts) |
| [src/AudioTrack.tsx](src/AudioTrack.tsx) | Musique + bruitages, ducking automatique |
| [scripts/generate-audio.mjs](scripts/generate-audio.mjs) | Synthèse locale des WAV (bruitages + nappe ambient) |

## Modifier un texte

Dans `src/scenes/configs.ts`, chaque scène a `title` / `sub` / `badge` et leurs
frames d'apparition (`titleAt`, `subAt`, `badgeAt`, relatifs au début de la
scène, 30 fps). Les textes d'intro/outro/chapitres sont dans leurs fichiers
respectifs. Garder ≥ 45–60 frames de présence stable par ligne (lisibilité).

## Modifier un cadrage / une surbrillance

Toujours dans `configs.ts` : les coordonnées sont des **fractions de la
capture** (0..1, origine en haut à gauche).

- `cam` : keyframes `{f, cx, cy, s}` — centre visé + niveau de zoom.
- `highlights` : `{rect: {x,y,w,h}, from, to}` — anneau bleu + assombrissement.
- `cursor.points` : points de passage `{f, x, y}` ; `clicks` : frames de clic.
- `cascade` : pile de mini-badges blancs ancrée dans la capture
  (`{x, y, at, items: [{text, dot}]}`).

## Remplacer une capture

Déposer le nouveau PNG (même ratio ~1918×1031) dans `public/captures/` sous le
même nom (ex. `02-travail.png`), ou changer le champ `capture` de la scène.

## Audio

- **Bruitages** : `public/audio/sfx/*.wav` (whoosh, click, pop, drop, success),
  générés par `npm run audio` (synthèse locale, libre de droits par
  construction). Pour en remplacer un, écraser le WAV du même nom.
- **Musique** : `public/audio/music/ambient-bed.wav` est un **placeholder
  synthétique** (pop solaire 104 BPM : pads + arpège + pulsation douce).
  Pour votre piste libre de droits : déposer le fichier à ce
  chemin (WAV ou renommer + adapter le chemin dans `src/AudioTrack.tsx`).
  Volume de base : `MUSIC_BASE` dans `AudioTrack.tsx`. Le ducking (drop /
  validation) et les fondus d'entrée/sortie sont automatiques.
- Le calage des bruitages est dérivé automatiquement des configs de scènes
  (pop = apparition des textes, click = clics du curseur, etc.) dans
  `src/timeline.ts`.

## Ajouter / réordonner des scènes

`SCENE_LIST` dans `src/timeline.ts`. La durée totale, les débuts de scènes et
tous les calages audio sont recalculés automatiquement.

## Intégration dans le hero de la landing

Voir [hero-snippet.html](hero-snippet.html). Recommandé : poster extrait de la
vidéo (`npx remotion still RedibatPresentation assets/video-poster.jpg --frame=285`),
muet + autoplay + boucle pour le hero, son activable au clic.
