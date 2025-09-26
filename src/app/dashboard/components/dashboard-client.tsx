
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, CalendarCheck, Loader2, KeyRound, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCompactNumber } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { getUserKeyCount } from '../actions';
import { useEffect, useState } from 'react';
import { StatCards } from './stat-cards';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getFreeReferralSettings } from '@/app/server-settings/actions';
import type { FreeReferralSettings } from '@/lib/types';
import { CredentialsDisplay } from './credentials-display';
import Link from 'next/link';

export function DashboardClient() {
  const { user, loading } = useAuth();
  const [userKeyCount, setUserKeyCount] = useState(0);
  const [keysLoading, setKeysLoading] = useState(true);
  const [freeReferralSettings, setFreeReferralSettings] = useState<FreeReferralSettings | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);


  const isAdmin = user?.level === 1;
  const isFreeUser = user?.level === 4;

  useEffect(() => {
    if (user) {
      if (!isAdmin) {
        setKeysLoading(true);
        getUserKeyCount(user.username).then(count => {
          setUserKeyCount(count);
          setKeysLoading(false);
        });
      } else {
        setKeysLoading(false);
      }
      
      if (isFreeUser) {
        getFreeReferralSettings().then(setFreeReferralSettings);
        // Check for and consume the temporary password
        const pass = sessionStorage.getItem('temp_pass');
        if (pass) {
            setTempPassword(pass);
            sessionStorage.removeItem('temp_pass');
        }
      }
    }
  }, [user, isAdmin, isFreeUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  const isExpired = user.expiration_date ? new Date(user.expiration_date) < new Date() : false;

  // If Free User and expired, show locked screen
  if (isFreeUser && isExpired) {
    return (
        <Card className="text-center p-8">
            <CardHeader>
                <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
                <CardTitle className="mt-4 text-2xl">Account Locked</CardTitle>
                <CardDescription>
                    {freeReferralSettings?.lock_message || "Your free trial has expired. Please make a payment to continue."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Link href="https://t.me/officialAkshit01" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline hover:text-primary/80">
                  Contact for Payment
                </Link>
            </CardContent>
        </Card>
    )
  }

  const cardAnimation = {
     initial: { opacity: 0, y: -20 },
     animate: { opacity: 1, y: 0 },
     transition: { duration: 0.5 }
  }
  
  const ResellerDashboard = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div {...cardAnimation} transition={{...cardAnimation.transition, delay: 0.1}}>
            <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold font-mono text-green-500">
                {formatCompactNumber(user.saldo) ?? '0'}
                </p>
            </CardContent>
            </Card>
        </motion.div>
        {user.expiration_date && (
        <motion.div {...cardAnimation} transition={{...cardAnimation.transition, delay: 0.2}}>
                <Card className="shadow-lg border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Account Expiration</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">
                            {format(new Date(user.expiration_date), 'PPP')}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        )}
        <motion.div {...cardAnimation} transition={{...cardAnimation.transition, delay: 0.3}}>
            <Card className="shadow-lg border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Keys You've Generated</CardTitle>
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {keysLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <p className="text-2xl font-semibold">
                            {userKeyCount}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    </div>
  );

  return (
    <>
        {isFreeUser && tempPassword && user.username && (
             <CredentialsDisplay username={user.username} password={tempPassword} />
        )}
        {isFreeUser && user.expiration_date && !isExpired && (
             <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/30">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-600">Free Trial Account</AlertTitle>
                <AlertDescription>
                    Your account expires in {formatDistanceToNow(new Date(user.expiration_date), { addSuffix: true })}. {freeReferralSettings?.lock_message}{' '}
                    <Link href="https://t.me/officialAkshit01" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold">Contact for Payment</Link>
                </AlertDescription>
            </Alert>
        )}
        {!isAdmin ? <ResellerDashboard /> : null}
    </>
  )
}
