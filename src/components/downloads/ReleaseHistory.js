
import { Download, Clock } from 'lucide-react';
import styles from '../../app/downloads/page.module.css';
import { formatDate } from '../../utils/date';

export default function ReleaseHistory({ releases }) {
    if (!releases || releases.length === 0) return null;

    return (
        <section className={`fade-in-up ${styles.timeline}`} style={{ animationDelay: '0.2s' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={24} />
                Previous Versions
            </h2>

            {releases.map((release) => {
                const downloadAsset = release.assets.find(asset => asset.name.endsWith('.exe')) || release.assets[0];
                const downloadUrl = downloadAsset ? downloadAsset.browser_download_url : release.html_url;

                return (
                    <div key={release.id} id={release.tag_name} className={styles.historyItem}>
                        <span className={styles.historyDate}>{formatDate(release.published_at)}</span>
                        <div className={styles.historyVersion}>{release.name || release.tag_name}</div>

                        <a href={downloadUrl} className={styles.historyDownload}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Download {release.tag_name} <Download size={14} />
                            </span>
                        </a>
                    </div>
                );
            })}
        </section>
    );
}
