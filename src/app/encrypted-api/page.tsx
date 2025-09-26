
import { AppLayout } from "@/components/app-layout";
import { EncryptedApiClient } from "./components/encrypted-api-client";
import { getEncryptedApiSettings, createInitialEncryptedApiSettings } from "./actions";
import { EncryptedApiSettings } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const defaultSettings: EncryptedApiSettings = {
    id: 1,
    key: '',
    iv: ''
};

export default async function EncryptedApiPage() {
  await createInitialEncryptedApiSettings();
  const settings = await getEncryptedApiSettings();

  return (
    <AppLayout>
        <div className="space-y-4 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Encrypted API
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Manage and test the AES-256 encrypted response API.
                </p>
            </div>
            <EncryptedApiClient initialSettings={settings ?? defaultSettings} />
        </div>
    </AppLayout>
  );
}
