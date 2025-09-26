
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Key } from "@/lib/types";
import { format } from "date-fns";

export const columns = ({
  onStatusChange,
  onDelete,
}: {
  onStatusChange: (id: string, data: Partial<Key>) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Key>[] => [
  {
    accessorKey: "user_key",
    header: "Key",
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.user_key}</div>,
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
              onStatusChange(key.id_keys, { status: checked ? 1 : 0 })
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
    accessorKey: "devices",
    header: "Usage",
    cell: ({ row }) => {
      const devices = row.original.devices ? row.original.devices.split(',').filter(d => d).length : 0;
      return <span>{devices} / {row.original.max_devices}</span>;
    },
  },
  {
      accessorKey: "expired_date",
      header: "Expires On",
      cell: ({ row }) => format(new Date(row.original.expired_date), "PPP"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
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
              onClick={() => onDelete(row.original.id_keys)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
