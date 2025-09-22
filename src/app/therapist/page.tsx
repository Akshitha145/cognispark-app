import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { allChildren, therapists, recentActivities } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Video } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';

export default function TherapistPortalPage() {
  const therapist = therapists[0]; // Assuming we are logged in as the first therapist
  
  // For demonstration, let's assign all children to this therapist
  const patients = allChildren;

  return (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={therapist.avatar} alt={therapist.name} data-ai-hint={therapist.avatarHint} />
                    <AvatarFallback>{therapist.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-xl font-bold">Therapist Portal</h1>
                    <p className="text-sm text-muted-foreground">{therapist.name}</p>
                </div>
            </div>
            <nav className="ml-auto flex items-center gap-4">
                <Button variant="outline" asChild>
                    <Link href="/">Switch Role</Link>
                </Button>
            </nav>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6">
            <PageHeader
                title="Patient Dashboard"
                description={`You have ${patients.length} patients assigned.`}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Your Patients</CardTitle>
                    <CardDescription>An overview of the children under your care.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Disability</TableHead>
                                <TableHead>Recent Activity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map((patient) => {
                                const lastActivity = recentActivities.find(a => a.childName === patient.name);
                                return (
                                <TableRow key={patient.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={patient.avatar} alt={patient.name} data-ai-hint={patient.avatarHint} />
                                                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{patient.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{patient.disability}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {lastActivity ? `${lastActivity.activity} (${lastActivity.timestamp})` : 'No recent activity'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" asChild>
                                                <Link href="/progress">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Progress</span>
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="icon" asChild>
                                                <Link href="/social">
                                                    <Video className="h-4 w-4" />
                                                    <span className="sr-only">Start Call</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
