
"use client";

import { useState } from "react";
import type { Key, User, ReferralCode } from "@/lib/types";
import { DataTable } from "./data-table";
import { columns as keysColumns } from "./columns";
import { columns as referralsColumns } from "./referrals-columns";
import { columns as subResellersColumns } from "./sub-resellers-columns";
import { useToast } from "@/hooks/use-toast";
import { updateKey, deleteKey } from "@/app/keys/actions";
import { deleteReferralCode } from "@/app/referrals/actions";
import { updateUser } from "@/app/users/actions";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Mail, DollarSign, Edit } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import Link from "next/link";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";


export function UserDetailsClient({ 
    user, 
    initialKeys,
    initialReferrals,
    initialSubResellers
}: { 
    user: User; 
    initialKeys: Key[];
    initialReferrals: ReferralCode[];
    initialSubResellers: User[];
}) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // Local state for managed entities
  const [managedUser, setManagedUser] = useState<User>(user);
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const [referrals, setReferrals] = useState<ReferralCode[]>(initialReferrals);
  
  // Dialog/modal states
  const [keyToDelete, setKeyToDelete] = useState<Key | null>(null);
  const [referralToDelete, setReferralToDelete] = useState<ReferralCode | null>(null);
  const [isSaldoDialogOpen, setIsSaldoDialogOpen] = useState(false);
  const [newSaldo, setNewSaldo] = useState<number | string>(managedUser.saldo);
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingSaldo, setIsSavingSaldo] = useState(false);
  
  const isMainAdmin = currentUser?.level === 1;
  const isResellerAdmin = managedUser.level === 2;

  const handleKeyStatusUpdate = async (keyId: string, data: Partial<Key>) => {
    const result = await updateKey(keyId, data);
    if (result.success) {
      const updatedKeys = keys.map((k) => (k.id_keys === keyId ? { ...k, ...data } : k));
      setKeys(updatedKeys);
      toast({ title: "Success", description: "Key status updated." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  const handleKeyDeleteClick = (keyId: string) => {
    const key = keys.find(k => k.id_keys === keyId);
    if(key) setKeyToDelete(key);
  }
  
  const handleConfirmKeyDelete = async () => {
    if (!keyToDelete) return;
    setIsDeleting(true);
    const result = await deleteKey(keyToDelete.id_keys);

    if (result.success) {
      setKeys(prev => prev.filter(k => k.id_keys !== keyToDelete.id_keys));
      toast({ title: "Success", description: "Key deleted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsDeleting(false);
    setKeyToDelete(null);
  }
  
  const handleReferralDeleteClick = (referralId: string) => {
    const referral = referrals.find(r => r.id_reff === referralId);
    if(referral) setReferralToDelete(referral);
  };
  
  const handleConfirmReferralDelete = async () => {
    if (!referralToDelete) return;
    setIsDeleting(true);
    const result = await deleteReferralCode(referralToDelete.id_reff);
    
    if (result.success) {
      setReferrals(prev => prev.filter(r => r.id_reff !== referralToDelete.id_reff));
      toast({ title: "Success", description: "Referral code deleted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsDeleting(false);
    setReferralToDelete(null);
  };

  const handleSaveSaldo = async () => {
    setIsSavingSaldo(true);
    const result = await updateUser(managedUser.id, { saldo: Number(newSaldo) });
    if (result.success) {
      setManagedUser(prev => ({...prev, saldo: Number(newSaldo)}));
      toast({ title: "Success", description: "User balance updated." });
      setIsSaldoDialogOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsSavingSaldo(false);
  }

  return (
    <>
    <div className="space-y-4 md:space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
            <Link href="/management"><ArrowLeft /></Link>
        </Button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground text-sm md:text-base">
                Manage details for {managedUser.username}.
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>User Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="font-semibold">{managedUser.username}</span>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-semibold">{managedUser.email}</span>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="font-semibold text-green-500">{managedUser.saldo > 2000000000 ? '∞' : formatCompactNumber(managedUser.saldo)}</span>
                </div>
                 {isMainAdmin && managedUser.level !== 1 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setNewSaldo(managedUser.saldo); setIsSaldoDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </CardContent>
      </Card>
      
      {isResellerAdmin && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Generated Referral Codes ({referrals.length})</CardTitle>
                    <CardDescription>All one-time use referral codes generated by this Reseller Admin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={referralsColumns({ onDelete: handleReferralDeleteClick })}
                        data={referrals}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Onboarded Sub-Resellers ({initialSubResellers.length})</CardTitle>
                    <CardDescription>All users who have registered using this admin's referral codes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={subResellersColumns()}
                        data={initialSubResellers}
                    />
                </CardContent>
            </Card>
        </>
      )}

      <Card>
        <CardHeader>
            <CardTitle>{isResellerAdmin ? `Managed Keys (${keys.length})` : `Generated Keys (${keys.length})`}</CardTitle>
            <CardDescription>{isResellerAdmin ? "All keys generated by this admin and their sub-resellers." : "All keys generated by this user."}</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable
            columns={keysColumns({ onStatusChange: handleKeyStatusUpdate, onDelete: handleKeyDeleteClick })}
            data={keys}
            />
        </CardContent>
      </Card>
    </div>

    {/* Key Deletion Dialog */}
    <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the key <strong className="font-mono text-foreground">{keyToDelete?.user_key}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmKeyDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    {/* Referral Deletion Dialog */}
    <AlertDialog open={!!referralToDelete} onOpenChange={() => setReferralToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the referral code <strong className="font-mono text-foreground">{referralToDelete?.Referral}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReferralDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    {/* Manage Saldo Dialog */}
    <Dialog open={isSaldoDialogOpen} onOpenChange={setIsSaldoDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Manage Saldo for {managedUser.username}</DialogTitle>
                <DialogDescription>
                    Set a new balance for this user. This action is only available to the Main Admin.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="saldo-input">New Saldo</Label>
                <Input
                    id="saldo-input"
                    type="number"
                    value={newSaldo}
                    onChange={(e) => setNewSaldo(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsSaldoDialogOpen(false)} disabled={isSavingSaldo}>Cancel</Button>
                <Button onClick={handleSaveSaldo} disabled={isSavingSaldo}>
                    {isSavingSaldo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Balance
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
