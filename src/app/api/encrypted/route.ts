
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, get, update, set } from 'firebase/database';
import type { Key, FeatureSettings, MaintenanceSettings, EncryptedApiSettings } from '@/lib/types';
import { createHash, createCipheriv } from 'crypto';
import { getEncryptedApiSettings } from '@/app/encrypted-api/actions';

const STATIC_WORDS = "Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E";

// Helper function to find a key by user_key and game
async function findKeyByUserAndGame(userKey: string, game: string): Promise<(Key & { id: string }) | null> {
    const keysRef = ref(db, "keys_code");
    const snapshot = await get(keysRef);
    if (snapshot.exists()) {
        const keysData: Record<string, Key> = snapshot.val();
        for (const id in keysData) {
            if (keysData[id].user_key === userKey && keysData[id].game === game) {
                return { ...keysData[id], id };
            }
        }
    }
    return null;
}

// AES-256-CBC Encryption
function encrypt(text: string, key: string, iv: string): string {
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export async function GET(request: Request) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Developer Contact</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f0f2f5;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 40px;
                text-align: center;
                max-width: 320px;
                width: 100%;
            }
            h1 {
                font-size: 24px;
                color: #1c1e21;
                margin-bottom: 8px;
            }
            p {
                font-size: 16px;
                color: #606770;
                margin-bottom: 24px;
            }
            .button {
                display: inline-block;
                background-color: #0088cc;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: background-color 0.3s;
            }
            .button:hover {
                background-color: #0077b3;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Developer</h1>
            <p>Contact the developer for support or inquiries.</p>
            <a href="https://t.me/officialAkshit01" class="button" target="_blank" rel="noopener noreferrer">Contact on Telegram</a>
        </div>
    </body>
    </html>
    `;
    return new NextResponse(htmlContent, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}


export async function POST(request: Request) {
    const encryptionSettings = await getEncryptedApiSettings();

    // Helper to encrypt responses consistently
    const createEncryptedResponse = (data: any, status: number) => {
        if (!encryptionSettings || !encryptionSettings.key || !encryptionSettings.iv) {
            // If encryption is not set up, we can't encrypt, return a plain error.
            // This case should be handled on the settings page, but as a fallback.
            return NextResponse.json({ status: false, reason: "Server-side encryption is not configured." }, { status: 500 });
        }
        const encryptedData = encrypt(JSON.stringify(data), encryptionSettings.key, encryptionSettings.iv);
        return new NextResponse(encryptedData, {
            status,
            headers: { 'Content-Type': 'text/plain' },
        });
    };

    try {
        // --- Maintenance Check ---
        const maintenanceRef = ref(db, "onoff/1");
        const maintenanceSnapshot = await get(maintenanceRef);
        if (maintenanceSnapshot.exists()) {
            const maintenanceSettings: MaintenanceSettings = maintenanceSnapshot.val();
            if (maintenanceSettings.status === 'on') {
                return createEncryptedResponse({ status: false, reason: maintenanceSettings.myinput }, 200);
            }
        }
        
        let game: string | null = null;
        let user_key: string | null = null;
        let serial: string | null = null;

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            game = formData.get('game') as string;
            user_key = formData.get('user_key') as string;
            serial = formData.get('serial') as string;
        } else if (contentType.includes("application/json")) {
             const body = await request.json();
             game = body.game;
             user_key = body.user_key;
             serial = body.serial;
        }

        if (!game || !user_key || !serial) {
            return createEncryptedResponse({ status: false, reason: "Bad Parameter" }, 400);
        }

        const findKey = await findKeyByUserAndGame(user_key, game);

        if (!findKey) {
            return createEncryptedResponse({ status: false, reason: "USER OR GAME NOT REGISTERED" }, 200);
        }

        if (findKey.status !== 1) {
            return createEncryptedResponse({ status: false, reason: "USER BLOCKED" }, 200);
        }

        const now = new Date();
        let expiredDate = findKey.expired_date ? new Date(findKey.expired_date) : null;

        // If expired_date is not set, set it now.
        if (!expiredDate) {
            expiredDate = new Date(now);
            expiredDate.setDate(now.getDate() + findKey.duration);
            const keyRef = ref(db, `keys_code/${findKey.id}`);
            await update(keyRef, { expired_date: expiredDate.toISOString() });
            findKey.expired_date = expiredDate.toISOString();
        }

        if (now > expiredDate) {
            return createEncryptedResponse({ status: false, reason: "EXPIRED KEY" }, 200);
        }
        
        // --- Device Check ---
        const devices = findKey.devices ? findKey.devices.split(',').filter(d => d) : [];
        const isDeviceRegistered = devices.includes(serial);

        if (!isDeviceRegistered) {
            if (devices.length >= findKey.max_devices) {
                return createEncryptedResponse({ status: false, reason: "MAX DEVICE REACHED" }, 200);
            }
            // Add new device
            devices.push(serial);
            const keyRef = ref(db, `keys_code/${findKey.id}`);
            await update(keyRef, { devices: devices.join(',') });
        }
        
        // --- Fetch Feature Toggles ---
        const featureRef = ref(db, "Feature/1");
        const modNameRef = ref(db, "modname/1");
        const fTextRef = ref(db, "_ftext/1");

        const [featureSnapshot, modNameSnapshot, fTextSnapshot] = await Promise.all([
            get(featureRef),
            get(modNameRef),
            get(fTextRef)
        ]);

        const featureSettings = featureSnapshot.exists()
          ? featureSnapshot.val()
          : { ESP: 'off', Item: 'off', SilentAim: 'off', AIM: 'off', BulletTrack: 'off', Memory: 'off', Floating: 'off', Setting: 'off' };
        
        const modNameSettings = modNameSnapshot.exists() ? modNameSnapshot.val() : { modname: 'Kuro' };
        const fTextSettings = fTextSnapshot.exists() ? fTextSnapshot.val() : { _status: 'Online', _ftext: 'Kuro Panel' };


        const real = `${game}-${user_key}-${serial}-${STATIC_WORDS}`;
        const token = createHash('md5').update(real).digest('hex');

        const responseData = {
            status: true,
            data: {
                real: real,
                token: token,
                modname: modNameSettings.modname,
                mod_status: fTextSettings._status,
                credit: fTextSettings._ftext,
                ...featureSettings,
                expired_date: findKey.expired_date,
                exdate: findKey.expired_date,
                device: findKey.max_devices,
                rng: Math.floor(now.getTime() / 1000), // Unix timestamp
            },
        };

        return createEncryptedResponse(responseData, 200);

    } catch (error) {
        console.error("API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
        return createEncryptedResponse({ status: false, reason: errorMessage }, 500);
    }
}
