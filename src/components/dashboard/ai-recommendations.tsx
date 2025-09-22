import { getCaregiverRecommendations } from '@/ai/flows/caregiver-ai-recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { children, exercises } from '@/lib/data';
import { Lightbulb, Info } from 'lucide-react';

export async function AiRecommendations() {
    const selectedChild = children[0]; // For demonstration, we'll use the first child
    const recommendations = await getCaregiverRecommendations({
        childId: selectedChild.id,
        childAgeMonths: selectedChild.age * 12,
        disabilityType: selectedChild.disability,
        currentExercises: ['memory-match', 'focus-forest'],
        performanceData: { 'memory-match': { score: 85, attempts: 10 }, 'focus-forest': { score: 70, time: '15min' } },
    });

    const getExerciseIcon = (exerciseId: string) => {
        const exercise = exercises.find(e => e.id === exerciseId);
        return exercise ? <exercise.icon className="h-6 w-6 text-primary" /> : <Lightbulb className="h-6 w-6 text-primary" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    AI Recommendations for {selectedChild.name}
                </CardTitle>
                <CardDescription>
                    Based on recent performance, here are some suggested next steps.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {recommendations.recommendations.slice(0, 3).map((rec, index) => (
                         <li key={index} className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg">
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
            </CardContent>
        </Card>
    );
}
