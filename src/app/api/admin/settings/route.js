import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';
import { validateUrl, sanitizeString } from '@/lib/validation';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'admin-settings.json');

async function readSettings() {
    try {
        const data = await fs.readFile(SETTINGS_PATH, 'utf8');
        const settings = JSON.parse(data);
        // Ensure credentials object exists with default username if missing
        if (!settings.credentials) {
            settings.credentials = {
                username: 'admin',
                passwordHash: await bcrypt.hash('admin123', 10)
            };
        } else if (!settings.credentials.username) {
            settings.credentials.username = 'admin';
        }
        return settings;
    } catch (error) {
        // Return default settings if file doesn't exist
        return {
            credentials: {
                username: 'admin',
                passwordHash: await bcrypt.hash('admin123', 10)
            },
            regions: [
                { id: 'india-hyderabad', name: '🇮🇳 India (Hyderabad)', enabled: true },
                { id: 'singapore', name: '🇸🇬 Singapore', enabled: false }
            ],
            quota: { default: 200, minimum: 100, maximum: 500 },
            ui: { brandName: 'V-NEXUS', primaryColor: '#00cc66', logoUrl: null }
        };
    }
}

async function writeSettings(settings) {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

// GET - Fetch admin settings (excluding password hash but including username)
export async function GET() {
    try {
        const settings = await readSettings();
        const { credentials, ...publicSettings } = settings;

        // Return username as part of settings for the UI
        return NextResponse.json({
            success: true,
            settings: {
                ...publicSettings,
                username: credentials.username
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to load settings' },
            { status: 500 }
        );
    }
}

// POST - Update admin settings
export async function POST(request) {
    try {
        // Get client IP for rate limiting
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        // Rate limit: 10 requests per hour per IP
        const rateLimitResult = rateLimit(`settings-update:${ip}`, 10, 60 * 60 * 1000);

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Too many update requests. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.retryAfter.toString()
                    }
                }
            );
        }

        const body = await request.json();
        const { password, updates } = body;

        // Verify admin password
        const settings = await readSettings();
        const isValid = await bcrypt.compare(password, settings.credentials.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Validate social links if they're being updated
        if (updates.socialLinks) {
            const links = updates.socialLinks;

            if (links.github && !validateUrl(links.github).valid) {
                return NextResponse.json(
                    { success: false, error: 'Invalid GitHub URL' },
                    { status: 400 }
                );
            }

            if (links.twitter && !validateUrl(links.twitter).valid) {
                return NextResponse.json(
                    { success: false, error: 'Invalid Twitter/X URL' },
                    { status: 400 }
                );
            }

            if (links.telegram && !validateUrl(links.telegram).valid) {
                return NextResponse.json(
                    { success: false, error: 'Invalid Telegram URL' },
                    { status: 400 }
                );
            }
        }

        // Sanitize brand name if being updated
        if (updates.ui?.brandName) {
            updates.ui.brandName = sanitizeString(updates.ui.brandName, 50);
        }

        // Update settings
        const updatedSettings = {
            ...settings,
            ...updates,
            credentials: settings.credentials // Preserve credentials
        };

        await writeSettings(updatedSettings);

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

// PUT - Change admin credentials (password and/or username)
export async function PUT(request) {
    try {
        const body = await request.json();
        const { currentPassword, newPassword, newUsername } = body;

        const settings = await readSettings();
        const isValid = await bcrypt.compare(currentPassword, settings.credentials.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Update password if provided
        if (newPassword) {
            const newHash = await bcrypt.hash(newPassword, 10);
            settings.credentials.passwordHash = newHash;
        }

        // Update username if provided
        if (newUsername) {
            settings.credentials.username = newUsername;
        }

        await writeSettings(settings);

        return NextResponse.json({
            success: true,
            message: 'Credentials updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update credentials' },
            { status: 500 }
        );
    }
}
