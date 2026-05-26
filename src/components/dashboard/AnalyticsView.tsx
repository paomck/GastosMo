'use client';
import styles from './AnalyticsView.module.css';
import type { MonthlyStats } from '@/lib/useTransactions';
import type { Transaction } from '@/lib/firestore';
import { BarChart3, TrendingUp, PieChart, Target } from 'lucide-react';
import { currentMonth } from '@/lib/firestore';

interface AnalyticsViewProps {
  stats: MonthlyStats;
  transactions: Transaction[];
}

export default function AnalyticsView({ stats, transactions }: AnalyticsViewProps) {
  const efficiency = ((stats.ewRebate / stats.ewSpend) * 100 || 0).toFixed(1);

  // Group active transactions for breakdown (filter for current month, fallback to all-time if empty)
  const curMonth = currentMonth();
  const monthTxns = transactions.filter((t) => t.month === curMonth);
  const activeTxns = monthTxns.length > 0 ? monthTxns : transactions;

  // Calculate totals per category
  const catTotals = activeTxns.reduce((acc, t) => {
    const cat = t.category || 'other';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalCatSpend = Object.values(catTotals).reduce((sum, val) => sum + val, 0);

  const categoriesList = ['dining', 'groceries', 'shopping', 'travel', 'bills', 'transportation', 'other'];

  const CATEGORY_LABELS: Record<string, string> = {
    dining: 'Dining',
    groceries: 'Groceries',
    shopping: 'Shopping',
    travel: 'Travel',
    bills: 'Bills',
    transportation: 'Transportation/Auto',
    other: 'Other'
  };

  const catData = categoriesList.map(catId => {
    const total = catTotals[catId] || 0;
    const percent = totalCatSpend > 0 ? Math.round((total / totalCatSpend) * 100) : 0;
    return {
      id: catId,
      label: CATEGORY_LABELS[catId],
      total,
      percent
    };
  }).sort((a, b) => b.total - a.total);
  
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Rebate Efficiency Widget */}
        <section className={`glass-card ${styles.efficiency}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <TrendingUp size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Rebate Efficiency</h2>
          </div>

          <div className={styles.gaugeArea}>
            <div className={styles.gauge}>
              <svg viewBox="0 0 100 100">
                <circle className={styles.gaugeBg} cx="50" cy="50" r="45" />
                <circle 
                  className={styles.gaugeValue} 
                  cx="50" cy="50" r="45" 
                  style={{ strokeDasharray: `${(parseFloat(efficiency) / 10) * 283} 283` } as any}
                />
              </svg>
              <div className={styles.gaugeText}>
                <span className={styles.gaugeNum}>{efficiency}%</span>
                <span className={styles.gaugeLabel}>Cashback Ratio</span>
              </div>
            </div>
            
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Spend</span>
                <span className={styles.statValue}>₱{stats.totalSpend.toLocaleString()}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Rewards</span>
                <span className={styles.statValue} style={{ color: 'var(--accent-amber)' }}>
                  ₱{stats.ewRebate.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cap Progress Detailed */}
        <section className={`glass-card ${styles.capProgress}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <Target size={20} />
            </div>
            <h2 className={styles.sectionTitle}>EastWest 8.88% Cap Status</h2>
          </div>

          <div className={styles.capDetails}>
            <div className={styles.capBar}>
              <div className={styles.capFill} style={{ width: `${(stats.ewRebate / 1250) * 100}%` }} />
            </div>
            
            <div className={styles.capGrid}>
              <div className={styles.capBox}>
                <span className={styles.capBoxLabel}>Earned</span>
                <span className={styles.capBoxValue}>₱{stats.ewRebate.toFixed(2)}</span>
              </div>
              <div className={styles.capBox}>
                <span className={styles.capBoxLabel}>Remaining</span>
                <span className={styles.capBoxValue}>₱{(1250 - stats.ewRebate).toFixed(2)}</span>
              </div>
              <div className={styles.capBox}>
                <span className={styles.capBoxLabel}>Optimal Spend Left</span>
                <span className={styles.capBoxValue}>₱{((1250 - stats.ewRebate) / 0.0888).toFixed(0)}</span>
              </div>
            </div>

            <p className={styles.capAdvice}>
              {stats.ewRebate >= 1250 
                ? "Cap reached. Any further EastWest swipes will earn 0% rebate. Switch to BDO Amex now."
                : `You are earning 8.88% on every swipe. Continue using EastWest for the next ₱${((1250 - stats.ewRebate) / 0.0888).toFixed(0)} spent.`}
            </p>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className={`glass-card ${styles.categories}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <PieChart size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Category Breakdown</h2>
          </div>

          <div className={styles.catBars}>
             {catData.map((item, i) => (
               <div key={item.id} className={styles.catRow}>
                 <div className={styles.catInfo}>
                   <span className={styles.catLabel}>{item.label}</span>
                   <div className={styles.catValueGroup}>
                     <span className={styles.catValue}>₱{item.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     <span className={styles.catPercent}>{item.percent}%</span>
                   </div>
                 </div>
                 <div className={styles.catProgress}>
                    <div className={styles.catFill} style={{ width: `${item.percent}%`, opacity: 1 - (i * 0.12) }} />
                 </div>
               </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
}
