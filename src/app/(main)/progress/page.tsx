'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Star, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { ProgressRadarChart } from '@/components/progress/progress-radar-chart';
import { ExerciseScoresBarChart } from '@/components/progress/exercise-scores-bar-chart';
import { RecentScoresTable } from '@/components/progress/recent-scores-table';
import { getCaregiverData } from '@/lib/data';
import { useEffect, useState } from 'react';
import type { Child } from '@/lib/types';

export default function ProgressPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const data = await getCaregiverData();
            if (data && data.children) {
                setChildren(data.children);
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
             <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    if (!children || children.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="No Progress Data" description="No children are assigned to your profile, or data is still loading." />
                 <p className="text-muted-foreground">Ensure a caregiver and a child with a matching 'caregiverId' exist in Firestore.</p>
            </div>
        )
    }
    const selectedChild = children[0];
  
    return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={`Detailed Progress for ${selectedChild.name}`}
        description="Dive deep into performance metrics and track improvements over time."
      />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Skill</CardTitle>
                    <Star className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Memory</div>
                    <p className="text-xs text-muted-foreground">88% average score</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Attention</div>
                    <p className="text-xs text-muted-foreground">62% average score</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Time Played</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12h 45m</div>
                    <p className="text-xs text-muted-foreground">+3h from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Trend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+7%</div>
                    <p className="text-xs text-muted-foreground">Improvement over last 7 days</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
                <ProgressRadarChart />
            </div>
            <div className="col-span-1 flex flex-col gap-6 lg:col-span-3">
                <ExerciseScoresBarChart />
            </div>
        </div>

        <RecentScoresTable />
    </div>
  );
}
