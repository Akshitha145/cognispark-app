
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, XCircle, Lightbulb, Square, Triangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise, Child } from '@/lib/types';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/use-audio-player';

const puzzles = [
    { target: Square, options: [Square, Triangle, Lightbulb], correct: 0 },
    { target: Triangle, options: [Lightbulb, Triangle, Square], correct: 1 },
    { target: Lightbulb, options: [Square, Lightbulb, Triangle], correct: 1 },
    { target: Square, options: [Triangle, Square, Lightbulb], correct: 1 },
];

export function PatternPuzzlesGame({ exercise, child }: { exercise: Exercise, child: Child }) {
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const { toast } = useToast();
    const { playAudio, isPlaying } = useAudioPlayer();

    const currentPuzzle = useMemo(() => puzzles[currentPuzzleIndex], [currentPuzzleIndex]);
    const performance = Math.round((score / puzzles.length) * 100);

    const handleOptionClick = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        const correct = index === currentPuzzle.correct;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
            if (!isPlaying) playAudio('Correct!', 'en-US');
        } else {
            if (!isPlaying) playAudio('Oops, try again!', 'en-US');
        }
        setTimeout(() => {
            if (currentPuzzleIndex < puzzles.length - 1) {
                setCurrentPuzzleIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setIsComplete(true);
            }
        }, 1500);
    };

     useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                if (!isPlaying) playAudio('Great job!', 'en-US');
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: performance, difficulty: 'Easy' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: 'Your score has been recorded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete, exercise.id, performance, toast, child.id]);

    const handleRestart = () => {
        setCurrentPuzzleIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsComplete(false);
        setScore(0);
    };

    const TargetIcon = currentPuzzle.target;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>Match the shapes to complete the puzzle!</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                        <p className="text-muted-foreground mb-4">You've completed the shape puzzles.</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-12 p-4">
                        <div className="flex flex-col items-center gap-4">
                             <div className="flex items-center justify-center h-24 w-24 rounded-lg bg-muted">
                                <TargetIcon className="h-16 w-16 text-primary" />
                            </div>
                            <div className="w-px h-12 bg-border"></div>
                             <div className="flex items-center justify-center h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground">
                                <HelpCircle className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {currentPuzzle.options.map((Icon, index) => {
                                const isSelected = selectedOption === index;
                                const isTheCorrect = isCorrect !== null && index === currentPuzzle.correct;
                                return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={cn(
                                        "h-24 w-24 relative",
                                        isSelected && isCorrect === false && "bg-destructive/20 border-destructive",
                                        isTheCorrect && "bg-green-500/20 border-green-500"
                                    )}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={selectedOption !== null}
                                >
                                    <Icon className="h-12 w-12" />
                                    {isSelected && isCorrect === false && <XCircle className="h-5 w-5 absolute -top-2 -right-2 text-white bg-destructive rounded-full" />}
                                    {isTheCorrect && <CheckCircle className="h-5 w-5 absolute -top-2 -right-2 text-white bg-green-500 rounded-full" />}
                                </Button>
                            )})}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
