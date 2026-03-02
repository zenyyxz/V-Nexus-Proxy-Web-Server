
import styles from '../page.module.css';
import HeroSection from '../../../components/downloads/HeroSection';
import ReleaseHistory from '../../../components/downloads/ReleaseHistory';
import { getReleases } from '../../../lib/github';

export const metadata = {
    title: 'Downloads - V-Nexus',
    description: 'Download the latest version of V-Nexus and view release history.',
};

export default async function DownloadsPage() {
    const releases = await getReleases();
    const latestRelease = releases[0];
    const previousReleases = releases.slice(1);

    return (
        <main className={styles.container}>
            <HeroSection latestRelease={latestRelease} />
            <ReleaseHistory releases={previousReleases} />
        </main>
    );
}
