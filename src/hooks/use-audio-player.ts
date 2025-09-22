import { useState, useCallback } from 'react';
import { textToSpeech } from '@/ai/flows/text-to-speech';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const playAudio = useCallback(async (text: string, languageCode: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
    
    try {
      const response = await textToSpeech({ text, languageCode });
      const audio = new Audio(response.audioDataUri);
      setAudioElement(audio);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setAudioElement(null);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { isPlaying, playAudio };
}
