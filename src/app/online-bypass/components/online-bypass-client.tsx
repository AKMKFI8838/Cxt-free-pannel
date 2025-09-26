
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { OnlineBypassSettings } from "@/lib/types";
import { updateOnlineBypassSettings } from "../actions";
import { Loader2, Copy, KeyRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OnlineBypassClientProps {
  initialSettings: OnlineBypassSettings | null;
}

export function OnlineBypassClient({ initialSettings }: OnlineBypassClientProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [bypassText, setBypassText] = useState(initialSettings?.bypass_text || "");
  const [password, setPassword] = useState(initialSettings?.password || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (password.length !== 10 || !/^\d+$/.test(password)) {
        toast({
            variant: "destructive",
            title: "Invalid Password",
            description: "Password must be exactly 10 digits.",
        });
        return;
    }
    
    setIsLoading(true);
    const result = await updateOnlineBypassSettings({ bypass_text: bypassText, password });
    if (result.success) {
      const newSettings = {
        ...settings,
        bypass_text: bypassText,
        password: password,
        updated_at: new Date().toISOString()
      } as OnlineBypassSettings
      setSettings(newSettings);
      toast({ title: "Success", description: "Bypass settings saved." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsLoading(false);
  };
  
  const handleCopy = () => {
    if (settings?.bypass_text) {
        navigator.clipboard.writeText(settings.bypass_text);
        toast({ title: "Copied!", description: "Bypass text copied to clipboard." });
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bypass Settings</CardTitle>
          <CardDescription>
            Manage the bypass text and the 10-digit password for the API. Last updated{" "}
            {settings?.updated_at
              ? formatDistanceToNow(new Date(settings.updated_at), { addSuffix: true })
              : "never"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                    <KeyRound /> API Password (10 digits)
                </Label>
                <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={10}
                    placeholder="Enter a 10-digit numeric password"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="bypass-text">Bypass Text</Label>
                 <Textarea
                    id="bypass-text"
                    value={bypassText}
                    onChange={(e) => setBypassText(e.target.value)}
                    placeholder="Enter your new bypass text here..."
                    rows={6}
                />
            </div>
            
        </CardContent>
         <CardFooter>
          <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
