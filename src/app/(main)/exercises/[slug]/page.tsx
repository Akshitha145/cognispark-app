
'use client';

import { notFound } from 'next/navigation';
import { exercises } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mic, Loader2 } from 'lucide-react';
import { MemoryMatchGame } from '@/components/games/memory-match-game';
import { PatternPuzzlesGame } from '@/components/games/pattern-puzzles-game';
import { FocusForestGame } from '@/components/games/focus-forest-game';
import { StoryCreatorGame } from '@/components/games/story-creator-game';
import { EmotionExplorerGame } from '@/components/games/emotion-explorer-game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, use } from 'react';
import { cn } from '@/lib/utils';
import { BackgroundMusic } from '@/components/games/background-music';
import type { Child } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ExercisePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    const [child, setChild] = useState<Child | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { transcript, isListening, startListening, stopListening, isSupported } = useVoiceInput({
        onSpeechEnd: () => {
            stopListening();
        }
    });
     useEffect(() => {
        const storedChild = localStorage.getItem('currentChild');
        if (storedChild) {
            setChild(JSON.parse(storedChild));
        } else {
            // If no child is logged in, redirect to the main page or login.
            // For now, we go back to the role selection.
            router.push('/');
        }
        setIsLoading(false);
    }, [router]);

    const exercise = exercises.find((e) => e.id === slug);

    useEffect(() => {
        if (transcript && !isListening && exercise?.id !== 'emotion-explorer') {
             toast({
                title: "Heard that!",
                description: `You said: "${transcript}"`,
            });
        }
    }, [transcript, toast, isListening, exercise]);

    if (!exercise) {
        notFound();
    }

    if (isLoading) {
        return (
            <div className="flex h-full flex-1 items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin" />
               <p className="ml-2 text-muted-foreground">Loading game...</p>
            </div>
       )
    }

    if (!child) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Error" description="Could not identify the player." />
                <p className="text-muted-foreground">Please log in via the Child Portal to play.</p>
                <Button asChild><Link href="/child/login">Go to Login</Link></Button>
            </div>
        )
    }


    const renderGameForExercise = () => {
        switch(exercise.id) {
            case 'memory-match':
                return <MemoryMatchGame exercise={exercise} child={child} />;
            case 'pattern-puzzles':
                return <PatternPuzzlesGame exercise={exercise} child={child} />;
            case 'focus-forest':
                return <FocusForestGame exercise={exercise} child={child} />;
            case 'story-creator':
                return <StoryCreatorGame exercise={exercise} child={child} />;
            case 'emotion-explorer':
                return <EmotionExplorerGame exercise={exercise} child={child} transcript={transcript} isListening={isListening} />;
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
    
    const handleMicClick = () => {
        if (!isSupported) {
            toast({
                variant: 'destructive',
                title: "Voice input not supported",
                description: "Your browser does not support the Web Speech API.",
            });
            return;
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6">
            <BackgroundMusic />
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/child"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <PageHeader title={exercise.title} description={exercise.description} />
                </div>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleMicClick}
                    className={cn(isListening && 'bg-destructive/20 border-destructive text-destructive-foreground')}
                >
                    <Mic className="h-4 w-4" />
                    <span className="sr-only">Voice Commands</span>
                </Button>
            </div>

            {renderGameForExercise()}
        </div>
    );
}
