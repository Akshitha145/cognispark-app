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
import type { RecentActivity as RecentActivityType } from '@/lib/types';
  
export function RecentActivity({ data }: { data: RecentActivityType[]}) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>A log of the most recent activities for the selected child.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge variant="secondary">{activity.childName}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.activity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{activity.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}