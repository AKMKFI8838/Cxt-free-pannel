
"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import type { ApiSettings } from "@/lib/types";

const API_SETTINGS_REF = "api/1";

export async function getApiSettings(): Promise<ApiSettings | null> {
  try {
    const snapshot = await get(ref(db, API_SETTINGS_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching API settings:", error);
    return null;
  }
}

export async function updateApiSettings(
  data: Partial<Omit<ApiSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, API_SETTINGS_REF), data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update API settings. Reason: ${errorMessage}` };
  }
}

export async function createInitialApiSettings(): Promise<{ success: boolean; error?: string }> {
    try {
        const snapshot = await get(ref(db, API_SETTINGS_REF));
        if (!snapshot.exists()) {
            await set(ref(db, API_SETTINGS_REF), { 
                api_enabled: 'off',
                shortener_enabled: 'off',
                shortener_api_key: 'b9a8dd7190861340b329b952389569a13427bf24'
            });
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Could not create initial API settings. Reason: ${errorMessage}` };
    }
}
