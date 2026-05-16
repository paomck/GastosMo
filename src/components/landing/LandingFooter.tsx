'use client';

import styles from './LandingFooter.module.css';

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>G</span>
          <span className={styles.logoText}>astosMo</span>
        </div>
        <p className={styles.tagline}>Command Your Credit. Maximize Every Swipe.</p>
        <p className={styles.copy}>© {year} GastosMo. Built for smarter swipes.</p>
      </div>
    </footer>
  );
}
