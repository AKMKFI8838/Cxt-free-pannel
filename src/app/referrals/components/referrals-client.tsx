
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ReferralCode } from "@/lib/types";
import { generateReferralCode, deleteReferralCode } from "../actions";
import { useToast } from "@/hooks/use-toast";

const generateCodeSchema = z.object({
  set_saldo: z.coerce.number().min(0, "Saldo must be a positive number"),
  level: z.coerce.number().min(2, "Level is required").max(3),
  acc_expiration: z.coerce.number().min(1, "Expiration is required"),
});

export function ReferralsClient({ initialCodes, setCodes }: { initialCodes: ReferralCode[], setCodes: React.Dispatch<React.SetStateAction<ReferralCode[]>> }) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isResellerAdmin = user?.level === 2;

  const form = useForm<z.infer<typeof generateCodeSchema>>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      set_saldo: 5,
      level: 3, // Default to Reseller for reseller admin
      acc_expiration: 30, // Default to 30 days
    },
  });

  async function onSubmit(values: z.infer<typeof generateCodeSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
        return;
    }
    setIsSubmitting(true);
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + values.acc_expiration);

    // Reseller admins can only create level 3 users
    const levelToCreate = isResellerAdmin ? 3 : values.level;

    const result = await generateReferralCode({
      ...values,
      level: levelToCreate,
      acc_expiration: expirationDate.toISOString(),
      created_by: user.username,
      registratorId: user.id
    });

    if (result.success && result.code) {
      setCodes((prev) => [result.code!, ...prev]);
      if (typeof result.newSaldo === 'number') {
        updateUser({ ...user, saldo: result.newSaldo });
      }
      toast({ title: "Success", description: "New referral code generated." });
      form.reset({
          set_saldo: 5,
          level: 3,
          acc_expiration: 30,
      });
      setIsDialogOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsSubmitting(false);
  }

  const handleDelete = async (codeId: string) => {
    const result = await deleteReferralCode(codeId);
    if (result.success) {
      setCodes((prev) => prev.filter(c => c.id_reff !== codeId));
      toast({ title: "Success", description: "Referral code deleted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Referral Codes</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Generate and manage one-time use referral codes.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Generate Referral Code</DialogTitle>
                  <DialogDescription>
                    Configure the details for the new one-time use code. The starting saldo will be deducted from your balance.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="set_saldo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting Saldo</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acc_expiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Expiration</FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isResellerAdmin && (
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Level</FormLabel>
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                             <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2">Reseller Admin</SelectItem>
                              <SelectItem value="3">Reseller</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {isResellerAdmin && (
                    <div className="space-y-2">
                        <Label>Account Level</Label>
                        <Input value="Reseller" disabled />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Code
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns({ onDelete: handleDelete })} data={initialCodes} />
    </div>
  );
}
