import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { badges } from '@/lib/data';
import { BadgeIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { View } from 'lucide-react';

export default function RewardsPage() {
    const userLevel = 5;
    const userPoints = 1250;
    const pointsToNextLevel = 2000;
    const progressPercentage = (userPoints / pointsToNextLevel) * 100;
  
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
                        <p className="text-sm text-muted-foreground">{userPoints} / {pointsToNextLevel} Points</p>
                    </div>
                    <Progress value={progressPercentage} />
                    <p className="text-center text-sm text-muted-foreground">
                        {pointsToNextLevel - userPoints} points to the next level!
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
