
"use client";

import { useState } from "react";
import type { KeyPriceSettings, KeyPriceTier } from "@/lib/types";
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
import { updateKeyPriceSettings } from "../actions";
import { Loader2, PlusCircle, Trash2, DollarSign } from "lucide-react";
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


interface KeyPricingClientProps {
  initialSettings: KeyPriceSettings | null;
}

export function KeyPricingClient({ initialSettings }: KeyPricingClientProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [newTier, setNewTier] = useState<{ days: string; price: string }>({ days: "", price: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveDefaultPrice = async () => {
    if (!settings) return;
    setIsLoading(true);
    const result = await updateKeyPriceSettings({ defaultPricePerDay: settings.defaultPricePerDay });
    if (result.success) {
      toast({ title: "Success", description: "Default price saved." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsLoading(false);
  };

  const handleAddTier = async () => {
    if (!settings || !newTier.days || !newTier.price) {
        toast({ variant: "destructive", title: "Missing fields", description: "Please enter both days and price for the new tier."});
        return;
    }
    const days = parseInt(newTier.days, 10);
    const price = parseInt(newTier.price, 10);
    if (isNaN(days) || isNaN(price) || days <= 0 || price < 0) {
        toast({ variant: "destructive", title: "Invalid input", description: "Please enter valid, positive numbers."});
        return;
    }

    const updatedTiers = {
        ...settings.tiers,
        [newTier.days]: { days: days, price: price }
    }
    
    setIsLoading(true);
    const result = await updateKeyPriceSettings({ tiers: updatedTiers });
    if (result.success) {
      setSettings(prev => ({...prev!, tiers: updatedTiers}));
      setNewTier({ days: "", price: ""});
      toast({ title: "Success", description: "New price tier added." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsLoading(false);
  }
  
  const handleDeleteTier = async (tierId: string) => {
    if (!settings) return;
    
    const updatedTiers = {...settings.tiers};
    delete updatedTiers[tierId];

    setIsLoading(true);
    const result = await updateKeyPriceSettings({ tiers: updatedTiers });
    if (result.success) {
      setSettings(prev => ({...prev!, tiers: updatedTiers}));
      toast({ title: "Success", description: "Price tier removed." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsLoading(false);
  }

  const tiersList: KeyPriceTier[] = settings?.tiers ? Object.entries(settings.tiers).map(([id, tier]) => ({ id, ...tier })) : [];

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Default Pricing</CardTitle>
                <CardDescription>Set the fallback price per day if no specific tier matches.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="default-price">Default Cost per Day per Device</Label>
                    <Input 
                        id="default-price"
                        type="number"
                        value={settings?.defaultPricePerDay || 1}
                        onChange={(e) => setSettings(prev => ({...prev!, defaultPricePerDay: Number(e.target.value)}))}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSaveDefaultPrice} disabled={isLoading} className="ml-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Default Price
                </Button>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Price Tiers</CardTitle>
                <CardDescription>Define fixed prices for specific key durations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {tiersList.length > 0 && (
                    <div className="space-y-2">
                        {tiersList.map(tier => (
                            <div key={tier.id} className="flex items-center justify-between p-2 border rounded-md">
                                <span className="font-medium">{tier.days} Days</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-green-500 font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4"/> {tier.price}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTier(tier.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="flex items-end gap-2 pt-4 border-t">
                    <div className="grid gap-1.5 flex-1">
                        <Label htmlFor="new-days">Days</Label>
                        <Input id="new-days" type="number" placeholder="e.g., 30" value={newTier.days} onChange={e => setNewTier({...newTier, days: e.target.value})} />
                    </div>
                    <div className="grid gap-1.5 flex-1">
                        <Label htmlFor="new-price">Price</Label>
                        <Input id="new-price" type="number" placeholder="e.g., 25" value={newTier.price} onChange={e => setNewTier({...newTier, price: e.target.value})} />
                    </div>
                    <Button onClick={handleAddTier} disabled={isLoading}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
