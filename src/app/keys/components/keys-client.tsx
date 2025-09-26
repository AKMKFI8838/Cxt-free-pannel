

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useKeys } from "@/hooks/use-keys";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Key, KeyPriceSettings, KeyPriceTier } from "@/lib/types";
import { generateKey, deleteKey, updateKey } from "../actions";
import { getKeyPriceSettings } from "@/app/key-pricing/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// Schema for generating a new key
const generateKeySchema = z.object({
  user_key: z.string().optional(), // Now optional
  duration: z.coerce.number().min(1, "Duration is required"),
  durationType: z.enum(["days", "hours"]).default("days"),
  max_devices: z.coerce.number().min(1, "Max Devices must be at least 1"),
});

// Schema for editing an existing key
const editKeySchema = z.object({
  user_key: z.string().min(1, "User Key is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  max_devices: z.coerce.number().min(1, "Max Devices must be at least 1"),
});


function GenerateKeyDialogContent({ isSubmitting, onFormSubmit }) {
  const [priceSettings, setPriceSettings] = useState<KeyPriceSettings | null>(null);

  const generateForm = useForm<z.infer<typeof generateKeySchema>>({
    resolver: zodResolver(generateKeySchema),
    defaultValues: {
      user_key: "",
      duration: '',
      durationType: "days",
      max_devices: 1,
    },
  });
  
  useEffect(() => {
    getKeyPriceSettings().then(setPriceSettings);
  }, []);

  const watchedDuration = generateForm.watch("duration");
  const watchedDurationType = generateForm.watch("durationType");
  const watchedDevices = generateForm.watch("max_devices");

  const cost = useMemo(() => {
    if (!priceSettings || !watchedDuration || !watchedDevices) return 0;
    
    if (watchedDurationType === 'hours') {
        const costPerDay = priceSettings.defaultPricePerDay || 1;
        // Prorate the cost for hours
        return (watchedDuration / 24) * costPerDay * watchedDevices;
    }

    // Daily calculation
    const tier = priceSettings.tiers?.[String(watchedDuration)];
    if (tier) {
      return tier.price * watchedDevices;
    }
    
    // Custom duration costs 3x per day per device
    return watchedDuration * watchedDevices * 3;
  }, [priceSettings, watchedDuration, watchedDevices, watchedDurationType]);
  
  const durationTiers: KeyPriceTier[] = priceSettings?.tiers
    ? Object.entries(priceSettings.tiers).map(([id, tier]) => ({ id, ...tier }))
    : [];

  return (
    <Form {...generateForm}>
      <form onSubmit={generateForm.handleSubmit(onFormSubmit)}>
        <DialogHeader>
          <DialogTitle>Generate New Key</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new key for PUBG. The cost will be deducted from your saldo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField
            control={generateForm.control}
            name="user_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Key (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Leave blank for random" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="flex items-end gap-2">
                <FormField
                    control={generateForm.control}
                    name="duration"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 7 or 24" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={generateForm.control}
                    name="durationType"
                    render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
           </div>
          {durationTiers.length > 0 && (
            <div className="space-y-2">
                <Label>Price Tiers (Days)</Label>
                <ScrollArea className="h-24 w-full rounded-md border p-2">
                    <div className="space-y-1">
                        {durationTiers.map(tier => (
                            <div key={tier.id} className="text-sm p-1 flex justify-between">
                                <span>{tier.days} Days</span>
                                <span className="font-semibold">{tier.price} Saldo</span>
                            </div>
                        ))}
                         <div className="text-sm p-1 flex justify-between text-muted-foreground italic">
                            <span>Custom Duration</span>
                            <span className="font-semibold">3 Saldo / day</span>
                        </div>
                    </div>
                </ScrollArea>
            </div>
          )}
           <FormField
            control={generateForm.control}
            name="max_devices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Devices</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting || !watchedDuration}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Key {cost > 0 && `(Cost: ${cost.toFixed(2)} Saldo)`}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export function KeysClient() {
  const { user, updateUser } = useAuth();
  const { keys, addKey, removeKey, editKey: updateLocalKey, filteredKeys, loading } = useKeys();
  const { toast } = useToast();
  
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [areKeysVisible, setAreKeysVisible] = useState(false);

  const editForm = useForm<z.infer<typeof editKeySchema>>({
    resolver: zodResolver(editKeySchema),
  });

  useEffect(() => {
    if (selectedKey) {
      editForm.reset({
        user_key: selectedKey.user_key,
        duration: selectedKey.duration,
        max_devices: selectedKey.max_devices,
      });
    }
  }, [selectedKey, editForm]);


  async function onGenerateSubmit(values: z.infer<typeof generateKeySchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to generate a key." });
        return;
    }
    setIsSubmitting(true);
    
    const finalValues = {
        ...values,
        user_key: values.user_key || `Kuro-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    }

    const result = await generateKey({ 
      ...finalValues, 
      game: "PUBG", 
      registrator: user.username,
      registratorId: user.id
    });

    if (result.success && result.key) {
      addKey(result.key);
      if (typeof result.newSaldo === 'number') {
        updateUser({ ...user, saldo: result.newSaldo });
      }
      toast({ title: "Success", description: "New key generated successfully." });
      setIsGenerateDialogOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsSubmitting(false);
  }

  async function onEditSubmit(values: z.infer<typeof editKeySchema>) {
    if (!selectedKey) return;
    setIsSubmitting(true);
    
    const updateData = {
      user_key: values.user_key,
      duration: values.duration,
      max_devices: values.max_devices,
    };

    const result = await updateKey(selectedKey.id_keys, updateData);

    if (result.success) {
      updateLocalKey(selectedKey.id_keys, values);
      toast({ title: "Success", description: "Key updated successfully." });
      setIsEditDialogOpen(false);
      setSelectedKey(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsSubmitting(false);
  }

  const handleDelete = async (keyId: string) => {
    const result = await deleteKey(keyId);
     if (result.success) {
      removeKey(keyId);
      toast({ title: "Success", description: "Key deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }

  const handleStatusUpdate = async (keyId: string, data: Partial<Key>) => {
     const result = await updateKey(keyId, data);
     if (result.success) {
      updateLocalKey(keyId, data);
      toast({ title: "Success", description: "Key status updated." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }
  
  const handleEditOpen = (key: Key) => {
    setSelectedKey(key);
    setIsEditDialogOpen(true);
  }


  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Key Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Generate, view, and manage your keys.
          </p>
        </div>
         <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <GenerateKeyDialogContent 
              isSubmitting={isSubmitting}
              onFormSubmit={onGenerateSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

       {/* Edit Key Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                <DialogHeader>
                  <DialogTitle>Edit Key</DialogTitle>
                  <DialogDescription>
                    Modify the details of the existing key. Registrator and Game cannot be changed.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <div className="space-y-2">
                      <Label>Game</Label>
                      <Input value={selectedKey?.game} disabled />
                   </div>
                   <div className="space-y-2">
                      <Label>Registrator</Label>
                      <Input value={selectedKey?.registrator} disabled />
                   </div>
                  <FormField
                    control={editForm.control}
                    name="user_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a unique key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={editForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={editForm.control}
                    name="max_devices"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Devices</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Key
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <DataTable 
          columns={columns({
            onDelete: handleDelete, 
            onUpdate: handleStatusUpdate, 
            onEdit: handleEditOpen,
            areKeysVisible: areKeysVisible,
            toggleKeysVisibility: () => setAreKeysVisible(!areKeysVisible),
            toast
          })} 
          data={filteredKeys} 
        />
      )}
    </div>
  );
}
