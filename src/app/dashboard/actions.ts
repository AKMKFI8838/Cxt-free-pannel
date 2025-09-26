
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, update } from 'firebase/database';
import type { Key, User } from '@/lib/types';


export async function getDashboardStats(): Promise<{ totalUsers: number; totalKeys: number; totalSaldo: number; totalResellers: number; }> {
    try {
        const usersRef = ref(db, "users");
        const keysRef = ref(db, "keys_code");

        const [usersSnapshot, keysSnapshot] = await Promise.all([
            get(usersRef),
            get(keysRef)
        ]);

        const usersData: Record<string, User> = usersSnapshot.exists() ? usersSnapshot.val() : {};
        const keysData: Record<string, Key> = keysSnapshot.exists() ? keysSnapshot.val() : {};

        const totalUsers = Object.keys(usersData).length;
        const totalKeys = Object.keys(keysData).length;
        
        let totalResellers = 0;

        const totalSaldo = Object.values(usersData).reduce((sum, user) => {
            // Count resellers (users that are not admin level 1)
            if (user.level !== 1) {
                totalResellers++;
            }
            
            // Ensure saldo is a number and handle potential missing values
            const saldo = Number(user.saldo) || 0;
            // The value 2147384664 seems to be a placeholder for infinity/admin, exclude it.
            if (saldo < 2000000000) {
                 return sum + saldo;
            }
            return sum;
        }, 0);

        return { totalUsers, totalKeys, totalSaldo, totalResellers };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalUsers: 0, totalKeys: 0, totalSaldo: 0, totalResellers: 0 };
    }
}


export async function changePassword({ userId, currentPassword, newPassword }) {
  if (!userId || !currentPassword || !newPassword) {
    return { success: false, error: 'Missing required fields.' };
  }

  const userRef = ref(db, `users/${userId}`);

  try {
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      return { success: false, error: 'User not found.' };
    }

    const userData = snapshot.val();
    
    // In a real app, passwords must be hashed.
    // This is an insecure direct comparison.
    if (userData.password !== currentPassword) {
      return { success: false, error: 'Incorrect current password.' };
    }

    // Update the password
    await update(userRef, { password: newPassword });
    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, error: 'An unexpected error occurred on the server.' };
  }
}

export async function getUserKeyCount(username: string): Promise<number> {
    try {
        const keysRef = ref(db, "keys_code");
        const snapshot = await get(keysRef);
        if (!snapshot.exists()) {
            return 0;
        }
        const keysData: Record<string, Key> = snapshot.val();
        const userKeys = Object.values(keysData).filter(key => key.registrator === username);
        return userKeys.length;
    } catch (error) {
        console.error("Error fetching user key count:", error);
        return 0;
    }
}
