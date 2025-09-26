

"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, remove, push, update } from "firebase/database";
import type { Key, User, SecuritySettings, KeyPriceSettings } from "@/lib/types";

// Function to get all keys
export async function getKeys(): Promise<Key[]> {
  try {
    const keysRef = ref(db, "keys_code");
    const snapshot = await get(keysRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert the object of objects into an array of objects
      return Object.keys(data)
        .map(id => ({ ...data[id], id_keys: id }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by newest first
    }
    return [];
  } catch (error) {
    console.error("Error fetching keys:", error);
    return [];
  }
}

// Function to generate a new key
export async function generateKey(newKeyData: Omit<Key, 'id_keys' | 'created_at' | 'updated_at' | 'expired_date' | 'status'> & {registrator: string; user_key: string; registratorId: string; durationType: 'days' | 'hours' }): Promise<{ success: boolean; error?: string; key?: Key, newSaldo?: number }> {
  try {
    // --- Security Check ---
    const securityRef = ref(db, "security/1");
    const securitySnapshot = await get(securityRef);
    if (securitySnapshot.exists()) {
        const securitySettings: SecuritySettings = securitySnapshot.val();
        if (securitySettings.defense_mode === 'on') {
            return { success: false, error: securitySettings.defense_message || "Key generation is temporarily disabled." };
        }
    }

    const { registratorId, duration, durationType, max_devices } = newKeyData;
    
    // --- Pricing Check ---
    const priceRef = ref(db, "key_pricing");
    const priceSnapshot = await get(priceRef);
    const priceSettings: KeyPriceSettings | null = priceSnapshot.exists() ? priceSnapshot.val() : null;

    let cost = 0;

    if (durationType === 'hours') {
        const costPerDay = priceSettings?.defaultPricePerDay || 1;
        cost = (duration / 24) * costPerDay * max_devices;
    } else {
        const tier = priceSettings?.tiers?.[String(duration)];
        if (tier) {
            cost = tier.price * max_devices;
        } else {
            // Custom duration costs 3x per day per device
            cost = duration * max_devices * 3;
        }
    }
    
    
    const userRef = ref(db, `users/${registratorId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return { success: false, error: "Registrator user not found." };
    }

    const user: User = userSnapshot.val();
    
    // Admin (level 1) might have infinite saldo or bypass this check
    if (user.level !== 1 && user.saldo < cost) {
       return { success: false, error: `Insufficient saldo. Cost: ${cost.toFixed(2)}, Your balance: ${user.saldo}` };
    }

    // Deduct saldo if not admin
    let newSaldo = user.saldo;
    if (user.level !== 1) {
        newSaldo = user.saldo - cost;
        await update(userRef, { saldo: newSaldo });
    }

    const keysRef = ref(db, "keys_code");
    const newKeyRef = push(keysRef);
    
    const now = new Date();
    const expired_date = new Date(now);
    if (newKeyData.durationType === 'hours') {
        expired_date.setHours(now.getHours() + newKeyData.duration);
    } else { // Default to days
        expired_date.setDate(now.getDate() + newKeyData.duration);
    }

    // Remove registratorId from the data to be saved.
    const { registratorId: _, ...keyDataToSave } = newKeyData;

    const keyWithDefaults: Key = {
        ...keyDataToSave,
        id_keys: newKeyRef.key!,
        status: 1,
        devices: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        expired_date: expired_date.toISOString(),
    };

    await set(newKeyRef, keyWithDefaults);
    return { success: true, key: keyWithDefaults, newSaldo };
  } catch (error) {
    console.error("Error generating key:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not generate key. Reason: ${errorMessage}` };
  }
}

// Function to update an existing key
export async function updateKey(keyId: string, updatedData: Partial<Omit<Key, 'id_keys' | 'game' | 'registrator'>>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!keyId) {
        throw new Error("Key ID is required for update.");
    }
    const keyRef = ref(db, `keys_code/${keyId}`);
    
    const snapshot = await get(keyRef);
    if (!snapshot.exists()) {
        return { success: false, error: 'Key not found.' };
    }

    const existingData = snapshot.val();
    const now = new Date();
    
    // Recalculate expiry if duration changes
    let expired_date = existingData.expired_date;
    if (updatedData.duration && updatedData.duration !== existingData.duration) {
      const creationDate = new Date(existingData.created_at);
      const newExpiry = new Date(creationDate);
      // Assuming duration here is always in days for edits for simplicity.
      // A more complex system could store durationType on the key.
      newExpiry.setDate(creationDate.getDate() + updatedData.duration);
      expired_date = newExpiry.toISOString();
    }
    
    const finalData = { 
        ...existingData, 
        ...updatedData, 
        expired_date: expired_date,
        updated_at: now.toISOString() 
    };

    await set(keyRef, finalData);
    return { success: true };
  } catch (error) {
    console.error("Error updating key:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update key. Reason: ${errorMessage}` };
  }
}

// Function to delete a key
export async function deleteKey(keyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!keyId) {
        throw new Error("Key ID is required for deletion.");
    }
    const keyRef = ref(db, `keys_code/${keyId}`);
    await remove(keyRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting key:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not delete key. Reason: ${errorMessage}` };
  }
}


export async function resetKeyDevices(keyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!keyId) {
        throw new Error("Key ID is required to reset devices.");
    }
    const keyRef = ref(db, `keys_code/${keyId}`);
    await update(keyRef, {
        devices: null,
        updated_at: new Date().toISOString() 
    });
    return { success: true };
  } catch (error) {
    console.error("Error resetting key devices:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not reset key devices. Reason: ${errorMessage}` };
  }
}
