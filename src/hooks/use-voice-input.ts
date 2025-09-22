'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePermission, useEventListener } from 'react-use';

interface UseVoiceInputOptions {
    onSpeechEnd?: () => void;
    onSpeechStart?: () => void;
    onSpeechResult?: (transcript: string) => void;
    onError?: (event: any) => void;
}

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export function useVoiceInput(options: UseVoiceInputOptions = {}) {
    const { onSpeechEnd, onSpeechStart, onSpeechResult, onError } = options;
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const permissionState = usePermission({ name: 'microphone' });

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            onSpeechStart?.();
        };

        recognition.onend = () => {
            setIsListening(false);
            setTranscript('');
            onSpeechEnd?.();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            onError?.(event);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join('');
            
            setTranscript(currentTranscript);

            // Check if the result is final
            if (event.results[event.results.length - 1].isFinal) {
                onSpeechResult?.(currentTranscript);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [onSpeechEnd, onSpeechStart, onSpeechResult, onError]);

    const startListening = useCallback(() => {
        if (permissionState !== 'granted') {
            alert('Microphone permission is not granted. Please allow microphone access in your browser settings.');
            return;
        }
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Could not start recognition", e)
            }
        }
    }, [isListening, permissionState]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
             try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Could not stop recognition", e)
            }
        }
    }, [isListening]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return {
        transcript,
        isListening,
        startListening,
        stopListening,
        isSupported: !!SpeechRecognition,
        permissionState,
    };
}
