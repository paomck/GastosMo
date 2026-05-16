'use client';
import styles from './SmartAdvisor.module.css';
import { getSmartRecommendation } from '@/lib/cards';
import { Sparkles, AlertCircle } from 'lucide-react';

interface SmartAdvisorProps {
  ewRebateEarned: number;
}

export default function SmartAdvisor({ ewRebateEarned }: SmartAdvisorProps) {
  const rec = getSmartRecommendation(ewRebateEarned);
  const isCapped = rec.status === 'capped';

  return (
    <div className={`glass-card ${styles.advisor} ${isCapped ? styles.capped : styles.active}`}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          {isCapped ? <AlertCircle size={20} /> : <Sparkles size={20} />}
        </div>
        <div>
          <h3 className={styles.headline}>{rec.headline}</h3>
          <p className={styles.badge}>{isCapped ? 'CAP REACHED' : 'OPTIMIZING REBATES'}</p>
        </div>
      </div>
      <p className={styles.subText}>{rec.sub}</p>
      
      {!isCapped && (
        <div className={styles.progressArea}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(ewRebateEarned / 1250) * 100}%` }}
            />
          </div>
          <p className={styles.progressLabel}>
            ₱{ewRebateEarned.toFixed(2)} / ₱1,250.00
          </p>
        </div>
      )}
    </div>
  );
}
