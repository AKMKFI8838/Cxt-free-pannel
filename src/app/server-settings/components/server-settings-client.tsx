

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type {
  FeatureSettings,
  MaintenanceSettings,
  ModNameSettings,
  FTextSettings,
  AnnouncementSettings,
  SecuritySettings,
  FreeReferralSettings,
} from "@/lib/types";
import {
  updateFeatureSetting,
  updateMaintenanceSettings,
  updateModNameSetting,
  updateFTextSettings,
  updateAnnouncementSettings,
  updateSecuritySettings,
  updateFreeReferralSettings,
} from "../actions";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ServerSettingsClientProps {
  initialFeatures: FeatureSettings;
  initialMaintenance: MaintenanceSettings;
  initialModName: ModNameSettings;
  initialFText: FTextSettings;
  initialAnnouncement: AnnouncementSettings;
  initialSecurity: SecuritySettings;
  initialFreeReferral: FreeReferralSettings;
}

export function ServerSettingsClient({
  initialFeatures,
  initialMaintenance,
  initialModName,
  initialFText,
  initialAnnouncement,
  initialSecurity,
  initialFreeReferral,
}: ServerSettingsClientProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.level === 1;
  
  // State for each settings group
  const [features, setFeatures] = useState(initialFeatures);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [modName, setModName] = useState(initialModName);
  const [fText, setFText] = useState(initialFText);
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [security, setSecurity] = useState(initialSecurity);
  const [freeReferral, setFreeReferral] = useState(initialFreeReferral);

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleFeatureToggle = async (
    featureName: keyof Omit<FeatureSettings, "id">
  ) => {
    setLoadingStates((prev) => ({ ...prev, [featureName]: true }));
    const currentValue = features[featureName];
    const newValue = currentValue === "on" ? "off" : "on";
    setFeatures((prev) => ({ ...prev, [featureName]: newValue }));
    const result = await updateFeatureSetting(featureName, newValue);
    if (!result.success) {
      setFeatures((prev) => ({ ...prev, [featureName]: currentValue })); // Revert on failure
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoadingStates((prev) => ({ ...prev, [featureName]: false }));
  };

  const handleMaintenanceToggle = async () => {
    setLoadingStates(prev => ({...prev, maintenance_status: true}));
    const currentValue = maintenance.status;
    const newValue = currentValue === 'on' ? 'off' : 'on';
    setMaintenance(prev => ({...prev, status: newValue}));
    const result = await updateMaintenanceSettings({ status: newValue });
    if (!result.success) {
        setMaintenance(prev => ({...prev, status: currentValue}));
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoadingStates(prev => ({...prev, maintenance_status: false}));
  };

  const handleDefenseModeToggle = async () => {
    setLoadingStates(prev => ({...prev, defense_mode_status: true}));
    const currentValue = security.defense_mode;
    const newValue = currentValue === 'on' ? 'off' : 'on';
    setSecurity(prev => ({...prev, defense_mode: newValue}));
    const result = await updateSecuritySettings({ defense_mode: newValue });
    if (!result.success) {
        setSecurity(prev => ({...prev, defense_mode: currentValue}));
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoadingStates(prev => ({...prev, defense_mode_status: false}));
  };

  const handleFreeReferralToggle = async () => {
    setLoadingStates(prev => ({...prev, free_referral_status: true}));
    const currentValue = freeReferral.enabled;
    const newValue = currentValue === 'on' ? 'off' : 'on';
    setFreeReferral(prev => ({...prev, enabled: newValue}));
    const result = await updateFreeReferralSettings({ enabled: newValue });
    if (!result.success) {
        setFreeReferral(prev => ({...prev, enabled: currentValue}));
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoadingStates(prev => ({...prev, free_referral_status: false}));
  }

  const handleSettingsSave = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    loadingKey: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));
    const result = await action();
    if (result.success) {
      toast({ title: "Success", description: "Settings saved successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
  };


  const featureList = Object.keys(initialFeatures).filter(
    (key) => key !== "id"
  ) as (keyof Omit<FeatureSettings, "id">)[];

  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Server Settings
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage global features and settings for the application.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Feature Toggles Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>
              Enable or disable core features for all users. Changes are instant.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featureList.map((featureName) => (
              <div
                key={featureName}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <Label htmlFor={featureName} className="text-base font-medium">
                  {featureName}
                </Label>
                <Switch
                  id={featureName}
                  checked={features[featureName] === "on"}
                  onCheckedChange={() => handleFeatureToggle(featureName)}
                  disabled={loadingStates[featureName]}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Maintenance Mode Card */}
        <Card>
            <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Control the global maintenance status of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="maintenance-status" className="text-base font-medium">Server Status</Label>
                    <Switch
                        id="maintenance-status"
                        checked={maintenance.status === 'on'}
                        onCheckedChange={handleMaintenanceToggle}
                        disabled={loadingStates['maintenance_status']}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea 
                        id="maintenance-message"
                        value={maintenance.myinput}
                        onChange={(e) => setMaintenance(prev => ({...prev, myinput: e.target.value}))}
                        placeholder="e.g. Server is down for updates, back soon!"
                        rows={3}
                    />
                </div>
            </CardContent>
             <CardFooter>
                <Button 
                    onClick={() => handleSettingsSave(() => updateMaintenanceSettings({ myinput: maintenance.myinput }), 'maintenance_save')} 
                    disabled={loadingStates['maintenance_save']}
                    className="ml-auto"
                >
                    {loadingStates['maintenance_save'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Message
                </Button>
            </CardFooter>
        </Card>
        
        {/* Security Settings Card */}
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Activate defense mode to temporarily block key generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="defense-mode-status" className="text-base font-medium">Defense Mode</Label>
                    <Switch
                        id="defense-mode-status"
                        checked={security.defense_mode === 'on'}
                        onCheckedChange={handleDefenseModeToggle}
                        disabled={loadingStates['defense_mode_status']}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="defense-message">Defense Mode Message</Label>
                    <Textarea 
                        id="defense-message"
                        value={security.defense_message}
                        onChange={(e) => setSecurity(prev => ({...prev, defense_message: e.target.value}))}
                        placeholder="DDoS protection, hard client production"
                        rows={3}
                    />
                </div>
            </CardContent>
             <CardFooter>
                <Button 
                    onClick={() => handleSettingsSave(() => updateSecuritySettings({ defense_message: security.defense_message }), 'defense_message_save')} 
                    disabled={loadingStates['defense_message_save']}
                    className="ml-auto"
                >
                    {loadingStates['defense_message_save'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Message
                </Button>
            </CardFooter>
        </Card>

        {/* Free Referral System Card */}
        <Card>
            <CardHeader>
                <CardTitle>Free Referral System</CardTitle>
                <CardDescription>Allow new users to register for a free trial account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="free-referral-status" className="text-base font-medium">Enable Free Referrals</Label>
                    <Switch
                        id="free-referral-status"
                        checked={freeReferral.enabled === 'on'}
                        onCheckedChange={handleFreeReferralToggle}
                        disabled={loadingStates['free_referral_status']}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="free-referral-lock-message">Account Lock Message</Label>
                    <Textarea 
                        id="free-referral-lock-message"
                        value={freeReferral.lock_message}
                        onChange={(e) => setFreeReferral(prev => ({...prev, lock_message: e.target.value}))}
                        placeholder="Your free trial has expired. Please make a payment to continue."
                        rows={3}
                    />
                </div>
            </CardContent>
             <CardFooter>
                <Button 
                    onClick={() => handleSettingsSave(() => updateFreeReferralSettings({ lock_message: freeReferral.lock_message }), 'free_referral_save')} 
                    disabled={loadingStates['free_referral_save']}
                    className="ml-auto"
                >
                    {loadingStates['free_referral_save'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Lock Message
                </Button>
            </CardFooter>
        </Card>
        
        {/* Other Settings Card */}
        <Card>
             <CardHeader>
                <CardTitle>Mod & Status Text</CardTitle>
                <CardDescription>Manage the global mod name and status messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="modname">Mod Name</Label>
                    <Input 
                        id="modname"
                        value={modName.modname}
                        onChange={(e) => setModName(prev => ({...prev, modname: e.target.value}))}
                    />
                     <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleSettingsSave(() => updateModNameSetting(modName.modname), 'modname_save')} 
                        disabled={loadingStates['modname_save']}
                    >
                        {loadingStates['modname_save'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Name
                    </Button>
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                     <div className="space-y-2">
                        <Label htmlFor="ftext-status">Status Display</Label>
                        <Input 
                            id="ftext-status"
                            value={fText._status}
                            onChange={(e) => setFText(prev => ({...prev, _status: e.target.value}))}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ftext-credit">Credit / Footer Text</Label>
                        <Input 
                            id="ftext-credit"
                            value={fText._ftext}
                            onChange={(e) => setFText(prev => ({...prev, _ftext: e.target.value}))}
                        />
                    </div>
                    <Button 
                        size="sm"
                        variant="outline"
                         onClick={() => handleSettingsSave(() => updateFTextSettings({ _status: fText._status, _ftext: fText._ftext }), 'ftext_save')} 
                         disabled={loadingStates['ftext_save']}
                    >
                         {loadingStates['ftext_save'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Status Texts
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {/* Announcement Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Global Announcement</CardTitle>
            <CardDescription>
              Set a global announcement that will be displayed to all users on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid w-full gap-2">
                <Textarea
                  placeholder="Type your announcement here."
                  value={announcement?.text || ''}
                  onChange={(e) => setAnnouncement(prev => ({...prev, text: e.target.value}))}
                  rows={4}
                />
              </div>
          </CardContent>
           <CardFooter>
                <Button 
                    onClick={() => handleSettingsSave(() => updateAnnouncementSettings({ text: announcement.text }), 'announcement_save')} 
                    disabled={loadingStates['announcement_save']}
                    className="ml-auto"
                >
                    {loadingStates['announcement_save'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Announcement
                </Button>
            </CardFooter>
        </Card>

      </div>
    </div>
  );
}
