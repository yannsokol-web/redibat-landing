import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {AudioTrack} from './AudioTrack';
import {CaptureScene} from './scenes/CaptureScene';
import {Chapter} from './scenes/Chapter';
import {Intro} from './scenes/Intro';
import {Outro} from './scenes/Outro';
import {OVERLAP, SCENE_LIST, SCENE_STARTS, SceneEntry} from './timeline';

/**
 * Enveloppe de transition : la scène entre en fondu par-dessus la
 * précédente (cross-dissolve), avec un léger zoom-through après les
 * cartons de chapitre. Jamais de coupe sèche.
 */
const SceneShell: React.FC<{
  index: number;
  entrance: 'fade' | 'zoomOut' | 'zoomIn';
  children: React.ReactNode;
}> = ({index, entrance, children}) => {
  const frame = useCurrentFrame();
  if (index === 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const t = interpolate(frame, [0, OVERLAP], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const scale = entrance === 'zoomIn' ? 1.1 - 0.1 * t : entrance === 'zoomOut' ? 0.94 + 0.06 * t : 1.015 - 0.015 * t;
  const blur = entrance === 'fade' ? 0 : (1 - t) * 7;
  return (
    <AbsoluteFill style={{opacity: t, transform: `scale(${scale})`, filter: blur > 0.1 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

/** Flashs blancs aux entrées de chapitres (réf. transitions Axonaut). */
const Flashes: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  SCENE_LIST.forEach((scene, i) => {
    if (scene.kind !== 'chapter') return;
    const s = SCENE_STARTS[i];
    opacity = Math.max(
      opacity,
      interpolate(frame, [s - 2, s + 3, s + 18], [0, 0.85, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    );
  });
  if (opacity <= 0.01) return null;
  return <AbsoluteFill style={{background: '#ffffff', opacity, pointerEvents: 'none'}} />;
};

const renderScene = (scene: SceneEntry, analyseSection: boolean) => {
  switch (scene.kind) {
    case 'intro':
      return <Intro />;
    case 'outro':
      return <Outro />;
    case 'chapter':
      return <Chapter chapter={scene.chapter} />;
    case 'capture':
      return <CaptureScene config={scene.config} tint={analyseSection ? 'cyan' : 'blue'} />;
  }
};

export const Main: React.FC = () => {
  let analyse = false;
  return (
    <AbsoluteFill style={{backgroundColor: '#1b4cb4'}}>
      {SCENE_LIST.map((scene, i) => {
        if (scene.kind === 'chapter' && scene.key === 'ch-analyse') analyse = true;
        const prev = SCENE_LIST[i - 1];
        const entrance: 'fade' | 'zoomOut' | 'zoomIn' =
          scene.kind === 'chapter' ? 'zoomIn' : prev?.kind === 'chapter' ? 'zoomOut' : 'fade';
        return (
          <Sequence key={scene.key} from={SCENE_STARTS[i]} durationInFrames={scene.duration}>
            <SceneShell index={i} entrance={entrance}>
              {renderScene(scene, analyse)}
            </SceneShell>
          </Sequence>
        );
      })}
      <Flashes />
      <AudioTrack />
    </AbsoluteFill>
  );
};
