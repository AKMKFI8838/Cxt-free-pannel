
import { AppLayout } from "@/components/app-layout";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { AlertsClient } from "./components/alerts-client";

export default function AlertsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <AnnouncementBanner />
        <AlertsClient />
      </div>
    </AppLayout>
  );
}
