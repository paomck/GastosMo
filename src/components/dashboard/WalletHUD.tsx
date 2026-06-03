'use client';
import styles from './WalletHUD.module.css';
import CardArt from './CardArt';
import { CARD_ORDER, type CardId, getCycleMonth, CARDS } from '@/lib/cards';
import type { MonthlyStats } from '@/lib/useTransactions';
import { currentMonth } from '@/lib/firestore';

interface WalletHUDProps {
  stats: MonthlyStats;
  onSelectCard: (id: CardId) => void;
  activeCardId?: CardId;
  userLimits: Record<string, import('@/lib/firestore').UserCardConfig>;
  paidCycles?: Record<string, boolean>;
  onUpdatePaidCycles?: (cycles: Record<string, boolean>) => Promise<void>;
}

export default function WalletHUD({ stats, onSelectCard, activeCardId, userLimits, paidCycles, onUpdatePaidCycles }: WalletHUDProps) {
  // Calculate total owed and total credit limit across active cards
  const activeCards = CARD_ORDER.filter((id) => id in userLimits);
  
  let totalOwed = 0;
  let totalLimit = 0;
  
  activeCards.forEach((id) => {
    totalOwed += stats.cardStats?.[id]?.spend || 0;
    totalLimit += userLimits[id]?.limit || 0;
  });

  const utilization = totalLimit > 0 ? (totalOwed / totalLimit) * 100 : 0;
  const clampedUtilization = Math.min(Math.max(utilization, 0), 100);

  return (
    <div className={styles.hud}>
      <h2 className={styles.title}>Your Wallet</h2>

      {/* Total Balance Summary Widget */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryLabel}>Total Amount Owed</span>
          <span className={styles.summaryLabel}>This Month</span>
        </div>
        <div className={styles.summaryValue}>
          ₱{totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={styles.utilizationWrap}>
          <div className={styles.utilizationLabel}>
            <span>Portfolio Utilization</span>
            <span>{utilization.toFixed(1)}%</span>
          </div>
          <div className={styles.utilizationBar}>
            <div 
              className={styles.utilizationFill} 
              style={{ width: `${clampedUtilization}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.stack}>
        {activeCards.map((id) => {
          const spend = stats.cardStats?.[id]?.spend || 0;
          const reward = stats.cardStats?.[id]?.reward || 0;
          
          const closeDay = userLimits?.[id]?.closeDay || CARDS[id].closeDay;
          const activeMonth = getCycleMonth(new Date(), closeDay);
          const cycleId = `${id}-${activeMonth}`;
          const isPaid = !!paidCycles?.[cycleId];

          const togglePaid = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!onUpdatePaidCycles || !paidCycles) return;
            const newPaid = { ...paidCycles };
            if (newPaid[cycleId]) {
              delete newPaid[cycleId];
            } else {
              newPaid[cycleId] = true;
            }
            await onUpdatePaidCycles(newPaid);
          };

          return (
            <div key={id} className={styles.cardItem}>
              <CardArt
                cardId={id}
                monthSpend={spend}
                rewardEarned={reward}
                creditLimit={userLimits[id]?.limit}
                userConfig={userLimits[id]}
                active={activeCardId === id}
                onClick={() => onSelectCard(id)}
                isPaid={isPaid}
                onTogglePaid={togglePaid}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
