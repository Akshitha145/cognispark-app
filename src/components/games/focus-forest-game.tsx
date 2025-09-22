'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';
import type { Exercise } from '@/lib/types';

// Using emojis for a more playful feel
const animals = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'];

type GameItem = {
    animal: string;
    isUnique: boolean;
};

function generateLevel(): GameItem[] {
    const commonAnimal = animals[Math.floor(Math.random() * animals.length)];
    let uniqueAnimal;
    do {
        uniqueAnimal = animals[Math.floor(Math.random() * animals.length)];
    } while (uniqueAnimal === commonAnimal);

    const items: GameItem[] = Array(9).fill(0).map(() => ({ animal: commonAnimal, isUnique: false }));
    const uniqueIndex = Math.floor(Math.random() * 9);
    items[uniqueIndex] = { animal: uniqueAnimal, isUnique: true };
    
    return items;
}

export function FocusForestGame({ exercise }: { exercise: Exercise }) {
    const [levelItems, setLevelItems] = useState<GameItem[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeTaken, setTimeTaken] = useState<number | null>(null);

    useEffect(() => {
        setLevelItems(generateLevel());
        setStartTime(Date.now());
    }, []);

    const handleItemClick = (item: GameItem) => {
        if (item.isUnique) {
            const endTime = Date.now();
            setTimeTaken((endTime - startTime) / 1000);
            setIsComplete(true);
        } else {
            // Optional: Add a small penalty or visual feedback for wrong clicks
        }
    };
    
    const handleRestart = () => {
        setLevelItems(generateLevel());
        setIsComplete(false);
        setStartTime(Date.now());
        setTimeTaken(null);
    };
    
    const performance = timeTaken ? Math.max(10, 100 - Math.floor(timeTaken - 3) * 10) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>Find the animal that is different from the rest!</CardDescription>
            </CardHeader>
            <CardContent>
                {isComplete ? (
                     <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">You found it!</h3>
                        <p className="text-muted-foreground mb-4">You completed the level in {timeTaken} seconds.</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {levelItems.map((item, index) => (
                            <button
                                key={index}
                                className="aspect-square flex items-center justify-center rounded-lg bg-secondary hover:bg-primary/10 transition-colors"
                                onClick={() => handleItemClick(item)}
                            >
                                <span className="text-5xl">{item.animal}</span>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
