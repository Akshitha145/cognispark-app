
'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authenticateCaregiver, type AuthFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CogniSparkLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
    const [state, dispatch, isPending] = useActionState(authenticateCaregiver, null);
    return <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log In
        </Button>;
}

export default function CaregiverLoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    const initialState: AuthFormState = null;
    const [state, formAction] = useActionState(authenticateCaregiver, initialState);

    useEffect(() => {
        if (state?.message === 'success' && state.caregiver) {
            toast({
                title: `Welcome back, ${state.caregiver.name}!`,
                description: "Loading your dashboard.",
            });
            localStorage.setItem('currentCaregiver', JSON.stringify(state.caregiver));
            router.push('/dashboard');
        } else if (state?.message && state.message !== 'success') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: state.message,
            });
        }
    }, [state, router, toast]);
    

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <div className="flex items-center gap-2 mb-4">
                <CogniSparkLogo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-4xl font-bold">Caregiver Portal</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-8">Log in to your account.</p>

            <Card className="w-full max-w-sm">
                <form action={formAction}>
                    <CardHeader>
                        <CardTitle>Caregiver Log In</CardTitle>
                        <CardDescription>Enter your name to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" name="name" type="text" placeholder="e.g. Maria" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <SubmitButton />
                         <div className="text-center text-sm">
                            <p className="text-muted-foreground">
                                Not a caregiver?{' '}
                                <Button variant="link" className="p-0 h-auto" asChild>
                                    <Link href="/">Switch Role</Link>
                                </Button>
                            </p>
                        </div>
                    </CardFooter>
                 </form>
            </Card>
        </div>
    );
}
