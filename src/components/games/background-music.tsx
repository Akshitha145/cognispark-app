'use client';

import { useEffect, useRef } from 'react';

export function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.1; // Set a low volume
            // Autoplay can be tricky. This is a common approach.
            audio.play().catch(error => {
                console.warn("Background music autoplay was prevented:", error);
                // In some browsers, autoplay is blocked until the user interacts with the page.
                // We can add a click listener to start it on the first interaction.
                const playOnFirstClick = () => {
                    audio.play().catch(e => console.error("Could not play audio on click", e));
                    window.removeEventListener('click', playOnFirstClick);
                };
                window.addEventListener('click', playOnFirstClick);
            });
        }
    }, []);

    return (
        <audio ref={audioRef} loop>
            <source src="https://www.chosic.com/wp-content/uploads/2022/01/Evening-Improvisation-with-calm-river-and-birds.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
}
