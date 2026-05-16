'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import styles from './HeroSection.module.css';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className={styles.hero}>
        {/* Ambient Background Orbs */}
        <div className={styles.orbAmber} aria-hidden="true" />
        <div className={styles.orbNavy} aria-hidden="true" />
        <div className={styles.orbAmberSecondary} aria-hidden="true" />

        {/* Noise overlay handled in globals.css */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Content */}
        <div className={styles.content}>
          {/* Badge */}
          <div className={`${styles.badge} animate-fade-up`}>
            <span className={styles.badgeDot} />
            Multi-card intelligent tracking
          </div>

          {/* Headline */}
          <h1 className={`${styles.headline} animate-fade-up delay-100`}>
            Command Your Credit.<br />
            <span className={styles.headlineAccent}>Maximize Every Swipe.</span>
          </h1>

          {/* Sub-headline */}
          <p className={`${styles.subheadline} animate-fade-up delay-200`}>
            The intelligent dashboard for multi-card.<br className={styles.desktopBreak} />
            Track <span className={styles.highlight}>8.88% rebates</span>, avoid fees, and always
            know which card to draw.
          </p>

          {/* CTA */}
          <div className={`${styles.ctaGroup} animate-fade-up delay-300`}>
            {!user && (
              <button
                id="hero-login-btn"
                className="btn-primary"
                onClick={() => setModalOpen(true)}
              >
                Login to Command Center
                <ArrowRight size={18} />
              </button>
            )}
            <a href="#features" className="btn-ghost">
              See how it works
            </a>
          </div>

          {/* Trust indicators */}
          <div className={`${styles.trust} animate-fade-up delay-400`}>
            <span className={styles.trustItem}>
              <span className={styles.trustDot} />
              Secure Firebase Auth
            </span>
            <span className={styles.trustDivider}>·</span>
            <span className={styles.trustItem}>
              <span className={styles.trustDot} />
              Real-time sync
            </span>
            <span className={styles.trustDivider}>·</span>
            <span className={styles.trustItem}>
              <span className={styles.trustDot} />
              Zero data sharing
            </span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <ChevronDown size={20} className={styles.scrollIcon} />
        </div>
      </section>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
