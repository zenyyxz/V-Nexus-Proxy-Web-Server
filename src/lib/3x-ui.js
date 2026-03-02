import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// CRITICAL: Disable SSL verification for self-signed certificates
// This must be set BEFORE any fetch calls
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const settingsPath = path.join(process.cwd(), 'data', 'admin-settings.json');

// Create an agent that ignores self-signed certificates
const agent = new https.Agent({
    rejectUnauthorized: false
});

export class ThreeXUIClient {
    constructor(serverConfig) {
        this.session = null;
        this.settings = { ...serverConfig };

        // Sanitize panelUrl: remove trailing slashes and accidental '/panel' suffix
        if (this.settings.panelUrl) {
            this.settings.panelUrl = this.settings.panelUrl.replace(/\/+$/, '');
            if (this.settings.panelUrl.endsWith('/panel')) {
                this.settings.panelUrl = this.settings.panelUrl.slice(0, -6);
            }
        }
    }

    async login() {
        if (!this.settings || !this.settings.panelUrl) {
            console.error('Missing server configuration');
            return false;
        }

        const { panelUrl, username, password } = this.settings;

        try {
            // 3x-ui expects form-urlencoded data, not JSON
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const res = await fetch(`${panelUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString(),
                // @ts-ignore - agent is supported in Next.js polyfilled fetch or we rely on global suppression if this fails
                agent: agent
            });

            if (!res.ok) {
                console.error(`Login failed with status: ${res.status} ${res.statusText}`);
                throw new Error(`Login failed: ${res.statusText}`);
            }

            const cookie = res.headers.get('set-cookie');
            if (cookie) {
                this.session = cookie.split(';')[0];
                return true;
            }
            return false;
        } catch (error) {
            console.error('3x-ui Login Error:', error);
            return false;
        }
    }

    async getInbounds() {
        if (!this.session) {
            const loggedIn = await this.login();
            if (!loggedIn) return [];
        }

        const { panelUrl } = this.settings;

        try {
            const res = await fetch(`${panelUrl}/panel/api/inbounds/list`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cookie': this.session
                },
                // @ts-ignore
                agent: agent
            });

            const data = await res.json();
            if (data.success) {
                return data.obj;
            }
            return [];
        } catch (error) {
            console.error('Get Inbounds Error:', error);
            return [];
        }
    }

    async addClient(inboundId, email, uuid, totalGB = 0) {
        if (!this.session) {
            const loggedIn = await this.login();
            if (!loggedIn) return { success: false, error: 'Authentication failed' };
        }

        const { panelUrl } = this.settings;

        // Client structure for VLESS (standard 3x-ui)
        const client = {
            id: uuid,
            email: email,
            flow: "",
            limitIp: 0,
            totalGB: totalGB,
            expiryTime: 0,
            enable: true,
            tgId: "",
            subId: ""
        };

        try {
            const res = await fetch(`${panelUrl}/panel/api/inbounds/addClient`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': this.session
                },
                body: JSON.stringify({
                    id: inboundId,
                    settings: JSON.stringify({
                        clients: [client]
                    })
                }),
                // @ts-ignore
                agent: agent
            });

            const data = await res.json();

            if (data.success) {
                return { success: true, data: data.obj };
            } else {
                // If session expired, retry once
                if (data.msg && data.msg.includes('login')) {
                    this.session = null;
                    return this.addClient(inboundId, email, uuid, totalGB);
                }
                return { success: false, error: data.msg };
            }
        } catch (error) {
            console.error('Add Client Error:', error);
            return { success: false, error: error.message };
        }
    }
}

export const createClient = (config) => new ThreeXUIClient(config);
