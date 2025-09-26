
import { AppLayout } from "@/components/app-layout";
import { OnlineBypassClient } from "./components/online-bypass-client";
import { getOnlineBypassSettings, createInitialBypassSettings } from "./actions";
import { getEncryptedApiSettings } from "@/app/encrypted-api/actions";
import { OnlineBypassApiClient } from "./components/online-bypass-api-client";
import { Separator } from "@/components/ui/separator";

export default async function OnlineBypassPage() {
  await createInitialBypassSettings();
  
  const [settings, encryptionSettings] = await Promise.all([
    getOnlineBypassSettings(),
    getEncryptedApiSettings()
  ]);

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Online Bypass
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your encrypted bypass text and API password.
          </p>
        </div>
        <OnlineBypassClient initialSettings={settings} />
        <Separator />
        <OnlineBypassApiClient encryptionSettings={encryptionSettings} />
      </div>
    </AppLayout>
  );
}
