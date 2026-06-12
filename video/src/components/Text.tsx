import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';

/**
 * Typographie cinétique : entrée mot par mot, ressort énergique + flou
 * résorbé + légère rotation qui se pose (réf. Axonaut, punchy mais lisible).
 */
export const KineticTitle: React.FC<{
  text: string;
  from: number;
  size: number;
  color?: string;
  weight?: number;
  stagger?: number;
  align?: 'left' | 'center';
}> = ({text, from, size, color = COLORS.text, weight = 700, stagger = 3, align = 'left'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: FONTS.body,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.12,
        letterSpacing: '-0.018em',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
        textShadow: '0 4px 26px rgba(11, 38, 92, 0.35)',
      }}
    >
      {words.map((word, i) => {
        const f = frame - from - i * stagger;
        const s = spring({frame: f, fps, config: {damping: 13, stiffness: 150}});
        const opacity = interpolate(f, [0, 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const blur = interpolate(s, [0, 1], [8, 0]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${(1 - s) * size * 0.55}px) rotate(${(1 - s) * -3}deg) scale(${0.8 + 0.2 * s})`,
              transformOrigin: 'left bottom',
              filter: `blur(${blur}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Sous-légende blanche, fondu + montée. */
export const SubLine: React.FC<{text: string; from: number; size: number}> = ({text, from, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - from, fps, config: {damping: 16, stiffness: 110}});
  const opacity = interpolate(frame - from, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        fontFamily: FONTS.body,
        fontSize: size,
        fontWeight: 500,
        color: COLORS.textSoft,
        opacity,
        transform: `translateY(${(1 - s) * 16}px)`,
        textShadow: '0 2px 16px rgba(11, 38, 92, 0.3)',
      }}
    >
      {text}
    </div>
  );
};

/** Pastille blanche façon Axonaut : point coloré + texte navy. */
export const Badge: React.FC<{text: string; from: number; size: number; dot?: string}> = ({
  text,
  from,
  size,
  dot = COLORS.cyan,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - from, fps, config: {damping: 12, stiffness: 180}});
  const opacity = interpolate(frame - from, [0, 7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.5,
        padding: `${size * 0.4}px ${size * 0.8}px`,
        borderRadius: 999,
        background: '#ffffff',
        boxShadow: '0 8px 26px rgba(11, 38, 92, 0.3)',
        fontFamily: FONTS.mono,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: '0.01em',
        color: COLORS.navy,
        opacity,
        transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * 4}deg)`,
        transformOrigin: 'left center',
      }}
    >
      <span
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: 999,
          background: dot,
        }}
      />
      {text}
    </div>
  );
};
