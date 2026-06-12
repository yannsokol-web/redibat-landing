/**
 * Génération des bruitages et du lit musical de la vidéo Rédibat.
 *
 * Synthèse 100 % locale (Node, zéro dépendance, zéro licence) :
 *   - public/audio/sfx/whoosh.wav   : transition (bruit filtré, sweep de bande)
 *   - public/audio/sfx/click.wav    : clic UI discret
 *   - public/audio/sfx/pop.wav      : apparition de texte / badge
 *   - public/audio/sfx/drop.wav     : dépôt de drag-and-drop
 *   - public/audio/sfx/success.wav  : carillon de validation (génération)
 *   - public/audio/music/ambient-bed.wav : nappe ambient ~100 s (placeholder
 *     libre de droits par construction — remplaçable par n'importe quel fichier
 *     déposé au même chemin, voir README)
 *
 * Relancer :  node scripts/generate-audio.mjs
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ---------------------------------------------------------------- utils -- */

const writeWav = (relPath, channels) => {
  const n = channels[0].length;
  const numCh = channels.length;
  const bytesPerSample = 2;
  const dataSize = n * numCh * bytesPerSample;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numCh, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * numCh * bytesPerSample, 28);
  buf.writeUInt16LE(numCh * bytesPerSample, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < numCh; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]));
      buf.writeInt16LE(Math.round(v * 32767), 44 + (i * numCh + c) * 2);
    }
  }
  const abs = join(root, relPath);
  mkdirSync(dirname(abs), {recursive: true});
  writeFileSync(abs, buf);
  console.log(`✓ ${relPath}  (${(buf.length / 1024).toFixed(0)} ko, ${(n / SR).toFixed(2)} s)`);
};

const seconds = (s) => Math.round(s * SR);

const normalize = (ch, peak = 0.7) => {
  let max = 0;
  for (const c of ch) for (const v of c) max = Math.max(max, Math.abs(v));
  if (max === 0) return ch;
  const g = peak / max;
  for (const c of ch) for (let i = 0; i < c.length; i++) c[i] *= g;
  return ch;
};

// Bruit blanc déterministe (LCG) pour des rendus reproductibles.
const makeNoise = (() => {
  let state = 123456789;
  return () => {
    state = (1103515245 * state + 12345) & 0x7fffffff;
    return (state / 0x3fffffff) - 1;
  };
})();

// Filtre passe-bande biquad à coefficients variables (recalculés par échantillon).
class Bandpass {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  run(x, freq, q) {
    const w = (2 * Math.PI * freq) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const b0 = alpha, b1 = 0, b2 = -alpha;
    const a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
    const y = (b0 * x + b1 * this.x1 + b2 * this.x2 - a1 * this.y1 - a2 * this.y2) / a0;
    this.x2 = this.x1; this.x1 = x;
    this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

/* ------------------------------------------------------------------ SFX -- */

// Whoosh de transition : bruit passe-bande dont la fréquence centrale balaye
// 300 → 2200 → 500 Hz sous une enveloppe de Hann.
{
  const n = seconds(0.8);
  const out = new Float32Array(n);
  const bp = new Bandpass();
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * Math.pow(t, 0.8)) ** 1.5;
    const f = 300 + 1900 * Math.sin(Math.PI * t) ** 2 * (1 - t * 0.6);
    out[i] = bp.run(makeNoise(), f, 1.1) * env;
  }
  writeWav('public/audio/sfx/whoosh.wav', normalize([out], 0.55));
}

// Clic UI : tick 1,8 kHz très court + souffle de contact.
{
  const n = seconds(0.09);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 220);
    out[i] = Math.sin(2 * Math.PI * 1800 * t) * env * 0.8 + makeNoise() * Math.exp(-t * 500) * 0.35;
  }
  writeWav('public/audio/sfx/click.wav', normalize([out], 0.5));
}

// Pop d'apparition : blip sinus glissant 520 → 940 Hz, décroissance rapide.
{
  const n = seconds(0.22);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 520 + 420 * Math.min(1, t / 0.06);
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 26);
    out[i] = (Math.sin(phase) + 0.3 * Math.sin(2 * phase)) * env;
  }
  writeWav('public/audio/sfx/pop.wav', normalize([out], 0.5));
}

// Dépôt (drop) : thump grave 160 → 70 Hz + très court souffle d'impact.
{
  const n = seconds(0.45);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 70 + 90 * Math.exp(-t * 24);
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 11);
    out[i] = Math.sin(phase) * env + makeNoise() * Math.exp(-t * 180) * 0.18;
  }
  writeWav('public/audio/sfx/drop.wav', normalize([out], 0.65));
}

