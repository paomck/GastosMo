'use client';

import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.logoWrap}>
        <span className={styles.logoMark}>G</span>
        <span className={styles.logoText}>astosMo</span>
      </div>
      <div className={styles.dots}>
        <span className={`${styles.dot} ${styles.dot1}`} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
      </div>
    </div>
  );
}
