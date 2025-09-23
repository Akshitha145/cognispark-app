
'use client';

import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { Child, Therapist } from '@/lib/types';
import { getAllChildren, getAllTherapists } from '@/lib/data';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';


export default function CallPage() {
    const params = useParams();
    const { id: remoteUserId } = params;
    const { toast } = useToast();

    const [user, setUser] = useState<{name: string, profilePhoto: string, id: string} | null>(null);
    const [remoteUser, setRemoteUser] = useState<{name: string, profilePhoto: string} | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const callIdRef = useRef<string | null>(null);

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const setupMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            setHasPermissions(true);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error('Error accessing media devices.', error);
            setHasPermissions(false);
            toast({
                variant: 'destructive',
                title: 'Media Access Failed',
                description: 'Could not access your camera and microphone. Please check permissions.',
            });
            setIsConnecting(false);
            return null;
        }
    }, [toast]);
    
    // Get current user (child or therapist)
    useEffect(() => {
        const currentUserStr = localStorage.getItem('currentChild') || localStorage.getItem('currentTherapist');
        if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            setUser(currentUser);
        } else {
             // For prototype, assume a default user if none is logged in
            setUser({ id: 'user1', name: 'You', profilePhoto: 'https://picsum.photos/seed/user1/150/150'});
        }
    }, []);

    // Get remote user
    useEffect(() => {
        const fetchUser = async () => {
            if (typeof remoteUserId !== 'string') return;
            const [children, therapists] = await Promise.all([
                getAllChildren(),
                getAllTherapists()
            ]);
            const allUsers: (Child | Therapist)[] = [...children, ...therapists];
            const foundUser = allUsers.find(u => u.id === remoteUserId);

            if (foundUser) {
                setRemoteUser(foundUser);
            } else {
                notFound();
            }
        };
        fetchUser();
    }, [remoteUserId]);

    const createCall = useCallback(async (pc: RTCPeerConnection) => {
        const callDocRef = collection(db, 'calls');
        const offerCandidates = collection(doc(callDocRef), 'offerCandidates');
        const answerCandidates = collection(doc(callDocRef), 'answerCandidates');

        const newCallDoc = await addDoc(callDocRef, { createdAt: new Date() });
        callIdRef.current = newCallDoc.id;

        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                await addDoc(offerCandidates, event.candidate.toJSON());
            }
        };
        
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);
        
        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await updateDoc(newCallDoc, { offer });

        onSnapshot(newCallDoc, (snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.setRemoteDescription(answerDescription);
            }
        });

        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });

    }, []);


    useEffect(() => {
        if (!user || !remoteUser) return;
        
        const pc = new RTCPeerConnection(servers);
        peerConnectionRef.current = pc;

        let isCaller = true; // Assume current user is caller for simplicity in this hook.

        const setupCall = async () => {
            const localStream = await setupMedia();
            if (!localStream) return;

            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setIsConnecting(false);
                    setIsCallActive(true);
                }
            };
            
            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                    setIsCallActive(false);
                }
            }

            // For prototype: this user will always be the caller
            createCall(pc);
        };
        
        setupCall();

        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
            pc?.close();
            if (callIdRef.current && isCaller) {
                const callDoc = doc(db, 'calls', callIdRef.current);
                deleteDoc(callDoc); // Clean up the call doc
            }
        };
    }, [user, remoteUser, setupMedia, createCall, servers]);

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

    if (!remoteUser) {
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
                        <AvatarImage src={remoteUser.profilePhoto} alt={remoteUser.name} />
                        <AvatarFallback>{remoteUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Video Call with {remoteUser.name}</p>
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
                            <p>Calling {remoteUser.name}...</p>
                        </div>
                     )}
                     {isCallActive && !remoteVideoRef.current?.srcObject && (
                        <Avatar className={cn("h-32 w-32 absolute transition-opacity")}>
                            <AvatarImage src={remoteUser.profilePhoto} alt={remoteUser.name} />
                            <AvatarFallback className="text-6xl">{remoteUser.name.charAt(0)}</AvatarFallback>
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

                {hasPermissions === false && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/90 z-20">
                        <Alert variant="destructive" className="max-w-md">
                            <AlertTitle>Camera & Mic Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera and microphone access in your browser to use the video call feature. You may need to refresh the page after granting permission.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </main>

            <footer className="flex items-center justify-center p-4 border-t bg-background gap-4">
                <Button variant={isMuted ? 'secondary' : 'outline'} size="icon" className="h-12 w-12 rounded-full" onClick={toggleMute} disabled={hasPermissions === false}>
                    {isMuted ? <MicOff /> : <Mic />}
                    <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                </Button>
                 <Button variant={isVideoOff ? 'secondary' : 'outline'} size="icon" className="h-12 w-12 rounded-full" onClick={toggleVideo} disabled={hasPermissions === false}>
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
