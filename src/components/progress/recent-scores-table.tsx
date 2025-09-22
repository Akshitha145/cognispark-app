import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { recentScores } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
  
export function RecentScoresTable() {
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
              {recentScores.map((score, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{score.exercise}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{score.difficulty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={score.score > 80 ? 'default': 'secondary'}>{score.score}%</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{format(new Date(score.date), "PPP")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}
