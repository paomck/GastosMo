'use client';
import styles from './WalletHUD.module.css';
import CardArt from './CardArt';
import { CARD_ORDER, type CardId } from '@/lib/cards';
import type { MonthlyStats } from '@/lib/useTransactions';

interface WalletHUDProps {
  stats: MonthlyStats;
  onSelectCard: (id: CardId) => void;
  activeCardId?: CardId;
  userLimits: Record<string, number>;
}

export default function WalletHUD({ stats, onSelectCard, activeCardId, userLimits }: WalletHUDProps) {
  return (
    <div className={styles.hud}>
      <h2 className={styles.title}>Your Wallet</h2>
      <div className={styles.stack}>
        {CARD_ORDER.map((id) => {
          let spend = 0;
          let reward = 0;

          if (id === 'eastwest') {
            spend = stats.ewSpend;
            reward = stats.ewRebate;
          } else if (id === 'bdo-amex') {
            spend = stats.amexSpend;
            reward = stats.amexPoints;
          } else if (id === 'bdo-diamond') {
            spend = stats.diamondSpend;
            reward = stats.diamondPoints;
          }

          return (
            <div key={id} className={styles.cardItem}>
              <CardArt
                cardId={id}
                monthSpend={spend}
                rewardEarned={reward}
                creditLimit={userLimits[id]}
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
