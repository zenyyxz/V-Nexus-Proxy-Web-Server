import { createClient } from '@/lib/3x-ui';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { rateLimit } from '@/lib/rateLimit';
import { validateEmail, validateConfigName, sanitizeString } from '@/lib/validation';

const settingsPath = path.join(process.cwd(), 'data', 'admin-settings.json');
const configPath = path.join(process.cwd(), 'data', 'config.json');

export async function POST(request) {
    try {
        // Get client IP for rate limiting
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        // Rate limit: 3 requests per hour per IP
        const rateLimitResult = rateLimit(`proxy-create:${ip}`, 3, 60 * 60 * 1000);

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: `Too many proxy creation requests. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`
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
        let { email, configName, transport, quotaLimit, region } = body;

        // Validate config name
        const configNameValidation = validateConfigName(configName);
        if (!configNameValidation.valid) {
            return NextResponse.json({ error: configNameValidation.error }, { status: 400 });
        }

        // Sanitize config name
        configName = sanitizeString(configName, 50);

        if (!transport) {
            return NextResponse.json({ error: 'Transport is required' }, { status: 400 });
        }

        if (!region) {
            return NextResponse.json({ error: 'Region is required' }, { status: 400 });
        }

        if (!email) {
            // Generate a pseudo-email/ID if not provided
            email = `${configName.replace(/\s+/g, '-').toLowerCase()}-${crypto.randomBytes(2).toString('hex')}`;
        } else {
            // Validate email if provided
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return NextResponse.json({ error: emailValidation.error }, { status: 400 });
            }
        }

        // 1. Load Admin Settings & Config
        const settingsData = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);

        // Find the selected region configuration
        const regionConfig = settings.regions.find(r => r.id === region);

        if (!regionConfig) {
            return NextResponse.json({ error: 'Invalid region selected' }, { status: 400 });
        }

        const serverConfig = regionConfig.server;

        if (!serverConfig || !serverConfig.panelUrl) {
            return NextResponse.json({ error: `Server not configured for region: ${regionConfig.name}` }, { status: 500 });
        }

        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        const transportConfig = config.transports[transport];

        if (!transportConfig) {
            return NextResponse.json({ error: 'Invalid transport type' }, { status: 400 });
        }

        const inboundId = transportConfig.inboundId;

        // 2. Initialize 3x-ui client for this specific server
        const client = createClient(serverConfig);

        // 3. Connect to 3x-ui & Check for Existing Client
        const inbounds = await client.getInbounds();
        const inbound = inbounds.find(i => i.id === inboundId);

        if (!inbound) {
            return NextResponse.json({ error: 'Inbound not found' }, { status: 500 });
        }

        // Get inbound remark (name) for the VLESS link
        const inboundName = inbound.remark || 'proxy';

        let existingClient = null;
        const inboundSettings = JSON.parse(inbound.settings || '{}');
        const clients = inboundSettings.clients || [];
        existingClient = clients.find(c => c.email === email);

        let uuid = existingClient ? existingClient.uuid : crypto.randomUUID();

        // Calculate totalGB in bytes (default to 0 if not provided)
        // 1 GB = 1024 * 1024 * 1024 bytes
        const totalBytes = quotaLimit ? parseInt(quotaLimit) * 1024 * 1024 * 1024 : 0;

        // 4. Add Client to 3x-ui
        if (!existingClient) {
            const result = await client.addClient(inboundId, email, uuid, totalBytes);
            if (!result.success) {
                console.error('Failed to add client:', result.error);
                return NextResponse.json({ error: `Failed to create proxy: ${result.error}` }, { status: 500 });
            }
        }

        // 5. Generate VLESS link
        const baseUrl = serverConfig.publicDomain || new URL(serverConfig.panelUrl).hostname;
        const port = 443;

        const params = [];

        // Base type determination
        let type = transport.toLowerCase();
        if (transport === 'REALITY') type = 'tcp';
        if (transport === 'H2') type = 'http';

        params.push(`type=${type}`);
        params.push('encryption=none');

        if (transport === 'REALITY') {
            params.push('security=reality');
            params.push('pbk=YOUR_PBK'); // Ideally from config
            if (body.domain) params.push(`sni=${encodeURIComponent(body.domain)}`);
            if (body.fingerprint) params.push(`fp=${body.fingerprint}`);
            params.push('spx=%2F');
        } else {
            params.push('security=tls');
            params.push('fp=');
            params.push('alpn=');
        }

        params.push('allowInsecure=1');

        if (transport === 'TCP') {
            if (body.sni) params.push(`sni=${encodeURIComponent(body.sni)}`);
        }
        else if (transport === 'WS') {
            if (body.path) params.push(`path=${encodeURIComponent(body.path)}`);
            if (body.host) params.push(`host=${encodeURIComponent(body.host)}`);
            if (body.sni) params.push(`sni=${encodeURIComponent(body.sni)}`);
        }
        else if (transport === 'GRPC') {
            if (body.serviceName) params.push(`serviceName=${encodeURIComponent(body.serviceName)}`);
            params.push('mode=gun');
            if (body.sni) params.push(`sni=${encodeURIComponent(body.sni)}`);
        }
        else if (transport === 'H2') {
            if (body.path) params.push(`path=${encodeURIComponent(body.path)}`);
            if (body.host) params.push(`host=${encodeURIComponent(body.host)}`);
            if (body.sni) params.push(`sni=${encodeURIComponent(body.sni)}`);
        }

        // Create remark with inbound name prefix (like 3x-ui does)
        const remark = `${inboundName}-${configName}`;
        const link = `vless://${uuid}@${baseUrl}:${port}?${params.join('&')}#${encodeURIComponent(remark)}`;

        return NextResponse.json({
            success: true,
            config: link,
            uuid: uuid,
            email: email,
            transport: transport,
            isExisting: !!existingClient
        });

    } catch (error) {
        console.error('Proxy creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
