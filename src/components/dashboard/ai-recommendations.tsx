
import { getCaregiverRecommendations } from '@/ai/flows/caregiver-ai-recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { exercises } from '@/lib/data';
import { Lightbulb, Info, Loader2 } from 'lucide-react';
import type { Child } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

async function Recommendations({ child }: { child: Child }) {
    const recommendations = await getCaregiverRecommendations({
        childId: child.id,
        childAgeMonths: child.age * 12,
        disabilityType: child.disability,
        currentExercises: ['memory-match', 'focus-forest'],
        performanceData: { 'memory-match': { score: 85, attempts: 10 }, 'focus-forest': { score: 70, time: '15min' } },
    });

    const getExerciseIcon = (exerciseId: string) => {
        const exercise = exercises.find(e => e.id === exerciseId);
        return exercise ? <exercise.icon className="h-6 w-6 text-primary" /> : <Lightbulb className="h-6 w-6 text-primary" />;
    };

     if (!recommendations || !recommendations.recommendations) {
        return <p className="text-sm text-muted-foreground">Could not load recommendations.</p>
    }

    return (
         <ul className="space-y-4">
            {recommendations.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={`${rec.exerciseId}-${index}`} className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-shrink-0">
                        {getExerciseIcon(rec.exerciseId)}
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">
                            {exercises.find(e => e.id === rec.exerciseId)?.title || rec.exerciseId}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-start gap-1">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{rec.reason}</span>
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-primary">{rec.difficulty}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function AiRecommendations({ child }: { child: Child }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    AI Recommendations for {child.name}
                </CardTitle>
                <CardDescription>
                    Based on recent performance, here are some suggested next steps.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                }>
                    <Recommendations child={child} />
                </Suspense>
            </CardContent>
        </Card>
    );
}
