'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, Wand } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/types';

const storyParts = [
    { type: 'Character', words: ['The cat', 'The hero', 'The alien'] },
    { type: 'Action', words: ['jumped over', 'danced with', 'flew to'] },
    { type: 'Object', words: ['the moon', 'a rainbow', 'a giant cookie'] },
];

export function StoryCreatorGame({ exercise }: { exercise: Exercise }) {
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [story, setStory] = useState<string[]>([]);

    const handleWordSelect = (word: string) => {
        const newStory = [...story, word];
        setStory(newStory);
        if (currentPartIndex < storyParts.length - 1) {
            setCurrentPartIndex(currentPartIndex + 1);
        }
    };
    
    const handleRestart = () => {
        setStory([]);
        setCurrentPartIndex(0);
    };
    
    const isComplete = story.length === storyParts.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-8">
                    <div className="h-24 min-h-24 w-full rounded-lg border-2 border-dashed bg-muted p-4 flex items-center justify-center">
                        <p className="text-2xl font-semibold text-center">{story.join(' ')}</p>
                    </div>

                    {isComplete ? (
                        <div className="text-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                            <h3 className="text-2xl font-bold">Great Story!</h3>
                             <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Create Another Story</Button>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                            <h3 className="text-lg font-medium mb-4">Choose a word for: <span className="text-primary">{storyParts[currentPartIndex].type}</span></h3>
                            <div className="grid grid-cols-3 gap-4">
                                {storyParts[currentPartIndex].words.map((word) => (
                                    <Button key={word} variant="outline" className="h-16 text-lg" onClick={() => handleWordSelect(word)}>
                                        {word}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
