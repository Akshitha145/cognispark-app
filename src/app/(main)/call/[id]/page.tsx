'use client';

import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { Child, Therapist } from '@/lib/types';


// A placeholder for fetching user data, which will be replaced with a Firestore call.
const getUserById = async (id: string) => {
    const placeholderUsers: (Partial<Child> & Partial<Therapist> & {id: string, name: string, profilePic: string})[] = [
        { id: 'child1', name: 'Alex', profilePic: 'https://picsum.photos/seed/1/150/150', avatarHint: 'child portrait' },
        { id: 'child2', name: 'Bella', profilePic: 'https://picsum.photos/seed/2/150/150', avatarHint: 'child portrait' },
        { id: 'child3', name: 'Charlie', profilePic: 'https://picsum.photos/seed/3/150/150', avatarHint: 'child portrait' },
        { id: 'therapist1', name: 'Dr. Evelyn Reed', profilePic: 'https://picsum.photos/seed/5/150/150', avatarHint: 'therapist portrait' },
        { id: 'therapist2', name: 'Dr. Samuel Chen', profilePic: 'https://picsum.photos/seed/6/150/150', avatarHint: 'therapist portrait' },
    ]
    return placeholderUsers.find(u => u.id === id);
}

export default function CallPage() {
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [user, setUser] = useState<{name: string, profilePic: string, avatarHint?: string} | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

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
            streamRef.current = stream;
            setHasCameraPermission(true);
    
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
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

        const connectionTimer = setTimeout(() => {
            setIsConnecting(false);
            setIsCallActive(true);
        }, 3000);

        return () => {
            clearTimeout(connectionTimer);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
      }, [toast]);

    const toggleMute = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(p => !p);
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(p => !p);
        }
    };

    if (!user) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    const remoteUserView = (
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
            <Avatar className="h-32 w-32">
                <AvatarImage src={user.profilePic} alt={user.name} data-ai-hint={user.avatarHint} />
                <AvatarFallback className="text-6xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="absolute bottom-4 text-white/50 text-sm">{user.name}'s video is off</p>
        </div>
    );
    
    const localUserView = (
        <Card className="w-full h-full bg-black overflow-hidden flex items-center justify-center">
            <video ref={localVideoRef} className={cn("w-full h-full object-cover", isVideoOff && 'hidden')} autoPlay muted playsInline />
            {isVideoOff && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <VideoOff className="h-12 w-12"/>
                    <span className="text-lg">Your video is off</span>
                </div>
            )}
        </Card>
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col bg-secondary">
            <header className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePic} alt={user.name} data-ai-hint={user.avatarHint} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Video Call with {user.name}</p>
                        <p className="text-sm text-muted-foreground">{isConnecting ? 'Connecting...' : (isCallActive ? 'Connected' : 'Call Ended')}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative flex items-center justify-center p-4">
                {isConnecting ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Connecting to {user.name}...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-full h-full">
                           {isCallActive ? remoteUserView : localUserView}
                        </div>

                        <Card className={cn(
                            "absolute bottom-6 right-6 w-48 h-36 sm:w-64 sm:h-48 bg-black overflow-hidden ring-2 ring-background/50 transition-all duration-300",
                            !isCallActive && "opacity-0 scale-90 translate-y-10",
                            isVideoOff && "bg-secondary flex items-center justify-center"
                        )}>
                            <CardContent className="p-0 h-full w-full">
                               <video ref={isCallActive ? localVideoRef : remoteVideoRef} className={cn("w-full h-full object-cover", isVideoOff && isCallActive && 'hidden')} autoPlay muted playsInline />
                                {isVideoOff && isCallActive && (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                                        <VideoOff />
                                        <span>You're hidden</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/90 z-20">
                        <Alert variant="destructive" className="max-w-md">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser to use the video call feature. You may need to refresh the page after granting permission.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </main>

            <footer className="flex items-center justify-center p-4 border-t bg-background gap-4">
                <Button variant={isMuted ? 'secondary' : 'outline'} size="icon" className="h-12 w-12 rounded-full" onClick={toggleMute} disabled={hasCameraPermission === false}>
                    {isMuted ? <MicOff /> : <Mic />}
                    <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                </Button>
                 <Button variant={isVideoOff ? 'secondary' : 'outline'} size="icon" className="h-12 w-12 rounded-full" onClick={toggleVideo} disabled={hasCameraPermission === false}>
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
