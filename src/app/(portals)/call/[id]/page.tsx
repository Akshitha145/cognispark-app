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
import { getAllChildren, getAllTherapists } from '@/lib/data';


export default function CallPage() {
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [user, setUser] = useState<{name: string, profilePhoto: string} | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (typeof id !== 'string') return;
            
            const [children, therapists] = await Promise.all([
                getAllChildren(),
                getAllTherapists()
            ]);

            const allUsers: (Child | Therapist)[] = [...children, ...therapists];
            const foundUser = allUsers.find(u => u.id === id);

            if (foundUser) {
                setUser(foundUser);
            } else {
                notFound();
            }
        };
        fetchUser();
    }, [id]);

    useEffect(() => {
        const setupCall = async () => {
            try {
                // 1. Get user media
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                setHasCameraPermission(true);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. Create Peer Connection
                const pc = new RTCPeerConnection();
                peerConnectionRef.current = pc;

                // 3. Add tracks to peer connection
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                // 4. Handle remote track
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // 5. Simulate signaling (offer/answer exchange)
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // --- In a real app, this offer would be sent to the other peer via a signaling server ---
                
                // Simulate receiving the offer and creating an answer
                const answer = await pc.createAnswer();
                await pc.setRemoteDescription(offer); // Remote peer sets the offer they received
                await pc.setLocalDescription(answer); // Local peer sets its own answer
                
                // --- In a real app, this answer would be sent back to the original caller ---

                // Simulate original caller receiving the answer
                await pc.setRemoteDescription(answer);

                 // Simulate connection
                setTimeout(() => {
                    setIsConnecting(false);
                    setIsCallActive(true);
                }, 2000);

            } catch (error) {
                console.error('Error accessing camera or setting up WebRTC:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Call Failed',
                    description: 'Could not access camera or establish a connection. Please check permissions.',
                });
                setIsConnecting(false);
            }
        };

        setupCall();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
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

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col bg-secondary">
            <header className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePhoto} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Video Call with {user.name}</p>
                        <p className="text-sm text-muted-foreground">{isConnecting ? 'Connecting...' : (isCallActive ? 'Connected' : 'Call Ended')}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative p-4">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
                    <video ref={remoteVideoRef} className={cn("w-full h-full object-cover", !isCallActive && "hidden")} autoPlay playsInline />
                     {!isCallActive && !isConnecting && (
                         <div className="text-center text-white">
                             <h2 className="text-2xl font-bold">Call Ended</h2>
                         </div>
                     )}
                     {isConnecting && (
                         <div className="flex flex-col items-center gap-4 text-white">
                            <Loader2 className="h-12 w-12 animate-spin" />
                            <p>Connecting to {user.name}...</p>
                        </div>
                     )}
                     {isCallActive && (
                        <Avatar className={cn("h-32 w-32 absolute transition-opacity", remoteVideoRef.current?.srcObject ? 'opacity-0' : 'opacity-100')}>
                            <AvatarImage src={user.profilePhoto} alt={user.name} />
                            <AvatarFallback className="text-6xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                     )}
                </div>

                <Card className={cn(
                    "absolute bottom-6 right-6 w-48 h-36 sm:w-64 sm:h-48 bg-black overflow-hidden ring-2 ring-background/50 transition-all duration-300",
                    isVideoOff && "bg-secondary flex items-center justify-center"
                )}>
                    <CardContent className="p-0 h-full w-full">
                       <video ref={localVideoRef} className={cn("w-full h-full object-cover", isVideoOff && 'hidden')} autoPlay muted playsInline />
                        {isVideoOff && (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                                <VideoOff />
                                <span>You're hidden</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
