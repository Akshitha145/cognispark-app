'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';

const scenarios = [
    { text: 'You got a new puppy!', emotion: '😊', name: 'happy' },
    { text: 'You dropped your ice cream.', emotion: '😢', name: 'sad' },
    { text: 'You saw a spider!', emotion: '😨', name: 'scared' },
    { text: "It's your birthday!", emotion: '🥳', name: 'excited' },
];

const emotions = [
    { emoji: '😊', name: 'happy' },
    { emoji: '😢', name: 'sad' },
    { emoji: '😠', name: 'angry' },
    { emoji: '😨', name: 'scared' },
    { emoji: '🥳', name: 'excited' },
]


export function EmotionExplorerGame({ 
    exercise,
    transcript,
    isListening
}: { 
    exercise: Exercise,
    transcript?: string;
    isListening?: boolean;
}) {
    const { toast } = useToast();
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);

    const currentScenario = useMemo(() => scenarios[currentScenarioIndex], [currentScenarioIndex]);
    const performance = Math.round((score / scenarios.length) * 100);

    const handleEmotionSelect = (emotionName: string) => {
        const selected = emotions.find(e => e.name === emotionName);
        if (!selected) return;

        setSelectedEmotion(selected.emoji);
        const correct = selected.name === currentScenario.name;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
        }

        setTimeout(() => {
            if (currentScenarioIndex < scenarios.length - 1) {
                setCurrentScenarioIndex(prev => prev + 1);
                setSelectedEmotion(null);
                setIsCorrect(null);
            } else {
                setIsComplete(true);
            }
        }, 1500);
    };

    useEffect(() => {
        if (transcript && !isListening && !selectedEmotion) {
            const heardEmotion = transcript.toLowerCase().trim().replace('.', '');
            const matchingEmotion = emotions.find(e => e.name === heardEmotion);

            if (matchingEmotion) {
                toast({
                    title: 'Voice Command Received',
                    description: `You said "${matchingEmotion.name}". Selecting it.`
                })
                handleEmotionSelect(matchingEmotion.name);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Voice Command Not Recognized',
                    description: `Sorry, I didn't understand "${transcript}". Try saying "happy", "sad", "angry", "scared", or "excited".`
                })
            }
        }
    }, [transcript, isListening, selectedEmotion]);

     useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                // TODO: Get the real childId
                const result = await saveGameSession({ childId: 'child1', exerciseId: exercise.id, score: performance, difficulty: 'Easy' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: 'Your score has been recorded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    }, [isComplete, exercise.id, performance, toast]);


    const handleRestart = () => {
        setCurrentScenarioIndex(0);
        setSelectedEmotion(null);
        setIsCorrect(null);
        setIsComplete(false);
        setScore(0);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>How would you feel? Match the emotion to the situation by clicking a button or using your voice.</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                        <p className="text-muted-foreground mb-4">You are an emotion expert!</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8">
                        <div className="h-24 w-full rounded-lg border-2 border-dashed bg-muted p-4 flex items-center justify-center">
                            <p className="text-2xl font-semibold text-center">{currentScenario.text}</p>
                        </div>
                        
                        <div className="flex gap-4">
                            {emotions.map((emotion) => {
                                const isSelected = selectedEmotion === emotion.emoji;
                                const isTheCorrect = isCorrect !== null && emotion.name === currentScenario.name;
                                return (
                                <Button
                                    key={emotion.emoji}
                                    variant="outline"
                                    className={cn(
                                        "h-20 w-20 text-4xl",
                                        isSelected && isCorrect === false && "bg-destructive/20 border-destructive",
                                        isTheCorrect && "bg-green-500/20 border-green-500"
                                    )}
                                    onClick={() => handleEmotionSelect(emotion.name)}
                                    disabled={selectedEmotion !== null}
                                >
                                    {emotion.emoji}
                                </Button>
                            )})}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}