'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <Link href="/" className={styles.logo}>
                <Shield size={28} color="hsl(150, 100%, 40%)" />
                <span className={styles.logoText}>V-NEXUS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className={styles.navLinks}>
                {/* Network Status Widget */}
                <div className={styles.statusWidget}>
                    <span className={styles.statusDot}></span>
                    <span className={styles.statusText}>Systems Operational</span>
                </div>

                <Link
                    href="/"
                    className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
                >
                    Home
                </Link>
                <Link
                    href="/downloads"
                    className={`${styles.navLink} ${pathname.startsWith('/downloads') ? styles.active : ''}`}
                >
                    Downloads
                </Link>
                <Link href="/dashboard" className={styles.navLinkHighlight}>Manage Profiles</Link>

                <Link href="#get-started" className={styles.ctaButton}>
                    Get Started
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                className={styles.mobileMenuButton}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.statusWidget}>
                        <span className={styles.statusDot}></span>
                        <span className={styles.statusText}>Systems Operational</span>
                    </div>
                    <Link
                        href="/"
                        className={`${styles.mobileNavLink} ${pathname === '/' ? styles.mobileActive : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/downloads"
                        className={`${styles.mobileNavLink} ${pathname.startsWith('/downloads') ? styles.mobileActive : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Downloads
                    </Link>
                    <Link href="/dashboard" className={styles.mobileNavLinkHighlight} onClick={() => setMobileMenuOpen(false)}>
                        Manage Profiles
                    </Link>
                    <Link href="#get-started" className={styles.mobileCtaButton} onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    );
}
