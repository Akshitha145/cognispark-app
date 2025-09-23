'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Video, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import type { Therapist, Child } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getAllChildren } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function TherapistPortalPage() {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [patients, setPatients] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedTherapist = localStorage.getItem('currentTherapist');
        if (storedTherapist) {
            setTherapist(JSON.parse(storedTherapist));
        } else {
            router.push('/therapist/login');
            return;
        }

        async function fetchPatients() {
            const children = await getAllChildren();
            // Assign all children as their patients for this prototype.
            setPatients(children);
            setIsLoading(false);
        }
        
        fetchPatients();
    }, [router]);

  if (isLoading || !therapist) {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-2 text-muted-foreground">Loading Portal...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
        <header className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
                 <PageHeader
                    title="Patient Dashboard"
                    description={patients.length > 0 ? `You have ${patients.length} patients assigned.` : 'There are no patients assigned to you yet.'}
                />
            </div>
            <nav className="ml-auto flex items-center gap-4">
                <Button variant="outline" onClick={() => {
                    localStorage.removeItem('currentTherapist');
                    router.push('/');
                }}>Switch Role</Button>
            </nav>
        </header>
        <main className="flex flex-1 flex-col gap-6">
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
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={patient.profilePhoto} alt={patient.name} />
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
                                            {'No recent activity'}
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
                                                    <Link href={`/call/${patient.id}`}>
                                                        <Video className="h-4 w-4" />
                                                        <span className="sr-only">Start Call</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No patients found. Please add children to the 'children' collection in Firestore.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
