'use client';

import styles from './TrustSection.module.css';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export default function TrustSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Shield Icon */}
        <div className={styles.iconWrap}>
          <ShieldCheck size={36} className={styles.icon} />
        </div>

        {/* Headline */}
        <h2 className={styles.headline}>
          Zero Risk. <span className={styles.headlineAccent}>Total Privacy.</span>
        </h2>

        {/* Supporting Copy */}
        <p className={styles.description}>
          GastosMo never asks for your bank logins, card numbers, CVV, or expiry
          dates. Simply input your statement dates and credit limits manually to
          start optimizing your strategy with zero security risk.
        </p>

        {/* Trust Badges */}
        <div className={styles.badges}>
          <div className={styles.badge}>
            <Lock size={18} className={styles.badgeIcon} />
            <span className={styles.badgeText}>No Card Numbers</span>
          </div>
          <div className={styles.badge}>
            <EyeOff size={18} className={styles.badgeIcon} />
            <span className={styles.badgeText}>No Bank Logins</span>
          </div>
          <div className={styles.badge}>
            <ShieldCheck size={18} className={styles.badgeIcon} />
            <span className={styles.badgeText}>Manual Input Only</span>
          </div>
        </div>
      </div>
    </section>
  );
}
