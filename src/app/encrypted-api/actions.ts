
"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import type { EncryptedApiSettings } from "@/lib/types";
import { createDecipheriv } from 'crypto';

const SETTINGS_REF = "encrypted_api/1";

export async function getEncryptedApiSettings(): Promise<EncryptedApiSettings | null> {
  try {
    const snapshot = await get(ref(db, SETTINGS_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching encrypted API settings:", error);
    return null;
  }
}

export async function updateEncryptedApiSettings(
  data: Partial<Omit<EncryptedApiSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, SETTINGS_REF), data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update settings. Reason: ${errorMessage}` };
  }
}

export async function createInitialEncryptedApiSettings(): Promise<{ success: boolean; error?: string }> {
    try {
        const snapshot = await get(ref(db, SETTINGS_REF));
        if (!snapshot.exists()) {
            await set(ref(db, SETTINGS_REF), { 
                key: '0'.repeat(64), // Default 32-byte key (64 hex chars)
                iv: '0'.repeat(32)   // Default 16-byte IV (32 hex chars)
            });
        }
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Could not create initial settings. Reason: ${errorMessage}` };
    }
}

export async function decryptApiResponse(
    encryptedText: string,
    keyHex: string,
    ivHex: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const decipher = createDecipheriv('aes-256-cbc', Buffer.from(keyHex, 'hex'), Buffer.from(ivHex, 'hex'));
        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return { success: true, data: JSON.parse(decrypted) };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Decryption failed. Check key, IV, and encrypted text.";
        return { success: false, error: errorMessage };
    }
}
