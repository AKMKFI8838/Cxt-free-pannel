
"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import type { OnlineBypassSettings } from "@/lib/types";

const BYPASS_REF = "onlineBypass/1";

export async function getOnlineBypassSettings(): Promise<OnlineBypassSettings | null> {
  try {
    const snapshot = await get(ref(db, BYPASS_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching bypass settings:", error);
    return null;
  }
}

export async function updateOnlineBypassSettings(
  data: Partial<Omit<OnlineBypassSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const dataToUpdate = {
        ...data,
        updated_at: new Date().toISOString()
    }
    await update(ref(db, BYPASS_REF), dataToUpdate);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update bypass settings. Reason: ${errorMessage}` };
  }
}

export async function createInitialBypassSettings(): Promise<{ success: boolean; error?: string }> {
    try {
        const snapshot = await get(ref(db, BYPASS_REF));
        if (!snapshot.exists()) {
            await set(ref(db, BYPASS_REF), { 
                bypass_text: 'Paste your bypass text here.',
                password: '0123456789', // Default 10-digit password
                updated_at: new Date().toISOString()
            });
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Could not create initial bypass settings. Reason: ${errorMessage}` };
    }
}
