'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { GameSession } from '@/lib/types';
import { exercises } from '@/lib/data';

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function ExerciseScoresBarChart({ data: sessions }: { data: GameSession[]}) {
  
  const exerciseData: { [key: string]: { totalScore: number, count: number } } = {};

  sessions.forEach(session => {
    const exercise = exercises.find(e => e.id === session.exerciseId);
    if (exercise) {
        if (!exerciseData[exercise.title]) {
            exerciseData[exercise.title] = { totalScore: 0, count: 0 };
        }
        exerciseData[exercise.title].totalScore += session.score;
        exerciseData[exercise.title].count++;
    }
  });

  const chartData = Object.entries(exerciseData).map(([name, data]) => ({
      name,
      score: Math.round(data.totalScore / data.count)
  }));


  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Score by Exercise</CardTitle>
        <CardDescription>Comparing performance across different games.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
                <BarChart data={chartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    />
                    <YAxis dataKey="score" />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                </BarChart>
            </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}