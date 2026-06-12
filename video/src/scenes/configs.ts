/**
 * Configuration déclarative des scènes « capture » : caméra (Ken Burns),
 * surbrillances, curseur, textes et bruitages spécifiques.
 *
 * Toutes les coordonnées sont des FRACTIONS de la capture (0..1, origine en
 * haut à gauche). Les frames sont relatives au début de la scène (30 fps).
 * Pour ajuster un cadrage : modifier les keyframes `cam` (cx/cy = centre
 * visé, s = niveau de zoom).
 */

export type Rect = {x: number; y: number; w: number; h: number};
export type CamKey = {f: number; cx: number; cy: number; s: number};

export type SfxName = 'whoosh' | 'click' | 'pop' | 'drop' | 'success';

export type SceneConfig = {
  key: string;
  capture: string;
  duration: number;
  cam: CamKey[];
  title: string;
  titleAt: number;
  sub?: string;
  subAt?: number;
  badge?: string;
  badgeAt?: number;
  /** Anneaux de surbrillance (avec assombrissement du reste). */
  highlights?: {rect: Rect; from: number; to: number}[];
  /** Étiquettes-pastilles ancrées dans la capture. */
  labels?: {text: string; x: number; y: number; at: number}[];
  /** Curseur simulé : points de passage + frames de clic. */
  cursor?: {points: {f: number; x: number; y: number}[]; clicks?: number[]};
  /** Cascade de mini-badges blancs ancrée dans la capture (réf. Axonaut). */
  cascade?: {x: number; y: number; at: number; items: {text: string; dot: string}[]};
  /** Bruitages additionnels propres à la scène (drop, validation…). */
  extraSfx?: {file: SfxName; at: number; volume?: number; duck?: boolean}[];
};

export type ChapterConfig = {
  key: string;
  duration: number;
  num: string;
  title: string;
  capture: string;
  focus: {cx: number; cy: number};
  tint: 'blue' | 'cyan';
};

export const CHAPTER_EDITION: ChapterConfig = {
  key: 'ch-edition',
  duration: 120,
  num: '01',
  title: 'Édition CCTP',
  capture: '01-accueil.png',
  focus: {cx: 0.26, cy: 0.28},
  tint: 'blue',
};

export const CHAPTER_ANALYSE: ChapterConfig = {
  key: 'ch-analyse',
  duration: 120,
  num: '02',
  title: 'Analyse des offres',
  capture: '01-accueil.png',
  focus: {cx: 0.575, cy: 0.28},
  tint: 'cyan',
};

