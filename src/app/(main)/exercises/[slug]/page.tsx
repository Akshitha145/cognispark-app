'use client';

import { notFound } from 'next/navigation';
import { exercises } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mic } from 'lucide-react';
import { MemoryMatchGame } from '@/components/games/memory-match-game';
import { PatternPuzzlesGame } from '@/components/games/pattern-puzzles-game';
import { FocusForestGame } from '@/components/games/focus-forest-game';
import { StoryCreatorGame } from '@/components/games/story-creator-game';
import { EmotionExplorerGame } from '@/components/games/emotion-explorer-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExercisePage({ params }: { params: { slug: string } }) {
    const exercise = exercises.find((e) => e.id === params.slug);

    if (!exercise) {
        notFound();
    }

    const renderGameForExercise = () => {
        switch(exercise.id) {
            case 'memory-match':
                return <MemoryMatchGame exercise={exercise} />;
            case 'pattern-puzzles':
                return <PatternPuzzlesGame exercise={exercise} />;
            case 'focus-forest':
                return <FocusForestGame exercise={exercise} />;
            case 'story-creator':
                return <StoryCreatorGame exercise={exercise} />;
            case 'emotion-explorer':
                return <EmotionExplorerGame exercise={exercise} />;
            default:
                return (
                     <Card className="flex-1">
                        <CardHeader>
                        <CardTitle>Coming Soon!</CardTitle>
                        <CardDescription>
                            This game is currently under development.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground">Interactive game coming soon.</p>
                        </div>
                        </CardContent>
                    </Card>
                )
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/exercises"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <PageHeader title={exercise.title} description={exercise.description} />
                </div>
                <Button variant="outline" size="icon">
                    <Mic className="h-4 w-4" />
                    <span className="sr-only">Voice Commands</span>
                </Button>
            </div>

            {renderGameForExercise()}
        </div>
    );
}
