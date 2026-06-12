import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background} from '../components/Background';
import {COLORS, FONTS} from '../theme';

/** Carton d'ouverture : icône qui claque, « Rédibat » lettre à lettre, sous-titre. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const sf = Math.min(width / 1920, height / 1080) * (width / height < 1.4 ? 1.45 : 1);

  const logoS = spring({frame: frame - 6, fps, config: {damping: 11, stiffness: 130}});

  const letters = 'Rédibat'.split('');
  const subWords = 'La rédaction de CCTP, repensée.'.split(' ');

  // Petit éclat de confettis au moment où l'icône se pose.
  const burst = interpolate(frame, [12, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 28 * sf}}>
        <div style={{position: 'relative'}}>
          <Img
            src={staticFile('logo-icon.png')}
            style={{
              height: 138 * sf,
              transform: `scale(${0.3 + 0.7 * logoS}) rotate(${(1 - logoS) * -10}deg)`,
              opacity: Math.min(1, logoS * 1.6),
              filter: 'drop-shadow(0 18px 44px rgba(9, 30, 75, 0.5))',
            }}
          />
          {burst > 0 && burst < 1
            ? [0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 9 * sf,
                    height: 9 * sf,
                    borderRadius: deg % 120 === 0 ? '50%' : 2,
                    background: '#ffffff',
                    opacity: (1 - burst) * 0.9,
                    transform: `rotate(${deg}deg) translateY(${-(60 + burst * 110) * sf}px)`,
                  }}
                />
              ))
            : null}
        </div>
        <div style={{display: 'flex'}}>
          {letters.map((ch, i) => {
            const f = frame - 20 - i * 2.5;
            const s = spring({frame: f, fps, config: {damping: 12, stiffness: 160}});
            const opacity = interpolate(f, [0, 7], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 122 * sf,
                  fontWeight: 700,
                  color: COLORS.text,
                  letterSpacing: '-0.02em',
                  display: 'inline-block',
                  opacity,
                  transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s})`,
                  filter: `blur(${(1 - s) * 7}px)`,
                  textShadow: '0 6px 32px rgba(9, 30, 75, 0.4)',
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: 11 * sf}}>
          {subWords.map((word, i) => {
            const f = frame - 50 - i * 3;
            const s = spring({frame: f, fps, config: {damping: 16, stiffness: 130}});
            const opacity = interpolate(f, [0, 9], [0, 0.95], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 36 * sf,
                  fontWeight: 500,
                  color: COLORS.textSoft,
                  display: 'inline-block',
                  opacity,
                  transform: `translateY(${(1 - s) * 18}px)`,
                  textShadow: '0 2px 18px rgba(9, 30, 75, 0.35)',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
