import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { GameSession } from '@/lib/types';
import { exercises } from '@/lib/data';
  
export function RecentScoresTable({ data: sessions }: { data: GameSession[]}) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
          <CardDescription>A log of the most recent game scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 10).map((score) => {
                const exercise = exercises.find(e => e.id === score.exerciseId);
                return (
                <TableRow key={score.id}>
                  <TableCell className="font-medium">{exercise?.title || score.exerciseId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{score.difficulty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={score.score > 80 ? 'default': 'secondary'}>{score.score}%</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{format(new Date(score.timestamp), "PPP")}</TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}
