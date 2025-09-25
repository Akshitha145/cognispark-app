
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import type { Child } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { RecommendationsList } from './recommendations-list';

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
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    </div>
                }>
                    <RecommendationsList child={child} />
                </Suspense>
            </CardContent>
        </Card>
    );
}
