'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { progressData } from '@/lib/data';

export function ProgressChart() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Cognitive score and time spent over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full p-2">
            <ResponsiveContainer>
                <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                    />
                    <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                    <Bar yAxisId="left" dataKey="Cognitive Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="Time Spent (min)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
}
