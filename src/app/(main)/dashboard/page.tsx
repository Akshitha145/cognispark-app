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
type CaregiverData = Awaited<ReturnType<typeof getCaregiverData>>;

export default function DashboardPage() {
    const [caregiverData, setCaregiverData] = useState<CaregiverData | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getCaregiverData();
            setCaregiverData(data);
            if (data && data.children.length > 0) {
                const firstChild = data.children[0];
                setSelectedChildId(firstChild.id);
                const dashData = await getDashboardData(firstChild.id, firstChild.name);
                setDashboardData(dashData);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleChildChange = async (childId: string) => {
        if (childId === selectedChildId) return;

        setSelectedChildId(childId);
        setDashboardData(null); 
        if (caregiverData && caregiverData.children) {
            const child = caregiverData.children.find(c => c.id === childId);
            if (child) {
                const dashData = await getDashboardData(childId, child.name);
                setDashboardData(dashData);
            }
        }
    }

    if (isLoading) {
        return (
             <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    if (!caregiverData || !caregiverData.caregiver) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Welcome!" description="No caregiver data found in the database." />
                <p className="text-muted-foreground">Please add a 'caregivers' collection in Firestore and create at least one caregiver document.</p>
            </div>
        )
    }
    
    if (!selectedChildId || !caregiverData.children || caregiverData.children.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Welcome!" description="It looks like there are no children assigned to your profile." />
                <p className="text-muted-foreground">Please add a 'children' collection in Firestore and add documents with a 'caregiverId' field that matches your caregiver's document ID.</p>
            </div>
        )
    }

    const selectedChild = caregiverData.children.find(c => c.id === selectedChildId);

    return (
        <div className="flex flex-1 flex-col gap-4">
            <PageHeader title="Caregiver Dashboard" description="Welcome back! Here's an overview of your child's progress.">
               {caregiverData.children.length > 1 && selectedChildId && (
                 <Select value={selectedChildId} onValueChange={handleChildChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                        {caregiverData.children.map(child => (
                            <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
               )}
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
