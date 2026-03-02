'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import {
    Settings, Lock, Globe, Database, Palette, Activity,
    Save, Eye, EyeOff, Plus, Trash2, Check, X, Server, Link as LinkIcon, User, Hash, Layout, Zap, Shield, Mail, Github, Twitter, Send, RefreshCw
} from 'lucide-react';
import { revalidateGithubData } from '../actions/revalidate';

export default function Admin() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [settings, setSettings] = useState(null);
    const [config, setConfig] = useState(null);

    // Security Tab States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Region Server Password Visibility State
    // Map of regionId -> boolean
    const [regionPasswordVisibility, setRegionPasswordVisibility] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
            fetchConfig();
        }
    }, [isAuthenticated]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
                // Initialize username field if available
                if (data.settings.username) {
                    setNewUsername(data.settings.username);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/config');
            const data = await res.json();
            if (data.success) {
                setConfig(data.config);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                setIsAuthenticated(true);
            } else {
                setMessage({ type: 'error', text: 'Invalid password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Login failed' });
        }
        setLoading(false);
    };

    const handleUpdateCredentials = async (e) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (newPassword && newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            const payload = { currentPassword };
            if (newPassword) payload.newPassword = newPassword;
            if (newUsername && newUsername !== settings.username) payload.newUsername = newUsername;

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Credentials updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Update local settings with new username
                if (payload.newUsername) {
                    setSettings(prev => ({ ...prev, username: payload.newUsername }));
                }
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update credentials' });
        }
        setLoading(false);
    };

    const updateSettings = async (updates) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, updates })
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                await fetchSettings();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        }
        setLoading(false);
    };

    const saveConfig = async (newConfig) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, config: newConfig })
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Configuration saved successfully!' });
                setConfig(newConfig);
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        }
        setLoading(false);
    };

    const toggleRegion = (regionId) => {
        if (!settings) return;
        const updatedRegions = settings.regions.map(r =>
            r.id === regionId ? { ...r, enabled: !r.enabled } : r
        );
        setSettings({ ...settings, regions: updatedRegions });
    };

    const addRegion = () => {
        if (!settings) return;
        const newRegion = {
            id: `region-${Date.now()}`,
            name: '🌍 New Region',
            enabled: false,
            server: {
                panelUrl: '',
                username: '',
                password: '',
                inboundId: 0,
                publicDomain: ''
            }
        };
        setSettings({ ...settings, regions: [...settings.regions, newRegion] });
    };

    const removeRegion = (regionId) => {
        if (!settings) return;
        const updatedRegions = settings.regions.filter(r => r.id !== regionId);
        setSettings({ ...settings, regions: updatedRegions });
    };

    const updateRegionName = (regionId, newName) => {
        if (!settings) return;
        const updatedRegions = settings.regions.map(r =>
            r.id === regionId ? { ...r, name: newName } : r
        );
        setSettings({ ...settings, regions: updatedRegions });
    };

    const toggleRegionPassword = (regionId) => {
        setRegionPasswordVisibility(prev => ({
            ...prev,
            [regionId]: !prev[regionId]
        }));
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'regions', label: 'Regions & Servers', icon: Globe },
        { id: 'quota', label: 'Quota', icon: Database },
        { id: 'transports', label: 'Transports', icon: Settings },
        { id: 'content', label: 'Content', icon: Layout },
        { id: 'ui', label: 'UI Customization', icon: Palette },
        { id: 'links', label: 'Links', icon: LinkIcon },
        { id: 'system', label: 'System', icon: Server },
        { id: 'security', label: 'Security', icon: Lock }
    ];

    if (!isAuthenticated) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.loginCard}>
                        <div className={styles.loginHeader}>
                            <Lock size={48} color="hsl(var(--color-primary))" />
                            <h1 className={styles.loginTitle}>Admin Access</h1>
                            <p className={styles.loginSubtitle}>Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className={styles.loginForm}>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Admin Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                >
                                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button type="submit" className={styles.loginButton} disabled={loading}>
                                {loading ? 'Authenticating...' : 'Login'}
                            </button>

                            {message && (
                                <div className={`${styles.message} ${styles[message.type]}`}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.adminContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>System Configuration</h1>
                    <button
                        onClick={() => updateSettings(settings)}
                        className={styles.saveButton}
                        disabled={loading || !settings}
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
                        {message.text}
                    </div>
                )}

                <div className={styles.tabsContainer}>
                    <div className={styles.tabs}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'dashboard' && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>System Overview</h2>
                                <div className={styles.statsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <div className={styles.statCard} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                                            <Globe size={20} />
                                            <span>Total Regions</span>
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--color-primary))' }}>
                                            {settings?.regions?.length || 0}
                                        </div>
                                    </div>
                                    <div className={styles.statCard} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                                            <Check size={20} />
                                            <span>Active Regions</span>
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--color-success))' }}>
                                            {settings?.regions?.filter(r => r.enabled).length || 0}
                                        </div>
                                    </div>
                                    <div className={styles.statCard} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                                            <Settings size={20} />
                                            <span>Transports</span>
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>
                                            {config ? Object.keys(config.transports).length : 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'regions' && (
                            <div className={styles.section}>
                                {!settings ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                                        Loading settings...
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h2 className={styles.sectionTitle}>Region & Server Management</h2>
                                                <p className={styles.sectionDesc}>Configure regions and their associated 3x-ui servers</p>
                                            </div>
                                            <button onClick={addRegion} className={styles.addButton}>
                                                <Plus size={16} /> Add Region
                                            </button>
                                        </div>

                                        <div className={styles.regionList}>
                                            {settings.regions.map((region) => (
                                                <div key={region.id} className={styles.regionItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                value={region.name}
                                                                onChange={(e) => updateRegionName(region.id, e.target.value)}
                                                                style={{ maxWidth: '200px' }}
                                                            />
                                                            <span className={styles.regionId}>{region.id}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className={`${styles.toggleButton} ${region.enabled ? styles.enabled : ''}`}
                                                                onClick={() => toggleRegion(region.id)}
                                                            >
                                                                {region.enabled ? 'Enabled' : 'Disabled'}
                                                            </button>
                                                            <button
                                                                className={styles.deleteButton}
                                                                onClick={() => removeRegion(region.id)}
                                                                title="Delete Region"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Server Configuration for this Region */}
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.2)',
                                                        padding: '1rem',
                                                        borderRadius: '8px',
                                                        marginTop: '0.5rem',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <h4 style={{ margin: '0 0 1rem 0', color: 'hsl(var(--color-primary))', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Server size={14} /> Server Configuration
                                                        </h4>
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.label}>Panel URL</label>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                placeholder="https://panel.example.com:2053"
                                                                value={region.server?.panelUrl || ''}
                                                                onChange={(e) => {
                                                                    const updatedRegions = settings.regions.map(r =>
                                                                        r.id === region.id ? { ...r, server: { ...r.server || {}, panelUrl: e.target.value } } : r
                                                                    );
                                                                    setSettings({ ...settings, regions: updatedRegions });
                                                                }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Username</label>
                                                                <input
                                                                    type="text"
                                                                    className={styles.input}
                                                                    value={region.server?.username || ''}
                                                                    onChange={(e) => {
                                                                        const updatedRegions = settings.regions.map(r =>
                                                                            r.id === region.id ? { ...r, server: { ...r.server || {}, username: e.target.value } } : r
                                                                        );
                                                                        setSettings({ ...settings, regions: updatedRegions });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Password</label>
                                                                <div className={styles.inputWrapper}>
                                                                    <input
                                                                        type={regionPasswordVisibility[region.id] ? "text" : "password"}
                                                                        className={styles.input}
                                                                        value={region.server?.password || ''}
                                                                        onChange={(e) => {
                                                                            const updatedRegions = settings.regions.map(r =>
                                                                                r.id === region.id ? { ...r, server: { ...r.server || {}, password: e.target.value } } : r
                                                                            );
                                                                            setSettings({ ...settings, regions: updatedRegions });
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className={styles.eyeButton}
                                                                        onClick={() => toggleRegionPassword(region.id)}
                                                                    >
                                                                        {regionPasswordVisibility[region.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Inbound ID</label>
                                                                <input
                                                                    type="number"
                                                                    className={styles.input}
                                                                    value={region.server?.inboundId || ''}
                                                                    onChange={(e) => {
                                                                        const updatedRegions = settings.regions.map(r =>
                                                                            r.id === region.id ? { ...r, server: { ...r.server || {}, inboundId: parseInt(e.target.value) } } : r
                                                                        );
                                                                        setSettings({ ...settings, regions: updatedRegions });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Public Domain (Optional)</label>
                                                                <input
                                                                    type="text"
                                                                    className={styles.input}
                                                                    placeholder="vpn.example.com"
                                                                    value={region.server?.publicDomain || ''}
                                                                    onChange={(e) => {
                                                                        const updatedRegions = settings.regions.map(r =>
                                                                            r.id === region.id ? { ...r, server: { ...r.server || {}, publicDomain: e.target.value } } : r
                                                                        );
                                                                        setSettings({ ...settings, regions: updatedRegions });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'quota' && (
                            <div className={styles.section}>
                                {!settings ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                                        Loading settings...
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={styles.sectionTitle}>Quota Limits</h2>
                                        <p className={styles.sectionDesc}>Configure data usage limits for users</p>

                                        <div className={styles.form}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Default Quota (GB)</label>
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    value={settings.quota.default}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        quota: { ...settings.quota, default: parseInt(e.target.value) }
                                                    })}
                                                    min={settings.quota.minimum}
                                                    max={settings.quota.maximum}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Minimum Quota (GB)</label>
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    value={settings.quota.minimum}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        quota: { ...settings.quota, minimum: parseInt(e.target.value) }
                                                    })}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Maximum Quota (GB)</label>
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    value={settings.quota.maximum}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        quota: { ...settings.quota, maximum: parseInt(e.target.value) }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'transports' && (
                            <div className={styles.section}>
                                {!config ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                                        Loading configuration...
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h2 className={styles.sectionTitle}>Transport Configuration</h2>
                                                <p className={styles.sectionDesc}>Map 3x-ui inbounds to transport types</p>
                                            </div>
                                            <button
                                                onClick={() => saveConfig(config)}
                                                className={styles.saveButton}
                                                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                                            >
                                                <Save size={16} />
                                                Save Config
                                            </button>
                                        </div>

                                        <div className={styles.transportList}>
                                            {Object.entries(config.transports).map(([type, transport]) => (
                                                <div key={type} className={styles.transportItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                                                    <div className={styles.transportHeader} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <h3 className={styles.transportName}>{type}</h3>
                                                        <button
                                                            className={`${styles.toggleButton} ${transport.enabled ? styles.enabled : ''}`}
                                                            onClick={() => {
                                                                const updatedConfig = {
                                                                    ...config,
                                                                    transports: {
                                                                        ...config.transports,
                                                                        [type]: { ...transport, enabled: !transport.enabled }
                                                                    }
                                                                };
                                                                setConfig(updatedConfig);
                                                            }}
                                                        >
                                                            {transport.enabled ? 'Enabled' : 'Disabled'}
                                                        </button>
                                                    </div>

                                                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                                                        <div>
                                                            <label className={styles.label} style={{ fontSize: '0.75rem' }}>Inbound ID</label>
                                                            <input
                                                                type="number"
                                                                className={styles.input}
                                                                value={transport.inboundId}
                                                                onChange={(e) => {
                                                                    const updatedConfig = {
                                                                        ...config,
                                                                        transports: {
                                                                            ...config.transports,
                                                                            [type]: { ...transport, inboundId: parseInt(e.target.value) }
                                                                        }
                                                                    };
                                                                    setConfig(updatedConfig);
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={styles.label} style={{ fontSize: '0.75rem' }}>Display Label</label>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                value={transport.label}
                                                                onChange={(e) => {
                                                                    const updatedConfig = {
                                                                        ...config,
                                                                        transports: {
                                                                            ...config.transports,
                                                                            [type]: { ...transport, label: e.target.value }
                                                                        }
                                                                    };
                                                                    setConfig(updatedConfig);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className={styles.section}>
                                {!settings ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                                        Loading settings...
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={styles.sectionTitle}>Content Management</h2>
                                        <p className={styles.sectionDesc}>Customize the text content of the landing page</p>

                                        <div className={styles.form}>
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                marginBottom: '1.5rem',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <h3 className={styles.subTitle} style={{ margin: 0, color: 'hsl(var(--color-primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Github size={18} /> GitHub Data
                                                    </h3>
                                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))' }}>
                                                        Manually refresh release history and README (Bypasses 1h cache)
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        const btn = document.getElementById('refresh-btn');
                                                        btn.disabled = true;
                                                        btn.innerHTML = 'Refreshing...';
                                                        try {
                                                            const res = await revalidateGithubData();
                                                            setMessage({
                                                                type: res.success ? 'success' : 'error',
                                                                text: res.message || res.error
                                                            });
                                                        } catch (err) {
                                                            setMessage({ type: 'error', text: 'Failed to refresh' });
                                                        }
                                                        btn.disabled = false;
                                                        btn.innerHTML = 'Refresh Now';
                                                    }}
                                                    id="refresh-btn"
                                                    className={styles.saveButton}
                                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: 'hsl(var(--color-bg-surface))', border: '1px solid hsl(var(--color-primary))' }}
                                                >
                                                    <RefreshCw size={14} style={{ marginRight: '6px' }} />
                                                    Refresh Now
                                                </button>
                                            </div>

                                            <h3 className={styles.subTitle} style={{ marginTop: '1rem', color: 'hsl(var(--color-primary))' }}>Hero Section</h3>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Hero Title (HTML Allowed)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    value={settings.content?.hero?.title || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        content: {
                                                            ...settings.content,
                                                            hero: { ...settings.content?.hero, title: e.target.value }
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Hero Subtitle</label>
                                                <textarea
                                                    className={styles.input}
                                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                                    value={settings.content?.hero?.subtitle || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        content: {
                                                            ...settings.content,
                                                            hero: { ...settings.content?.hero, subtitle: e.target.value }
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>CTA Button Text</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    value={settings.content?.hero?.ctaText || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        content: {
                                                            ...settings.content,
                                                            hero: { ...settings.content?.hero, ctaText: e.target.value }
                                                        }
                                                    })}
                                                />
                                            </div>

                                            <h3 className={styles.subTitle} style={{ marginTop: '2rem', color: 'hsl(var(--color-primary))' }}>Features Section</h3>
                                            {settings.content?.features?.map((feature, index) => (
                                                <div key={feature.id} style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    marginBottom: '1rem',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    <div className={styles.formGroup}>
                                                        <label className={styles.label}>Feature {index + 1} Title</label>
                                                        <input
                                                            type="text"
                                                            className={styles.input}
                                                            value={feature.title}
                                                            onChange={(e) => {
                                                                const newFeatures = [...settings.content.features];
                                                                newFeatures[index] = { ...feature, title: e.target.value };
                                                                setSettings({
                                                                    ...settings,
                                                                    content: { ...settings.content, features: newFeatures }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label className={styles.label}>Description</label>
                                                        <textarea
                                                            className={styles.input}
                                                            style={{ minHeight: '60px', resize: 'vertical' }}
                                                            value={feature.description}
                                                            onChange={(e) => {
                                                                const newFeatures = [...settings.content.features];
                                                                newFeatures[index] = { ...feature, description: e.target.value };
                                                                setSettings({
                                                                    ...settings,
                                                                    content: { ...settings.content, features: newFeatures }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'ui' && (
                            <div className={styles.section}>
                                {!settings ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                                        Loading settings...
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={styles.sectionTitle}>UI Customization</h2>
                                        <p className={styles.sectionDesc}>Customize the look and feel of the application</p>

                                        <div className={styles.form}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Brand Name</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    value={settings.ui.brandName}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        ui: { ...settings.ui, brandName: e.target.value }
                                                    })}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Primary Color</label>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <input
                                                        type="color"
                                                        value={settings.ui.primaryColor}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            ui: { ...settings.ui, primaryColor: e.target.value }
                                                        })}
                                                        style={{ height: '40px', width: '60px', padding: '0', border: 'none', borderRadius: '4px' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={settings.ui.primaryColor}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            ui: { ...settings.ui, primaryColor: e.target.value }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'links' && (
                            <div className={styles.section}>
                                {!settings ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                                        Loading settings...
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={styles.sectionTitle}>Social Links</h2>
                                        <p className={styles.sectionDesc}>Manage social media links displayed in the footer</p>

                                        <div className={styles.form}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Email Address</label>
                                                <div className={styles.inputWrapper}>
                                                    <Mail size={18} className={styles.inputIcon} />
                                                    <input
                                                        type="email"
                                                        className={styles.input}
                                                        value={settings.socialLinks?.email || ''}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            socialLinks: { ...settings.socialLinks, email: e.target.value }
                                                        })}
                                                        placeholder="contact@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>GitHub URL</label>
                                                <div className={styles.inputWrapper}>
                                                    <Github size={18} className={styles.inputIcon} />
                                                    <input
                                                        type="url"
                                                        className={styles.input}
                                                        value={settings.socialLinks?.github || ''}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            socialLinks: { ...settings.socialLinks, github: e.target.value }
                                                        })}
                                                        placeholder="https://github.com/username"
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>X (Twitter) URL</label>
                                                <div className={styles.inputWrapper}>
                                                    <Twitter size={18} className={styles.inputIcon} />
                                                    <input
                                                        type="url"
                                                        className={styles.input}
                                                        value={settings.socialLinks?.twitter || ''}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                                                        })}
                                                        placeholder="https://x.com/username"
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Telegram URL</label>
                                                <div className={styles.inputWrapper}>
                                                    <Send size={18} className={styles.inputIcon} />
                                                    <input
                                                        type="url"
                                                        className={styles.input}
                                                        value={settings.socialLinks?.telegram || ''}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            socialLinks: { ...settings.socialLinks, telegram: e.target.value }
                                                        })}
                                                        placeholder="https://t.me/username"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}


                        {activeTab === 'system' && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>System Status</h2>
                                <p className={styles.sectionDesc}>Monitor system health and logs</p>
                                <div className={styles.statCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                        <Activity size={20} color="hsl(var(--color-success))" />
                                        <span style={{ fontWeight: '600' }}>System Operational</span>
                                    </div>
                                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                                        All services are running normally. No issues detected.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Security Settings</h2>
                                <p className={styles.sectionDesc}>Manage admin access credentials</p>
                                <form onSubmit={handleUpdateCredentials} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Current Password (Required)</label>
                                        <div className={styles.inputWrapper}>
                                            <Lock size={18} className={styles.inputIcon} />
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                className={styles.input}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className={styles.eyeButton}
                                                onClick={() => setShowPasswords(!showPasswords)}
                                            >
                                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>New Username (Optional)</label>
                                        <div className={styles.inputWrapper}>
                                            <User size={18} className={styles.inputIcon} />
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                placeholder="Leave empty to keep current"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>New Password (Optional)</label>
                                        <div className={styles.inputWrapper}>
                                            <Lock size={18} className={styles.inputIcon} />
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                className={styles.input}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Leave empty to keep current"
                                            />
                                            <button
                                                type="button"
                                                className={styles.eyeButton}
                                                onClick={() => setShowPasswords(!showPasswords)}
                                            >
                                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Confirm New Password</label>
                                        <div className={styles.inputWrapper}>
                                            <Lock size={18} className={styles.inputIcon} />
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                className={styles.input}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                className={styles.eyeButton}
                                                onClick={() => setShowPasswords(!showPasswords)}
                                            >
                                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className={styles.button} disabled={loading}>
                                        <Save size={18} />
                                        Update Credentials
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </main >
    );
}
