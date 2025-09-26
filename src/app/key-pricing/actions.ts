
"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import type { KeyPriceSettings, KeyPriceTier } from "@/lib/types";

const KEY_PRICE_REF = "key_pricing";

export async function getKeyPriceSettings(): Promise<KeyPriceSettings | null> {
  try {
    const snapshot = await get(ref(db, KEY_PRICE_REF));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching key price settings:", error);
    return null;
  }
}

export async function createInitialKeyPriceSettings(): Promise<{ success: boolean; error?: string }> {
    try {
        const snapshot = await get(ref(db, KEY_PRICE_REF));
        if (!snapshot.exists()) {
            await set(ref(db, KEY_PRICE_REF), { 
                defaultPricePerDay: 1,
                tiers: {
                    "30": { days: 30, price: 25 },
                    "7": { days: 7, price: 7 },
                }
            });
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Could not create initial key price settings. Reason: ${errorMessage}` };
    }
}

export async function updateKeyPriceSettings(
  data: Partial<KeyPriceSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, KEY_PRICE_REF), data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update key price. Reason: ${errorMessage}` };
  }
}
