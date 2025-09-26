
"use server";

import { db } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import type { User } from "@/lib/types";

export async function updateUser(
  userId: string, 
  data: Partial<Pick<User, 'saldo' | 'status'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, data);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not update user. Reason: ${errorMessage}` };
  }
}
