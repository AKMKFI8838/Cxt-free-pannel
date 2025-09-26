

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Briefcase, User, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReferralCode } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const columns = ({ onDelete }: { onDelete: (id: string) => void }): ColumnDef<ReferralCode>[] => {
  const { toast } = useToast();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Referral code copied." });
  };

  return [
    {
      accessorKey: "Referral",
      header: "Code",
      cell: ({ row }) => (
        <div
          className="font-mono text-sm text-green-500/80 cursor-pointer"
          onClick={() => handleCopy(row.original.Referral)}
        >
          {row.original.Referral}
        </div>
      ),
    },
    {
      accessorKey: "set_saldo",
      header: "Saldo",
      cell: ({ row }) => <div>{row.original.set_saldo}</div>,
    },
    {
      accessorKey: "level",
      header: "Grants Level",
      cell: ({ row }) => {
        const level = row.original.level;
        
        const levelMap = {
            1: { label: "Main Admin", icon: Shield, variant: "default"},
            2: { label: "Reseller Admin", icon: Briefcase, variant: "secondary"},
            3: { label: "Reseller", icon: User, variant: "outline"},
            4: { label: "Free User", icon: UserCheck, variant: "outline"},
        }
        
        const currentLevel = levelMap[level] || levelMap[3];

        return (
             <Badge variant={currentLevel.variant} className="flex items-center gap-2 w-fit">
               <currentLevel.icon className="h-3 w-3" />
               <span>{currentLevel.label}</span>
            </Badge>
        )
      },
    },
    {
      accessorKey: "acc_expiration",
      header: "Expires On",
      cell: ({ row }) => {
        const date = new Date(row.original.acc_expiration);
        return <span>{format(date, "PPP")}</span>;
      },
    },
    {
      accessorKey: "used_by",
      header: "Used By",
      cell: ({ row }) => (
        <div>
          {row.original.used_by ? (
            <Badge variant="outline">{row.original.used_by}</Badge>
          ) : (
            <span className="text-muted-foreground">Not used</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_by",
      header: "Created By",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const code = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(code.id_reff)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
