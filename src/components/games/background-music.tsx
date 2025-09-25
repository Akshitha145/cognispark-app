
'use client';

import { useEffect, useRef, useState } from 'react';

export function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && audioRef.current) {
            const audio = audioRef.current;
            audio.volume = 0.1; // Set a low volume
            
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Background music autoplay was prevented:", error);
                    const playOnFirstClick = () => {
                        audio.play().catch(e => console.error("Could not play audio on click", e));
                        window.removeEventListener('click', playOnFirstClick);
                    };
                    window.addEventListener('click', playOnFirstClick);
                });
            }
        }
    }, [isMounted]);

    if (!isMounted) {
        return null;
    }

    return (
        <audio ref={audioRef} loop>
            <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
}
