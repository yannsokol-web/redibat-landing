import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, TOTAL_DURATION} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vidéo principale — hero de la landing (1920×1080, ~85 s) */}
      <Composition
        id="RedibatPresentation"
        component={Main}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/* Variante carrée pour le social (mêmes scènes, mise en page adaptée) */}
      <Composition
        id="RedibatSquare"
        component={Main}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
