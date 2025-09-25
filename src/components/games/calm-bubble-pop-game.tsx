
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Exercise, Child } from '@/lib/types';
import { BubbleIcon } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, RotateCcw, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';
import { useAudioPlayer } from '@/hooks/use-audio-player';

type BubbleType = 'normal' | 'star';

type Bubble = {
  id: number;
  x: number;
  size: number;
  duration: number;
  color: string;
  type: BubbleType;
};

const bubbleColors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#22d3ee', // cyan-400
    '#ef4444', // red-500
];
const popSoundUri = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

let bubbleId = 0;
const STARS_TO_WIN = 5;

export function CalmBubblePopGame({ exercise, child }: { exercise: Exercise; child: Child }) {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [starsPopped, setStarsPopped] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const { toast } = useToast();
    const { playAudio, isPlaying } = useAudioPlayer();
    const popAudioRef = useRef<HTMLAudioElement>(null);
    

    const progress = useMemo(() => (starsPopped / STARS_TO_WIN) * 100, [starsPopped]);
    
    const performance = useMemo(() => {
        if (isComplete && startTime) {
            const timeTaken = (Date.now() - startTime) / 1000;
            // Base score is 100, lose 2 points for every second over 10 seconds.
            const score = Math.max(10, 100 - Math.round(Math.max(0, timeTaken - 10) * 2));
            return score;
        }
        return 0;
    }, [isComplete, startTime]);


    const createBubble = useCallback(() => {
        if (isComplete) return;
        if (!startTime) {
            setStartTime(Date.now());
        }
        // One in five chance for a star bubble
        const type: BubbleType = Math.random() < 0.2 ? 'star' : 'normal';
        
        const newBubble: Bubble = {
            id: bubbleId++,
            x: Math.random() * 90, // % from left
            size: type === 'star' ? Math.random() * 20 + 50 : Math.random() * 40 + 30, // Stars are bigger
            duration: Math.random() * 5 + 8, // 8 to 13 seconds
            color: type === 'star' ? '#fde047' : bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            type: type,
        };
        setBubbles(prev => [...prev, newBubble]);
    }, [startTime, isComplete]);

    useEffect(() => {
        if (isComplete) return;
        const interval = setInterval(createBubble, 1500); // New bubble every 1.5s
        return () => clearInterval(interval);
    }, [isComplete, createBubble]);

    const playPopSound = () => {
        if (popAudioRef.current) {
            popAudioRef.current.currentTime = 0;
            popAudioRef.current.play().catch(e => console.error("Error playing pop sound:", e));
        }
    }

    const handlePop = (bubble: Bubble) => {
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
        playPopSound();
        
        if (bubble.type === 'star') {
            setStarsPopped(prev => prev + 1);
        }
    };
    
    useEffect(() => {
        if (starsPopped >= STARS_TO_WIN) {
            setIsComplete(true);
        }
    }, [starsPopped]);

    useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                if (!isPlaying) playAudio('Well done!', 'en-US');
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: performance, difficulty: 'Easy' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: `You earned ${performance} points!` });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete]);

    const handleRestart = () => {
        setBubbles([]);
        setStarsPopped(0);
        setIsComplete(false);
        setStartTime(null);
    };

    return (
        <Card className="relative overflow-hidden">
             <audio ref={popAudioRef} src={popSoundUri} style={{ display: 'none' }} preload="auto" />
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>
                    {isComplete ? 'Great job, you completed the session!' : 'A calm space. Pop the bubbles, especially the stars!'}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] w-full p-0 border-t">
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Well Done!</h3>
                        <p className="text-muted-foreground mb-4">You collected all the stars.</p>
                        <p className="text-xl font-bold mb-6">Final Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
                            {bubbles.map(bubble => (
                                <motion.div
                                    key={bubble.id}
                                    className="absolute bottom-0"
                                    style={{
                                        left: `${bubble.x}%`,
                                        width: bubble.size,
                                        height: bubble.size,
                                    }}
                                    initial={{ y: 0, opacity: 1 }}
                                    animate={{ y: -450 }}
                                    exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.3 } }}
                                    transition={{ duration: bubble.duration, ease: "linear" }}
                                    onAnimationComplete={() => setBubbles(prev => prev.filter(b => b.id !== bubble.id))}
                                >
                                    <button onClick={() => handlePop(bubble)} className="w-full h-full relative">
                                        {bubble.type === 'star' ? (
                                            <Star className="w-full h-full text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
                                        ) : (
                                            <BubbleIcon style={{ color: bubble.color }} className="w-full h-full" />
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className="absolute inset-0 flex items-center justify-center -z-10">
                            <p className="text-muted-foreground/30 text-lg">Just relax and pop...</p>
                        </div>
                    </>
                )}
            </CardContent>
            {!isComplete && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                     <div className="flex items-center gap-2 w-full">
                        <Star className="text-yellow-400" />
                        <Progress value={progress} className="w-full" />
                     </div>
                    <Button asChild variant="secondary">
                        <Link href="/child">End Session</Link>
                    </Button>
                </div>
            )}
        </Card>
    );
}
