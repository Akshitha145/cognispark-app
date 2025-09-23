'use client';

import { PageHeader } from '@/components/page-header';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { AiRecommendations } from '@/components/dashboard/ai-recommendations';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { getCaregiverData, getDashboardData } from '@/lib/data';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Child } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getCaregiverData();
            if (data && data.children.length > 0) {
                setChildren(data.children);
                const firstChildId = data.children[0].id;
                setSelectedChildId(firstChildId);
                const dashData = await getDashboardData(firstChildId);
                setDashboardData(dashData);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleChildChange = async (childId: string) => {
        setSelectedChildId(childId);
        setDashboardData(null); // Show loading state
        const dashData = await getDashboardData(childId);
        setDashboardData(dashData);
    }

    if (isLoading) {
        return (
             <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    if (!selectedChildId || children.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Welcome!" description="It looks like there are no children assigned to your profile." />
                <p className="text-muted-foreground">Please check Firestore to ensure caregiver 'caregiver1' and associated children are present.</p>
            </div>
        )
    }

    const selectedChild = children.find(c => c.id === selectedChildId);

    return (
        <div className="flex flex-1 flex-col gap-4">
            <PageHeader title="Caregiver Dashboard" description="Welcome back! Here's an overview of your child's progress.">
                <Select value={selectedChildId} onValueChange={handleChildChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                        {children.map(child => (
                            <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </PageHeader>

            {!dashboardData ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                    <div className="col-span-1 flex flex-col gap-4 lg:col-span-7">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Skeleton className="h-[126px]" />
                            <Skeleton className="h-[126px]" />
                            <Skeleton className="h-[126px]" />
                        </div>
                    </div>
                     <div className="col-span-1 flex flex-col gap-4 lg:col-span-4">
                        <Skeleton className="h-[420px]" />
                        <Skeleton className="h-[300px]" />
                    </div>
                    <div className="col-span-1 flex flex-col gap-4 lg:col-span-3">
                        <Skeleton className="h-[300px]" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                    <div className="col-span-1 flex flex-col gap-4 lg:col-span-7">
                        <OverviewStats data={dashboardData.overviewStats} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-4 lg:col-span-4">
                        <ProgressChart data={dashboardData.progressChartData} />
                        <RecentActivity data={dashboardData.recentActivities} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-4 lg:col-span-3">
                        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                           {selectedChild && <AiRecommendations child={selectedChild} />}
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
}