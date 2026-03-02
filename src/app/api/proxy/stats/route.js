import { createClient } from '@/lib/3x-ui';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'admin-settings.json');

async function readSettings() {
    const data = await fs.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(data);
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const configName = searchParams.get('configName');
        const region = searchParams.get('region') || 'india-hyderabad'; // Default region

        if (!configName) {
            return NextResponse.json({ error: 'Config name is required' }, { status: 400 });
        }

        // Get region-specific server config
        const settings = await readSettings();
        const regionConfig = settings.regions.find(r => r.id === region);

        if (!regionConfig || !regionConfig.server) {
            return NextResponse.json({ error: 'Invalid region or server not configured' }, { status: 400 });
        }

        // Create client for this region
        const client = createClient(regionConfig.server);

        // Get client stats by config name (email field in 3x-ui)
        const stats = await client.getClientStats(configName);

        if (stats) {
            return NextResponse.json({
                success: true,
                stats: {
                    up: stats.up,
                    down: stats.down,
                    total: stats.total,
                    expiryTime: stats.expiryTime
                }
            });
        } else {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
