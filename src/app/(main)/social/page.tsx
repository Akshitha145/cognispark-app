import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SocialPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Social Mode"
        description="Collaborate with peers and therapists in real-time."
      />
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Coming Soon!</CardTitle>
          <CardDescription>
            Our WebRTC-powered social interaction mode is currently under development. Soon, you'll be
            able to connect with others for collaborative exercises and therapy sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">The collaborative social mode will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
