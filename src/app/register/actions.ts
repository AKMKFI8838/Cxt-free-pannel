
'use server';

import { db } from "@/lib/firebase";
import { ref, set, push, get } from 'firebase/database';
import { headers } from "next/headers";
import type { User } from "@/lib/types";

// Function to get the user's IP, moved here to ensure server-only execution
function getIP() {
    const forwardedFor = headers().get('x-forwarded-for');
    const realIp = headers().get('x-real-ip');

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    if (realIp) {
        return realIp.trim();
    }
    return null;
}

// Function to generate a random string
const generateRandomString = (length = 8) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


export async function createFreeUser(): Promise<{ success: boolean; error?: string; user?: User, userId?: string }> {
    try {
        const ip = getIP();
        if (!ip) {
            return { success: false, error: "Could not determine your IP address. Please try again." };
        }

        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        const usersData = snapshot.val() || {};

        // Check if an account already exists for this IP
        for (const userId in usersData) {
            if (usersData[userId].ip === ip) {
                const existingUser = { ...usersData[userId], id: userId };
                return { 
                    success: false, 
                    error: "An account for this IP address already exists. Please log in.",
                    user: existingUser,
                    userId: userId,
                };
            }
        }
        
        // Generate unique username
        let username = '';
        let isUsernameUnique = false;
        while (!isUsernameUnique) {
            username = `free_${generateRandomString(6)}`;
            isUsernameUnique = !Object.values(usersData).some((u: any) => u.username === username);
        }

        const password = generateRandomString(10);
        const email = `${username}@kuro.panel`;
        
        const now = new Date();
        const expiration_date = new Date(now);
        expiration_date.setDate(now.getDate() + 30); // Set trial for 30 days

        const newUser: Omit<User, 'id'> = {
            username: username,
            email: email,
            password: password,
            level: 4, // Free User
            status: 1, // Active
            saldo: 2147384664, // Unlimited Saldo
            ip: ip, // Store the IP
            uplink: 'FreeTrial',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            expiration_date: expiration_date.toISOString(),
        };

        const newUserRef = push(usersRef);
        await set(newUserRef, newUser);

        return { success: true, user: {id: newUserRef.key!, ...newUser}, userId: newUserRef.key! };

    } catch (error: any) {
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
