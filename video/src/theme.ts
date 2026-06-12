/**
 * Charte Rédibat, déclinée « univers lumineux » (réf. Axonaut en 1 minute) :
 * fond bleu vif habité, fenêtres flottantes en perspective, badges blancs.
 * Polices de la landing : Hanken Grotesk (titres punchy), IBM Plex Mono.
 */
import {loadFont as loadNewsreader} from '@remotion/google-fonts/Newsreader';
import {loadFont as loadHanken} from '@remotion/google-fonts/HankenGrotesk';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';

const newsreader = loadNewsreader('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
});
const hanken = loadHanken('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
});
const plexMono = loadPlexMono('normal', {
  weights: ['400', '500'],
  subsets: ['latin', 'latin-ext'],
});

export const FONTS = {
  display: `${newsreader.fontFamily}, Georgia, serif`,
  body: `${hanken.fontFamily}, -apple-system, sans-serif`,
  mono: `${plexMono.fontFamily}, ui-monospace, monospace`,
};

export const COLORS = {
  navy: '#1E3A5F',
  // Univers bleu vif (réf. Axonaut), ancré sur le bleu de marque #185fcb.
  bgTop: '#3d7df0',
  bgMid: '#2563d9',
  bgDeep: '#1b4cb4',
  text: '#ffffff',
  textSoft: 'rgba(255, 255, 255, 0.88)',
  cyan: '#30c5ec',
  turquoise: '#3fd6c0',
  blue: '#185fcb',
  blueDeep: '#0b317c',
  green: '#34c98e',
  sun: '#ffd84d',
  windowBorder: 'rgba(255, 255, 255, 0.35)',
  brandGrad: 'linear-gradient(135deg, #0b317c 0%, #185fcb 55%, #30c5ec 100%)',
};

/** Ratio des captures (1918×1031). */
export const CAPTURE_ASPECT = 1918 / 1031;

/**
 * Mise en page responsive : la composition 16:9 est la référence,
 * la variante carrée (social) réutilise les mêmes formules.
 */
export const getLayout = (width: number, height: number) => {
  const wide = width / height > 1.4;
  const sf = wide ? width / 1920 : (width / 1920) * 1.5; // facteur typo
  const textTop = (wide ? 56 : 70) * sf;
  const minWinTop = (wide ? 208 : 270) * sf;
  const bottomPad = 64 * sf;
  const winW = Math.min(width * 0.84, (height - minWinTop - bottomPad) * CAPTURE_ASPECT);
  const winH = winW / CAPTURE_ASPECT;
  // En format carré, la fenêtre est recentrée dans l'espace sous le texte.
  const winTop = Math.max(minWinTop, (height - winH + minWinTop * 0.6) / 2);
  const winLeft = (width - winW) / 2;
  return {sf, textTop, winTop, winW, winH, winLeft, textLeft: winLeft + 6 * sf};
};
