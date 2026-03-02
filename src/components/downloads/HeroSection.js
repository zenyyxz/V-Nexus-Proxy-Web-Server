'use client';

import { Download, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from 'react';
import styles from '../../app/downloads/page.module.css';
import { formatDate } from '../../utils/date';

export default function HeroSection({ latestRelease }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsExpanded(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!latestRelease) return null;

    const downloadAsset = latestRelease.assets.find(asset => asset.name.endsWith('.exe')) || latestRelease.assets[0];
    const downloadUrl = downloadAsset ? downloadAsset.browser_download_url : latestRelease.html_url;

    return (
        <section className={styles.hero}>
            <h1 className={styles.heroTitle}>Release History</h1>
            <p className={styles.heroSubtitle}>Download the latest updates and see what's new in V-Nexus.</p>

            <div className={`fade-in-up ${styles.latestCard}`}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <span className={styles.versionBadge}>{latestRelease.tag_name}</span>
                    <div style={{ marginTop: '0.5rem' }}>
                        <span className={styles.releaseDate}>Released on {formatDate(latestRelease.published_at)}</span>
                    </div>
                </div>

                <a href={downloadUrl} className={styles.downloadButton}>
                    <Download size={24} />
                    Download .exe
                </a>

                <div style={{ width: '100%', borderTop: '1px solid hsla(var(--color-text-muted) / 0.2)', margin: '1rem 0' }}></div>

                <div className={styles.changelog}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <ShieldCheck size={20} color="hsl(var(--color-primary))" />
                            What's New
                        </h3>
                        {isMobile && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={styles.readMoreButton}
                                aria-label={isExpanded ? "Show less" : "Read more"}
                            >
                                {isExpanded ? (
                                    <>Show Less <ChevronUp size={16} /></>
                                ) : (
                                    <>Read More <ChevronDown size={16} /></>
                                )}
                            </button>
                        )}
                    </div>
                    <div
                        className={`${styles.markdownContent} ${!isExpanded && isMobile ? styles.changelogCollapsed : ''}`}
                        style={{ marginTop: '1rem' }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {latestRelease.body}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </section>
    );
}
