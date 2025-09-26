
import { AppLayout } from "@/components/app-layout";
import { FreeApiClient } from "./components/free-api-client";
import { getEncryptedApiSettings } from "@/app/encrypted-api/actions";
import { EncryptedApiSettings } from "@/lib/types";

const defaultEncryptedSettings: EncryptedApiSettings = {
    id: 1,
    key: '',
    iv: ''
};

export default async function FreeApiPage() {
  const encryptedSettings = await getEncryptedApiSettings();

  return (
    <AppLayout>
        <div className="space-y-4 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Free API Access
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Documentation and tools for using the available APIs.
                </p>
            </div>
            <FreeApiClient initialEncryptedSettings={encryptedSettings ?? defaultEncryptedSettings} />
        </div>
    </AppLayout>
  );
}
