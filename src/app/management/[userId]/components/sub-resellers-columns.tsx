
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";
import { format } from "date-fns";


export const columns = (): ColumnDef<User>[] => [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div className="font-medium">{row.original.username}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.email}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
          <Badge variant={row.original.status === 1 ? "default" : "destructive"}>
            {row.original.status === 1 ? 'Active' : 'Blocked'}
          </Badge>
      ),
    },
    {
        accessorKey: "created_at",
        header: "Joined On",
        cell: ({ row }) => format(new Date(row.original.created_at!), "PPP"),
    },
];
