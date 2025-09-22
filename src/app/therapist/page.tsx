import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TherapistPortalPage() {
  return (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
            <h1 className="font-headline text-2xl font-bold">Therapist Portal</h1>
            <nav className="ml-auto flex items-center gap-4">
                <Button variant="outline" asChild>
                    <Link href="/">Switch Role</Link>
                </Button>
            </nav>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6">
            <PageHeader
                title="Therapist Dashboard"
                description="Manage your patients and track their progress."
            />
            <Card className="flex-1">
                <CardHeader>
                <CardTitle>Coming Soon!</CardTitle>
                <CardDescription>
                    This portal will allow therapists to view patient data, assign exercises, and communicate with caregivers.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Therapist-specific features will be displayed here.</p>
                </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
