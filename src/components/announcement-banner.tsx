
import { getAnnouncementSettings } from "@/app/server-settings/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone } from "lucide-react";

export async function AnnouncementBanner() {
  const settings = await getAnnouncementSettings();

  if (!settings?.text) {
    return null;
  }

  return (
    <Alert className="bg-primary/5 border-primary/20">
      <Megaphone className="h-4 w-4" />
      <AlertTitle className="text-primary">Announcement</AlertTitle>
      <AlertDescription>{settings.text}</AlertDescription>
    </Alert>
  );
}
