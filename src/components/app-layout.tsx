
'use client';

import { AppSidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleIdle = () => {
    // Clear any session storage
    sessionStorage.removeItem('user');
    toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive"
    })
    router.push('/login');
  };

  useIdleTimeout({ onIdle: handleIdle, idleTime: 15 });

  return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <AppSidebar />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
            <Header />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}
