
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { getFreeReferralSettings } from '@/app/server-settings/actions';
import { createFreeUser } from '@/app/register/actions';
import type { FreeReferralSettings, User } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [freeReferralSettings, setFreeReferralSettings] = useState<FreeReferralSettings | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    getFreeReferralSettings().then(setFreeReferralSettings);
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        let userFound = false;
        let userData = null;
        let userId = null;

        for (const id in usersData) {
            if (usersData[id].email === email) {
                userData = usersData[id];
                userId = id;
                userFound = true;
                break;
            }
        }
        
        if (userFound && userData) {
            if (userData.password === password) {
                sessionStorage.setItem('user', JSON.stringify({id: userId, ...userData}));
                router.push('/dashboard');
            } else {
                throw new Error("Invalid credentials.");
            }
        } else {
            throw new Error("User not found.");
        }

      } else {
        throw new Error("No users in the database.");
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
       setLoading(false);
    }
  };

  const handleFreeTrial = async () => {
    setTrialLoading(true);
    const result = await createFreeUser();

    if (result.success && result.user) {
        toast({
            title: "Free Trial Account Created!",
            description: "Welcome! Redirecting you to your new dashboard.",
        });
        // This is a new user, save their password to session to show on dashboard
        sessionStorage.setItem('temp_pass', result.user.password!);
        sessionStorage.setItem('user', JSON.stringify({id: result.userId, ...result.user}));
        router.push('/dashboard');

    } else if (!result.success && result.user && result.error?.includes("already exists")) {
        // This is a returning user with the same IP
        toast({
            title: "Welcome Back!",
            description: "An account for this IP already exists. Logging you in automatically.",
        });
        sessionStorage.setItem('user', JSON.stringify({id: result.userId, ...result.user}));
        router.push('/dashboard');
    }
    else {
        toast({
            variant: "destructive",
            title: "Free Trial Failed",
            description: result.error,
        });
    }
    setTrialLoading(false);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4 font-bold text-center text-primary">Admin & User Login</CardTitle>
            <CardDescription className="text-center">
              Please enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <div className="text-xs text-center text-muted-foreground space-x-2">
                 <Link href="/register" className="underline text-primary hover:text-primary/80">
                  Register with code
                </Link>
                <span>|</span>
                 <a href="https://t.me/officialAkshit01" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                  Contact developer
                </a>
              </div>
            </CardFooter>
          </form>

          {freeReferralSettings?.enabled === 'on' && (
            <>
                <div className="flex items-center px-6 py-2">
                    <Separator className="flex-1" />
                    <span className="px-4 text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                <CardFooter>
                     <Button variant="outline" className="w-full" onClick={handleFreeTrial} disabled={trialLoading}>
                        {trialLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                        </>
                        ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                            Start Free Trial
                        </>
                        )}
                    </Button>
                </CardFooter>
            </>
          )}

        </Card>
      </motion.div>
    </div>
  );
}
