import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProgressPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Detailed Progress"
        description="Dive deep into performance metrics and track improvements over time."
      />
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Coming Soon!</CardTitle>
          <CardDescription>
            This section will feature detailed charts and reports on cognitive skill development,
            exercise history, and performance trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Detailed progress analytics will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
