import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Award, Clock } from "lucide-react";

type OverviewStatsProps = {
    data: {
        timeSpent: string;
        timeSpentTrend: string;
        exercisesCompleted: number;
        exercisesCompletedTrend: string;
        badgesEarned: number;
        latestBadge: string;
    }
}

export function OverviewStats({ data }: OverviewStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Time Spent This Week
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.timeSpent}</div>
                <p className="text-xs text-muted-foreground">
                  {data.timeSpentTrend} from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Exercises Completed
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.exercisesCompleted}</div>
                <p className="text-xs text-muted-foreground">
                  {data.exercisesCompletedTrend} from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.badgesEarned}</div>
                <p className="text-xs text-muted-foreground">
                    New "{data.latestBadge}" badge
                </p>
              </CardContent>
            </Card>
          </div>
    )
}