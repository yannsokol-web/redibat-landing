import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';

/**
 * Fond « univers Rédibat » (réf. Axonaut) : bleu vif lumineux, nappes
 * floues façon nuages qui dérivent lentement, confettis géométriques
 * discrets. La variante `cyan` (module Analyse) tire vers le turquoise.
 */

type Blob = {x: number; y: number; w: number; h: number; color: string; o: number; spd: number; ph: number};

const BLOBS_BLUE: Blob[] = [
  {x: 8, y: -14, w: 56, h: 38, color: '#9cc4ff', o: 0.3, spd: 0.16, ph: 0},
  {x: 78, y: 76, w: 52, h: 40, color: '#7fb3ff', o: 0.26, spd: 0.12, ph: 2.1},
  {x: -12, y: 62, w: 44, h: 36, color: '#5a96f5', o: 0.32, spd: 0.2, ph: 4.0},
  {x: 62, y: -10, w: 40, h: 30, color: '#bcd8ff', o: 0.2, spd: 0.1, ph: 1.2},
];
const BLOBS_CYAN: Blob[] = [
  {x: 8, y: -14, w: 56, h: 38, color: '#8fe7d8', o: 0.3, spd: 0.16, ph: 0},
  {x: 80, y: 74, w: 52, h: 40, color: '#5ad6c1', o: 0.28, spd: 0.12, ph: 2.1},
  {x: -12, y: 62, w: 44, h: 36, color: '#6ea8f7', o: 0.3, spd: 0.2, ph: 4.0},
  {x: 64, y: -8, w: 40, h: 30, color: '#c2f3ea', o: 0.18, spd: 0.1, ph: 1.2},
];

type Confetto = {x: number; y: number; s: number; kind: 'dot' | 'square' | 'diamond'; o: number; drift: number; ph: number};

// Positions déterministes (pas de Math.random : rendu reproductible).
const CONFETTI: Confetto[] = [
  {x: 7, y: 22, s: 10, kind: 'square', o: 0.3, drift: 14, ph: 0.3},
  {x: 14, y: 64, s: 6, kind: 'dot', o: 0.38, drift: 10, ph: 1.7},
  {x: 23, y: 36, s: 8, kind: 'diamond', o: 0.26, drift: 16, ph: 3.1},
  {x: 31, y: 80, s: 5, kind: 'dot', o: 0.3, drift: 9, ph: 4.4},
  {x: 44, y: 12, s: 7, kind: 'dot', o: 0.32, drift: 12, ph: 2.4},
  {x: 57, y: 88, s: 9, kind: 'square', o: 0.24, drift: 13, ph: 5.0},
  {x: 66, y: 18, s: 6, kind: 'diamond', o: 0.3, drift: 15, ph: 0.9},
  {x: 75, y: 56, s: 5, kind: 'dot', o: 0.36, drift: 8, ph: 3.8},
  {x: 84, y: 30, s: 11, kind: 'square', o: 0.26, drift: 17, ph: 1.4},
  {x: 91, y: 70, s: 6, kind: 'dot', o: 0.32, drift: 11, ph: 2.9},
  {x: 38, y: 50, s: 5, kind: 'diamond', o: 0.22, drift: 12, ph: 5.6},
  {x: 95, y: 10, s: 7, kind: 'dot', o: 0.28, drift: 10, ph: 4.1},
];

export const Background: React.FC<{tint?: 'blue' | 'cyan'}> = ({tint = 'blue'}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const px = width / 1920;
  const blobs = tint === 'cyan' ? BLOBS_CYAN : BLOBS_BLUE;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 95% at 50% 32%, ${COLORS.bgTop} 0%, ${COLORS.bgMid} 55%, ${COLORS.bgDeep} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Nuages flous dérivant lentement */}
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${b.x + Math.sin(frame * 0.01 * b.spd * 6 + b.ph) * 3}%`,
            top: `${b.y + Math.cos(frame * 0.008 * b.spd * 6 + b.ph) * 2.5}%`,
            width: `${b.w}%`,
            height: `${b.h}%`,
            borderRadius: '50%',
            background: b.color,
            opacity: b.o,
            filter: 'blur(90px)',
          }}
        />
      ))}
      {/* Halo lumineux central */}
      <AbsoluteFill
        style={{background: 'radial-gradient(54% 44% at 50% 42%, rgba(255,255,255,0.14), transparent 70%)'}}
      />
      {/* Confettis géométriques */}
      {CONFETTI.map((c, i) => {
        const bobY = Math.sin(frame * 0.02 + c.ph) * c.drift;
        const rot = (frame * 0.4 + c.ph * 60) % 360;
        const common: React.CSSProperties = {
          position: 'absolute',
          left: `${c.x}%`,
          top: `calc(${c.y}% + ${bobY * px}px)`,
          width: c.s * px,
          height: c.s * px,
          opacity: c.o,
        };
        if (c.kind === 'dot') {
          return <div key={i} style={{...common, borderRadius: '50%', background: '#ffffff'}} />;
        }
        if (c.kind === 'square') {
          return (
            <div
              key={i}
              style={{
                ...common,
                borderRadius: 2 * px,
                background: 'rgba(255,255,255,0.85)',
                transform: `rotate(${rot}deg)`,
              }}
            />
          );
        }
        return (
          <div
            key={i}
            style={{
              ...common,
              border: `${1.6 * px}px solid rgba(255,255,255,0.8)`,
              borderRadius: 2 * px,
              background: 'transparent',
              transform: `rotate(${45 + rot * 0.5}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
