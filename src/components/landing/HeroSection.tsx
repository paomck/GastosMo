'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import styles from './HeroSection.module.css';
import { ArrowRight, ChevronDown, ShieldCheck, Lock } from 'lucide-react';

interface HeroSectionProps {
  onGoToDashboard?: () => void;
}

export default function HeroSection({ onGoToDashboard }: HeroSectionProps) {
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
            Track your highest rebates, avoid fees, and always<br className={styles.desktopBreak} />
            know which card to draw.
          </p>

          {/* CTA */}
          <div className={`${styles.ctaGroup} animate-fade-up delay-300`}>
            {user ? (
              onGoToDashboard && (
                <button
                  className="btn-primary"
                  onClick={onGoToDashboard}
                >
                  Go to Command Center
                  <ArrowRight size={18} />
                </button>
              )
            ) : (
              <button
                id="hero-login-btn"
                className="btn-primary"
                onClick={() => setModalOpen(true)}
              >
                Login
                <ArrowRight size={18} />
              </button>
            )}
            <a href="#features" className={`btn-ghost ${styles.ghostCta}`}>
              See how it works
            </a>
          </div>

          {/* Trust indicators */}
          <div className={`${styles.trust} animate-fade-up delay-400`}>
            <span className={styles.trustItem}>
              <Lock size={14} className={styles.trustIcon} />
              No Card Numbers Required
            </span>
            <span className={styles.trustDivider}>·</span>
            <span className={styles.trustItem}>
              <ShieldCheck size={14} className={styles.trustIcon} />
              100% Privacy Focused
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
