'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, View } from 'lucide-react';
import Link from 'next/link';
import { ArViewer } from '@/components/ar-viewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BadgeIcon } from '@/components/icons';

export default function ArRewardsPage() {
    
    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/rewards"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <PageHeader title="AR Rewards Viewer" description="See your earned badges in Augmented Reality!" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>AR View</CardTitle>
                    <CardDescription>Point your camera at a flat surface to see your rewards come to life.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                       <ArViewer />
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center pointer-events-none">
                            <BadgeIcon className="h-16 w-16 mb-4" />
                            <h3 className="text-2xl font-bold">AR Feature Coming Soon</h3>
                            <p>Imagine seeing your badges as 3D trophies right in your room!</p>
                       </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
