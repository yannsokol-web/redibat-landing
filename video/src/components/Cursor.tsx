import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

type Waypoint = {f: number; x: number; y: number};

const ease = Easing.inOut(Easing.cubic);

/** Position interpolée (avec easing par segment) le long des points de passage. */
export const cursorPosition = (points: Waypoint[], frame: number) => {
  if (frame <= points[0].f) return {x: points[0].x, y: points[0].y};
  const last = points[points.length - 1];
  if (frame >= last.f) return {x: last.x, y: last.y};
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = b.f === a.f ? 1 : ease((frame - a.f) / (b.f - a.f));
      return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
    }
  }
  return {x: last.x, y: last.y};
};

/**
 * Curseur simulé, positionné en fractions de la capture (espace image).
 * Affiche une ondulation circulaire à chaque frame de clic.
 */
export const Cursor: React.FC<{points: Waypoint[]; clicks?: number[]}> = ({points, clicks = []}) => {
  const frame = useCurrentFrame();
  const appearAt = points[0].f - 8;
  const opacity = interpolate(frame, [appearAt, appearAt + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) return null;
  const {x, y} = cursorPosition(points, frame);

  // Enfoncement bref du curseur au clic.
  const press = clicks.reduce((acc, c) => {
    const d = frame - c;
    if (d >= 0 && d < 10) return Math.min(acc, 0.86 + (d / 10) * 0.14);
    return acc;
  }, 1);

  return (
    <>
      {clicks.map((c, i) => {
        const d = frame - c;
        if (d < 0 || d > 22) return null;
        const r = interpolate(d, [0, 22], [0.4, 3.4]);
        const o = interpolate(d, [0, 22], [0.55, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${r}%`,
              aspectRatio: '1',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `2.5px solid ${COLORS.cyan}`,
              opacity: o,
            }}
          />
        );
      })}
      <svg
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: '1.7%',
          opacity,
          transform: `translate(-12%, -8%) scale(${press})`,
          filter: 'drop-shadow(0 2px 5px rgba(6, 16, 32, 0.45))',
        }}
      >
        <path
          d="M5.5 3.2 L18.8 11.6 L12.4 12.9 L9.2 19.2 Z"
          fill="#ffffff"
          stroke={COLORS.navy}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
