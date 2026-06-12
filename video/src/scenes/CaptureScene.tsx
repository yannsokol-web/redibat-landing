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
import {Cursor, cursorPosition} from '../components/Cursor';
import {Badge, KineticTitle, SubLine} from '../components/Text';
import {COLORS, FONTS, getLayout} from '../theme';
import {CamKey, Rect, SceneConfig} from './configs';

const ease = Easing.inOut(Easing.cubic);

/** Caméra Ken Burns : interpolation lissée entre keyframes (cx, cy, zoom). */
const getCam = (keys: CamKey[], frame: number) => {
  if (frame <= keys[0].f) return keys[0];
  const last = keys[keys.length - 1];
  if (frame >= last.f) return last;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = b.f === a.f ? 1 : ease((frame - a.f) / (b.f - a.f));
      return {
        f: frame,
        cx: a.cx + (b.cx - a.cx) * t,
        cy: a.cy + (b.cy - a.cy) * t,
        s: a.s + (b.s - a.s) * t,
      };
    }
  }
  return last;
};

/** Anneau de surbrillance + assombrissement doux du reste de la capture. */
const Highlight: React.FC<{rect: Rect; from: number; to: number}> = ({rect, from, to}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) return null;
  const settle = interpolate(frame, [from, from + 16], [1.05, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: `${rect.x * 100}%`,
        top: `${rect.y * 100}%`,
        width: `${rect.w * 100}%`,
        height: `${rect.h * 100}%`,
        borderRadius: 10,
        border: `3px solid ${COLORS.blue}`,
        boxShadow: `0 0 24px rgba(24, 95, 203, 0.45), 0 0 0 6000px rgba(11, 38, 92, 0.22)`,
        opacity,
        transform: `scale(${settle})`,
      }}
    />
  );
};

/** Étiquette-pastille blanche ancrée dans la capture. */
const ImageLabel: React.FC<{text: string; x: number; y: number; at: number}> = ({text, x, y, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 170}});
  const opacity = interpolate(frame - at, [0, 7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(-10%, -120%) scale(${0.7 + 0.3 * s}) rotate(${(1 - s) * 5}deg)`,
        transformOrigin: 'left bottom',
        opacity,
        padding: '9px 16px',
        borderRadius: 999,
        background: '#ffffff',
        boxShadow: '0 10px 28px rgba(11, 38, 92, 0.35)',
        fontFamily: FONTS.mono,
        fontSize: 19,
        fontWeight: 500,
        color: COLORS.navy,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Cascade de mini-badges blancs (réf. badges de paiement Axonaut). */
const BadgeCascade: React.FC<{
  x: number;
  y: number;
  at: number;
  items: {text: string; dot: string}[];
}> = ({x, y, at, items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {items.map((item, i) => {
        const f = frame - at - i * 7;
        const s = spring({frame: f, fps, config: {damping: 12, stiffness: 190}});
        const opacity = interpolate(f, [0, 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (opacity <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(x + i * 0.012) * 100}%`,
              top: `${(y + i * 0.062) * 100}%`,
              transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -5}deg)`,
              transformOrigin: 'left center',
              opacity,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: '#ffffff',
              boxShadow: '0 10px 26px rgba(11, 38, 92, 0.35)',
              fontFamily: FONTS.mono,
              fontSize: 17,
              fontWeight: 500,
              color: COLORS.navy,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{width: 9, height: 9, borderRadius: 999, background: item.dot}} />
            {item.text}
          </div>
        );
      })}
    </>
  );
};

/* ----------------------------------------------------- overlays spéciaux -- */

/** S4 : article « fantôme » glissé de la bibliothèque vers l'arbre de l'affaire. */
const GhostDrag: React.FC = () => {
  const frame = useCurrentFrame();
  const from = 56;
  const to = 118;
  if (frame < from || frame > to + 16) return null;
  const pos = cursorPosition(
    [
      {f: from, x: 0.13, y: 0.42},
      {f: to, x: 0.405, y: 0.555},
    ],
    frame
  );
  const lift = interpolate(frame, [from, from + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dropFade = interpolate(frame, [to, to + 14], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const arc = Math.sin(((frame - from) / (to - from)) * Math.PI) * -0.018;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.x * 100}%`,
        top: `${(pos.y + arc) * 100}%`,
        width: '19%',
        transform: `translate(-4%, -50%) rotate(${-2.2 * lift * dropFade}deg) scale(${0.96 + 0.04 * lift})`,
        opacity: 0.94 * lift * dropFade,
        borderRadius: 8,
        background: '#ffffff',
        border: `1.5px solid ${COLORS.navy}`,
        boxShadow: '0 14px 36px rgba(11, 38, 92, 0.4)',
        padding: '1% 1.2%',
        display: 'flex',
        alignItems: 'center',
        gap: '5%',
      }}
    >
      <div style={{width: 11, height: 11, borderRadius: 3, background: '#b8f0c9', border: '1px solid #57b87a', flexShrink: 0}} />
      <div style={{flex: 1}}>
        <div style={{height: 7, borderRadius: 4, background: COLORS.navy, opacity: 0.78, width: '86%'}} />
        <div style={{height: 5, borderRadius: 4, background: '#9fb4cc', width: '60%', marginTop: 5}} />
      </div>
    </div>
  );
};

