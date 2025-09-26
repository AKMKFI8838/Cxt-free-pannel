
"use client";

import { useState, useEffect } from "react";
import type { Key } from "@/lib/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useToast } from "@/hooks/use-toast";
import { useKeys } from "@/hooks/use-keys";
import { updateKey, resetKeyDevices } from "@/app/keys/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function KeyStatusClient() {
  const { toast } = useToast();
  const { filteredKeys, editKey, loading } = useKeys();
  
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [areDeviceIdsVisible, setAreDeviceIdsVisible] = useState(false);

  const handleStatusUpdate = async (keyId: string, data: Partial<Key>) => {
    const result = await updateKey(keyId, data);
    if (result.success) {
      editKey(keyId, data);
      // Also update the selected key if it's being managed
      if (selectedKey && selectedKey.id_keys === keyId) {
        setSelectedKey(prev => ({...prev!, ...data}));
      }
      toast({ title: "Success", description: "Key status updated." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };
  
  const handleResetDevices = async () => {
    if (!selectedKey) return;
    setIsResetting(true);
    const result = await resetKeyDevices(selectedKey.id_keys);
    if (result.success) {
      const updatedData = { devices: null };
      editKey(selectedKey.id_keys, updatedData);
      setSelectedKey(prev => ({...prev!, ...updatedData}));
      toast({ title: "Success", description: "Key devices have been reset." });
    } else {
       toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsResetting(false);
    setIsResetConfirmOpen(false);
  }

  const handleManageClick = (key: Key) => {
    setSelectedKey(key);
    setAreDeviceIdsVisible(false); // Reset visibility on open
    setIsManageOpen(true);
  };

  const getDeviceCount = (devices: string | null) => {
    if (!devices) return 0;
    return devices.split(',').filter(d => d).length;
  }
  
  const deviceList = selectedKey?.devices?.split(',').filter(d => d) || [];

  return (
    <>
      <div className="space-y-4 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Key Status
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View all your generated keys and the devices they are used by.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns({ onUpdate: handleStatusUpdate, onManage: handleManageClick, toast })}
            data={filteredKeys}
          />
        )}
      </div>

      {/* Manage Key Details Dialog */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Key Details</DialogTitle>
            <DialogDescription>
              View usage details and manage the status of this key.
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="key-string">Key</Label>
                <Input id="key-string" value={selectedKey.user_key} readOnly />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Device Usage</Label>
                    <p className="text-lg font-semibold">{getDeviceCount(selectedKey.devices)} / {selectedKey.max_devices}</p>
                </div>
                <div className="space-y-1">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="dialog-status-switch"
                            checked={selectedKey.status === 1}
                            onCheckedChange={(checked) => handleStatusUpdate(selectedKey.id_keys, { status: checked ? 1 : 0})}
                        />
                        <Badge variant={selectedKey.status === 1 ? 'default' : 'destructive'}>
                            {selectedKey.status === 1 ? 'Active' : 'Blocked'}
                        </Badge>
                    </div>
                </div>
              </div>

              <div className="space-y-1">
                 <div className="flex items-center justify-between">
                    <Label>Registered Device IDs</Label>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => setIsResetConfirmOpen(true)} disabled={deviceList.length === 0}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Reset
                    </Button>
                 </div>
                {deviceList.length > 0 ? (
                  <div className="relative">
                    <div className="p-2 border rounded-md bg-muted/50 max-h-24 overflow-y-auto space-y-1">
                        {areDeviceIdsVisible ? (
                            deviceList.map(id => (
                                <p key={id} className="font-mono text-xs">{id}</p>
                            ))
                        ) : (
                             <p className={cn("font-mono text-xs", !areDeviceIdsVisible && "blur-sm select-none")}>
                                {deviceList.map(id => '•'.repeat(id.length)).join('\n')}
                            </p>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-1 h-7 w-7" onClick={() => setAreDeviceIdsVisible(!areDeviceIdsVisible)}>
                        {areDeviceIdsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No devices have used this key yet.</p>
                )}
              </div>
              
              <Separator />

              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>Registered by:</strong> {selectedKey.registrator}</p>
                <p><strong>Expires on:</strong> {format(new Date(selectedKey.expired_date), 'PPP')}</p>
              </div>

            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Devices Confirmation Dialog */}
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Reset Devices?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all registered devices for this key? This will allow new devices to be registered. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDevices} disabled={isResetting} variant="destructive">
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Reset Devices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
