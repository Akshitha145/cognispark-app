
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, LogOut, Settings, User, Loader2 } from 'lucide-react';
import type { Caregiver, Therapist } from '@/lib/types';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

type LoggedInUser = (Caregiver | Therapist) & { type: 'Caregiver' | 'Therapist' };

export function UserNav() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    let storedUser = null;
    if (pathname.startsWith('/dashboard')) {
        storedUser = localStorage.getItem('currentCaregiver');
        if (storedUser) setUser({...JSON.parse(storedUser), type: 'Caregiver'});
    } else if (pathname.startsWith('/therapist')) {
        storedUser = localStorage.getItem('currentTherapist');
        if (storedUser) setUser({...JSON.parse(storedUser), type: 'Therapist'});
    }
    setIsLoading(false);
  }, [pathname]);

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (!user) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  const handleLogout = () => {
    if (user.type === 'Caregiver') {
        localStorage.removeItem('currentCaregiver');
    } else if (user.type === 'Therapist') {
        localStorage.removeItem('currentTherapist');
    }
    window.location.href = '/';
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.profilePhoto} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            {'email' in user && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
