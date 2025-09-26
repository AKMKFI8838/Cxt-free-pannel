'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminUser } from './actions';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setResult(null);
    const response = await createAdminUser();
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4 font-bold text-primary">Initial Admin Setup</CardTitle>
            <CardDescription>
              Click the button to create the initial administrative user.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Button onClick={handleSetup} disabled={loading || (result?.success ?? false)} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                'Create Admin User'
              )}
            </Button>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-md w-full ${result.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-destructive/10'}`}
              >
                {result.success ? 
                    <ShieldCheck className="h-5 w-5 text-green-500" /> : 
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                }
                <p className={`text-sm font-medium ${result.success ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>{result.message}</p>
              </motion.div>
            )}
             {result?.success && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                    You can now proceed to the{' '}
                    <Link href="/login" className="underline text-primary">
                    Login Page
                    </Link>.
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
