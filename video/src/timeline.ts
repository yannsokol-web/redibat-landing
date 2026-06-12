/**
 * Montage : ordre des scènes, durées, chevauchement des transitions et
 * calage de tous les bruitages sur des frames absolues.
 */
import {
  CAPTURE_SCENES,
  CHAPTER_ANALYSE,
  CHAPTER_EDITION,
  ChapterConfig,
  SceneConfig,
  SfxName,
} from './scenes/configs';

/** Chevauchement (frames) des fondus enchaînés entre scènes. */
export const OVERLAP = 15;
export const FPS = 30;

export type SceneEntry =
  | {kind: 'intro'; key: 'intro'; duration: number}
  | {kind: 'outro'; key: 'outro'; duration: number}
  | {kind: 'chapter'; key: string; duration: number; chapter: ChapterConfig}
  | {kind: 'capture'; key: string; duration: number; config: SceneConfig};

const cap = (key: string): SceneEntry => {
  const config = CAPTURE_SCENES.find((c) => c.key === key);
  if (!config) throw new Error(`Scène inconnue : ${key}`);
  return {kind: 'capture', key, duration: config.duration, config};
};

export const SCENE_LIST: SceneEntry[] = [
  {kind: 'intro', key: 'intro', duration: 120},
  cap('s1-accueil'),
  {kind: 'chapter', key: CHAPTER_EDITION.key, duration: CHAPTER_EDITION.duration, chapter: CHAPTER_EDITION},
  cap('s3-travail'),
  cap('s4-dragdrop'),
  cap('s5-garde'),
  cap('s6-miseenforme'),
  cap('s7-contacts'),
  cap('s8-completude'),
  cap('s9-generation'),
  cap('s10-dpgf'),
  {kind: 'chapter', key: CHAPTER_ANALYSE.key, duration: CHAPTER_ANALYSE.duration, chapter: CHAPTER_ANALYSE},
  cap('s12-plis'),
  cap('s13-recap'),
  cap('s14-tco'),
  {kind: 'outro', key: 'outro', duration: 270},
];

/** Frame absolue de début de chaque scène (chevauchement déduit). */
export const SCENE_STARTS: number[] = SCENE_LIST.reduce<number[]>((acc, _s, i) => {
  if (i === 0) return [0];
  const prev = SCENE_LIST[i - 1];
  acc.push(acc[i - 1] + prev.duration - OVERLAP);
  return acc;
}, []);

export const TOTAL_DURATION =
  SCENE_STARTS[SCENE_LIST.length - 1] + SCENE_LIST[SCENE_LIST.length - 1].duration;

/* --------------------------------------------------------------- audio -- */

export type SfxEvent = {file: SfxName; frame: number; volume: number; duck?: boolean};

const buildSfx = (): SfxEvent[] => {
  const events: SfxEvent[] = [];
  const push = (file: SfxName, frame: number, volume: number, duck?: boolean) => {
    if (frame >= 0 && frame < TOTAL_DURATION - 5) events.push({file, frame, volume, duck});
  };

  SCENE_LIST.forEach((scene, i) => {
    const start = SCENE_STARTS[i];

    // Whoosh de transition : marqué pour les changements d'ambiance,
    // discret pour les enchaînements de fonctionnalités.
    if (i > 0) {
      const big =
        scene.kind === 'chapter' ||
        scene.kind === 'outro' ||
        SCENE_LIST[i - 1].kind === 'intro' ||
        SCENE_LIST[i - 1].kind === 'chapter';
      push('whoosh', Math.max(0, start - 4), big ? 0.5 : 0.22);
    }

    if (scene.kind === 'intro') {
      push('pop', start + 8, 0.45);
      push('pop', start + 22, 0.45);
      push('pop', start + 52, 0.3);
    } else if (scene.kind === 'chapter') {
      push('pop', start + 8, 0.4);
      push('pop', start + 16, 0.5);
    } else if (scene.kind === 'outro') {
      // Orbite : mots puis tuiles, flash interne à 150, logo + pastille.
      push('pop', start + 14, 0.4);
      push('pop', start + 25, 0.4);
      push('pop', start + 36, 0.45);
      push('pop', start + 21, 0.22);
      push('pop', start + 42, 0.22);
      push('whoosh', start + 144, 0.5);
      push('pop', start + 156, 0.45);
      push('pop', start + 170, 0.4);
    } else {
      const c = scene.config;
      push('pop', start + c.titleAt, 0.45);
      if (c.sub && c.subAt !== undefined) push('pop', start + c.subAt, 0.3);
      if (c.badge && c.badgeAt !== undefined) push('pop', start + c.badgeAt, 0.36);
      c.labels?.forEach((l) => push('pop', start + l.at, 0.28));
      c.cursor?.clicks?.forEach((f) => push('click', start + f, 0.5));
      c.extraSfx?.forEach((e) => push(e.file, start + e.at, e.volume ?? 0.65, e.duck));
    }
  });

  return events.sort((a, b) => a.frame - b.frame);
};

export const SFX_EVENTS: SfxEvent[] = buildSfx();

/** Frames où la musique « s'efface » (drop / validation). */
export const DUCK_FRAMES: number[] = SFX_EVENTS.filter((e) => e.duck).map((e) => e.frame);
