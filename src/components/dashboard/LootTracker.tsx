'use client';
import { useEffect, useState } from 'react';
import styles from './LootTracker.module.css';
import { Coins, Trophy } from 'lucide-react';

interface LootTrackerProps {
  monthlyRebate: number;
  lifetimeRebate: number;
}

export default function LootTracker({ monthlyRebate, lifetimeRebate }: LootTrackerProps) {
  const cap = 1250;
  const progress = Math.min((monthlyRebate / cap) * 100, 100);

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Coins size={18} className={styles.icon} />
          LOOT TRACKER
        </h3>
      </div>

      <div className={styles.monthlySection}>
        <div className={styles.flexRow}>
          <span className={styles.label}>Monthly Rebate Cap</span>
          <span className={styles.value}>₱{monthlyRebate.toFixed(2)} / ₱{cap}</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={styles.odometerSection}>
        <div className={styles.flexRow}>
          <span className={styles.label}>Lifetime Earnings</span>
          <Trophy size={14} className={styles.trophy} />
        </div>
        <Odometer value={lifetimeRebate} />
      </div>
    </div>
  );
}

function Odometer({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const formatted = displayValue.toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  return (
    <div className={styles.odometer}>
      <span className={styles.currency}>₱</span>
      {formatted.split('').map((char, i) => (
        <span key={i} className={char === ',' || char === '.' ? styles.separator : styles.digit}>
          {char}
        </span>
      ))}
    </div>
  );
}
