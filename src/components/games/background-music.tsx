
'use client';

import { useEffect, useRef } from 'react';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.1;
    audio.loop = true;

    const playAudio = () => {
      audio.play().catch((err) => {
        console.warn('Autoplay prevented, will try on user interaction:', err);
      });
    };

    playAudio();

    // Fallback: play on first user interaction
    const handleUserInteraction = () => {
      playAudio();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/audio/background.mp3"
      style={{ display: 'none' }}
      preload="auto"
    />
  );
}
