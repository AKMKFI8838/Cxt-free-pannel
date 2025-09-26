
import { AppLayout } from "@/components/app-layout";
import { DashboardClient } from "./components/dashboard-client";
import { getDashboardStats } from "./actions";
import { StatCards } from "./components/stat-cards";
import { AnnouncementBanner } from "@/components/announcement-banner";

export default async function DashboardPage() {
  // Fetching stats on the server
  const stats = await getDashboardStats();

  return (
    <AppLayout>
      <div className="space-y-8">
        <AnnouncementBanner />
        {/* StatCards is now a server component rendered based on fetched stats */}
        <StatCards stats={stats} />
        {/* DashboardClient handles all client-side logic */}
        <DashboardClient />
      </div>
    </AppLayout>
  );
}
