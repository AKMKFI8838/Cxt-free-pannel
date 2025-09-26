
"use client";

import { AppLayout } from "@/components/app-layout";
import { ManagementClient } from "./components/management-client";
import { getUserKeyCounts } from "./actions";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import type { UserKeyCount } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function ManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserKeyCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserKeyCounts(user).then(usersWithKeyCounts => {
        setUsers(usersWithKeyCounts);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ManagementClient users={users} setUsers={setUsers} />
    </AppLayout>
  );
}
