'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Wrench, Sparkles, Code, Rocket } from 'lucide-react';

export default function ManageProfiles() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Animated Background Elements */}
                <div className={styles.floatingIcons}>
                    <Code className={styles.floatingIcon} size={40} />
                    <Wrench className={styles.floatingIcon} size={35} />
                    <Sparkles className={styles.floatingIcon} size={30} />
                    <Rocket className={styles.floatingIcon} size={38} />
                </div>

                {/* Main Content */}
                <div className={styles.content}>
                    <div className={styles.iconWrapper}>
                        <Wrench size={80} className={styles.mainIcon} />
                    </div>

                    <h1 className={styles.title}>
                        Under Development
                    </h1>

                    <p className={styles.subtitle}>
                        We're crafting something amazing for you{dots}
                    </p>

                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <Sparkles size={20} />
                            <span>Profile Management</span>
                        </div>
                        <div className={styles.featureItem}>
                            <Code size={20} />
                            <span>Usage Analytics</span>
                        </div>
                        <div className={styles.featureItem}>
                            <Rocket size={20} />
                            <span>Advanced Controls</span>
                        </div>
                    </div>

                    <div className={styles.progressBar}>
                        <div className={styles.progressFill}></div>
                    </div>

                    <p className={styles.message}>
                        This feature is currently being built and will be available soon.
                        <br />
                        Stay tuned for updates!
                    </p>

                    <a href="/" className={styles.backButton}>
                        ← Back to Home
                    </a>
                </div>
            </div>
        </main>
    );
}
