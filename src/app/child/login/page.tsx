
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllChildren } from '@/lib/data';
import type { Child } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CogniSparkLogo } from '@/components/icons';

export default function ChildLoginPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchChildren() {
            const childrenData = await getAllChildren();
            setChildren(childrenData);
            setIsLoading(false);
        }
        fetchChildren();
    }, []);

    const handleChildSelect = (child: Child) => {
        localStorage.setItem('currentChild', JSON.stringify(child));
        router.push('/child');
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="flex items-center gap-2 mb-8">
                <CogniSparkLogo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-4xl font-bold">Who is Playing?</h1>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Finding players...</p>
                </div>
            ) : children.length === 0 ? (
                 <p className="text-muted-foreground text-lg text-center">No child profiles found in the database.<br/> Please ask your caregiver to set one up.</p>
            ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                    {children.map((child) => (
                        <Card 
                            key={child.id} 
                            className="flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                            onClick={() => handleChildSelect(child)}
                        >
                            <CardHeader>
                                <Avatar className="h-24 w-24 border-4 border-transparent group-hover:border-primary">
                                    <AvatarImage src={child.profilePhoto} alt={child.name} />
                                    <AvatarFallback className="text-3xl">{child.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-xl">{child.name}</CardTitle>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
