

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

function KeyDisplay() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (token) {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!token) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>No key token was provided.</CardDescription>
            </CardHeader>
             <CardContent>
                <p>Please try generating a key again.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl text-center">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Free Key is Ready!</CardTitle>
            <CardDescription>Copy the key below and use it in the application.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-4 border-2 border-dashed rounded-lg bg-muted">
                <p className="font-mono text-lg md:text-xl break-words text-primary">{token}</p>
            </div>
        </CardContent>
        <CardFooter className="justify-center">
            <Button onClick={handleCopy} size="lg">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Key'}
            </Button>
        </CardFooter>
    </Card>
  )
}


export default function ShowKeyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <Suspense fallback={<div>Loading...</div>}>
            <KeyDisplay />
        </Suspense>
    </div>
  );
}

