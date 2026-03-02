import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const configPath = path.join(process.cwd(), 'data', 'config.json');

export async function GET() {
    try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);

        return NextResponse.json({
            success: true,
            config
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
    }
}

import bcrypt from 'bcryptjs';

const settingsPath = path.join(process.cwd(), 'data', 'admin-settings.json');

export async function POST(request) {
    try {
        const { config, password } = await request.json();

        // Load admin settings to verify password
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);

        const isValid = await bcrypt.compare(password, settings.credentials.passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
