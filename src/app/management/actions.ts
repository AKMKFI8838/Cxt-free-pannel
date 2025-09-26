
"use server";

import { db } from "@/lib/firebase";
import { ref, get, remove } from "firebase/database";
import type { Key, User, UserKeyCount } from "@/lib/types";

// This is not efficient for large datasets as it fetches all keys and all users.
// For a production app, this logic should be optimized, possibly by using
// server-side counters or a more structured database like Firestore with queries.
export async function getUserKeyCounts(currentUser: User): Promise<UserKeyCount[]> {
  try {
    const keysRef = ref(db, "keys_code");
    const usersRef = ref(db, "users");

    const [keysSnapshot, usersSnapshot] = await Promise.all([
      get(keysRef),
      get(usersRef),
    ]);

    const keys: Record<string, Key> = keysSnapshot.exists() ? keysSnapshot.val() : {};
    const users: Record<string, User> = usersSnapshot.exists() ? usersSnapshot.val() : {};

    // Create a count of keys per registrator
    const keyCountsByRegistrator: Record<string, number> = {};
    for (const keyId in keys) {
      const registrator = keys[keyId].registrator;
      if (registrator) {
        keyCountsByRegistrator[registrator] = (keyCountsByRegistrator[registrator] || 0) + 1;
      }
    }
    
    // Map over users and add their key count
    let usersWithKeyCounts: UserKeyCount[] = Object.keys(users).map(userId => {
      const user = users[userId];
      return {
        id: userId,
        username: user.username,
        email: user.email,
        level: user.level,
        saldo: user.saldo,
        status: user.status,
        uplink: user.uplink,
        keyCount: keyCountsByRegistrator[user.username] || 0,
      };
    });

    // If the current user is a Reseller Admin (level 2), filter the users they can see
    if (currentUser.level === 2) {
      const referralCodesRef = ref(db, 'referral_code');
      const referralCodesSnapshot = await get(referralCodesRef);
      const referralCodesData = referralCodesSnapshot.val() || {};
      
      const adminReferralCodes = Object.values(referralCodesData)
        .filter((code: any) => code.created_by === currentUser.username)
        .map((code: any) => code.Referral);

      usersWithKeyCounts = usersWithKeyCounts.filter(user => 
        user.uplink && adminReferralCodes.includes(user.uplink)
      );
    }

    return usersWithKeyCounts;

  } catch (error) {
    console.error("Error fetching user key counts:", error);
    return [];
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
        throw new Error("User ID is required for deletion.");
    }
    // Prevent deletion of the main admin user
    if (userId === 'admin_user_id') {
        return { success: false, error: "The default admin user cannot be deleted." };
    }
    const userRef = ref(db, `users/${userId}`);
    await remove(userRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not delete user. Reason: ${errorMessage}` };
  }
}
