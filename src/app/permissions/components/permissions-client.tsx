
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { updatePermission } from "../actions";
import type { Permissions } from "@/lib/types";

interface PermissionsClientProps {
    initialPermissions: Permissions | null;
    modules: { id: string; label: string; description: string }[];
}

export function PermissionsClient({ initialPermissions, modules }: PermissionsClientProps) {
    const { toast } = useToast();
    const [permissions, setPermissions] = useState(initialPermissions ?? {});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const handleToggle = async (moduleId: string) => {
        setLoadingStates(prev => ({...prev, [moduleId]: true}));
        const currentValue = permissions[moduleId] ?? false;
        const newValue = !currentValue;
        
        // Optimistic UI update
        setPermissions(prev => ({...prev, [moduleId]: newValue}));

        const result = await updatePermission(moduleId, newValue);

        if (!result.success) {
            // Revert on failure
            setPermissions(prev => ({...prev, [moduleId]: currentValue}));
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error
            });
        }
        setLoadingStates(prev => ({...prev, [moduleId]: false}));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Module Access Control</CardTitle>
                <CardDescription>
                    Enable or disable top-level features for all Reseller Admins.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 pr-4">
                            <Label htmlFor={module.id} className="text-base font-medium cursor-pointer">
                                {module.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                        </div>
                        <Switch
                            id={module.id}
                            checked={permissions[module.id] ?? false}
                            onCheckedChange={() => handleToggle(module.id)}
                            disabled={loadingStates[module.id]}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
