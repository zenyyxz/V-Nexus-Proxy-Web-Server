import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'admin-settings.json');


export async function POST(request) {
    try {
        // Get client IP for rate limiting
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        // Rate limit: 5 attempts per 15 minutes
        const rateLimitResult = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Too many login attempts. Please try again in ${rateLimitResult.retryAfter} seconds.`
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
        const { password } = body;

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
        }

        let settings;
        try {
            const data = await fs.readFile(SETTINGS_PATH, 'utf8');
            settings = JSON.parse(data);
        } catch (error) {
            // Default settings if file doesn't exist
            settings = {
                credentials: {
                    passwordHash: await bcrypt.hash('admin123', 10)
                }
            };
        }

        const isValid = await bcrypt.compare(password, settings.credentials.passwordHash);

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
    }
}
