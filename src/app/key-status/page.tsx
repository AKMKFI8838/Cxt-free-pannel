
import { AppLayout } from "@/components/app-layout";
import { KeyStatusClient } from "./components/key-status-client";

export default async function KeyStatusPage() {
  return (
    <AppLayout>
      <KeyStatusClient />
    </AppLayout>
  );
}
