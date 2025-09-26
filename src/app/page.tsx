'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This is a Client Component that handles initial routing.
export default function RootPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const checkUserAndRedirect = () => {
      // 1. Check for a logged-in user in session storage.
      const userJson = sessionStorage.getItem('user');
      
      if (userJson) {
        // A session exists, go to the dashboard. The AuthProvider will handle verification from here.
        router.replace('/dashboard');
      } else {
        // 2. No user session, redirect to login page.
        router.replace('/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg font-semibold">{status}</p>
      <p className="mt-2 text-sm text-muted-foreground">Please wait...</p>
    </div>
  );
}
