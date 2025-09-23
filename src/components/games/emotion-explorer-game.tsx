
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise, Child } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';

const emotions = [
    { emoji: '😊', name: 'Happy' },
    { emoji: '😢', name: 'Sad' },
    { emoji: '😠', name: 'Angry' },
    { emoji: '😨', name: 'Scared' },
    { emoji: '🥳', name: 'Excited' },
    { emoji: '😮', name: 'Surprised' },
];

function generatePuzzles() {
    const shuffledEmotions = [...emotions].sort(() => 0.5 - Math.random());
    return shuffledEmotions.map(emotion => {
        const options = [...emotions]
            .filter(e => e.name !== emotion.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
        options.push(emotion);
        return {
            target: emotion,
            options: options.sort(() => 0.5 - Math.random()),
        };
    });
}


export function EmotionExplorerGame({ 
    exercise,
    child,
    transcript,
    isListening
}: { 
    exercise: Exercise,
    child: Child,
    transcript?: string;
    isListening?: boolean;
}) {
    const { toast } = useToast();
    const [puzzles, setPuzzles] = useState(generatePuzzles);
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);

    const currentPuzzle = useMemo(() => puzzles[currentPuzzleIndex], [puzzles, currentPuzzleIndex]);
    const performance = Math.round((score / puzzles.length) * 100);

    const handleSelect = useCallback((emotionName: string) => {
        if (selectedOption) return; // Prevent multiple clicks

        setSelectedOption(emotionName);
        const correct = emotionName === currentPuzzle.target.name;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
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
    }, [currentPuzzle, currentPuzzleIndex, puzzles.length, selectedOption]);

    useEffect(() => {
        if (transcript && !isListening && !selectedOption) {
            const heardEmotion = transcript.toLowerCase().trim().replace('.', '');
            const matchingEmotion = emotions.find(e => e.name.toLowerCase() === heardEmotion);

            if (matchingEmotion) {
                toast({
                    title: 'Voice Command Received',
                    description: `You said "${matchingEmotion.name}". Selecting it.`
                })
                handleSelect(matchingEmotion.name);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Voice Command Not Recognized',
                    description: `Sorry, I didn't understand "${transcript}".`
                })
            }
        }
    }, [transcript, isListening, selectedOption, handleSelect, toast]);

     useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: performance, difficulty: 'Easy' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: 'Your score has been recorded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    }, [isComplete, exercise.id, performance, toast, child.id]);


    const handleRestart = () => {
        setPuzzles(generatePuzzles());
        setCurrentPuzzleIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsComplete(false);
        setScore(0);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>Which emotion is this? Match the face to the correct word.</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                        <p className="text-muted-foreground mb-4">You're an emotion expert!</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8">
                        <div className="text-8xl">
                            {currentPuzzle.target.emoji}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            {currentPuzzle.options.map((emotion) => {
                                const isSelected = selectedOption === emotion.name;
                                const isTheCorrectAnswer = isCorrect !== null && emotion.name === currentPuzzle.target.name;

                                return (
                                <Button
                                    key={emotion.name}
                                    variant="outline"
                                    className={cn(
                                        "h-16 text-lg px-6",
                                        isSelected && isCorrect === false && "bg-destructive/20 border-destructive",
                                        isTheCorrectAnswer && "bg-green-500/20 border-green-500"
                                    )}
                                    onClick={() => handleSelect(emotion.name)}
                                    disabled={selectedOption !== null}
                                >
                                    {emotion.name}
                                </Button>
                            )})}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
