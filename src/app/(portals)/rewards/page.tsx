
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { badges, getGameSessions } from '@/lib/data';
import { BadgeIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { View, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Child } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function RewardsPage() {
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

    if (isLoading || totalPoints === null) {
        return (
             <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2 text-muted-foreground">Loading rewards...</p>
             </div>
        )
    }

    if (!child) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="No Rewards Data" description="Please log in as a child to view your rewards." />
            </div>
        )
    }
    
    const pointsPerLevel = 100;
    const userLevel = Math.floor(totalPoints / pointsPerLevel) + 1;
    const pointsInCurrentLevel = totalPoints % pointsPerLevel;
    const progressPercentage = (pointsInCurrentLevel / pointsPerLevel) * 100;
  
    return (
        <div className="flex flex-1 flex-col gap-6">
            <PageHeader
                title="Rewards & Achievements"
                description="Track your progress, level up, and collect awesome badges!"
            >
                <Button asChild variant="outline">
                    <Link href="/rewards/ar">
                        <View className="mr-2" />
                        View in AR
                    </Link>
                </Button>
            </PageHeader>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-xl font-semibold">Level {userLevel}</h3>
                        <p className="text-sm text-muted-foreground">{totalPoints} Total Points</p>
                    </div>
                    <Progress value={progressPercentage} />
                    <p className="text-center text-sm text-muted-foreground">
                        {pointsPerLevel - pointsInCurrentLevel} points to the next level!
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Badge Collection</CardTitle>
                    <CardDescription>Celebrate your achievements with these special badges.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {badges.map((badge, index) => (
                        <div key={badge.id} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className={`h-20 w-20 flex items-center justify-center rounded-full ${index < 3 ? 'bg-accent/20' : 'bg-secondary'}`}>
                                <badge.icon className={`h-10 w-10 ${index < 3 ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                            </div>
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                    ))}
                    <div className="flex flex-col items-center text-center gap-2 p-4 border-2 border-dashed rounded-lg justify-center bg-secondary/50">
                        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-secondary">
                            <BadgeIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="font-semibold text-muted-foreground">Locked Badge</p>
                        <p className="text-xs text-muted-foreground">Keep playing to unlock!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
