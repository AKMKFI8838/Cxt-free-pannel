
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteAllKeys, deleteExpiredKeys, deleteUnusedKeys } from "../actions";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/lib/types";

type ActionType = "all" | "expired" | "unused";

interface ActionConfig {
  title: string;
  description: string;
  buttonText: string;
  action: (user: User | null) => Promise<{ success: boolean; error?: string; count: number }>;
}

export function BulkActionsClient() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actions: Record<ActionType, ActionConfig> = {
    all: {
      title: "Delete All Keys",
      description: "This will permanently delete every key in your scope. This action cannot be undone.",
      buttonText: "Delete All Keys",
      action: deleteAllKeys,
    },
    expired: {
      title: "Delete Expired Keys",
      description: "This will permanently delete all keys in your scope that have passed their expiration date.",
      buttonText: "Delete Expired Keys",
      action: deleteExpiredKeys,
    },
    unused: {
      title: "Delete Unused Keys",
      description: "This will permanently delete all keys in your scope that have not been assigned to any device.",
      buttonText: "Delete Unused Keys",
      action: deleteUnusedKeys,
    },
  };

  const handleActionClick = (action: ActionType) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAction || confirmationText !== "DELETE") {
      toast({
        variant: "destructive",
        title: "Confirmation Error",
        description: "You must type 'DELETE' to confirm.",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await actions[selectedAction].action(user);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Success",
        description: `${result.count} keys have been deleted successfully.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }

    // Reset state and close dialog
    setConfirmationText("");
    setSelectedAction(null);
    setIsDialogOpen(false);
  };

  const currentActionConfig = selectedAction ? actions[selectedAction] : null;

  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bulk Actions</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Perform mass operations on your keys. These actions are irreversible.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {(Object.keys(actions) as ActionType[]).map((key) => (
          <Card key={key} className="border-destructive/30 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                {actions[key].title}
              </CardTitle>
              <CardDescription>{actions[key].description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button variant="destructive" className="w-full" onClick={() => handleActionClick(key)}>
                {actions[key].buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentActionConfig?.description} To confirm, please type{" "}
              <strong className="text-foreground">DELETE</strong> in the box below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="confirmation-text" className="sr-only">Confirmation</Label>
            <Input
              id="confirmation-text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationText("")}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={confirmationText !== "DELETE" || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentActionConfig?.buttonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
