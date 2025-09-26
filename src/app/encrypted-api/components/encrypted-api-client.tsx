
"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { EncryptedApiSettings } from "@/lib/types";
import { updateEncryptedApiSettings, decryptApiResponse } from "../actions";
import { Loader2, Copy, Send, KeyRound, Shield, RefreshCw, Unlock } from "lucide-react";

interface EncryptedApiClientProps {
  initialSettings: EncryptedApiSettings;
}

export function EncryptedApiClient({ initialSettings }: EncryptedApiClientProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [encryptedInput, setEncryptedInput] = useState("");
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);


  // Form state for testing
  const [game, setGame] = useState("PUBG");
  const [userKey, setUserKey] = useState("");
  const [serial, setSerial] = useState("test-device-01");

  const endpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/encrypted` : '';

  const handleSave = async () => {
    if (settings.key.length !== 64 || !/^[0-9a-fA-F]+$/.test(settings.key)) {
        toast({ variant: "destructive", title: "Invalid Key", description: "Key must be 64 hexadecimal characters." });
        return;
    }
    if (settings.iv.length !== 32 || !/^[0-9a-fA-F]+$/.test(settings.iv)) {
        toast({ variant: "destructive", title: "Invalid IV", description: "IV must be 32 hexadecimal characters." });
        return;
    }

    setLoading(true);
    const result = await updateEncryptedApiSettings(settings);
    if (result.success) {
      toast({ title: "Success", description: "Encryption settings saved." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoading(false);
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    setDecryptedResult(null);

    try {
        const body = new URLSearchParams();
        body.append('game', game);
        body.append('user_key', userKey);
        body.append('serial', serial);

        const response = await fetch('/api/encrypted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const data = await response.text();
        setTestResult(data);
         toast({ title: "Test Complete", description: `Received ${data.length} bytes of encrypted data.` });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setTestResult(`Error: ${errorMessage}`);
        toast({
            variant: "destructive",
            title: "Test Failed",
            description: errorMessage,
        });
    } finally {
        setTesting(false);
    }
  }

  const handleDecrypt = async (textToDecrypt: string) => {
      if (!textToDecrypt) {
          toast({ variant: "destructive", title: "Input Required", description: "There is nothing to decrypt." });
          return;
      }
      setDecrypting(true);
      const result = await decryptApiResponse(textToDecrypt, settings.key, settings.iv);
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
    if (testResult) {
      setEncryptedInput(testResult);
      handleDecrypt(testResult);
    }
  }

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({ description: "Copied to clipboard." });
  };

  const handleGenerateRandom = () => {
    const generateRandomHex = (byteLength: number) => {
        const array = new Uint8Array(byteLength);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const newKey = generateRandomHex(32); // 32 bytes = 64 hex chars
    const newIv = generateRandomHex(16);   // 16 bytes = 32 hex chars
    setSettings({ ...settings, key: newKey, iv: newIv });
    toast({ title: "Generated", description: "New random Key and IV have been generated." });
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Encryption Settings</CardTitle>
                <CardDescription>Set the AES-256 Key and IV for response encryption.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="aes-key" className="flex items-center gap-2">
                        <KeyRound /> AES-256 Key (64 hex)
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="aes-key"
                            value={settings.key}
                            onChange={(e) => setSettings({...settings, key: e.target.value})}
                            maxLength={64}
                            className="font-mono"
                        />
                         <Button variant="outline" size="icon" onClick={() => handleCopy(settings.key)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy Key</span>
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="aes-iv" className="flex items-center gap-2">
                        <Shield /> IV (32 hex)
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="aes-iv"
                            value={settings.iv}
                            onChange={(e) => setSettings({...settings, iv: e.target.value})}
                            maxLength={32}
                            className="font-mono"
                        />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(settings.iv)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy IV</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button onClick={handleGenerateRandom} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Random
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                </Button>
            </CardFooter>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>API Test Tool</CardTitle>
                <CardDescription>Send a test request to the encrypted endpoint.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-6">
                    <Label htmlFor="endpoint-url">Endpoint URL</Label>
                    <div className="flex items-center gap-2">
                        <Input id="endpoint-url" value={endpointUrl} readOnly />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(endpointUrl)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy URL</span>
                        </Button>
                    </div>
                </div>
                 <form onSubmit={handleTestSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="test-game">Game</Label>
                        <Input id="test-game" value={game} onChange={e => setGame(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="test-key">User Key</Label>
                        <Input id="test-key" value={userKey} onChange={e => setUserKey(e.target.value)} placeholder="Enter a key to test" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="test-serial">Serial</Label>
                        <Input id="test-serial" value={serial} onChange={e => setSerial(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={testing}>
                        {testing ? <Loader2 className="animate-spin" /> : <Send />}
                        Run Test
                    </Button>
                 </form>
                 {testResult && (
                    <div className="mt-6 space-y-2">
                        <Label>Encrypted Response</Label>
                        <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs">
                            <pre className="whitespace-pre-wrap break-all"><code>{testResult}</code></pre>
                             <div className="absolute top-2 right-2 flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAutoDecrypt}>
                                    <Unlock className="h-4 w-4" />
                                    <span className="sr-only">Decrypt Response</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(testResult)}>
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copy Response</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Decryptor</CardTitle>
                <CardDescription>Paste an encrypted response to decrypt it using the current settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="encrypted-input">Encrypted Text</Label>
                    <Textarea 
                        id="encrypted-input"
                        value={encryptedInput}
                        onChange={e => setEncryptedInput(e.target.value)}
                        placeholder="Paste encrypted text here or use the auto-decrypt button above..."
                        rows={5}
                        className="font-mono text-xs"
                    />
                </div>
                 <Button onClick={() => handleDecrypt(encryptedInput)} disabled={decrypting || !encryptedInput}>
                    {decrypting ? <Loader2 className="animate-spin" /> : <Unlock />}
                    Decrypt
                 </Button>
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
            </CardContent>
        </Card>
    </div>
  );
}
