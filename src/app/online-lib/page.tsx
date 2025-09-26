import { AppLayout } from "@/components/app-layout";
import { getLibFiles } from "./actions";
import { OnlineLibClient } from "./components/online-lib-client";

export default async function OnlineLibPage() {
  const initialFiles = await getLibFiles();

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Online Lib
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage and access your hosted library files.
          </p>
        </div>
        <OnlineLibClient initialFiles={initialFiles} />
      </div>
    </AppLayout>
  );
}
