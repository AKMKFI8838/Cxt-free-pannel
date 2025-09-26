
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Send } from "lucide-react";

const requestExample = `
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
    "ESP": "on",
    "Item": "on",
    "AIM": "on",
    ...
    "expired_date": "...",
    "device": 1,
    "rng": 1672531199
  }
}
`.trim();

const errorResponseExample = `
{
  "status": false,
  "reason": "EXPIRED KEY"
}
`.trim();

export function ConnectApiClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [game, setGame] = useState("PUBG");
  const [userKey, setUserKey] = useState("");
  const [serial, setSerial] = useState("test-device-01");

  const endpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/connect` : '';

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({ description: "Copied to clipboard." });
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);

    try {
        const body = new URLSearchParams();
        body.append('game', game);
        body.append('user_key', userKey);
        body.append('serial', serial);

        const response = await fetch('/api/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
        });

        const data = await response.json();
        setTestResult(JSON.stringify(data, null, 2));

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setTestResult(JSON.stringify({ status: false, reason: errorMessage }, null, 2));
        toast({
            variant: "destructive",
            title: "Test Failed",
            description: errorMessage,
        });
    } finally {
        setLoading(false);
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect API</CardTitle>
        <CardDescription>
          Documentation and testing tool for the main user connection endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-6">
            <Label>Endpoint URL</Label>
            <div className="flex items-center gap-2">
                <Input value={endpointUrl} readOnly />
                <Button variant="outline" size="icon" onClick={() => handleCopy(endpointUrl)}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="test">Live Test</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="mt-4">
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
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                    Run Test
                </Button>
             </form>
             {testResult && (
                <div className="mt-6 space-y-2">
                    <Label>Test Result</Label>
                    <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs break-words">
                        <pre><code>{testResult}</code></pre>
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
                <h3 className="font-semibold">Success Response (200 OK)</h3>
                 <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs break-words">
                    <pre><code>{successResponseExample}</code></pre>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(successResponseExample)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold">Error Response (200 OK)</h3>
                 <div className="relative p-4 border rounded-md bg-muted/50 font-mono text-xs break-words">
                    <pre><code>{errorResponseExample}</code></pre>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(errorResponseExample)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
