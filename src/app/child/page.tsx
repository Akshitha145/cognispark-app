
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { exercises } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Volume2, Loader2, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Child, GameSession } from '@/lib/types';
import { getGameSessions } from '@/lib/data';

function PlayAudioButton({ text, languageCode }: { text: string, languageCode: string }) {
    const { playAudio, isPlaying } = useAudioPlayer();

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playAudio(text, languageCode);
    }
    
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handlePlay}
            disabled={isPlaying}
            className="h-6 w-6"
        >
            {isPlaying ? <Loader2 className="animate-spin" /> : <Volume2 />}
            <span className="sr-only">Play audio</span>
        </Button>
    )
}


export default function ChildPortalPage() {
    const [child, setChild] = useState<Child | null>(null);
    const [totalPoints, setTotalPoints] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedChild = localStorage.getItem('currentChild');
        let childData: Child | null = null;
        if (storedChild) {
            childData = JSON.parse(storedChild);
            setChild(childData);
        } else {
            router.push('/child/auth');
            return;
        }
        setIsLoading(false);

        if (childData) {
            // Set up real-time listener for game sessions
            const unsubscribe = getGameSessions(childData.id, 365, (sessions) => {
                const points = sessions.reduce((acc, session) => acc + (session.score / 10), 0);
                setTotalPoints(Math.round(points));
            });
    
            // Cleanup listener on component unmount
            return () => unsubscribe();
        }

    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('currentChild');
        router.push('/');
    };

    if (isLoading || !child) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground mt-2">Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h1 className="font-headline text-2xl font-bold">Let's Play, {child.name}!</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-500" />
                        {totalPoints !== null ? (
                            <span className="font-bold text-lg">{totalPoints} Points</span>
                        ) : (
                            <span className="text-sm text-muted-foreground">Loading score...</span>
                        )}
                    </div>
                     <Button variant="outline" asChild>
                        <Link href="/rewards">
                            <Trophy className="mr-2 h-4 w-4" />
                            My Rewards
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout}>
                        Switch User
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Your Games"
                        description="Choose a game to play and earn points."
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Hear in Kannada</span>
                        <PlayAudioButton text="Choose a game to play and earn points." languageCode="kn-IN" />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [perspective:1000px]">
                    {exercises.map((exercise) => (
                        <Card key={exercise.id} className="flex flex-col transition-transform duration-300 ease-in-out hover:shadow-2xl hover:[transform:rotateX(10deg)_translateZ(20px)]">
                            <CardHeader className="flex-row items-start gap-4 space-y-0">
                                <div className="flex-shrink-0">
                                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <exercise.icon className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{exercise.title}</CardTitle>
                                        <PlayAudioButton text={exercise.title} languageCode="kn-IN" />
                                    </div>
                                    <Badge variant="outline" className="mt-1">{exercise.skill}</Badge>
                                </div>
                            </CardHeader>
                            <CardDescription className="p-6 pt-0 grow">
                                <div className="flex items-start justify-between">
                                    <span>{exercise.description}</span>
                                    <PlayAudioButton text={exercise.description} languageCode="kn-IN" />
                                </div>
                            </CardDescription>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/exercises/${exercise.id}`}>
                                        Play Game <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
