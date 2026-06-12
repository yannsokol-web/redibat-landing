import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {DUCK_FRAMES, SFX_EVENTS, TOTAL_DURATION} from './timeline';

const MUSIC_BASE = 0.72;

/**
 * Volume de la musique : fondu d'entrée/sortie + « ducking » doux autour
 * des bruitages marqués (drop, validation).
 */
const musicVolume = (frame: number) => {
  const fadeIn = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [TOTAL_DURATION - 80, TOTAL_DURATION - 8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  let duck = 1;
  for (const d of DUCK_FRAMES) {
    const factor = interpolate(frame, [d - 18, d, d + 8, d + 40], [1, 0.5, 0.5, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    duck = Math.min(duck, factor);
  }
  return MUSIC_BASE * fadeIn * fadeOut * duck;
};

/** Musique de fond + bruitages calés frame par frame (voir timeline.ts). */
export const AudioTrack: React.FC = () => {
  return (
    <>
      <Audio src={staticFile('audio/music/ambient-bed.wav')} volume={musicVolume} />
      {SFX_EVENTS.map((e, i) => (
        <Sequence key={i} from={e.frame} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${e.file}.wav`)} volume={e.volume} />
        </Sequence>
      ))}
    </>
  );
};
