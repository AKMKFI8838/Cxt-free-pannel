
'use server';

import { db } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';

const ADMIN_EMAIL = 'support@aloneboy.com';
const ADMIN_PASSWORD = 'defaultAdminPassword123!'; 
const ADMIN_ID = 'admin_user_id'; // Predictable ID for the admin

export async function createAdminUser(): Promise<{ success: boolean; message: string }> {
  try {
    const adminUserRef = ref(db, `users/${ADMIN_ID}`);
    const snapshot = await get(adminUserRef);

    if (snapshot.exists()) {
        return { success: false, message: 'Admin user already exists.' };
    }

    await set(adminUserRef, {
      username: 'admin',
      fullname: 'admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // SECURITY RISK: Storing password in plaintext
      level: 1, // Admin level
      status: 1, // Active
      saldo: 2147384664,
      uplink: 'Owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expiration_date: '2050-01-01T00:00:00.000Z',
    });

    return { 
        success: true, 
        message: `Admin user created successfully. Email: ${ADMIN_EMAIL}, Password: ${ADMIN_PASSWORD}`
    };

  } catch (error: any) {
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
