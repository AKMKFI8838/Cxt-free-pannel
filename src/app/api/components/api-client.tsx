
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ApiSettings } from "@/lib/types";
import { updateApiSettings } from "../actions";
import { Loader2, Copy, Link as LinkIcon } from "lucide-react";

interface ApiClientProps {
  initialSettings: ApiSettings;
}

export function ApiClient({ initialSettings }: ApiClientProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (field: 'api_enabled' | 'shortener_enabled') => {
    setLoading(true);
    const currentValue = settings[field];
    const newValue = currentValue === "on" ? "off" : "on";
    const newSettings = {...settings, [field]: newValue};
    setSettings(newSettings);
    const result = await updateApiSettings({ [field]: newValue });
     if (!result.success) {
      setSettings(settings); // Revert on failure
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoading(false);
  }

  const handleSaveApiKey = async () => {
    setLoading(true);
    const result = await updateApiSettings({ shortener_api_key: settings.shortener_api_key });
    if (result.success) {
      toast({ title: "Success", description: "API Key saved." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoading(false);
  }
  
  const generateUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/api/generate` : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generateUrl);
    toast({ title: "Copied!", description: "API URL copied to clipboard."});
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>API Control</CardTitle>
                <CardDescription>Enable or disable the free key generation API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="api-enabled" className="text-base font-medium">Free Key API Status</Label>
                    <Switch
                        id="api-enabled"
                        checked={settings.api_enabled === 'on'}
                        onCheckedChange={() => handleToggle('api_enabled')}
                        disabled={loading}
                    />
                </div>
                {settings.api_enabled === 'on' && (
                    <div className="space-y-2">
                        <Label htmlFor="api-url">API URL</Label>
                        <div className="flex items-center gap-2">
                            <Input id="api-url" value={generateUrl} readOnly />
                            <Button variant="outline" size="icon" onClick={handleCopyUrl}><Copy className="h-4 w-4" /></Button>
                        </div>
                        <CardDescription>Share this URL to allow users to generate a free key.</CardDescription>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Link Shortener</CardTitle>
                <CardDescription>Optionally shorten the key link using Get2Short.com.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="shortener-enabled" className="text-base font-medium">Use Link Shortener</Label>
                    <Switch
                        id="shortener-enabled"
                        checked={settings.shortener_enabled === 'on'}
                        onCheckedChange={() => handleToggle('shortener_enabled')}
                        disabled={loading}
                    />
                </div>
                 {settings.shortener_enabled === 'on' && (
                    <div className="space-y-2">
                        <Label htmlFor="shortener-api-key">Get2Short API Token</Label>
                        <Input 
                            id="shortener-api-key" 
                            type="password"
                            value={settings.shortener_api_key}
                            onChange={(e) => setSettings({...settings, shortener_api_key: e.target.value})}
                        />
                    </div>
                 )}
            </CardContent>
            {settings.shortener_enabled === 'on' && (
                <CardFooter>
                    <Button onClick={handleSaveApiKey} disabled={loading} className="ml-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save API Key
                    </Button>
                </CardFooter>
            )}
        </Card>
    </div>
  );
}
