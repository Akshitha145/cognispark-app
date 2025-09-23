'use client';

import { TrendingUp } from 'lucide-react';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function ProgressRadarChart({ data }: { data: { skill: string, score: number }[]}) {
  const bestSkill = data.reduce((max, skill) => skill.score > max.score ? skill : max, { skill: 'N/A', score: 0 });

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Skill Distribution</CardTitle>
        <CardDescription>An overview of cognitive skill strengths.</CardDescription>
      </CardHeader>
      <CardContent className="pb-0 h-[300px]">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <PolarGrid />
            <Radar dataKey="score" fill="var(--color-score)" fillOpacity={0.6} dot={{ r: 4, fillOpacity: 1 }} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {bestSkill.skill} is the highest skill <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Data from the last 30 days
        </div>
      </CardFooter>
    </Card>
  );
}