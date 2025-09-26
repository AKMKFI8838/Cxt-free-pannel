
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CredentialsDisplayProps {
  username: string;
  password?: string;
}

export function CredentialsDisplay({ username, password }: CredentialsDisplayProps) {
  const { toast } = useToast();
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleCopy = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
    toast({ description: `${type === 'user' ? 'Username' : 'Password'} copied to clipboard.` });
  };

  if (!password) return null;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to Your Free Trial!</CardTitle>
        <CardDescription>
          Your account is ready. Please save your new credentials below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600">Important</AlertTitle>
          <AlertDescription>
            These credentials are shown only once. Please copy and store them in a safe place.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                 <div className="flex items-center gap-2">
                    <Input id="username" value={username} readOnly className="font-mono"/>
                    <Button variant="outline" size="icon" onClick={() => handleCopy(username, 'user')}>
                        {copiedUser ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                 <div className="flex items-center gap-2">
                    <Input id="password" value={password} readOnly type={isPasswordVisible ? 'text' : 'password'} className="font-mono"/>
                     <Button variant="outline" size="icon" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                        {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                     <Button variant="outline" size="icon" onClick={() => handleCopy(password, 'pass')}>
                        {copiedPass ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
