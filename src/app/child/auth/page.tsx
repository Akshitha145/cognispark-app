
'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authenticateChild, type AuthFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CogniSparkLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
    const { toast } = useToast();
    // This is a bit of a hack to get pending state
    const [state, dispatch, isPending] = useActionState(authenticateChild, null);
    return <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log In & Play!
        </Button>;
}

export default function ChildAuthPage() {
    const router = useRouter();
    const { toast } = useToast();

    const initialState: AuthFormState = null;
    const [state, formAction] = useActionState(authenticateChild, initialState);

    useEffect(() => {
        if (state?.message === 'success' && state.child) {
            toast({
                title: `Welcome back, ${state.child.name}!`,
                description: "Let's get playing!",
            });
            localStorage.setItem('currentChild', JSON.stringify(state.child));
            router.push('/child');
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
                <h1 className="font-headline text-4xl font-bold">Welcome Back!</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-8">Log in to your player account.</p>

            <Card className="w-full max-w-sm">
                <form action={formAction}>
                    <CardHeader>
                        <CardTitle>Child Log In</CardTitle>
                        <CardDescription>Enter your name and your caregiver's name to log in.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" name="name" type="text" placeholder="e.g. Alex" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caregiverName">Caretaker Name</Label>
                            <Input id="caregiverName" name="caregiverName" type="text" placeholder="e.g. Krish" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <SubmitButton />
                         <div className="text-center text-sm">
                            <p className="text-muted-foreground">
                                Don't have an account?{' '}
                                <Button variant="link" className="p-0 h-auto" asChild>
                                    <Link href="/child/login">Sign Up</Link>
                                </Button>
                            </p>
                        </div>
                    </CardFooter>
                 </form>
            </Card>
        </div>
    );
}
