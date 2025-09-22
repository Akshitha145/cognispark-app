import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { exercises } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ChildPortalPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h1 className="font-headline text-2xl font-bold">Let's Play!</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-500" />
                        <span className="font-bold text-lg">1250 Points</span>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/">Switch User</Link>
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Your Games"
                    description="Choose a game to play and earn points."
                />
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
