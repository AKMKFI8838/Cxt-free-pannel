
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, Send, Bot, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Key } from "@/lib/types";
import { getKeys } from "@/app/keys/actions";
import { updateUserBotSettings, pushToTelegram, getChatIdFromBot } from "../actions";
import { Badge } from "@/components/ui/badge";

export function TelegramBotClient() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [botToken, setBotToken] = useState(user?.telegramBotToken || "");
  const [chatId, setChatId] = useState(user?.telegramChatId || "");
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPushingAll, setIsPushingAll] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isFetchingChatId, setIsFetchingChatId] = useState(false);

  useEffect(() => {
    if (user) {
        setBotToken(user.telegramBotToken || "");
        setChatId(user.telegramChatId || "");
        getKeys().then(allKeys => {
            // Non-admins should only see their own keys
            if (user.level !== 1) {
              const userKeys = allKeys.filter(k => k.registrator === user.username);
              setKeys(userKeys);
            } else {
              setKeys(allKeys);
            }
            setIsLoadingKeys(false);
        });
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    const result = await updateUserBotSettings({
      userId: user.id,
      botToken: botToken,
    });
    if (result.success) {
      updateUser({ ...user, telegramBotToken: botToken });
      toast({ title: "Success", description: "Bot token saved." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsSaving(false);
  };
  
  const handleFetchChatId = async () => {
    if (!user || !botToken) {
        toast({ variant: "destructive", title: "Missing Token", description: "Please save your bot token first." });
        return;
    }
    setIsFetchingChatId(true);
    const result = await getChatIdFromBot(botToken);
    if (result.success && result.chatId) {
        await updateUserBotSettings({ userId: user.id, botToken, chatId: result.chatId });
        updateUser({ ...user, telegramChatId: result.chatId });
        setChatId(result.chatId);
        toast({ title: "Success!", description: "Chat ID has been found and saved." });
    } else {
        toast({ variant: "destructive", title: "Could Not Get Chat ID", description: result.error });
    }
    setIsFetchingChatId(false);
  }

  const handlePush = async () => {
    if (!selectedKey) {
        toast({ variant: 'destructive', title: 'No Key Selected', description: 'Please select a key to push.' });
        return;
    }
    setIsPushing(true);

    const keyDetails = `
━━━━━━━━━━━━━━━━━
   🔑  Key:  \`${selectedKey.user_key}\`
   ⏳  Duration: ${selectedKey.duration} Days
   📶  Status: ${selectedKey.status === 1 ? '✅ Active' : '❌ Blocked'}
   📱  Max Devices: ${selectedKey.max_devices}
━━━━━━━━━━━━━━━━━
    `.trim();

    const result = await pushToTelegram(keyDetails, user);

    if (result.success) {
        toast({ title: "Pushed!", description: "Key details sent to your bot." });
    } else {
        toast({ variant: 'destructive', title: 'Push Failed', description: result.error });
    }

    setIsPushing(false);
  }
  
  const handlePushAll = async () => {
    if (keys.length === 0) {
        toast({ variant: 'destructive', title: 'No Keys', description: 'You have no keys to push.' });
        return;
    }
    setIsPushingAll(true);

    const allKeysDetails = keys.map(key => `
━━━━━━━━━━━━━━━━━
   🔑  Key:  \`${key.user_key}\`
   ⏳  Duration: ${key.duration} Days
   📶  Status: ${key.status === 1 ? '✅ Active' : '❌ Blocked'}
   📱  Max Devices: ${key.max_devices}
━━━━━━━━━━━━━━━━━
    `.trim()).join('\n\n');
    
    const result = await pushToTelegram(allKeysDetails, user);

    if (result.success) {
        toast({ title: "Pushed!", description: "All key details have been sent to your bot." });
    } else {
        toast({ variant: 'destructive', title: 'Push Failed', description: result.error });
    }

    setIsPushingAll(false);
  }

  const handleKeySelect = (keyId: string) => {
    const key = keys.find(k => k.id_keys === keyId);
    setSelectedKey(key || null);
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>
            Enter your Telegram bot details. This is stored per user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bot-token" className="flex items-center gap-2">
                <Bot /> Bot Access Token
            </Label>
            <div className="flex gap-2">
              <Input
                id="bot-token"
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 123456:ABC-DEF1234..."
              />
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <h4 className="font-semibold">Chat ID Setup</h4>
             <p className="text-sm text-muted-foreground">
                1. Open Telegram and send the <code className="font-mono bg-background p-1 rounded-md">/start</code> command to your bot.
            </p>
             <p className="text-sm text-muted-foreground">
                2. Click the button below to automatically find and save your Chat ID.
            </p>
            <div className="flex items-center gap-4 pt-2">
                 <Button onClick={handleFetchChatId} disabled={isFetchingChatId || !botToken}>
                    {isFetchingChatId ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    Get My Chat ID
                </Button>
                {chatId && (
                    <Badge variant="secondary">Status: <span className="font-semibold text-green-500 ml-1">Configured</span></Badge>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Key to Bot</CardTitle>
          <CardDescription>
            Select one of your keys to send its details via your bot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="key-select">Select Key</Label>
                <Select onValueChange={handleKeySelect} disabled={isLoadingKeys}>
                    <SelectTrigger id="key-select">
                        <SelectValue placeholder={isLoadingKeys ? "Loading keys..." : "Choose a key..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {keys.map(key => (
                            <SelectItem key={key.id_keys} value={key.id_keys}>
                                {key.user_key}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selectedKey && (
                <div className="p-4 border rounded-md bg-muted/50 font-mono text-sm space-y-2">
                   <p>🔑 Key: {selectedKey.user_key}</p>
                   <p>⏳ Duration: {selectedKey.duration} Days</p>
                   <p>📶 Status: {selectedKey.status === 1 ? '✅ Active' : '❌ Blocked'}</p>
                   <p>📱 Max Devices: {selectedKey.max_devices}</p>
                </div>
            )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button onClick={handlePushAll} variant="outline" disabled={isPushingAll || keys.length === 0 || !chatId}>
            {isPushingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Push All Keys
          </Button>
          <Button onClick={handlePush} disabled={isPushing || !selectedKey || !chatId}>
            {isPushing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2" /> Push Selected
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
