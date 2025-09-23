

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, HeartHandshake, Baby } from 'lucide-react';
import { CogniSparkLogo } from '@/components/icons';

const roles = [
  {
    name: 'Caregiver',
    description: 'Monitor progress and manage settings.',
    icon: User,
    href: '/dashboard',
    cta: 'Go to Dashboard',
  },
  {
    name: 'Therapist',
    description: 'Oversee multiple children and track data.',
    icon: HeartHandshake,
    href: '/therapist',
    cta: 'Go to Portal',
  },
  {
    name: 'Child',
    description: 'Play games and earn rewards!',
    icon: Baby,
    href: '/child/auth',
    cta: 'Start Playing',
  },
];

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2 mb-8">
            <CogniSparkLogo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-4xl font-bold">Welcome to CogniSpark</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-10">Please select your role to continue.</p>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {roles.map((role) => (
            <Card key={role.name} className="flex flex-col text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <role.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center">
                    <Button asChild className="w-full">
                        <Link href={role.href}>{role.cta}</Link>
                    </Button>
                </CardContent>
            </Card>
            ))}
      </div>
    </div>
  );
}
