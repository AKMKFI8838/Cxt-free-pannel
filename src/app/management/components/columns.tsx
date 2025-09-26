

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { UserKeyCount } from "@/lib/types";
import { MoreHorizontal, User, Shield, Trash2, DollarSign, Edit, Briefcase, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatCompactNumber } from "@/lib/utils";
import Link from "next/link";


export const columns = ({ onDelete }: { onDelete: (id: string) => void }): ColumnDef<UserKeyCount>[] => [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div className="font-medium">{row.original.username}</div>,
    },
    {
      accessorKey: "level",
      header: "Level",
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
      accessorKey: "saldo",
      header: "Balance",
      cell: ({ row }) => {
        const saldo = row.original.saldo;
        const isInfinite = saldo >= 2000000000;
        return (
            <div className="font-semibold text-green-500/90 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{isInfinite ? '∞' : formatCompactNumber(saldo)}</span>
            </div>
        )
      },
    },
    {
      accessorKey: "keyCount",
      header: "Keys Created",
       cell: ({ row }) => <div className="font-semibold text-center w-fit">{row.original.keyCount}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
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
                 <DropdownMenuItem asChild>
                    <Link href={`/management/${user.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Manage Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(user.id)}
                  disabled={user.level === 1}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
];
