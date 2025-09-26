
import { AppLayout } from "@/components/app-layout";
import { ApiClient } from "./components/api-client";
import { getApiSettings, createInitialApiSettings } from "./actions";
import { ApiSettings } from "@/lib/types";
import { ConnectApiClient } from "./components/connect-api-client";
import { Separator } from "@/components/ui/separator";

const defaultSettings: ApiSettings = {
    id: 1,
    api_enabled: 'off',
    shortener_enabled: 'off',
    shortener_api_key: ''
};

export default async function ApiPage() {
  await createInitialApiSettings();
  const settings = await getApiSettings();

  return (
    <AppLayout>
        <div className="space-y-4 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    API Settings
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Manage API endpoints, integrations, and test connections.
                </p>
            </div>
            <ApiClient initialSettings={settings ?? defaultSettings} />
            <Separator />
            <ConnectApiClient />
        </div>
    </AppLayout>
  );
}
