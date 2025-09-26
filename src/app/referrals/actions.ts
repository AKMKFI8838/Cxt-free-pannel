
"use server";

import { db } from "@/lib/firebase";
import { ref, get, set, remove, push, update } from "firebase/database";
import type { ReferralCode, User } from "@/lib/types";

export async function getReferralCodes(currentUser: User | null): Promise<ReferralCode[]> {
  try {
    const codesRef = ref(db, "referral_code");
    const snapshot = await get(codesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      let allCodes: ReferralCode[] = Object.keys(data)
        .map(id => ({ ...data[id], id_reff: id }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // If the user is a Reseller Admin, filter codes to only show their own
      if (currentUser && currentUser.level === 2) {
        allCodes = allCodes.filter(code => code.created_by === currentUser.username);
      }
      
      return allCodes;
    }
    return [];
  } catch (error) {
    console.error("Error fetching referral codes:", error);
    return [];
  }
}

export async function generateReferralCode(
  newCodeData: Omit<ReferralCode, 'id_reff' | 'code' | 'Referral' | 'created_at' | 'updated_at' | 'used_by'> & { created_by: string, registratorId: string; }
): Promise<{ success: boolean; error?: string; code?: ReferralCode, newSaldo?: number }> {
  try {
    const { registratorId, set_saldo } = newCodeData;

    // --- Saldo Deduction Logic ---
    const userRef = ref(db, `users/${registratorId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return { success: false, error: "Registrator user not found." };
    }

    const user: User = userSnapshot.val();
    
    // Main Admin (level 1) has infinite saldo and bypasses this check
    if (user.level !== 1 && user.saldo < set_saldo) {
       return { success: false, error: `Insufficient saldo. Cost: ${set_saldo}, Your balance: ${user.saldo}` };
    }

    // Deduct saldo if not admin
    let newSaldo = user.saldo;
    if (user.level !== 1) {
        newSaldo = user.saldo - set_saldo;
        await update(userRef, { saldo: newSaldo });
    }

    const codesRef = ref(db, "referral_code");
    const newCodeRef = push(codesRef);
    
    const now = new Date();
    const referral = `KURO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const hashCode = `hashed-${Date.now()}`; 

    const { registratorId: _, ...codeDataToSave } = newCodeData;

    const codeWithDefaults: ReferralCode = {
      ...codeDataToSave,
      id_reff: newCodeRef.key!,
      Referral: referral,
      code: hashCode,
      used_by: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    await set(newCodeRef, codeWithDefaults);
    return { success: true, code: codeWithDefaults, newSaldo };
  } catch (error) {
    console.error("Error generating referral code:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not generate code. Reason: ${errorMessage}` };
  }
}

export async function deleteReferralCode(codeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!codeId) {
      throw new Error("Code ID is required for deletion.");
    }
    const codeRef = ref(db, `referral_code/${codeId}`);
    await remove(codeRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting referral code:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not delete code. Reason: ${errorMessage}` };
  }
}
