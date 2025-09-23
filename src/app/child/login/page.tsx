
'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { registerChild, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CogniSparkLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
    // This is a placeholder for pending state, which is not available in 'use client' with 'useFormStatus'
    // For a real app, we would handle pending state.
    return <Button type="submit" className="w-full">Let's Play!</Button>;
}


export default function ChildLoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    const initialState: FormState = { message: '' };
    const [state, formAction] = useActionState(registerChild, initialState);

    useEffect(() => {
        if (state.message === 'success' && state.child) {
            toast({
                title: 'Welcome!',
                description: `Let's play some games, ${state.child.name}!`,
            });
            localStorage.setItem('currentChild', JSON.stringify(state.child));
            router.push('/child');
        } else if (state.message && state.message !== 'success') {
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: state.message,
            });
        }
    }, [state, router, toast]);
    

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <div className="flex items-center gap-2 mb-4">
                <CogniSparkLogo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-4xl font-bold">Welcome!</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-8">Let's get you set up to play.</p>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Tell us about you</CardTitle>
                    <CardDescription>Enter your name and age to start playing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" name="name" type="text" placeholder="e.g. Alex" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Your Age</Label>
                            <Input id="age" name="age" type="number" placeholder="e.g. 8" required />
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
