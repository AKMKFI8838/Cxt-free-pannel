
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Alert } from "@/lib/types";

export const columns: ColumnDef<Alert>[] = [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => <div className="font-medium">{row.original.metric}</div>,
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => {
      const { condition, threshold } = row.original;
      return (
        <div className="flex items-center">
          {condition === "above" ? (
            <ArrowUp className="mr-2 h-4 w-4 text-destructive" />
          ) : (
            <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
          )}
          <span>{condition === "above" ? "Above" : "Below"} {threshold}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "notification",
    header: "Notification",
    cell: ({ row }) => {
      const variant = row.original.notification === 'email' ? 'secondary' : 'default';
      return <Badge variant={variant} className="capitalize">{row.original.notification}</Badge>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
                onClick={() => navigator.clipboard.writeText(row.original.id)}
              >
                Copy alert ID
              </DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
