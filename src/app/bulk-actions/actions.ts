
"use server";

import { db } from "@/lib/firebase";
import { ref, get, remove, child } from "firebase/database";
import type { Key, User, ReferralCode } from "@/lib/types";

// Fetches all keys, careful with large datasets
async function getAllKeys(currentUser: User | null): Promise<Record<string, Key>> {
    const keysRef = ref(db, "keys_code");
    const snapshot = await get(keysRef);
    let allKeys: Record<string, Key> = snapshot.exists() ? snapshot.val() : {};

    // If the user is a Reseller Admin, filter keys to their scope
    if (currentUser && currentUser.level === 2) {
      // 1. Find all referral codes created by this Reseller Admin
      const referralCodesRef = ref(db, 'referral_code');
      const referralCodesSnapshot = await get(referralCodesRef);
      const referralCodesData: Record<string, ReferralCode> = referralCodesSnapshot.exists() ? referralCodesSnapshot.val() : {};
      
      const adminReferralCodes = Object.values(referralCodesData)
        .filter(code => code.created_by === currentUser.username)
        .map(code => code.Referral);

      // 2. Find all users (sub-resellers) who used these referral codes
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);
      const usersData: Record<string, User> = usersSnapshot.exists() ? usersSnapshot.val() : {};
      
      const myResellers = Object.values(usersData)
        .filter(user => user.uplink && adminReferralCodes.includes(user.uplink))
        .map(user => user.username);
        
      // 3. The list of allowed key creators includes the Reseller Admin and all their sub-resellers
      const allowedRegistrators = [currentUser.username, ...myResellers];
      
      // 4. Filter the keys
      const filteredKeys: Record<string, Key> = {};
      for (const keyId in allKeys) {
          if (allowedRegistrators.includes(allKeys[keyId].registrator)) {
              filteredKeys[keyId] = allKeys[keyId];
          }
      }
      return filteredKeys;
    }

    // Main admin sees all keys, Resellers would see their own (but bulk actions aren't for them)
    return allKeys;
}

export async function deleteAllKeys(currentUser: User | null): Promise<{ success: boolean; error?: string; count: number }> {
  try {
    const relevantKeys = await getAllKeys(currentUser);
    const keyCount = Object.keys(relevantKeys).length;
    if (keyCount === 0) {
      return { success: true, count: 0 };
    }

    if (currentUser && currentUser.level === 1) {
        // Main admin can delete all keys at once
        const keysRef = ref(db, "keys_code");
        await remove(keysRef);
    } else {
        // Reseller admins must delete keys one by one from their scope
        for (const keyId in relevantKeys) {
             const keyRef = ref(db, `keys_code/${keyId}`);
             await remove(keyRef);
        }
    }
    
    return { success: true, count: keyCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not delete all keys. Reason: ${errorMessage}`, count: 0 };
  }
}

export async function deleteExpiredKeys(currentUser: User | null): Promise<{ success: boolean; error?: string; count: number }> {
  try {
    const relevantKeys = await getAllKeys(currentUser);
    const now = new Date();
    let deletedCount = 0;
    
    for (const keyId in relevantKeys) {
        const key = relevantKeys[keyId];
        if (new Date(key.expired_date) < now) {
            const keyRef = ref(db, `keys_code/${keyId}`);
            await remove(keyRef);
            deletedCount++;
        }
    }
    return { success: true, count: deletedCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not delete expired keys. Reason: ${errorMessage}`, count: 0 };
  }
}

export async function deleteUnusedKeys(currentUser: User | null): Promise<{ success: boolean; error?: string; count: number }> {
    try {
        const relevantKeys = await getAllKeys(currentUser);
        let deletedCount = 0;

        for (const keyId in relevantKeys) {
            const key = relevantKeys[keyId];
            // An unused key is one where 'devices' is null, empty, or an empty array string '[]'
            if (!key.devices || key.devices.trim() === '[]' || key.devices.trim() === '') {
                 const keyRef = ref(db, `keys_code/${keyId}`);
                 await remove(keyRef);
                 deletedCount++;
            }
        }
        return { success: true, count: deletedCount };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Could not delete unused keys. Reason: ${errorMessage}`, count: 0 };
    }
}
