'use client';

import { notFound } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { exercises } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { getAdaptedExercise, type FormState } from './actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Get AI Adaptation
        </Button>
    );
}


export default function ExercisePage({ params }: { params: { slug: string } }) {
    const [performance, setPerformance] = useState(75);
    const [difficulty, setDifficulty] = useState('Medium');
    
    const initialState: FormState = null;
    const [state, formAction] = useFormState(getAdaptedExercise, initialState);

    const exercise = exercises.find((e) => e.id === params.slug);

    if (!exercise) {
        notFound();
    }
    
    useEffect(() => {
        if(state?.result?.newDifficulty) {
            setDifficulty(state.result.newDifficulty);
        }
    }, [state]);

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/exercises"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <PageHeader title={exercise.title} description={exercise.description} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Exercise Simulation</CardTitle>
                        <CardDescription>Simulate a user's performance to see AI adaptation in action. The current difficulty is <Badge>{difficulty}</Badge>.</CardDescription>
                    </CardHeader>
                    <form action={formAction}>
                        <CardContent className="space-y-6">
                            <input type="hidden" name="exerciseType" value={exercise.title} />
                            <input type="hidden" name="currentDifficulty" value={difficulty} />
                            <input type="hidden" name="userPerformance" value={performance} />
                            <div className="space-y-2">
                                <label htmlFor="performance" className="text-sm font-medium">Performance Score: {performance}%</label>
                                <Slider
                                    id="performance"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[performance]}
                                    onValueChange={(value) => setPerformance(value[0])}
                                />
                                <p className="text-xs text-muted-foreground">Adjust the slider to simulate the child's score on this exercise.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton />
                        </CardFooter>
                    </form>
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI Personalization
                        </CardTitle>
                        <CardDescription>The AI will adjust the next exercise based on the performance score.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {state?.result ? (
                             <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>New Recommendation: {state.result.newDifficulty}</AlertTitle>
                                <AlertDescription>
                                    {state.result.reasoning}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
                                <p className="text-muted-foreground">Submit performance to see AI results</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
