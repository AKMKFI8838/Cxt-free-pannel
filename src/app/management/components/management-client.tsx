
"use client";

import { useState } from "react";
import type { UserKeyCount } from "@/lib/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "../actions";
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
import { Loader2 } from "lucide-react";


export function ManagementClient({ users, setUsers }: { users: UserKeyCount[], setUsers: React.Dispatch<React.SetStateAction<UserKeyCount[]>> }) {
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<UserKeyCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        setUserToDelete(user);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    const result = await deleteUser(userToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast({
        title: "Success",
        description: `User "${userToDelete.username}" has been deleted.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setUserToDelete(null);
  };


  return (
    <>
      <div className="space-y-4 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View users and the number of keys they have created.
          </p>
        </div>
        <DataTable columns={columns({ onDelete: handleDeleteClick })} data={users} />
      </div>

       <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              <strong className="text-foreground">{userToDelete?.username}</strong> and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
