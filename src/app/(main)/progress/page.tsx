
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Star, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { ProgressRadarChart } from '@/components/progress/progress-radar-chart';
import { ExerciseScoresBarChart } from '@/components/progress/exercise-scores-bar-chart';
import { RecentScoresTable } from '@/components/progress/recent-scores-table';
import { getCaregiverData, getGameSessions } from '@/lib/data';
import { useEffect, useState } from 'react';
import type { Child, GameSession } from '@/lib/types';
import { exercises } from '@/lib/data';

function calculateSkillScores(sessions: GameSession[]) {
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

    const skillScores = Object.entries(skillData).map(([skill, data]) => ({
        skill,
        score: Math.round(data.totalScore / data.count)
    }));

    return skillScores;
}

export default function ProgressPage() {
    const [child, setChild] = useState<Child | null>(null);
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const caregiverData = await getCaregiverData();
            if (caregiverData && caregiverData.children.length > 0) {
                // For this version, we will always show progress for the first child.
                // A future update could use a shared state for child selection.
                const firstChild = caregiverData.children[0];
                setChild(firstChild);
                const gameSessions = await getGameSessions(firstChild.id, 30);
                setSessions(gameSessions);
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
             <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2 text-muted-foreground">Loading progress...</p>
             </div>
        )
    }

    if (!child) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <PageHeader title="No Progress Data" description="No child data found. Please ensure a child is assigned to your profile." />
            </div>
        )
    }
    
    if (sessions.length === 0) {
        return (
            <div className="flex flex-1 flex-col gap-6">
                <PageHeader
                    title={`Detailed Progress for ${child.name}`}
                    description="Dive deep into performance metrics and track improvements over time."
                />
                 <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center rounded-lg border-2 border-dashed py-24">
                    <h3 className="text-xl font-semibold">No Progress Data Yet!</h3>
                    <p className="text-muted-foreground">Play some games from the exercises tab to see your progress here.</p>
                </div>
            </div>
        )
    }

    const skillScores = calculateSkillScores(sessions);
    const bestSkill = skillScores.reduce((max, skill) => skill.score > max.score ? skill : max, { skill: 'N/A', score: 0 });
    const improvementSkill = skillScores.reduce((min, skill) => skill.score < min.score ? skill : min, { skill: 'N/A', score: 101 });
    const totalTime = sessions.length * 2; // Assuming 2 mins per session
  
    return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={`Detailed Progress for ${child.name}`}
        description="Dive deep into performance metrics and track improvements over time."
      />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Skill</CardTitle>
                    <Star className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{bestSkill.skill}</div>
                    <p className="text-xs text-muted-foreground">{bestSkill.score}% average score</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{improvementSkill.skill}</div>
                    <p className="text-xs text-muted-foreground">{improvementSkill.score}% average score</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Time Played</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.floor(totalTime / 60)}h {totalTime % 60}m</div>
                    <p className="text-xs text-muted-foreground">in the last 30 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Trend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+0%</div>
                    <p className="text-xs text-muted-foreground">Improvement over last 7 days</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
                <ProgressRadarChart data={skillScores} />
            </div>
            <div className="col-span-1 flex flex-col gap-6 lg:col-span-3">
                <ExerciseScoresBarChart data={sessions} />
            </div>
        </div>

        <RecentScoresTable data={sessions} />
    </div>
  );
}
