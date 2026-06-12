import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background} from '../components/Background';
import {FONTS} from '../theme';
import {ChapterConfig} from './configs';

/**
 * Carton de chapitre punchy (réf. « RAPIDE ! NON !? » d'Axonaut) :
 * mots blancs massifs en perspective inclinée qui claquent à l'écran,
 * pastille numéro, éclat de confettis à l'impact.
 */
export const Chapter: React.FC<{chapter: ChapterConfig}> = ({chapter}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const sf = Math.min(width / 1920, height / 1080) * (width / height < 1.4 ? 1.45 : 1);

  const words = chapter.title.toUpperCase().split(' ');
  const numS = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 170}});

  // Éclat à l'impact du premier mot.
  const burst = interpolate(frame, [16, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background tint={chapter.tint} />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30 * sf,
          perspective: 1200,
        }}
      >
        <div
          style={{
            padding: `${9 * sf}px ${22 * sf}px`,
            borderRadius: 999,
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(9, 30, 75, 0.35)',
            fontFamily: FONTS.mono,
            fontSize: 24 * sf,
            fontWeight: 500,
            letterSpacing: '0.3em',
            color: chapter.tint === 'cyan' ? '#0f7c6c' : '#0b317c',
            opacity: Math.min(1, numS * 1.5),
            transform: `scale(${0.5 + 0.5 * numS})`,
          }}
        >
          {chapter.num}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 34 * sf,
            transform: 'rotateX(10deg) rotateY(-12deg) rotate(-4deg)',
            maxWidth: '86%',
          }}
        >
          {words.map((word, i) => {
            const f = frame - 12 - i * 6;
            const s = spring({frame: f, fps, config: {damping: 12, stiffness: 130}});
            const opacity = interpolate(f, [0, 6], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 146 * sf,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  display: 'inline-block',
                  opacity,
                  transform: `scale(${2.1 - 1.1 * s}) translateY(${(1 - s) * 26}px)`,
                  filter: `blur(${(1 - s) * 9}px)`,
                  textShadow: '0 12px 44px rgba(9, 30, 75, 0.45)',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        {burst > 0 && burst < 1
          ? [20, 70, 130, 200, 250, 310].map((deg) => (
              <div
                key={deg}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '52%',
                  width: 11 * sf,
                  height: 11 * sf,
                  borderRadius: deg % 60 === 20 ? '50%' : 3,
                  background: 'rgba(255,255,255,0.95)',
                  opacity: (1 - burst) * 0.85,
                  transform: `rotate(${deg}deg) translateY(${-(150 + burst * 260) * sf}px) rotate(${burst * 160}deg)`,
                }}
              />
            ))
          : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
