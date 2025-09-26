
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import type { Key } from '@/lib/types';
import { getApiSettings } from '@/app/api/actions';

// This function generates a free key
async function generateFreeKey(): Promise<Key | null> {
    try {
        const keysRef = ref(db, "keys_code");
        const newKeyRef = push(keysRef);
        
        const now = new Date();
        const expired_date = new Date(now);
        expired_date.setDate(now.getDate() + 1); // 1-day duration for free keys

        const newKeyData: Omit<Key, 'id_keys'> = {
            game: "PUBG",
            user_key: `FREE-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
            duration: 1,
            expired_date: expired_date.toISOString(),
            max_devices: 1,
            devices: null,
            status: 1,
            registrator: "API_System",
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
        };

        const keyWithDefaults: Key = {
            ...newKeyData,
            id_keys: newKeyRef.key!,
        };

        await set(newKeyRef, keyWithDefaults);
        return keyWithDefaults;

    } catch (error) {
        console.error("Error generating free key:", error);
        return null;
    }
}


// Shortens a URL using get2short.com API
async function shortenUrl(longUrl: string, apiKey: string, alias: string): Promise<string> {
    const apiUrl = `https://get2short.com/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}&alias=${alias}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status: ${response.status}. Body: ${errorBody}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return data.shortenedUrl;
        } else {
            console.error("Link shortener error:", data.message);
            // Fallback to the long URL if shortener fails
            return longUrl;
        }
    } catch (error) {
        console.error("Failed to shorten URL:", error);
        return longUrl; // Fallback
    }
}

// Function to generate a random 6-character alphabetic string
function generateRandomAlias(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


export async function GET(request: NextRequest) {
    const settings = await getApiSettings();

    if (settings?.api_enabled !== 'on') {
        return new Response('The free key API is currently disabled.', { status: 403 });
    }

    const freeKey = await generateFreeKey();

    if (!freeKey) {
        return new Response('Failed to generate a new key.', { status: 500 });
    }

    // Construct the URL to the page that will display the key
    const host = request.headers.get('host');
    const protocol = host?.startsWith('localhost') ? 'http' : 'https';
    const displayUrl = `${protocol}://${host}/api/show-key?token=${freeKey.user_key}`;

    let finalUrl = displayUrl;

    // If link shortener is enabled, shorten the URL
    if (settings.shortener_enabled === 'on' && settings.shortener_api_key) {
        const randomAlias = generateRandomAlias();
        finalUrl = await shortenUrl(displayUrl, settings.shortener_api_key, randomAlias);
    }
    
    // Redirect the user to the final URL
    return NextResponse.redirect(finalUrl);
}
