'use client';
import styles from './KeyMetrics.module.css';
import type { MonthlyStats } from '@/lib/useTransactions';
import { EASTWEST_CAP } from '@/lib/cards';

interface KeyMetricsProps {
  stats: MonthlyStats;
}

export default function KeyMetrics({ stats }: KeyMetricsProps) {
  const metrics = [
    {
      label: 'EastWest Rebate',
      value: `₱${stats.ewRebate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      sub: `₱${(EASTWEST_CAP - stats.ewRebate).toFixed(2)} to cap`,
      color: 'var(--accent-amber)',
    },
    {
      label: 'Total Spend',
      value: `₱${stats.totalSpend.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`,
      sub: 'Across all 3 cards',
      color: 'var(--text-primary)',
    },
    {
      label: 'Amex Points',
      value: `${Math.round(stats.amexPoints).toLocaleString()}`,
      sub: 'MR Points earned',
      color: '#C8C5C0',
    },
    {
      label: 'Diamond Points',
      value: `${Math.round(stats.diamondPoints).toLocaleString()}`,
      sub: 'Peso Points earned',
      color: '#B8CCE8',
    },
  ];

  return (
    <div className={styles.grid}>
      {metrics.map((m) => (
        <div key={m.label} className={`glass-card ${styles.card}`}>
          <p className={styles.label}>{m.label}</p>
          <div className={styles.value} style={{ color: m.color }}>{m.value}</div>
          <p className={styles.sub}>{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
