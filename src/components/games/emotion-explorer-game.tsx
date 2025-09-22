'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/types';

const scenarios = [
    { text: 'You got a new puppy!', emotion: '😊' },
    { text: 'You dropped your ice cream.', emotion: '😢' },
    { text: 'You saw a spider!', emotion: '😨' },
    { text: "It's your birthday!", emotion: '🥳' },
];
const emotions = ['😊', '😢', '😠', '😨', '🥳'];


export function EmotionExplorerGame({ exercise }: { exercise: Exercise }) {
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);

    const currentScenario = useMemo(() => scenarios[currentScenarioIndex], [currentScenarioIndex]);
    
    const handleEmotionClick = (emotion: string) => {
        setSelectedEmotion(emotion);
        const correct = emotion === currentScenario.emotion;
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

    const handleRestart = () => {
        setCurrentScenarioIndex(0);
        setSelectedEmotion(null);
        setIsCorrect(null);
        setIsComplete(false);
        setScore(0);
    };
    
    const performance = Math.round((score / scenarios.length) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>How would you feel? Match the emotion to the situation.</CardDescription>
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
                                const isSelected = selectedEmotion === emotion;
                                const isTheCorrect = isCorrect !== null && emotion === currentScenario.emotion;
                                return (
                                <Button
                                    key={emotion}
                                    variant="outline"
                                    className={cn(
                                        "h-20 w-20 text-4xl",
                                        isSelected && isCorrect === false && "bg-destructive/20 border-destructive",
                                        isTheCorrect && "bg-green-500/20 border-green-500"
                                    )}
                                    onClick={() => handleEmotionClick(emotion)}
                                    disabled={selectedEmotion !== null}
                                >
                                    {emotion}
                                </Button>
                            )})}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
