
import { AppLayout } from "@/components/app-layout";
import { KeysClient } from "./components/keys-client";

export default async function KeysPage() {
  return (
    <AppLayout>
      <KeysClient />
    </AppLayout>
  );
}
