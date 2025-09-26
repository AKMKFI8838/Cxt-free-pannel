
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { ref, set, push, get, query, equalTo, orderByChild, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import type { ReferralCode } from '@/lib/types';


async function validateAndUseReferralCode(code: string, username: string): Promise<{ saldo: number; level: number; expiration_date: string } | null> {
    if (!code) return null;

    const codesRef = ref(db, 'referral_code');
    const snapshot = await get(codesRef);
    if (!snapshot.exists()) return null;

    const codesData: Record<string, ReferralCode> = snapshot.val();
    let foundCodeId: string | null = null;
    let foundCodeData: ReferralCode | null = null;

    for (const id in codesData) {
        if (codesData[id].Referral === code) {
            foundCodeId = id;
            foundCodeData = codesData[id];
            break;
        }
    }
    
    // Code must exist and must NOT have been used yet.
    if (foundCodeId && foundCodeData && !foundCodeData.used_by) {
        // Mark the code as used
        const codeRef = ref(db, `referral_code/${foundCodeId}`);
        await update(codeRef, { used_by: username, updated_at: new Date().toISOString() });
        
        return {
            saldo: foundCodeData.set_saldo,
            level: foundCodeData.level,
            expiration_date: foundCodeData.acc_expiration
        };
    }

    // If code doesn't exist or is already used, return null
    return null;
}


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!referralCode) {
        throw new Error("A referral code is required to register.");
      }

      // Check for duplicate user
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const usersData = snapshot.val() || {};
      for (const userId in usersData) {
        if (usersData[userId].email === email) throw new Error("An account with this email already exists.");
        if (usersData[userId].username === username) throw new Error("This username is already taken.");
      }
      
      // Validate referral code
      const referralData = await validateAndUseReferralCode(referralCode, username);
      if (!referralData) {
          throw new Error("Invalid or already used referral code.");
      }

      // Create a new user record in Firebase Realtime Database
      const newUserRef = push(usersRef);
      await set(newUserRef, {
        username: username,
        fullname: username,
        email: email,
        password: password, // SECURITY RISK: Storing password in plaintext
        level: referralData.level,
        status: 1, // Active
        saldo: referralData.saldo,
        uplink: referralCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expiration_date: referralData.expiration_date,
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });

      router.push('/login');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4 font-bold text-center text-primary">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details below to register. A valid referral code is required.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral">Referral Code</Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
               <p className="text-xs text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="underline text-primary">
                  Login here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
