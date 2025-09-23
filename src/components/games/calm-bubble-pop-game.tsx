
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    'hsl(var(--primary) / 0.4)',
    'hsl(var(--accent) / 0.4)',
    '#8b5cf666', // violet-500 with 40% opacity
    '#ec489966', // pink-500 with 40% opacity
    '#22d3ee66', // cyan-400 with 40% opacity
];
const popSoundUrl = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-zapsplat/zapsplat_multimedia_button_click_fast_short_soft_001_63852.mp3';

let bubbleId = 0;
const STARS_TO_WIN = 5;

export function CalmBubblePopGame({ exercise, child }: { exercise: Exercise; child: Child }) {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [starsPopped, setStarsPopped] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const { toast } = useToast();

    const progress = useMemo(() => (starsPopped / STARS_TO_WIN) * 100, [starsPopped]);
    const score = useMemo(() => Math.round((starsPopped / STARS_TO_WIN) * 100), [starsPopped]);

    const createBubble = useCallback(() => {
        // One in five chance for a star bubble
        const type: BubbleType = Math.random() < 0.2 ? 'star' : 'normal';
        
        const newBubble: Bubble = {
            id: bubbleId++,
            x: Math.random() * 90, // % from left
            size: type === 'star' ? Math.random() * 20 + 50 : Math.random() * 40 + 30, // Stars are bigger
            duration: Math.random() * 5 + 8, // 8 to 13 seconds
            color: type === 'star' ? '#fde04799' : bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            type: type,
        };
        setBubbles(prev => [...prev, newBubble]);
    }, []);

    useEffect(() => {
        if (isComplete) return;
        const interval = setInterval(createBubble, 1500); // New bubble every 1.5s
        return () => clearInterval(interval);
    }, [isComplete, createBubble]);

    const handlePop = (bubble: Bubble) => {
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
        new Audio(popSoundUrl).play().catch(e => console.error("Error playing sound", e));
        
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
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: score, difficulty: 'Easy' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: `You earned ${score} points!` });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    }, [isComplete, exercise.id, score, toast, child.id]);

    const handleRestart = () => {
        setBubbles([]);
        setStarsPopped(0);
        setIsComplete(false);
    };

    return (
        <Card className="relative overflow-hidden">
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
                        <p className="text-xl font-bold mb-6">Final Score: {score}%</p>
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
                                            <Star className="w-full h-full text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
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
