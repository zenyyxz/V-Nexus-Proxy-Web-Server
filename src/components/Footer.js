import { Mail, Globe, Github, Twitter, Send } from 'lucide-react';
import styles from './Footer.module.css';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getSocialLinks() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'admin-settings.json');
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const settings = JSON.parse(fileContent);
        return settings.socialLinks || {};
    } catch (error) {
        console.error('Failed to load social links:', error);
        return {};
    }
}

export default async function Footer() {
    const links = await getSocialLinks();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brandSection}>
                    <h3 className={styles.brandName}>V-NEXUS</h3>
                    <p className={styles.brandDesc}>
                        Premium proxy management infrastructure for the modern web. Secure, fast, and reliable connectivity.
                    </p>
                    <div className={styles.developerBadgesWrapper}>
                        <div className={styles.developerBadge}>
                            <p className={styles.developerLabel}>DEVELOPED BY</p>
                            <a href="https://lahirux.dev" target="_blank" rel="noopener noreferrer" className={styles.developerLink}>
                                Lahiru Rashmika <Globe size={16} color="hsl(var(--color-primary))" />
                            </a>
                        </div>
                        <div className={styles.developerBadge}>
                            <p className={styles.developerLabel}>DEVELOPED BY</p>
                            <a href="https://sophie.lahirux.dev" target="_blank" rel="noopener noreferrer" className={styles.developerLink}>
                                Sophie Ember <Globe size={16} color="hsl(var(--color-primary))" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.linksContainer}>
                    <div className={styles.linkSection}>
                        <h4 className={styles.sectionTitle}>Product</h4>
                        <div className={styles.linkList}>
                            <a href="#" className={styles.link}>Features</a>
                            <a href="#" className={styles.link}>Pricing</a>
                            <a href="#" className={styles.link}>API</a>
                        </div>
                    </div>
                    <div className={styles.linkSection}>
                        <h4 className={styles.sectionTitle}>Legal</h4>
                        <div className={styles.linkList}>
                            <a href="#" className={styles.link}>Privacy</a>
                            <a href="#" className={styles.link}>Terms</a>
                        </div>
                    </div>
                    <div className={styles.linkSection}>
                        <h4 className={styles.sectionTitle}>Connect</h4>
                        <div className={styles.socialLinks}>
                            {links.email && (
                                <a href={`mailto:${links.email}`} className={styles.socialLink} aria-label="Email">
                                    <Mail size={20} color="hsl(var(--color-primary))" />
                                    <span className={styles.socialText}>Email</span>
                                </a>
                            )}
                            {links.github && (
                                <a href={links.github} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
                                    <Github size={20} color="hsl(var(--color-primary))" />
                                    <span className={styles.socialText}>GitHub</span>
                                </a>
                            )}
                            {links.twitter && (
                                <a href={links.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X (Twitter)">
                                    <Twitter size={20} color="hsl(var(--color-primary))" />
                                    <span className={styles.socialText}>X (Twitter)</span>
                                </a>
                            )}
                            {links.telegram && (
                                <a href={links.telegram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Telegram">
                                    <Send size={20} color="hsl(var(--color-primary))" />
                                    <span className={styles.socialText}>Telegram</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                © 2024 V-Nexus Infrastructure. All rights reserved.
            </div>
        </footer>
    );
}
