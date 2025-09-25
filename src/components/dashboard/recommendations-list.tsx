
import { getCaregiverRecommendations } from '@/ai/flows/caregiver-ai-recommendations';
import { exercises } from '@/lib/data';
import type { Child } from '@/lib/types';
import { Lightbulb, Info } from 'lucide-react';

export async function RecommendationsList({ child }: { child: Child }) {
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

     if (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0) {
        return <p className="text-sm text-muted-foreground">Could not load recommendations at this time.</p>
    }

    return (
         <ul className="space-y-4">
            {recommendations.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={`${rec.exerciseId}-${index}`} className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                        {getExerciseIcon(rec.exerciseId)}
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">
                            {exercises.find(e => e.id === rec.exerciseId)?.title || rec.exerciseId}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                            <Info className="h-3 w-3 mt-1 flex-shrink-0" />
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
