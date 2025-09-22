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
import { children } from '@/lib/data';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    if (!children || children.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="Welcome!" description="It looks like there are no children assigned to your profile." />
                <p className="text-muted-foreground">Please contact support to get set up.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            <PageHeader title="Caregiver Dashboard" description="Welcome back! Here's an overview of your child's progress.">
                <Select defaultValue={children[0].id}>
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                <div className="col-span-1 flex flex-col gap-4 lg:col-span-7">
                    <OverviewStats />
                </div>
                <div className="col-span-1 flex flex-col gap-4 lg:col-span-4">
                    <ProgressChart />
                    <RecentActivity />
                </div>
                <div className="col-span-1 flex flex-col gap-4 lg:col-span-3">
                    <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                        <AiRecommendations />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
