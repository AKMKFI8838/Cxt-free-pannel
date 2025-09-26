
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { decryptApiResponse } from "@/app/encrypted-api/actions";
import type { EncryptedApiSettings } from "@/lib/types";
import { Loader2, Copy, Send, Unlock } from "lucide-react";


const requestExample = `
fetch('/api/online-bypass', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    password: 'YOUR_10_DIGIT_PASSWORD'
  })
})
.then(res => res.text()) // Note: Responses are encrypted raw text
.then(data => console.log(data));
`.trim();


export function OnlineBypassApiClient({ encryptionSettings }: { encryptionSettings: EncryptedApiSettings | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedInput, setEncryptedInput] = useState("");
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);

  const endpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/online-bypass` : '';

  const handleCopy = (textToCopy: string) => {
    if(!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    toast({ description: "Copied to clipboard." });
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);

    try {
        const response = await fetch('/api/online-bypass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        
        const data = await response.text();
        setTestResult(data);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setTestResult(`Error: ${errorMessage}`);
        toast({
            variant: "destructive",
            title: "Test Failed",
            description: errorMessage,
        });
    } finally {
        setLoading(false);
    }
  }

  const handleDecrypt = async () => {
    if (!encryptedInput) {
        toast({ variant: "destructive", title: "Input Required", description: "Please paste the encrypted text to decrypt." });
        return;
    }
    if (!encryptionSettings?.key || !encryptionSettings?.iv) {
        toast({ variant: "destructive", title: "Not Configured", description: "Encryption Key and IV must be set in the Encrypted API page." });
        return;
    }
    setDecrypting(true);
    const result = await decryptApiResponse(encryptedInput, encryptionSettings.key, encryptionSettings.iv);
    if (result.success) {
        // The decrypted data for this API is just raw text, not JSON
        setDecryptedResult(result.data);
    } else {
        setDecryptedResult(`Error: ${result.error}`);
    }
    setDecrypting(false);
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Bypass API</CardTitle>
        <CardDescription>
          Documentation and testing tool for the encrypted bypass endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="test">Live Test</TabsTrigger>
            <TabsTrigger value="decrypt">Decryptor</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="mt-4">
             <form onSubmit={handleTestSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <div className="flex items-center gap-2">
                        <Input value={endpointUrl} readOnly />
                        <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(endpointUrl)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="test-password">Password (10 digits)</Label>
                    <Input 
                        id="test-password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="Enter the 10-digit API password"
                        maxLength={10}
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                    Run Test
                </Button>
             </form>
             {testResult && (
                <div className="mt-6 space-y-2">
                    <Label>Encrypted Result</Label>
                    <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                        <pre className="whitespace-pre-wrap break-words"><code>{testResult}</code></pre>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => handleCopy(testResult)}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
             )}
          </TabsContent>
          
          <TabsContent value="decrypt" className="mt-4 space-y-4">
               <div className="space-y-2">
                    <Label htmlFor="encrypted-input">Encrypted Text</Label>
                    <Textarea 
                        id="encrypted-input"
                        value={encryptedInput}
                        onChange={e => setEncryptedInput(e.target.value)}
                        placeholder="Paste encrypted text here..."
                        rows={5}
                        className="font-mono text-xs"
                    />
                </div>
                 <Button onClick={handleDecrypt} disabled={decrypting || !encryptionSettings}>
                    {decrypting ? <Loader2 className="animate-spin" /> : <Unlock />}
                    Decrypt
                 </Button>
                 {!encryptionSettings && (
                    <p className="text-xs text-destructive">Decryption requires Key and IV to be set on the Encrypted API page.</p>
                 )}
                 {decryptedResult && (
                    <div className="mt-4 space-y-2">
                        <Label>Decrypted Result</Label>
                        <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                           <pre className="whitespace-pre-wrap break-all"><code>{decryptedResult}</code></pre>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={() => handleCopy(decryptedResult)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                 )}
          </TabsContent>

          <TabsContent value="docs" className="mt-4 space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Request Body</h3>
                 <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs break-words">
                    <pre><code>{requestExample}</code></pre>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(requestExample)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Success Response (200 OK, encrypted raw text)</h3>
                 <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs break-words">
                    <pre><code>U2FsdGVkX1... (example encrypted string)</code></pre>
                </div>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold">Error Response (e.g., 400, also encrypted)</h3>
                 <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs break-words">
                    <pre><code>U2FsdGVkX1... (encrypted error message)</code></pre>
                </div>
            </div>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
