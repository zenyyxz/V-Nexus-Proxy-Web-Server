
import Link from 'next/link';
import styles from './page.module.css';
import { getReleases } from '../../lib/github';
import { Package, FileText, Tag } from 'lucide-react';

export default async function DownloadsLayout({ children }) {
    const releases = await getReleases();

    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sidebarTitle}>Menu</h3>
                    <Link href="/downloads" className={styles.sidebarLink}>
                        <FileText size={18} /> Overview
                    </Link>
                    <Link href="/downloads/releases" className={styles.sidebarLink}>
                        <Package size={18} /> All Releases
                    </Link>
                </div>

                <div className={styles.sidebarSection}>
                    <h3 className={styles.sidebarTitle}>Versions</h3>
                    <div className={styles.tagsList}>
                        {releases.map(release => (
                            <Link
                                key={release.id}
                                href={`/downloads/releases#${release.tag_name}`}
                                className={styles.tagLink}
                            >
                                <Tag size={14} /> {release.tag_name}
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