/** Icône de fichier (PDF / XLSX) volant vers la zone d'import. */
const FlyingFile: React.FC<{
  kind: 'PDF' | 'XLSX';
  from: number;
  to: number;
  start: {x: number; y: number};
  end: {x: number; y: number};
}> = ({kind, from, to, start, end}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 14) return null;
  const t = interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const x = start.x + (end.x - start.x) * t;
  const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * -0.045;
  const fade = interpolate(frame, [to, to + 12], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const color = kind === 'PDF' ? '#c23b2e' : '#1d6f42';
  const ringR = interpolate(frame, [to, to + 14], [0.5, 3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <>
      {frame >= to ? (
        <div
          style={{
            position: 'absolute',
            left: `${end.x * 100}%`,
            top: `${end.y * 100}%`,
            width: `${ringR}%`,
            aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `2.5px solid ${COLORS.blue}`,
            opacity: fade * 0.6,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: '5.2%',
          transform: `translate(-50%, -50%) rotate(${(1 - t) * -9}deg) scale(${1 - t * 0.3})`,
          opacity: fade,
          borderRadius: 7,
          background: '#ffffff',
          border: '1px solid rgba(30, 58, 95, 0.35)',
          boxShadow: '0 12px 30px rgba(11, 38, 92, 0.4)',
          overflow: 'hidden',
        }}
      >
        <div style={{height: 26, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontFamily: FONTS.mono, fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: '0.04em'}}>
            {kind}
          </span>
        </div>
        <div style={{padding: '6px 7px'}}>
          <div style={{height: 4, borderRadius: 2, background: '#c6d2e0', width: '90%'}} />
          <div style={{height: 4, borderRadius: 2, background: '#d8e1ec', width: '70%', marginTop: 4}} />
          <div style={{height: 4, borderRadius: 2, background: '#d8e1ec', width: '80%', marginTop: 4}} />
        </div>
      </div>
    </>
  );
};

/** S12 : le tableau d'ouverture « se remplit » par bandes successives. */
const TableReveal: React.FC<{rect: Rect; from: number; bands?: number}> = ({rect, from, bands = 4}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: bands}, (_, i) => {
        const opacity = interpolate(frame, [from + i * 12, from + i * 12 + 18], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (opacity <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(rect.x + (rect.w / bands) * i) * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${(rect.w / bands) * 100 + 0.05}%`,
              height: `${rect.h * 100}%`,
              background: '#fbfcfd',
              opacity,
            }}
          />
        );
      })}
    </>
  );
};

/** S9 : coche de validation animée après le clic « Générer ». */
const SuccessCheck: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 170}});
  const dash = interpolate(frame - at, [4, 22], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: '4.6%',
        aspectRatio: '1',
        transform: `translate(-50%, -50%) scale(${s})`,
        borderRadius: '50%',
        background: COLORS.green,
        boxShadow: '0 10px 30px rgba(20, 120, 80, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 24 24" style={{width: '58%'}}>
        <path
          d="M5 12.5 L10 17.5 L19 7"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="30"
          strokeDashoffset={dash}
        />
      </svg>
    </div>
  );
};

/** S9 : document A4 qui s'élève hors de la fenêtre après la génération
 *  (réf. devis flottant Axonaut). */
const FloatingDoc: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 70}});
  const rise = interpolate(s, [0, 1], [0.12, 0]);
  const sway = Math.sin((frame - at) * 0.06) * 2.2;
  return (
    <div
      style={{
        position: 'absolute',
        left: '78%',
        top: `${(0.3 + rise) * 100}%`,
        width: '13%',
        aspectRatio: '0.72',
        opacity: s,
        transform: `rotate(${sway}deg) scale(${0.7 + 0.3 * s})`,
        transformOrigin: 'center bottom',
        borderRadius: 8,
        background: '#ffffff',
        boxShadow: '0 26px 60px rgba(11, 38, 92, 0.45)',
        padding: '2.2%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4.5%',
      }}
    >
      <div style={{height: '11%', borderRadius: 4, background: COLORS.navy, width: '52%'}} />
      {[88, 78, 84, 70, 80, 60].map((w, i) => (
        <div key={i} style={{height: '4.5%', borderRadius: 3, background: i % 3 === 0 ? '#b9c9dc' : '#dbe4ee', width: `${w}%`}} />
      ))}
      <div style={{marginTop: 'auto', alignSelf: 'flex-end', height: '9%', width: '34%', borderRadius: 4, background: COLORS.green}} />
    </div>
  );
};

/** Overlays propres à certaines scènes (drag, fichiers, remplissage, coche). */
const SpecialOverlay: React.FC<{sceneKey: string}> = ({sceneKey}) => {
  switch (sceneKey) {
    case 's4-dragdrop':
      return <GhostDrag />;
    case 's9-generation':
      return (
        <>
          <SuccessCheck at={114} x={0.655} y={0.8} />
          <FloatingDoc at={124} />
        </>
      );
    case 's12-plis':
      return (
        <>
          <TableReveal rect={{x: 0.255, y: 0.185, w: 0.745, h: 0.77}} from={118} />
          <FlyingFile kind="XLSX" from={40} to={72} start={{x: -0.04, y: 1.06}} end={{x: 0.115, y: 0.93}} />
          <FlyingFile kind="PDF" from={60} to={92} start={{x: 0.02, y: 1.12}} end={{x: 0.155, y: 0.93}} />
        </>
      );
    case 's14-tco':
      return (
        <>
          <FlyingFile kind="PDF" from={34} to={66} start={{x: -0.04, y: 1.06}} end={{x: 0.115, y: 0.93}} />
          <FlyingFile kind="XLSX" from={52} to={84} start={{x: 0.02, y: 1.12}} end={{x: 0.155, y: 0.93}} />
        </>
      );
    default:
      return null;
  }
};

/** Phase pseudo-aléatoire stable par scène (flottement différencié). */
const phaseOf = (key: string) => {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) % 997;
  return (h / 997) * Math.PI * 2;
};

/* ----------------------------------------------------------- la scène -- */

export const CaptureScene: React.FC<{config: SceneConfig; tint?: 'blue' | 'cyan'}> = ({
  config,
  tint = 'blue',
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const L = getLayout(width, height);
  const cam = getCam(config.cam, frame);
  const ph = phaseOf(config.key);

  // Entrée de la fenêtre : ressort + perspective qui se pose, puis
  // flottement continu très léger (réf. fenêtres « vivantes » Axonaut).
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 70}});
  const winScale = 0.94 + 0.06 * enter;
  const rotY = (1 - enter) * 9 + Math.sin(frame * 0.022 + ph) * 1.5;
  const rotX = (1 - enter) * -4 + 1.4 + Math.cos(frame * 0.018 + ph) * 0.9;
  const bobY = Math.sin(frame * 0.03 + ph) * 5 * L.sf;

  return (
    <AbsoluteFill>
      <Background tint={tint} />

      {/* Bloc texte au-dessus de la fenêtre */}
      <div style={{position: 'absolute', left: L.textLeft, top: L.textTop, right: L.textLeft, zIndex: 2}}>
        <KineticTitle text={config.title} from={config.titleAt} size={54 * L.sf} />
        <div style={{display: 'flex', alignItems: 'center', gap: 22 * L.sf, marginTop: 14 * L.sf}}>
          {config.sub && config.subAt !== undefined ? (
            <SubLine text={config.sub} from={config.subAt} size={27 * L.sf} />
          ) : null}
          {config.badge && config.badgeAt !== undefined ? (
            <Badge text={config.badge} from={config.badgeAt} size={20 * L.sf} />
          ) : null}
        </div>
      </div>

      {/* Fenêtre flottante en perspective */}
      <div style={{position: 'absolute', inset: 0, perspective: 1700, perspectiveOrigin: '50% 40%'}}>
        <div
          style={{
            position: 'absolute',
            left: L.winLeft,
            top: L.winTop + bobY,
            width: L.winW,
            height: L.winH,
            borderRadius: 14,
            overflow: 'hidden',
            border: `1.5px solid ${COLORS.windowBorder}`,
            boxShadow: '0 44px 110px rgba(9, 30, 75, 0.5), 0 12px 34px rgba(9, 30, 75, 0.35)',
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${winScale})`,
            background: '#eef2f7',
          }}
        >
          {/* Contenu transformé par la caméra (capture + overlays solidaires) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${cam.s}) translate(${(0.5 - cam.cx) * 100}%, ${(0.5 - cam.cy) * 100}%)`,
            }}
          >
            <Img
              src={staticFile(`captures/${config.capture}`)}
              style={{width: '100%', height: '100%', display: 'block'}}
            />
            {config.highlights?.map((h, i) => (
              <Highlight key={i} rect={h.rect} from={h.from} to={h.to} />
            ))}
            <SpecialOverlay sceneKey={config.key} />
            {config.labels?.map((l, i) => (
              <ImageLabel key={i} text={l.text} x={l.x} y={l.y} at={l.at} />
            ))}
            {config.cascade ? <BadgeCascade {...config.cascade} /> : null}
            {config.cursor ? <Cursor points={config.cursor.points} clicks={config.cursor.clicks} /> : null}
          </div>

          {/* Reflet discret en haut de la fenêtre */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              background: 'linear-gradient(178deg, rgba(255,255,255,0.12) 0%, transparent 14%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
