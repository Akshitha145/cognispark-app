'use client';

import { notFound, useParams } from 'next/navigation';
import { allChildren, therapists } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useState } from 'react';

export default function CallPage() {
    const params = useParams();
    const { id } = params;

    const user = [...allChildren, ...therapists].find(u => u.id === id);
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    if (!user) {
        notFound();
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.avatarHint} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Video Call with {user.name}</p>
                        <p className="text-sm text-muted-foreground">Connecting...</p>
                    </div>
                </div>
            </header>
            <main className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-secondary/20 relative">
                 <div className="relative flex items-center justify-center bg-black/50">
                    <p className="text-white">Remote user video (placeholder)</p>
                </div>
                <Card className="absolute bottom-4 right-4 h-48 w-64">
                    <CardContent className="p-2 h-full flex items-center justify-center">
                         <p className="text-muted-foreground text-sm">Your video (placeholder)</p>
                    </CardContent>
                </Card>
            </main>
            <footer className="flex items-center justify-center p-4 border-t gap-4">
                <Button variant={isMuted ? 'secondary' : 'outline'} size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsMuted(p => !p)}>
                    {isMuted ? <MicOff /> : <Mic />}
                    <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                </Button>
                 <Button variant={isVideoOff ? 'secondary' : 'outline'} size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsVideoOff(p => !p)}>
                    {isVideoOff ? <VideoOff /> : <Video />}
                    <span className="sr-only">{isVideoOff ? 'Turn Video On' : 'Turn Video Off'}</span>
                </Button>
                <Button asChild variant="destructive" size="icon" className="h-12 w-12 rounded-full">
                    <Link href="/social">
                        <Phone />
                         <span className="sr-only">End Call</span>
                    </Link>
                </Button>
            </footer>
        </div>
    );
}
