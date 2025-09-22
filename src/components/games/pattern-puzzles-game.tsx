'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, XCircle, Lightbulb, Square, Triangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/types';

const patterns = [
    { sequence: [Square, Triangle, Square], options: [Triangle, Square], correct: 0 },
    { sequence: [Lightbulb, Lightbulb, Square], options: [Square, Lightbulb], correct: 1 },
    { sequence: [Triangle, Square, Triangle], options: [Square, Triangle], correct: 1 },
];

export function PatternPuzzlesGame({ exercise }: { exercise: Exercise }) {
    const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);

    const currentPattern = useMemo(() => patterns[currentPatternIndex], [currentPatternIndex]);

    const handleOptionClick = (index: number) => {
        setSelectedOption(index);
        const correct = index === currentPattern.correct;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
        }
        setTimeout(() => {
            if (currentPatternIndex < patterns.length - 1) {
                setCurrentPatternIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setIsComplete(true);
            }
        }, 1500);
    };

    const handleRestart = () => {
        setCurrentPatternIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsComplete(false);
        setScore(0);
    };

    const performance = Math.round((score / patterns.length) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                        <p className="text-muted-foreground mb-4">You've completed the pattern puzzles.</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8">
                        <div className="text-lg">Complete the pattern:</div>
                        <div className="flex items-center gap-4">
                            {currentPattern.sequence.map((Icon, index) => <Icon key={index} className="h-16 w-16 text-primary" />)}
                            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-primary text-4xl font-bold">?</div>
                        </div>

                        <div className="flex gap-4">
                            {currentPattern.options.map((Icon, index) => {
                                const isSelected = selectedOption === index;
                                const isTheCorrect = isCorrect !== null && index === currentPattern.correct;
                                return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={cn(
                                        "h-24 w-24",
                                        isSelected && isCorrect === false && "bg-destructive/20 border-destructive text-destructive-foreground",
                                        isTheCorrect && "bg-green-500/20 border-green-500"
                                    )}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={selectedOption !== null}
                                >
                                    <Icon className="h-12 w-12" />
                                </Button>
                            )})}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
