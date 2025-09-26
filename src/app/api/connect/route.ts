
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, get, update, set } from 'firebase/database';
import type { Key, FeatureSettings, MaintenanceSettings } from '@/lib/types';
import { createHash } from 'crypto';

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

export async function GET(request: Request) {
    const htmlContent = `<h1><strong><center><font size='10' color='red' face='arial'><marquee direction='right' scrollamount='15'>WANT OWN KURO PANEL?<br> DM HERE - </marquee></font></center></strong></h1>`;
    return new NextResponse(htmlContent, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}


export async function POST(request: Request) {
    try {
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


        // --- Maintenance Check ---
        const maintenanceRef = ref(db, "onoff/1");
        const maintenanceSnapshot = await get(maintenanceRef);
        const maintenanceSettings: MaintenanceSettings | null = maintenanceSnapshot.exists() ? maintenanceSnapshot.val() : null;
        
        if (maintenanceSettings?.status === 'on') {
            return NextResponse.json({ status: true, reason: maintenanceSettings.myinput });
        }

        // --- Validation ---
        const alphaDashRegex = /^[a-zA-Z0-9-_]+$/;
        if (!game || !user_key || !serial || !alphaDashRegex.test(game) || !alphaDashRegex.test(serial) || user_key.length > 36) {
            return NextResponse.json({ status: false, reason: "Bad Parameter" }, { status: 200 });
        }

        const findKey = await findKeyByUserAndGame(user_key, game);

        if (!findKey) {
            return NextResponse.json({ status: false, reason: "USER OR GAME NOT REGISTERED" });
        }

        if (findKey.status !== 1) {
            return NextResponse.json({ status: false, reason: "USER BLOCKED" });
        }

        const now = new Date();
        let expiredDate = findKey.expired_date ? new Date(findKey.expired_date) : null;
        
        const keyRef = ref(db, `keys_code/${findKey.id}`);

        // If expired_date is not set, set it now based on duration
        if (!expiredDate) {
            const durationInHours = (findKey.duration || 0) * 24; // Assuming duration is in days
            expiredDate = new Date(now.getTime() + durationInHours * 60 * 60 * 1000);
            await update(keyRef, { expired_date: expiredDate.toISOString() });
            findKey.expired_date = expiredDate.toISOString();
        }

        if (now > expiredDate) {
            return NextResponse.json({ status: false, reason: "EXPIRED KEY" });
        }
        
        // --- Device Check ---
        const devices = findKey.devices ? findKey.devices.split(',').map(d=>d.trim()).filter(d => d) : [];
        const isDeviceRegistered = devices.includes(serial);

        if (!isDeviceRegistered) {
            if (devices.length >= findKey.max_devices) {
                return NextResponse.json({ status: false, reason: "MAX DEVICE REACHED" });
            }
            // Add new device
            devices.push(serial);
            await update(keyRef, { devices: devices.join(',') });
        }
        
        // --- Fetch other settings ---
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
        
        const expiry = findKey.expired_date;

        const responseData = {
            status: true,
            data: {
                real: real,
                token: token,
                modname: modNameSettings.modname,
                mod_status: fTextSettings._status,
                credit: fTextSettings._ftext,
                ESP: featureSettings.ESP,
                Item: featureSettings.Item,
                AIM: featureSettings.AIM,
                SilentAim: featureSettings.SilentAim,
                BulletTrack: featureSettings.BulletTrack,
                Floating: featureSettings.Floating,
                Memory: featureSettings.Memory,
                Setting: featureSettings.Setting,
                expired_date: expiry,
                EXP: expiry,
                exdate: expiry,
                device: findKey.max_devices,
                rng: Math.floor(now.getTime() / 1000), // Unix timestamp
            },
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
        return NextResponse.json({ status: false, reason: errorMessage }, { status: 500 });
    }
}