export const CAPTURE_SCENES: SceneConfig[] = [
  // 1 — Page d'accueil ------------------------------------------------------
  {
    key: 's1-accueil',
    capture: '01-accueil.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.04},
      {f: 55, cx: 0.5, cy: 0.48, s: 1.06},
      {f: 130, cx: 0.33, cy: 0.295, s: 1.42},
      {f: 180, cx: 0.345, cy: 0.295, s: 1.45},
    ],
    title: 'Vos affaires, votre bibliothèque, vos modèles — réunis.',
    titleAt: 18,
    cursor: {
      points: [
        {f: 52, x: 0.1, y: 0.55},
        {f: 80, x: 0.08, y: 0.285},
        {f: 108, x: 0.2, y: 0.285},
        {f: 136, x: 0.305, y: 0.285},
        {f: 172, x: 0.575, y: 0.285},
      ],
    },
  },
  // 3 — Page de travail -----------------------------------------------------
  {
    key: 's3-travail',
    capture: '02-travail.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.04},
      {f: 65, cx: 0.5, cy: 0.47, s: 1.07},
      {f: 172, cx: 0.48, cy: 0.44, s: 1.16},
    ],
    title: 'Un espace de travail clair',
    titleAt: 16,
    labels: [
      {text: 'Bibliothèque', x: 0.098, y: 0.083, at: 64},
      {text: "Articles de l'affaire", x: 0.145, y: 0.2, at: 82},
      {text: 'Éditeur', x: 0.64, y: 0.16, at: 100},
    ],
  },
  // 4 — Drag & drop depuis la bibliothèque ----------------------------------
  {
    key: 's4-dragdrop',
    capture: '03-bibliotheque.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.06},
      {f: 48, cx: 0.295, cy: 0.47, s: 1.42},
      {f: 140, cx: 0.295, cy: 0.47, s: 1.42},
      {f: 180, cx: 0.32, cy: 0.48, s: 1.36},
    ],
    title: 'Glissez-déposez vos articles',
    titleAt: 16,
    badge: 'Bibliothèque personnalisable',
    badgeAt: 132,
    cursor: {
      points: [
        {f: 38, x: 0.2, y: 0.6},
        {f: 56, x: 0.13, y: 0.42},
        {f: 62, x: 0.13, y: 0.42},
        {f: 118, x: 0.405, y: 0.555},
        {f: 132, x: 0.405, y: 0.555},
        {f: 168, x: 0.44, y: 0.62},
      ],
      clicks: [58],
    },
    highlights: [{rect: {x: 0.27, y: 0.515, w: 0.27, h: 0.085}, from: 122, to: 165}],
    extraSfx: [{file: 'drop', at: 120, duck: true}],
  },
  // 5 — Page de garde -------------------------------------------------------
  {
    key: 's5-garde',
    capture: '04-page-garde.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.5, cy: 0.47, s: 1.18},
      {f: 50, cx: 0.31, cy: 0.45, s: 1.62},
      {f: 95, cx: 0.31, cy: 0.45, s: 1.62},
      {f: 140, cx: 0.6, cy: 0.5, s: 1.42},
      {f: 180, cx: 0.6, cy: 0.5, s: 1.45},
    ],
    title: 'Page de garde personnalisable',
    titleAt: 16,
    badge: 'Aperçu en temps réel',
    badgeAt: 118,
    highlights: [
      {rect: {x: 0.208, y: 0.13, w: 0.205, h: 0.62}, from: 50, to: 100},
      {rect: {x: 0.468, y: 0.155, w: 0.26, h: 0.69}, from: 122, to: 172},
    ],
  },
  // 6 — Mise en forme -------------------------------------------------------
  {
    key: 's6-miseenforme',
    capture: '05-mise-en-forme.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.16},
      {f: 48, cx: 0.43, cy: 0.42, s: 1.56},
      {f: 95, cx: 0.43, cy: 0.42, s: 1.56},
      {f: 140, cx: 0.655, cy: 0.45, s: 1.5},
      {f: 180, cx: 0.655, cy: 0.45, s: 1.53},
    ],
    title: 'Mise en forme sur mesure',
    titleAt: 16,
    badge: 'Aperçu live',
    badgeAt: 118,
    highlights: [
      {rect: {x: 0.3, y: 0.12, w: 0.25, h: 0.58}, from: 48, to: 100},
      {rect: {x: 0.557, y: 0.1, w: 0.215, h: 0.74}, from: 122, to: 172},
    ],
  },
  // 7 — Contacts ------------------------------------------------------------
  {
    key: 's7-contacts',
    capture: '06-contacts.png',
    duration: 150,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.12},
      {f: 42, cx: 0.31, cy: 0.43, s: 1.48},
      {f: 80, cx: 0.31, cy: 0.43, s: 1.48},
      {f: 118, cx: 0.53, cy: 0.42, s: 1.4},
      {f: 150, cx: 0.53, cy: 0.42, s: 1.43},
    ],
    title: 'Contacts intégrés & personnalisables',
    titleAt: 16,
    cascade: {
      x: 0.6,
      y: 0.49,
      at: 100,
      items: [
        {text: "Maître d'ouvrage", dot: '#185fcb'},
        {text: 'Architecte', dot: '#30c5ec'},
        {text: 'Économiste · BET', dot: '#34c98e'},
      ],
    },
    cursor: {
      points: [
        {f: 40, x: 0.29, y: 0.3},
        {f: 66, x: 0.29, y: 0.43},
        {f: 84, x: 0.295, y: 0.537},
        {f: 92, x: 0.295, y: 0.537},
        {f: 122, x: 0.5, y: 0.42},
      ],
      clicks: [86],
    },
    highlights: [
      {rect: {x: 0.238, y: 0.235, w: 0.115, h: 0.55}, from: 40, to: 80},
      {rect: {x: 0.35, y: 0.225, w: 0.375, h: 0.43}, from: 96, to: 145},
    ],
  },
  // 8 — Rapport de complétude ----------------------------------------------
  {
    key: 's8-completude',
    capture: '07-completude.png',
    duration: 165,
    cam: [
      {f: 0, cx: 0.5, cy: 0.49, s: 1.14},
      {f: 42, cx: 0.46, cy: 0.42, s: 1.42},
      {f: 88, cx: 0.46, cy: 0.42, s: 1.42},
      {f: 128, cx: 0.72, cy: 0.45, s: 1.55},
      {f: 165, cx: 0.72, cy: 0.45, s: 1.58},
    ],
    title: 'Rapport de complétude',
    titleAt: 16,
    sub: 'Vérifié avant génération',
    subAt: 96,
    highlights: [
      {rect: {x: 0.185, y: 0.345, w: 0.655, h: 0.05}, from: 46, to: 92},
      {rect: {x: 0.75, y: 0.2, w: 0.095, h: 0.58}, from: 126, to: 160},
    ],
  },
  // 9 — Génération CCTP Word / PDF -----------------------------------------
  {
    key: 's9-generation',
    capture: '08-generation-cctp.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.52, cy: 0.48, s: 1.22},
      {f: 45, cx: 0.46, cy: 0.68, s: 1.62},
      {f: 110, cx: 0.46, cy: 0.68, s: 1.62},
      {f: 150, cx: 0.55, cy: 0.6, s: 1.4},
      {f: 180, cx: 0.55, cy: 0.6, s: 1.42},
    ],
    title: 'Génération CCTP',
    titleAt: 16,
    sub: 'Word ou PDF, en un clic',
    subAt: 40,
    cascade: {
      x: 0.545,
      y: 0.615,
      at: 52,
      items: [
        {text: 'Word · .docx', dot: '#185fcb'},
        {text: 'PDF · .pdf', dot: '#c23b2e'},
        {text: 'DPGF · .xlsx', dot: '#1d6f42'},
      ],
    },
    highlights: [{rect: {x: 0.345, y: 0.63, w: 0.185, h: 0.17}, from: 46, to: 92}],
    cursor: {
      points: [
        {f: 42, x: 0.46, y: 0.56},
        {f: 68, x: 0.368, y: 0.668},
        {f: 78, x: 0.368, y: 0.668},
        {f: 102, x: 0.655, y: 0.8},
        {f: 112, x: 0.655, y: 0.8},
        {f: 140, x: 0.62, y: 0.74},
      ],
      clicks: [70, 104],
    },
    extraSfx: [{file: 'success', at: 112, duck: true}],
  },
  // 10 — Génération DPGF ----------------------------------------------------
  {
    key: 's10-dpgf',
    capture: '09-dpgf.png',
    duration: 180,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.16},
      {f: 45, cx: 0.385, cy: 0.38, s: 1.52},
      {f: 92, cx: 0.385, cy: 0.38, s: 1.52},
      {f: 138, cx: 0.62, cy: 0.43, s: 1.4},
      {f: 180, cx: 0.62, cy: 0.43, s: 1.43},
    ],
    title: 'DPGF généré',
    titleAt: 16,
    badge: 'Aperçu en direct',
    badgeAt: 120,
    highlights: [
      {rect: {x: 0.3, y: 0.125, w: 0.165, h: 0.5}, from: 45, to: 96},
      {rect: {x: 0.465, y: 0.095, w: 0.315, h: 0.71}, from: 122, to: 172},
    ],
  },
  // 12 — Tableau d'ouverture des plis ---------------------------------------
  {
    key: 's12-plis',
    capture: '10-plis-ouverture.png',
    duration: 225,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.06},
      {f: 32, cx: 0.18, cy: 0.8, s: 1.7},
      {f: 105, cx: 0.18, cy: 0.8, s: 1.7},
      {f: 148, cx: 0.6, cy: 0.5, s: 1.18},
      {f: 185, cx: 0.86, cy: 0.5, s: 1.5},
      {f: 225, cx: 0.86, cy: 0.5, s: 1.52},
    ],
    title: 'Devis Excel & PDF importés',
    titleAt: 16,
    sub: "Tableau d'ouverture organisé automatiquement",
    subAt: 132,
    highlights: [
      {rect: {x: 0.008, y: 0.9, w: 0.24, h: 0.07}, from: 36, to: 96},
      {rect: {x: 0.9, y: 0.205, w: 0.068, h: 0.7}, from: 188, to: 220},
    ],
    extraSfx: [
      {file: 'drop', at: 72, volume: 0.55},
      {file: 'drop', at: 92, duck: true},
      {file: 'whoosh', at: 118, volume: 0.25},
    ],
  },
  // 13 — Récap ----------------------------------------------------------------
  {
    key: 's13-recap',
    capture: '11-plis-recap.png',
    duration: 150,
    cam: [
      {f: 0, cx: 0.5, cy: 0.45, s: 1.1},
      {f: 40, cx: 0.58, cy: 0.45, s: 1.3},
      {f: 85, cx: 0.58, cy: 0.45, s: 1.3},
      {f: 125, cx: 0.83, cy: 0.5, s: 1.45},
      {f: 150, cx: 0.83, cy: 0.5, s: 1.47},
    ],
    title: 'Récapitulatif automatique',
    titleAt: 16,
    sub: "depuis le tableau d'ouverture",
    subAt: 40,
    highlights: [{rect: {x: 0.793, y: 0.26, w: 0.14, h: 0.56}, from: 118, to: 148}],
  },
  // 14 — TCO -------------------------------------------------------------------
  {
    key: 's14-tco',
    capture: '12-tco.png',
    duration: 195,
    cam: [
      {f: 0, cx: 0.5, cy: 0.5, s: 1.06},
      {f: 28, cx: 0.18, cy: 0.8, s: 1.64},
      {f: 95, cx: 0.18, cy: 0.8, s: 1.64},
      {f: 138, cx: 0.7, cy: 0.32, s: 1.42},
      {f: 168, cx: 0.7, cy: 0.32, s: 1.42},
      {f: 195, cx: 0.62, cy: 0.45, s: 1.22},
    ],
    title: 'TCO',
    titleAt: 16,
    sub: 'DPGF entreprises intégrés — PDF & Excel',
    subAt: 38,
    badge: 'Aperçu live',
    badgeAt: 160,
    highlights: [
      {rect: {x: 0.008, y: 0.9, w: 0.24, h: 0.07}, from: 30, to: 88},
      {rect: {x: 0.572, y: 0.21, w: 0.42, h: 0.07}, from: 135, to: 185},
    ],
    extraSfx: [
      {file: 'drop', at: 66, volume: 0.55},
      {file: 'drop', at: 84, duck: true},
    ],
  },
];
