
"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import type { Permissions } from "@/lib/types";

const PERMISSIONS_REF = "permissions/reseller_admin";

export async function getPermissions(): Promise<Permissions | null> {
  try {
    const snapshot = await get(ref(db, PERMISSIONS_REF));
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return null;
  }
}

export async function updatePermission(
  moduleId: string,
  isEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, PERMISSIONS_REF), { [moduleId]: isEnabled });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update permission for ${moduleId}. Reason: ${errorMessage}` };
  }
}
