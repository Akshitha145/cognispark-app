'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllChildren, getAllTherapists } from '@/lib/data';
import type { Child, Therapist } from '@/lib/types';

type User = {
    id: string;
    name: string;
    profilePhoto: string;
    status: 'Online' | 'Offline';
    type: 'Peer' | 'Therapist';
};

function ContactList({ title, users, isLoading }: { title: string; users: User[], isLoading: boolean }) {
    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    if (users.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No contacts available in the database.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-transparent data-[status=online]:ring-green-500">
                                <AvatarImage src={user.profilePhoto} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant={user.status === 'Online' ? 'default': 'secondary'} className={cn(user.status === 'Online' && 'bg-green-500 hover:bg-green-600')}>{user.status}</Badge>
                                    <Badge variant="outline">{user.type}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button asChild variant="outline" size="icon" disabled={user.status === 'Offline'}>
                            <Link href={`/call/${user.id}`}>
                                <Video className="h-5 w-5" />
                                <span className="sr-only">Start video call with {user.name}</span>
                            </Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function SocialPage() {
  const [peers, setPeers] = useState<User[]>([]);
  const [therapists, setTherapists] = useState<User[]>([]);
  const [isLoadingPeers, setIsLoadingPeers] = useState(true);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true);

  useEffect(() => {
    async function fetchPeers() {
      setIsLoadingPeers(true);
      const childrenData = await getAllChildren();
      const peerUsers: User[] = childrenData.map((child, index) => ({
        ...child,
        status: index % 2 === 0 ? 'Online' : 'Offline',
        type: 'Peer',
      }));
      setPeers(peerUsers);
      setIsLoadingPeers(false);
    }
    fetchPeers();
  }, []);

  useEffect(() => {
    async function fetchTherapists() {
        setIsLoadingTherapists(true);
        const therapistsData = await getAllTherapists();
        const therapistUsers: User[] = therapistsData.map((therapist, index) => ({
            ...therapist,
            status: index % 2 === 0 ? 'Online' : 'Offline',
            type: 'Therapist'
        }));
        setTherapists(therapistUsers);
        setIsLoadingTherapists(false);
    }
    fetchTherapists();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Social Mode"
        description="Collaborate with peers and therapists in real-time."
      />
        <Tabs defaultValue="peers">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="peers">Peers</TabsTrigger>
                <TabsTrigger value="therapists">Therapists</TabsTrigger>
            </TabsList>
            <TabsContent value="peers">
                <ContactList title="Your Peers" users={peers} isLoading={isLoadingPeers} />
            </TabsContent>
            <TabsContent value="therapists">
                <ContactList title="Your Therapists" users={therapists} isLoading={isLoadingTherapists}/>
            </TabsContent>
        </Tabs>

    </div>
  );
}

    