
'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CogniSparkLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { authenticateChild, type AuthFormState } from './actions';
import Link from 'next/link';

function SubmitButton() {
    // This is a placeholder for pending state, which is not available in 'use client' with 'useFormStatus'
    // For a real app, we would handle pending state.
    return <Button type="submit" className="w-full">Login</Button>;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const initialState: AuthFormState = { message: '' };
  const [state, formAction] = useActionState(authenticateChild, initialState);

  useEffect(() => {
    if (state?.message === 'success' && state.child) {
        toast({
            title: `Welcome back, ${state.child.name}!`,
            description: `Let's play some games!`,
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
      <div className="flex items-center gap-2 mb-8">
        <CogniSparkLogo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-4xl font-bold">Welcome to CogniSpark</h1>
      </div>
      <p className="text-muted-foreground text-lg mb-10">Please login to continue or sign up.</p>
      
      <Card className="w-full max-w-sm">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Child Login</CardTitle>
            <CardDescription>Enter your name and your Caretaker's name to login.</CardDescription>
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
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
         <div className="p-6 pt-0 text-center text-sm">
            <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/child/login">Sign Up</Link>
                </Button>
            </p>
        </div>
      </Card>
    </div>
  );
}
