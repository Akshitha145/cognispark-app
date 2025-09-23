
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
import { getCaregiverData, getGameSessions, exercises } from '@/lib/data';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Caregiver, Child, GameSession, ProgressDataPoint, RecentActivity as RecentActivityType } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';


type OverviewStatsData = React.ComponentProps<typeof OverviewStats>['data'];


function processSessionsForDashboard(sessions: GameSession[], childName: string) {
    const timeSpent = sessions.reduce((acc, session) => acc + 2, 0); // Assuming 2 mins per session
    const exercisesCompleted = sessions.length;

    const overviewStats: OverviewStatsData = {
        timeSpent: `${Math.floor(timeSpent / 60)}h ${timeSpent % 60}m`,
        timeSpentTrend: "+0%", // Placeholder
        exercisesCompleted: exercisesCompleted,
        exercisesCompletedTrend: "+0", // Placeholder
        badgesEarned: 3, // Placeholder to match rewards page
        latestBadge: "Puzzle Pro" // Placeholder
    };

    const progressChartData: ProgressDataPoint[] = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateString = format(date, 'EEE');
        const sessionsOnDay = sessions.filter(s => format(new Date(s.timestamp), 'EEE') === dateString);
        
        const avgScore = sessionsOnDay.length > 0
            ? sessionsOnDay.reduce((sum, s) => sum + s.score, 0) / sessionsOnDay.length
            : 0;
            
        const timeSpentOnDay = sessionsOnDay.length * 2; // Assuming 2 mins per session

        return { date: dateString, 'Cognitive Score': Math.round(avgScore), 'Time Spent (min)': timeSpentOnDay };
    });
    
    const recentActivities: RecentActivityType[] = sessions.slice(0, 3).map((session, index) => {
        const exercise = exercises.find(e => e.id === session.exerciseId);
        return {
            id: session.id || `${index}`,
            childName: childName,
            activity: `Completed ${exercise?.title || session.exerciseId}`,
            timestamp: format(new Date(session.timestamp), 'PPp')
        }
    });

    return { overviewStats, progressChartData, recentActivities };
}


export default function DashboardPage() {
    const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [overviewStats, setOverviewStats] = useState<OverviewStatsData | null>(null);
    const [progressChartData, setProgressChartData] = useState<ProgressDataPoint[] | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivityType[] | null>(null);

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const router = useRouter();

    // Initial load for caregiver and children list
    useEffect(() => {
        const storedCaregiver = localStorage.getItem('currentCaregiver');
        if (storedCaregiver) {
            const data = JSON.parse(storedCaregiver);
            setCaregiver(data);
            setChildren(data.children || []);
            if (data.children && data.children.length > 0) {
                setSelectedChildId(data.children[0].id);
            }
        } else {
            router.push('/caregiver/login');
        }
        setIsInitialLoading(false);
    }, [router]);

    // Real-time listener for game sessions of the selected child
    useEffect(() => {
        if (!selectedChildId) return;

        const child = children.find(c => c.id === selectedChildId);
        if (!child) return;

        // Reset data when child changes
        setOverviewStats(null);
        setProgressChartData(null);
        setRecentActivities(null);

        const unsubscribe = getGameSessions(selectedChildId, 7, (sessions) => {
            const { overviewStats, progressChartData, recentActivities } = processSessionsForDashboard(sessions, child.name);
            setOverviewStats(overviewStats);
            setProgressChartData(progressChartData);
            setRecentActivities(recentActivities);
        });

        // Cleanup listener on component unmount or when child changes
        return () => unsubscribe();
    }, [selectedChildId, children]);


    const handleChildChange = async (childId: string) => {
        setSelectedChildId(childId);
    }

    if (isInitialLoading) {
        return (
             <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2 text-muted-foreground">Loading dashboard...</p>
             </div>
        )
    }

    if (!caregiver) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Welcome!" description="No caregiver data found." />
                <p className="text-muted-foreground">Please log in to view the dashboard.</p>
            </div>
        )
    }
    
    if (!selectedChildId || !children || children.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Welcome!" description="It looks like there are no children assigned to your profile." />
                <p className="text-muted-foreground">You can add children to your profile in the settings.</p>
            </div>
        )
    }

    const selectedChild = children.find(c => c.id === selectedChildId);
    const isLoadingDashboardData = !overviewStats || !progressChartData || !recentActivities;

    return (
        <div className="flex flex-1 flex-col gap-4">
            <PageHeader title="Caregiver Dashboard" description="Welcome back! Here's an overview of your child's progress.">
               {children.length > 1 && selectedChildId && (
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
               )}
            </PageHeader>

            {isLoadingDashboardData ? (
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
                        <OverviewStats data={overviewStats} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-4 lg:col-span-4">
                        <ProgressChart data={progressChartData} />
                        <RecentActivity data={recentActivities} />
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
