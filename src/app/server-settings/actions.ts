

"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import type { FeatureSettings, MaintenanceSettings, ModNameSettings, FTextSettings, AnnouncementSettings, SecuritySettings, FreeReferralSettings } from "@/lib/types";

// --- Refs ---
const FEATURES_REF = "Feature/1";
const MAINTENANCE_REF = "onoff/1";
const MODNAME_REF = "modname/1";
const FTEXT_REF = "_ftext/1";
const ANNOUNCEMENT_REF = "announcement/1";
const SECURITY_REF = "security/1";
const FREE_REFERRAL_REF = "free_referral/1";


// --- Getters ---

export async function getFeatureSettings(): Promise<FeatureSettings | null> {
  try {
    const snapshot = await get(ref(db, FEATURES_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching feature settings:", error);
    return null;
  }
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings | null> {
  try {
    const snapshot = await get(ref(db, MAINTENANCE_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching maintenance settings:", error);
    return null;
  }
}

export async function getModNameSettings(): Promise<ModNameSettings | null> {
  try {
    const snapshot = await get(ref(db, MODNAME_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching mod name settings:", error);
    return null;
  }
}

export async function getFTextSettings(): Promise<FTextSettings | null> {
  try {
    const snapshot = await get(ref(db, FTEXT_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching ftext settings:", error);
    return null;
  }
}

export async function getAnnouncementSettings(): Promise<AnnouncementSettings | null> {
  try {
    const snapshot = await get(ref(db, ANNOUNCEMENT_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching announcement settings:", error);
    return null;
  }
}

export async function getSecuritySettings(): Promise<SecuritySettings | null> {
  try {
    const snapshot = await get(ref(db, SECURITY_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return null;
  }
}

export async function getFreeReferralSettings(): Promise<FreeReferralSettings | null> {
  try {
    const snapshot = await get(ref(db, FREE_REFERRAL_REF));
    return snapshot.exists() ? { id: 1, ...snapshot.val() } : null;
  } catch (error) {
    console.error("Error fetching free referral settings:", error);
    return null;
  }
}


// --- Updaters ---

export async function updateFeatureSetting(
  featureName: keyof Omit<FeatureSettings, 'id'>,
  value: 'on' | 'off'
): Promise<{ success: boolean; error?: string }> {
  try {
    await set(ref(db, `${FEATURES_REF}/${featureName}`), value);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update ${featureName}. Reason: ${errorMessage}` };
  }
}

export async function updateMaintenanceSettings(
  data: Partial<Omit<MaintenanceSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, MAINTENANCE_REF), data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update maintenance settings. Reason: ${errorMessage}` };
  }
}

export async function updateModNameSetting(
  modname: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await set(ref(db, `${MODNAME_REF}/modname`), modname);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update mod name. Reason: ${errorMessage}` };
  }
}

export async function updateFTextSettings(
  data: Partial<Omit<FTextSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, FTEXT_REF), data);
    return { success: true };
  } catch (error)
{
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update status text. Reason: ${errorMessage}` };
  }
}

export async function updateAnnouncementSettings(
  data: Partial<Omit<AnnouncementSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, ANNOUNCEMENT_REF), { ...data, updated_at: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update announcement. Reason: ${errorMessage}` };
  }
}

export async function updateSecuritySettings(
  data: Partial<Omit<SecuritySettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, SECURITY_REF), data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update security settings. Reason: ${errorMessage}` };
  }
}

export async function updateFreeReferralSettings(
  data: Partial<Omit<FreeReferralSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await update(ref(db, FREE_REFERRAL_REF), data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update free referral settings. Reason: ${errorMessage}` };
  }
}


// --- Initializers ---

export async function createInitialSettings(): Promise<void> {
  const settingsToCreate = [
    { ref: FEATURES_REF, data: { ESP: 'off', Item: 'off', SilentAim: 'off', AIM: 'off', BulletTrack: 'off', Memory: 'off', Floating: 'off', Setting: 'off' } },
    { ref: MAINTENANCE_REF, data: { status: 'off', myinput: '' } },
    { ref: MODNAME_REF, data: { modname: '' } },
    { ref: FTEXT_REF, data: { _status: '', _ftext: '' } },
    { ref: ANNOUNCEMENT_REF, data: { text: '', updated_at: new Date().toISOString() } },
    { ref: SECURITY_REF, data: { defense_mode: 'off', defense_message: 'DDoS protection, hard client production' } },
    { ref: FREE_REFERRAL_REF, data: { enabled: 'off', lock_message: 'Your free trial has expired. Please make a payment to continue.' } },
  ];

  for (const setting of settingsToCreate) {
    try {
      const snapshot = await get(ref(db, setting.ref));
      if (!snapshot.exists()) {
        await set(ref(db, setting.ref), setting.data);
      }
    } catch (error) {
      console.error(`Failed to create initial setting for ${setting.ref}:`, error);
    }
  }
}
