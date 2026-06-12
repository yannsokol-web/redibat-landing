import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background} from '../components/Background';
import {COLORS, FONTS} from '../theme';

const FLASH_AT = 150;

/** Tuiles qui gravitent autour de la fenêtre (réf. intégrations Axonaut). */
const ORBIT_TILES = [
  {text: 'CCTP', dot: '#185fcb', rx: 0.345, ry: 0.34, ph: 0.0},
  {text: 'DPGF', dot: '#1d6f42', rx: 0.345, ry: 0.34, ph: 1.05},
  {text: 'TCO', dot: '#30c5ec', rx: 0.345, ry: 0.34, ph: 2.1},
  {text: 'Word', dot: '#185fcb', rx: 0.345, ry: 0.34, ph: 3.14},
  {text: 'PDF', dot: '#c23b2e', rx: 0.345, ry: 0.34, ph: 4.2},
  {text: 'Excel', dot: '#1d6f42', rx: 0.345, ry: 0.34, ph: 5.24},
];

/**
 * Final en deux temps : la page d'accueil recule, les livrables Rédibat
 * gravitent autour (orbite), puis flash blanc → logo + pastille redibat.fr.
 */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const sf = Math.min(width / 1920, height / 1080) * (width / height < 1.4 ? 1.45 : 1);

  const words = ['Rédigez,', 'analysez,', 'décidez.'];

  /* ------------------------------------------------ phase A : orbite -- */
  const orbitOpacity = interpolate(frame, [FLASH_AT - 10, FLASH_AT + 2], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const winEnter = spring({frame, fps, config: {damping: 15, stiffness: 70}});
  const recede = interpolate(frame, [0, FLASH_AT], [1.02, 0.9], {
    easing: Easing.inOut(Easing.quad),
    extrapolateRight: 'clamp',
  });
  const winW = width * 0.42;
  const winH = winW / (1918 / 1031);
  const orbitAngle = frame * 0.0085;

  /* ------------------------------------------------ phase B : logo -- */
  const logoS = spring({frame: frame - FLASH_AT - 4, fps, config: {damping: 12, stiffness: 120}});
  const pillS = spring({frame: frame - FLASH_AT - 18, fps, config: {damping: 13, stiffness: 150}});
  const flash = interpolate(frame, [FLASH_AT - 6, FLASH_AT, FLASH_AT + 16], [0, 0.95, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background tint="cyan" />

      {/* Phase A — fenêtre qui recule + orbite de tuiles */}
      {orbitOpacity > 0 ? (
        <AbsoluteFill style={{opacity: orbitOpacity}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 90 * sf, display: 'flex', justifyContent: 'center', gap: 20 * sf, zIndex: 2}}>
            {words.map((word, i) => {
              const f = frame - 12 - i * 11;
              const s = spring({frame: f, fps, config: {damping: 13, stiffness: 140}});
              const opacity = interpolate(f, [0, 9], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 66 * sf,
                    fontWeight: 700,
                    color: '#ffffff',
                    display: 'inline-block',
                    opacity,
                    transform: `translateY(${(1 - s) * 30}px) scale(${0.8 + 0.2 * s})`,
                    filter: `blur(${(1 - s) * 6}px)`,
                    textShadow: '0 6px 30px rgba(9, 30, 75, 0.4)',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {/* Cercles d'orbite */}
          {[0.78, 0.6].map((d, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '56%',
                width: width * d,
                height: width * d * 0.62,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.25)',
              }}
            />
          ))}

          {/* Fenêtre accueil qui recule */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '56%',
              width: winW,
              height: winH,
              transform: `translate(-50%, -50%) scale(${recede * (0.9 + 0.1 * winEnter)})`,
              opacity: winEnter,
              borderRadius: 12,
              overflow: 'hidden',
              border: `1.5px solid ${COLORS.windowBorder}`,
              boxShadow: '0 40px 100px rgba(9, 30, 75, 0.5)',
            }}
          >
            <Img src={staticFile('captures/01-accueil.png')} style={{width: '100%', height: '100%'}} />
          </div>

          {/* Tuiles en orbite */}
          {ORBIT_TILES.map((tile, i) => {
            const f = frame - 14 - i * 7;
            const s = spring({frame: f, fps, config: {damping: 12, stiffness: 160}});
            const a = orbitAngle + tile.ph;
            const x = 0.5 + Math.cos(a) * tile.rx * (width / width);
            const y = 0.56 + Math.sin(a) * tile.ry * 0.62;
            const bob = Math.sin(frame * 0.04 + tile.ph * 2) * 5 * sf;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${x * 100}%`,
                  top: `calc(${y * 100}% + ${bob}px)`,
                  transform: `translate(-50%, -50%) scale(${s})`,
                  opacity: Math.min(1, s * 1.4),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10 * sf,
                  padding: `${12 * sf}px ${20 * sf}px`,
                  borderRadius: 14 * sf,
                  background: '#ffffff',
                  boxShadow: '0 14px 36px rgba(9, 30, 75, 0.38)',
                  fontFamily: FONTS.mono,
                  fontSize: 23 * sf,
                  fontWeight: 500,
                  color: COLORS.navy,
                }}
              >
                <span style={{width: 11 * sf, height: 11 * sf, borderRadius: 999, background: tile.dot}} />
                {tile.text}
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* Phase B — logo + redibat.fr */}
      {frame >= FLASH_AT ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 30 * sf}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24 * sf}}>
            <Img
              src={staticFile('logo-icon.png')}
              style={{
                height: 110 * sf,
                transform: `scale(${0.4 + 0.6 * logoS}) rotate(${(1 - logoS) * -8}deg)`,
                opacity: Math.min(1, logoS * 1.5),
                filter: 'drop-shadow(0 16px 40px rgba(9, 30, 75, 0.45))',
              }}
            />
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 96 * sf,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                opacity: Math.min(1, logoS * 1.4),
                transform: `translateY(${(1 - logoS) * 26}px)`,
                textShadow: '0 6px 32px rgba(9, 30, 75, 0.4)',
              }}
            >
              Rédibat
            </span>
          </div>
          <div
            style={{
              padding: `${12 * sf}px ${30 * sf}px`,
              borderRadius: 999,
              background: '#ffffff',
              boxShadow: '0 12px 34px rgba(9, 30, 75, 0.4)',
              fontFamily: FONTS.mono,
              fontSize: 30 * sf,
              fontWeight: 500,
              color: '#0b317c',
              opacity: Math.min(1, pillS * 1.4),
              transform: `scale(${0.6 + 0.4 * pillS})`,
            }}
          >
            redibat.fr
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Flash blanc de transition interne */}
      {flash > 0 ? <AbsoluteFill style={{background: '#ffffff', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
