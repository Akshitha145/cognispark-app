import { UserNav } from '@/components/user-nav';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { CogniSparkLogo } from '@/components/icons';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <CogniSparkLogo className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">CogniSpark</span>
            </Link>
          </div>
          <div className="flex-1">
            <MainNav />
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
             <Link href="/" className="text-sm text-muted-foreground hover:underline">
                Switch Role
            </Link>
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