// Validation : carillon deux notes (D5 puis A5), cloches douces.
{
  const n = seconds(0.9);
  const out = new Float32Array(n);
  const bell = (fr, start, gain) => {
    for (let i = seconds(start); i < n; i++) {
      const t = i / SR - start;
      const env = Math.min(1, t / 0.005) * Math.exp(-t * 6.5);
      out[i] += (Math.sin(2 * Math.PI * fr * t) + 0.28 * Math.sin(2 * Math.PI * fr * 2.76 * t) * Math.exp(-t * 12)) * env * gain;
    }
  };
  bell(587.33, 0, 0.8);   // D5
  bell(880.0, 0.16, 1.0); // A5
  writeWav('public/audio/sfx/success.wav', normalize([out], 0.5));
}

/* ---------------------------------------------------------------- Musique -- */

// Lit musical ~100 s, lumineux et rythmé (réf. énergie « Axonaut ») :
// pads majeurs brillants + arpège de plucks en croches + pulsation grave
// douce à 104 BPM. Progression : C / Am7 / F / G (pop solaire).
{
  const dur = 100;
  const n = seconds(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);

  const BPM = 104;
  const beat = 60 / BPM;          // 0,577 s
  const chordLen = beat * 8;      // 2 mesures par accord
  const fade = 0.9;

  // [basse, t1, t2, t3] + gamme d'arpège (tons de l'accord, octave au-dessus)
  const chords = [
    {pad: [130.81, 261.63, 329.63, 392.0], arp: [523.25, 659.26, 783.99, 659.26]},  // C
    {pad: [110.0, 261.63, 329.63, 440.0], arp: [523.25, 659.26, 880.0, 659.26]},    // Am7
    {pad: [87.31, 261.63, 349.23, 440.0], arp: [523.25, 698.46, 880.0, 698.46]},    // F
    {pad: [98.0, 246.94, 392.0, 493.88], arp: [493.88, 587.33, 783.99, 587.33]},    // G
  ];

  const addPadNote = (f, t0, t1, k) => {
    const i0 = Math.max(0, seconds(t0));
    const i1 = Math.min(n, seconds(t1));
    let p1 = 0, p2 = 0;
    for (let i = i0; i < i1; i++) {
      const t = i / SR;
      const env = Math.min(1, (t - t0) / fade) * Math.min(1, Math.max(0, t1 - t) / fade);
      const lfo = 1 + 0.1 * Math.sin(2 * Math.PI * 0.11 * t + k * 1.7);
      p1 += (2 * Math.PI * f * 1.0017) / SR;
      p2 += (2 * Math.PI * f * 0.9985) / SR;
      const v = (Math.sin(p1) + Math.sin(p2)) * 0.5 + 0.32 * Math.sin(2 * p1) + 0.12 * Math.sin(4 * p1);
      const g = (k === 0 ? 0.9 : 0.5) * env * lfo;
      L[i] += v * g * (k % 2 === 0 ? 1 : 0.7);
      R[i] += v * g * (k % 2 === 0 ? 0.7 : 1);
    }
  };

  const addPluck = (f, t0, pan) => {
    const i0 = Math.max(0, seconds(t0));
    const i1 = Math.min(n, seconds(t0 + 0.5));
    for (let i = i0; i < i1; i++) {
      const t = i / SR - t0;
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 8.5);
      const v = (Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(2 * Math.PI * f * 3 * t)) * env * 0.16;
      L[i] += v * (1 - pan);
      R[i] += v * pan;
    }
  };

  const addKick = (t0) => {
    const i0 = Math.max(0, seconds(t0));
    const i1 = Math.min(n, seconds(t0 + 0.14));
    let p = 0;
    for (let i = i0; i < i1; i++) {
      const t = i / SR - t0;
      p += (2 * Math.PI * (36 + 68 * Math.exp(-t * 26))) / SR;
      const v = Math.sin(p) * Math.exp(-t * 24) * 0.5;
      L[i] += v;
      R[i] += v;
    }
  };

  let chordIdx = 0;
  for (let t0 = 0; t0 < dur - 1; t0 += chordLen) {
    const chord = chords[chordIdx % chords.length];
    chordIdx++;
    const t1 = Math.min(dur, t0 + chordLen + fade);
    chord.pad.forEach((f, k) => addPadNote(f, t0, t1, k));
    // Arpège en croches : motif 8 pas sur les 2 mesures.
    for (let step = 0; step < 16; step++) {
      const tt = t0 + step * (beat / 2);
      if (tt >= dur - 0.6) break;
      addPluck(chord.arp[step % chord.arp.length], tt, step % 2 ? 0.62 : 0.38);
    }
    // Pulsation grave : noires, en retrait.
    for (let b = 0; b < 8; b++) {
      const tt = t0 + b * beat;
      if (tt >= dur - 0.3) break;
      addKick(tt);
    }
  }

  writeWav('public/audio/music/ambient-bed.wav', normalize([L, R], 0.45));
}

console.log('\nAudio généré. Pour remplacer la musique : déposez votre fichier en');
console.log('public/audio/music/ambient-bed.wav (ou changez le chemin dans src/AudioTrack.tsx).');
