
import { AppLayout } from "@/components/app-layout";
import { PermissionsClient } from "./components/permissions-client";
import { getPermissions } from "./actions";
import { allAppModules } from "@/lib/permissions-list";

export default async function PermissionsPage() {
    const permissions = await getPermissions();
    const modules = allAppModules;
    
    return (
        <AppLayout>
            <div className="space-y-4 md:space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Reseller Admin Permissions
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Control which modules are accessible to all Reseller Admins (Level 2 users).
                    </p>
                </div>
                <PermissionsClient initialPermissions={permissions} modules={modules} />
            </div>
        </AppLayout>
    )
}
