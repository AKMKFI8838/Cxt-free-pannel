
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Key } from "@/lib/types";

export const columns = ({
  onUpdate,
  onManage,
  toast,
}: {
  onUpdate: (id: string, data: Partial<Key>) => void;
  onManage: (key: Key) => void;
  toast: (options: { title: string; description?: string }) => void;
}): ColumnDef<Key>[] => {

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied!", description: "Key copied to clipboard." });
  };

  return [
    {
      accessorKey: "user_key",
      header: "Key",
      cell: ({ row }) => {
        const key = row.original.user_key;
        return (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => handleCopy(key)}
          >
            <span className="font-mono text-xs md:text-sm">{key}</span>
            <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      },
    },
    {
      accessorKey: "devices",
      header: "Usage",
      cell: ({ row }) => {
        const devices = row.original.devices ? row.original.devices.split(',').filter(d => d).length : 0;
        return <span>{devices} / {row.original.max_devices}</span>;
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
              aria-label="Toggle key status"
            />
            <Badge variant={key.status === 1 ? "default" : "outline"}>
              {key.status === 1 ? "Active" : "Blocked"}
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
                <DropdownMenuItem onClick={() => onManage(key)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Manage Detail
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCopy(key.user_key)}>
                  Copy Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
