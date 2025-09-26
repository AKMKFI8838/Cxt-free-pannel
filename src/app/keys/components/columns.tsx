
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Key } from "@/lib/types";
import { cn } from "@/lib/utils";


export const columns = ({
  onDelete,
  onUpdate,
  onEdit,
  areKeysVisible,
  toggleKeysVisibility,
  toast,
}: {
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Key>) => void;
  onEdit: (key: Key) => void;
  areKeysVisible: boolean;
  toggleKeysVisibility: () => void;
  toast: (options: { title: string; description: string }) => void;
}): ColumnDef<Key>[] => {
  
  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied!", description: "Key copied to clipboard." });
  };
  
  return [
    {
      accessorKey: "user_key",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Key</span>
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toggleKeysVisibility(); }}>
            {areKeysVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">Toggle key visibility</span>
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const key = row.original.user_key;
        return (
          <div 
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => handleCopy(key)}
          >
            <span className={cn(
              "font-mono text-xs md:text-sm text-green-500/80 transition-all",
              !areKeysVisible && "blur-sm"
            )}>
              {key}
            </span>
            <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const key = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              id={`status-${key.id_keys}`}
              checked={key.status === 1}
              onCheckedChange={(checked) =>
                onUpdate(key.id_keys, { status: checked ? 1 : 0 })
              }
            />
            <Badge variant={key.status === 1 ? "default" : "outline"}>
              {key.status === 1 ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const key = row.original;
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
                <DropdownMenuItem onClick={() => handleCopy(key.user_key)}>
                  Copy Key
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(key)}>
                  Edit Key Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(key.id_keys)}
                >
                  Delete Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
