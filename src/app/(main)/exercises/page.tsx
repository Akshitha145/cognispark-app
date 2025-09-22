import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { exercises } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ExercisesPage() {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <PageHeader
                title="Cognitive Exercises"
                description="Explore tailored exercises designed to improve specific cognitive skills."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {exercises.map((exercise) => (
                    <Card key={exercise.id} className="flex flex-col">
                        <CardHeader className="flex-row items-start gap-4 space-y-0">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <exercise.icon className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <CardTitle>{exercise.title}</CardTitle>
                                <Badge variant="outline" className="mt-1">{exercise.skill}</Badge>
                            </div>
                        </CardHeader>
                        <CardDescription className="p-6 pt-0 grow">
                            {exercise.description}
                        </CardDescription>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/exercises/${exercise.id}`}>
                                    Start Exercise <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
