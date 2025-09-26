
"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { decryptApiResponse } from "@/app/encrypted-api/actions";
import type { EncryptedApiSettings } from "@/lib/types";
import { Loader2, Copy, Send, Unlock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// --- Connect API Examples ---
const connectRequestExample = `
fetch('/api/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    'game': 'PUBG',
    'user_key': 'YOUR_USER_KEY',
    'serial': 'USER_DEVICE_SERIAL'
  })
})
.then(res => res.json())
.then(data => console.log(data));
`.trim();

const successResponseExample = `
{
  "status": true,
  "data": {
    "real": "...",
    "token": "...",
    "modname": "VIP MOD",
    "mod_status": "Safe",
    "credit": "MOD STATUS :- 100% SAFE",
    ...
  }
}
`.trim();

// --- Encrypted API Examples ---
const encryptedRequestExample = `
fetch('/api/encrypted', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    'game': 'PUBG',
    'user_key': 'YOUR_USER_KEY',
    'serial': 'USER_DEVICE_SERIAL'
  })
})
.then(res => res.text()) // Note: Encrypted response is raw text
.then(data => console.log(data));
`.trim();


interface FreeApiClientProps {
  initialEncryptedSettings: EncryptedApiSettings;
}

export function FreeApiClient({ initialEncryptedSettings }: FreeApiClientProps) {
  const { toast } = useToast();

  // State for Connect API
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectResult, setConnectResult] = useState<string | null>(null);
  const [connectGame, setConnectGame] = useState("PUBG");
  const [connectUserKey, setConnectUserKey] = useState("");
  const [connectSerial, setConnectSerial] = useState("test-device-01");
  const connectEndpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/connect` : '';

  // State for Encrypted API
  const [encryptedLoading, setEncryptedLoading] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedInput, setEncryptedInput] = useState("");
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const encryptedEndpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/encrypted` : '';


  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({ description: "Copied to clipboard." });
  };

  const handleConnectTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectLoading(true);
    setConnectResult(null);

    try {
        const body = new URLSearchParams();
        body.append('game', connectGame);
        body.append('user_key', connectUserKey);
        body.append('serial', connectSerial);

        const response = await fetch('/api/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
        });

        const data = await response.json();
        setConnectResult(JSON.stringify(data, null, 2));

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setConnectResult(JSON.stringify({ status: false, reason: errorMessage }, null, 2));
    } finally {
        setConnectLoading(false);
    }
  }

  const handleEncryptedTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setEncryptedLoading(true);
    setEncryptedResult(null);
    setDecryptedResult(null);

    try {
        const body = new URLSearchParams();
        body.append('game', connectGame);
        body.append('user_key', connectUserKey);
        body.append('serial', connectSerial);

        const response = await fetch('/api/encrypted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const data = await response.text();
        setEncryptedResult(data);
         toast({ title: "Test Complete", description: `Received ${data.length} bytes of encrypted data.` });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setEncryptedResult(`Error: ${errorMessage}`);
    } finally {
        setEncryptedLoading(false);
    }
  }

  const handleDecrypt = async (textToDecrypt: string) => {
      if (!textToDecrypt) {
          toast({ variant: "destructive", title: "Input Required", description: "There is nothing to decrypt." });
          return;
      }
      setDecrypting(true);
      const result = await decryptApiResponse(textToDecrypt, initialEncryptedSettings.key, initialEncryptedSettings.iv);
      if (result.success) {
          setDecryptedResult(JSON.stringify(result.data, null, 2));
          toast({ title: "Success", description: "Response decrypted successfully." });
      } else {
          setDecryptedResult(`Error: ${result.error}`);
          toast({ variant: "destructive", title: "Decryption Failed", description: result.error });
      }
      setDecrypting(false);
  }
  
  const handleAutoDecrypt = () => {
    if (encryptedResult) {
      setEncryptedInput(encryptedResult);
      handleDecrypt(encryptedResult);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connect API Card */}
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Connect API</CardTitle>
                <CardDescription>Documentation and testing for the standard connection endpoint.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="test" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="test">Live Test</TabsTrigger>
                        <TabsTrigger value="docs">Documentation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="test" className="mt-4">
                        <form onSubmit={handleConnectTest} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Endpoint URL</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={connectEndpointUrl} readOnly />
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(connectEndpointUrl)}><Copy className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="test-key-connect">User Key</Label>
                                <Input id="test-key-connect" value={connectUserKey} onChange={e => setConnectUserKey(e.target.value)} placeholder="Enter a key to test" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="test-serial-connect">Serial</Label>
                                <Input id="test-serial-connect" value={connectSerial} onChange={e => setConnectSerial(e.target.value)} />
                            </div>
                            <Button type="submit" disabled={connectLoading}>
                                {connectLoading ? <Loader2 className="animate-spin" /> : <Send />} Run Test
                            </Button>
                        </form>
                        {connectResult && (
                            <div className="mt-6 space-y-2">
                                <Label>Test Result</Label>
                                <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                                    <pre className="whitespace-pre-wrap break-all"><code>{connectResult}</code></pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(connectResult)}><Copy className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="docs" className="mt-4 space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Request Body</h3>
                            <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                                <pre><code>{connectRequestExample}</code></pre>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(connectRequestExample)}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Success Response</h3>
                            <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                                <pre><code>{successResponseExample}</code></pre>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(successResponseExample)}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        {/* Encrypted API Card */}
        <Card className="lg:col-span-1">
             <CardHeader>
                <CardTitle>Encrypted API</CardTitle>
                <CardDescription>Tools for the AES-256 encrypted endpoint.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="test" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="test">Live Test</TabsTrigger>
                        <TabsTrigger value="decrypt">Decryptor</TabsTrigger>
                        <TabsTrigger value="docs">Documentation</TabsTrigger>
                    </TabsList>

                     <TabsContent value="test" className="mt-4">
                         <form onSubmit={handleEncryptedTest} className="space-y-4">
                             <div className="space-y-2">
                                <Label>Endpoint URL</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={encryptedEndpointUrl} readOnly />
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(encryptedEndpointUrl)}><Copy className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="test-key-encrypted">User Key</Label>
                                <Input id="test-key-encrypted" value={connectUserKey} onChange={e => setConnectUserKey(e.target.value)} placeholder="Enter a key to test" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="test-serial-encrypted">Serial</Label>
                                <Input id="test-serial-encrypted" value={connectSerial} onChange={e => setConnectSerial(e.target.value)} />
                            </div>
                            <Button type="submit" disabled={encryptedLoading}>
                                {encryptedLoading ? <Loader2 className="animate-spin" /> : <Send />} Run Test
                            </Button>
                        </form>
                         {encryptedResult && (
                            <div className="mt-6 space-y-2">
                                <Label>Encrypted Response</Label>
                                <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                                    <pre className="whitespace-pre-wrap break-all"><code>{encryptedResult}</code></pre>
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAutoDecrypt}>
                                            <Unlock className="h-4 w-4" />
                                            <span className="sr-only">Decrypt Response</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(encryptedResult)}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                    
                     <TabsContent value="decrypt" className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="encrypted-input">Encrypted Text to Decrypt</Label>
                            <Textarea 
                                id="encrypted-input"
                                value={encryptedInput}
                                onChange={e => setEncryptedInput(e.target.value)}
                                placeholder="Paste encrypted response here..."
                                rows={5}
                                className="font-mono text-xs"
                            />
                        </div>
                        <Button onClick={() => handleDecrypt(encryptedInput)} disabled={decrypting || !encryptedInput}>
                            {decrypting ? <Loader2 className="animate-spin" /> : <Unlock />} Decrypt
                        </Button>
                        {decryptedResult && (
                            <div className="mt-4 space-y-2">
                                <Label>Decrypted Result</Label>
                                <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                                <pre className="whitespace-pre-wrap break-all"><code>{decryptedResult}</code></pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(decryptedResult)}><Copy className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                     <TabsContent value="docs" className="mt-4 space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Request Body</h3>
                            <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                                <pre><code>{encryptedRequestExample}</code></pre>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(encryptedRequestExample)}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Success Response (Encrypted)</h3>
                            <p className="text-sm text-muted-foreground">The API will return a Base64 encoded string. Use the decryptor tool to view the content.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
