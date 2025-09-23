
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';
import type { Exercise, Child } from '@/lib/types';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];
const shapes = ['circle', 'square', 'triangle'] as const;

type Shape = (typeof shapes)[number];

type GameItem = {
    id: number;
    color: string;
    shape: Shape;
};

function generateLevel() {
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    const items: GameItem[] = Array(12).fill(0).map((_, i) => {
        let color = colors[Math.floor(Math.random() * colors.length)];
        // Ensure at least 4 target colors and some distractors
        if (i < 4) {
            color = targetColor;
        }
        return {
            id: i,
            color,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
        };
    });
    return { items: items.sort(() => Math.random() - 0.5), targetColor };
}

export function ColorQuestGame({ exercise, child }: { exercise: Exercise; child: Child }) {
    const [level, setLevel] = useState(generateLevel);
    const [found, setFound] = useState<number[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const { toast } = useToast();

    const totalTargets = useMemo(() => level.items.filter(item => item.color === level.targetColor).length, [level]);
    const performance = Math.round((found.length / totalTargets) * 100);

    const handleItemClick = (item: GameItem) => {
        if (item.color === level.targetColor && !found.includes(item.id)) {
            const newFound = [...found, item.id];
            setFound(newFound);
        }
    };
    
    const checkCompletion = useCallback(() => {
        if (found.length === totalTargets) {
            setIsComplete(true);
        }
    }, [found, totalTargets]);


    useEffect(() => {
        checkCompletion();
    }, [found, checkCompletion]);

    useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: performance, difficulty: 'Medium' });
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
        setLevel(generateLevel());
        setFound([]);
        setIsComplete(false);
        setStartTime(Date.now());
    };
    
    const ShapeComponent = ({ shape, color, ...props }: {shape: Shape, color: string} & React.HTMLAttributes<HTMLDivElement>) => {
        const style = { backgroundColor: color };
        if (shape === 'circle') {
            return <div className="h-12 w-12 rounded-full" style={style} {...props}></div>;
        }
        if (shape === 'square') {
            return <div className="h-12 w-12 rounded-md" style={style} {...props}></div>;
        }
        if (shape === 'triangle') {
            return (
                <div
                    className="h-0 w-0 border-x-[24px] border-x-transparent border-b-[48px]"
                    style={{ borderBottomColor: color }}
                    {...props}
                ></div>
            );
        }
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>Find and click all the shapes with the target color.</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                     <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">You found them all!</h3>
                        <p className="text-muted-foreground mb-4">Great job focusing!</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4 text-lg">
                            <span>Find this color:</span>
                            <div className="h-8 w-8 rounded-md" style={{ backgroundColor: level.targetColor }}></div>
                            <span>Found: {found.length} / {totalTargets}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-secondary">
                            {level.items.map((item) => (
                                <button
                                    key={item.id}
                                    className={cn(
                                        "aspect-square flex items-center justify-center rounded-lg bg-background hover:scale-110 transition-transform",
                                        found.includes(item.id) && "opacity-25"
                                    )}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <ShapeComponent shape={item.shape} color={item.color} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
