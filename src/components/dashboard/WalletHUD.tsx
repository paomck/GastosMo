'use client';
import styles from './WalletHUD.module.css';
import CardArt from './CardArt';
import { CARD_ORDER, type CardId } from '@/lib/cards';
import type { MonthlyStats } from '@/lib/useTransactions';

interface WalletHUDProps {
  stats: MonthlyStats;
  onSelectCard: (id: CardId) => void;
  activeCardId?: CardId;
  userLimits: Record<string, import('@/lib/firestore').UserCardConfig>;
}

export default function WalletHUD({ stats, onSelectCard, activeCardId, userLimits }: WalletHUDProps) {
  return (
    <div className={styles.hud}>
      <h2 className={styles.title}>Your Wallet</h2>
      <div className={styles.stack}>
        {CARD_ORDER.filter((id) => id in userLimits).map((id) => {
          const spend = stats.cardStats?.[id]?.spend || 0;
          const reward = stats.cardStats?.[id]?.reward || 0;

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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
