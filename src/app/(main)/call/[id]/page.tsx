'use client';

import { notFound, useParams } from 'next/navigation';
import { allChildren, therapists } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


// A placeholder for fetching user data, which will be replaced with a Firestore call.
const getUserById = async (id: string) => {
    const placeholderUsers = [
        { id: 'child1', name: 'Alex', avatar: 'https://picsum.photos/seed/1/150/150', avatarHint: 'child portrait' },
        { id: 'child2', name: 'Bella', avatar: 'https://picsum.photos/seed/2/150/150', avatarHint: 'child portrait' },
        { id: 'child3', name: 'Charlie', avatar: 'https://picsum.photos/seed/3/150/150', avatarHint: 'child portrait' },
        { id: 'therapist1', name: 'Dr. Evelyn Reed', avatar: 'https://picsum.photos/seed/5/150/150', avatarHint: 'therapist portrait' },
        { id: 'therapist2', name: 'Dr. Samuel Chen', avatar: 'https://picsum.photos/seed/6/150/150', avatarHint: 'therapist portrait' },
    ]
    return placeholderUsers.find(u => u.id === id);
}


export default function CallPage() {
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [user, setUser] = useState<{name: string, avatar: string, avatarHint?: string} | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (typeof id === 'string') {
                const foundUser = await getUserById(id);
                if (foundUser) {
                    setUser(foundUser);
                } else {
                    notFound();
                }
            }
        };
        fetchUser();
    }, [id]);

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this app.',
            });
          }
        };
    
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
      }, [toast]);


    if (!user) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <p>Loading...</p>
            </div>
        )
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
                <Card className="absolute bottom-4 right-4 h-48 w-64 bg-black overflow-hidden">
                    <CardContent className="p-0 h-full flex items-center justify-center">
                         <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    </CardContent>
                </Card>
                {hasCameraPermission === false && (
                    <div className="absolute bottom-4 right-4 h-48 w-64 p-2">
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
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
