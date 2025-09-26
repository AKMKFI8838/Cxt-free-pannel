
import { NextResponse } from 'next/server';
import { getOnlineBypassSettings } from '@/app/online-bypass/actions';
import { getEncryptedApiSettings } from '@/app/encrypted-api/actions';
import { createCipheriv } from 'crypto';

// This function will return the "Contact Developer" page for GET requests
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

// AES-256-CBC Encryption - Note: Decryption requires JSON.parse, so we stringify even raw text.
function encrypt(text: string, key: string, iv: string): string {
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    // We JSON.stringify to ensure the decrypted content can always be parsed as JSON, even if it's just a string.
    let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}


// This function will handle fetching the bypass text for POST requests
export async function POST(request: Request) {
    const encryptionSettings = await getEncryptedApiSettings();
    
    // Helper to encrypt responses consistently
    const createEncryptedResponse = (data: any, status: number) => {
        if (!encryptionSettings || !encryptionSettings.key || !encryptionSettings.iv) {
            // If encryption is not set up, we can't encrypt, return a plain error.
            return NextResponse.json({ status: false, reason: "Server-side encryption is not configured." }, { status: 500 });
        }
        const encryptedData = encrypt(data, encryptionSettings.key, encryptionSettings.iv);
        return new NextResponse(encryptedData, {
            status,
            headers: { 'Content-Type': 'text/plain' },
        });
    };

    try {
        const body = await request.json();
        const { password } = body;
        
        const settings = await getOnlineBypassSettings();

        // Validate the password
        if (!password || !settings?.password || password !== settings.password) {
            return createEncryptedResponse("Invalid or missing password.", 403);
        }

        if (settings && settings.bypass_text) {
            // We return the raw text, encrypted.
             return createEncryptedResponse(settings.bypass_text, 200);
        } else {
            return createEncryptedResponse("Bypass text not set or could not be retrieved.", 404);
        }

    } catch (error) {
        console.error("Online Bypass API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
        return createEncryptedResponse(errorMessage, 500);
    }
}
