'use client';

import { useEffect, useRef } from 'react';

// A very short, looping, and lightweight audio clip as a data URI to prevent build/network errors.
const backgroundMusicDataUri = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.1;
    audio.loop = true;

    // This function attempts to play the audio and handles browser autoplay restrictions.
    const playAudio = () => {
      audio.play().catch((error) => {
        console.warn('Autoplay was prevented. Music will start on user interaction.', error);
      });
    };

    // Attempt to play immediately
    playAudio();

    // If autoplay fails, this listener will start the music on the first user interaction.
    const handleFirstInteraction = () => {
      playAudio();
      // Remove the listener after it has run once.
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    // Cleanup function: this runs when the component is unmounted.
    return () => {
      audio.pause();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src={backgroundMusicDataUri}
      preload="auto"
      style={{ display: 'none' }}
    />
  );
}
