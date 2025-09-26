
"use client";

import { AppLayout } from "@/components/app-layout";
import { ReferralsClient } from "./components/referrals-client";
import { getReferralCodes } from "./actions";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import type { ReferralCode } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function ReferralsPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getReferralCodes(user).then(userCodes => {
        setCodes(userCodes);
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
      <ReferralsClient initialCodes={codes} setCodes={setCodes} />
    </AppLayout>
  );
}
