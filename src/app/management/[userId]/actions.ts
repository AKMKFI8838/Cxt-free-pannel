
"use server";

import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { User, Key, ReferralCode } from "@/lib/types";

export async function getUser(userId: string): Promise<(User & { id: string }) | null> {
    try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return { id: userId, ...snapshot.val() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

// Gets keys managed by a user (themselves and their sub-resellers if they are a reseller admin)
export async function getManagedKeys(user: User | null): Promise<Key[]> {
    if (!user) return [];
    try {
        const keysRef = ref(db, "keys_code");
        const keysSnapshot = await get(keysRef);
        if (!keysSnapshot.exists()) return [];

        const allKeys: Record<string, Key> = keysSnapshot.val();

        let allowedRegistrators = [user.username];

        // If user is a reseller admin, find all their sub-resellers
        if (user.level === 2) {
            const adminReferralCodes = await getReferralCodesByCreator(user.username);
            const adminReferralCodeStrings = adminReferralCodes.map(c => c.Referral);
            
            const usersRef = ref(db, 'users');
            const usersSnapshot = await get(usersRef);
            if (usersSnapshot.exists()) {
                const usersData: Record<string, User> = usersSnapshot.val();
                const subResellers = Object.values(usersData)
                    .filter(u => u.uplink && adminReferralCodeStrings.includes(u.uplink))
                    .map(u => u.username);
                allowedRegistrators.push(...subResellers);
            }
        }
        
        const managedKeys = Object.keys(allKeys)
            .map(id => ({ ...allKeys[id], id_keys: id }))
            .filter(key => allowedRegistrators.includes(key.registrator))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return managedKeys;

    } catch (error) {
        console.error("Error fetching user keys:", error);
        return [];
    }
}


export async function getReferralCodesByCreator(username: string): Promise<ReferralCode[]> {
    try {
        const codesRef = ref(db, "referral_code");
        const snapshot = await get(codesRef);
        if (snapshot.exists()) {
            const data: Record<string, ReferralCode> = snapshot.val();
            return Object.keys(data)
                .map(id => ({ ...data[id], id_reff: id }))
                .filter(code => code.created_by === username)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return [];
    } catch (error) {
        console.error("Error fetching referral codes by creator:", error);
        return [];
    }
}

export async function getSubResellers(adminUsername: string): Promise<User[]> {
    try {
        const adminReferralCodes = await getReferralCodesByCreator(adminUsername);
        const adminReferralCodeStrings = adminReferralCodes.map(c => c.Referral);

        if (adminReferralCodeStrings.length === 0) return [];

        const usersRef = ref(db, "users");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const data: Record<string, User> = snapshot.val();
            return Object.keys(data)
                .map(id => ({...data[id], id}))
                .filter(user => user.uplink && adminReferralCodeStrings.includes(user.uplink))
                 .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
        }
        return [];
    } catch (error) {
        console.error("Error fetching sub-resellers:", error);
        return [];
    }
}
