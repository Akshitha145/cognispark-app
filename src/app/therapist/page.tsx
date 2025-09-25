
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Video, Loader2, Star, TrendingDown } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import type { Therapist, Child, GameSession } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { getAllChildren, exercises } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type PatientWithProgress = Child & {
    avgScore?: number;
    bestSkill?: { skill: string; score: number };
    improvementSkill?: { skill: string; score: number };
    isProgressLoading?: boolean;
};

export default function TherapistPortalPage() {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [patients, setPatients] = useState<PatientWithProgress[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const router = useRouter();

    const calculateSkillScores = useCallback((sessions: GameSession[]) => {
        const skillData: { [key: string]: { totalScore: number, count: number } } = {};
        sessions.forEach(session => {
            const exercise = exercises.find(e => e.id === session.exerciseId);
            if (exercise) {
                if (!skillData[exercise.skill]) {
                    skillData[exercise.skill] = { totalScore: 0, count: 0 };
                }
                skillData[exercise.skill].totalScore += session.score;
                skillData[exercise.skill].count++;
            }
        });
        return Object.entries(skillData).map(([skill, data]) => ({
            skill,
            score: Math.round(data.totalScore / data.count)
        }));
    }, []);

    useEffect(() => {
        const storedTherapist = localStorage.getItem('currentTherapist');
        if (storedTherapist) {
            setTherapist(JSON.parse(storedTherapist));
        } else {
            router.push('/therapist/login');
            return;
        }

        async function fetchInitialPatients() {
            const children = await getAllChildren();
            setPatients(children.map(c => ({...c, isProgressLoading: true })));
            setIsInitialLoading(false);
        }
        
        fetchInitialPatients();
    }, [router]);

    useEffect(() => {
        if (isInitialLoading || patients.length === 0) return;

        patients.forEach(patient => {
            if (patient.isProgressLoading) {
                fetchProgressForPatient(patient.id);
            }
        });

    }, [patients, isInitialLoading]);


    const fetchProgressForPatient = useCallback(async (patientId: string) => {
        const sessionsQuery = query(
            collection(db, "gameSessions"),
            where("childId", "==", patientId)
        );
        const querySnapshot = await getDocs(sessionsQuery);
        const sessions: GameSession[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Correctly handle both Firestore Timestamps and date strings/objects
            const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp);
            return { ...data, id: doc.id, timestamp } as GameSession;
        });

        let progressData: Partial<PatientWithProgress> = { isProgressLoading: false };

        if (sessions.length > 0) {
            const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
            const avgScore = Math.round(totalScore / sessions.length);
            const skillScores = calculateSkillScores(sessions);
            
            const bestSkill = skillScores.length > 0 ? skillScores.reduce((max, skill) => skill.score > max.score ? skill : max) : { skill: 'N/A', score: 0 };
            const improvementSkill = skillScores.length > 0 ? skillScores.reduce((min, skill) => skill.score < min.score ? skill : min) : { skill: 'N/A', score: 101 };
            
            progressData = { ...progressData, avgScore, bestSkill, improvementSkill };
        }
        
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...progressData } : p));
        
    }, [calculateSkillScores]);


  if (isInitialLoading || !therapist) {
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
                    <CardDescription>An overview of the children under your care with their latest progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Disability</TableHead>
                                <TableHead>Avg. Score</TableHead>
                                <TableHead>Best Skill</TableHead>
                                <TableHead>Needs Improvement</TableHead>
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
                                        <TableCell>
                                            <Badge variant="secondary">{patient.disability}</Badge>
                                        </TableCell>
                                         <TableCell>
                                            {patient.isProgressLoading ? <Skeleton className="h-5 w-12" /> :
                                                patient.avgScore !== undefined ? (
                                                <Badge variant={patient.avgScore > 75 ? 'default' : 'outline'}>{patient.avgScore}%</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No Data</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {patient.isProgressLoading ? <Skeleton className="h-5 w-24" /> :
                                                patient.bestSkill && patient.bestSkill.skill !== 'N/A' ? (
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-amber-500" />
                                                    <span className="text-sm">{patient.bestSkill.skill}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {patient.isProgressLoading ? <Skeleton className="h-5 w-24" /> :
                                                patient.improvementSkill && patient.improvementSkill.skill !== 'N/A' ? (
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4 text-destructive" />
                                                    <span className="text-sm">{patient.improvementSkill.skill}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">N/A</span>
                                            )}
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
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No patients found.
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
