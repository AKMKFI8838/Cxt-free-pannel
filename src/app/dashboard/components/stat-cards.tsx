
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, KeyRound } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface StatCardsProps {
  stats: {
    totalUsers: number;
    totalKeys: number;
    totalSaldo: number;
    totalResellers: number;
  } | null;
}

export function StatCards({ stats }: StatCardsProps) {
  const { user } = useAuth();
  const isAdmin = user?.level === 1;

  // Only render for admins and if stats are available
  if (!isAdmin || !stats) {
    return null;
  }

  const statItems = [
    {
      title: "Total Users",
      value: formatCompactNumber(stats.totalUsers),
      icon: Users,
    },
    {
      title: "Total Resellers",
      value: formatCompactNumber(stats.totalResellers),
      icon: Users,
    },
    {
      title: "Total Keys",
      value: formatCompactNumber(stats.totalKeys),
      icon: KeyRound,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
