
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import type { Exercise, Child } from '@/lib/types';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';
import { useToast } from '@/hooks/use-toast';
import { ButterflyIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/use-audio-player';

const GRID_SIZE = 9;

export function ButterflyBalanceGame({ exercise, child }: { exercise: Exercise; child: Child }) {
    const [butterflies, setButterflies] = useState(Array(GRID_SIZE).fill(false));
    const [glowingIndex, setGlowingIndex] = useState(-1);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [round, setRound] = useState(1);
    const [isComplete, setIsComplete] = useState(false);
    const { toast } = useToast();
    const { playAudio, isPlaying } = useAudioPlayer();

    const performance = useMemo(() => Math.max(0, Math.round((score / (round -1)) * 100) - (mistakes * 5)), [score, round, mistakes]);

    const lightUpRandomButterfly = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * GRID_SIZE);
        setGlowingIndex(randomIndex);

        setTimeout(() => {
            setGlowingIndex(-1);
            // If the user missed it, count it as a miss for the round if it's not the final round
            if (round < 10) {
                 setRound(r => r + 1);
            } else {
                 setIsComplete(true);
            }
        }, 1500); // Butterfly glows for 1.5 seconds

    }, [round]);

    useEffect(() => {
        if (!isComplete) {
            const gameLoop = setTimeout(lightUpRandomButterfly, 2000); // New butterfly appears every 2 seconds
            return () => clearTimeout(gameLoop);
        }
    }, [round, isComplete, lightUpRandomButterfly]);
    
    useEffect(() => {
        if (round > 10 && !isComplete) {
            setIsComplete(true);
        }
    }, [round, isComplete]);

     useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                if (!isPlaying) playAudio('Great focus!', 'en-US');
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: performance, difficulty: 'Medium' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: 'Your score has been recorded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete]);

    const handleButterflyClick = (index: number) => {
        if (isComplete) return;

        if (index === glowingIndex) {
            setScore(s => s + 1);
            setGlowingIndex(-1); // Stop glowing immediately on correct click
            if (!isPlaying) playAudio('Correct!', 'en-US');
            setRound(r => r + 1);

        } else {
            setMistakes(m => m + 1);
            if (!isPlaying) playAudio('Oops, try again!', 'en-US');
            toast({
                variant: 'destructive',
                title: 'Oops!',
                description: 'That wasn\'t the glowing butterfly. Try to focus on the right one!',
                duration: 2000,
            })
        }
    };

    const handleRestart = () => {
        setScore(0);
        setMistakes(0);
        setRound(1);
        setIsComplete(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>Tap only the glowing butterfly. Rounds: {Math.min(round, 10)}/10. Score: {score}. Mistakes: {mistakes}.</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Great Focus!</h3>
                        <p className="text-muted-foreground mb-4">You've completed the exercise.</p>
                        <p className="text-xl font-bold mb-6">Final Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {butterflies.map((_, index) => (
                            <button
                                key={index}
                                className="aspect-square flex items-center justify-center rounded-lg bg-secondary hover:bg-primary/10 transition-colors"
                                onClick={() => handleButterflyClick(index)}
                            >
                                <ButterflyIcon className={cn(
                                    "h-16 w-16 text-primary/50 transition-all duration-300",
                                    glowingIndex === index && "text-amber-400 scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                                )} />
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
