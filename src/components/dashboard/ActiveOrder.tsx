'use client';
import styles from './ActiveOrder.module.css';
import { getSmartRecommendation } from '@/lib/cards';
import { Compass, ShoppingBag, Utensils, Zap } from 'lucide-react';

interface ActiveOrderProps {
  userName: string;
  ewRebateEarned: number;
}

export default function ActiveOrder({ userName, ewRebateEarned }: ActiveOrderProps) {
  const rec = getSmartRecommendation(ewRebateEarned);
  const firstName = userName ? userName.split(' ')[0] : 'Captain';
  
  // Logic: Personalize based on category (this would ideally come from context or AI)
  // For now, we'll suggest a "Grocery run" or "Dining out" based on the EastWest status.
  const isCapped = rec.status === 'capped';
  const cardName = isCapped ? 'BDO Amex' : 'EastWest Visa';
  const rate = isCapped ? '1 pt/₱45' : '8.88%';
  const category = isCapped ? 'general spending' : 'Grocery run';

  return (
    <div className={`glass-card ${styles.banner}`}>
      <div className={styles.iconWrap}>
        <Zap size={24} className={styles.zap} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.statusLabel}>ACTIVE ORDER</div>
        <h2 className={styles.message}>
          {firstName}, for today's <span className={styles.highlight}>{category}</span>, 
          use your <span className={styles.highlight}>{cardName}</span> for <span className={styles.highlight}>{rate}</span> back.
        </h2>
      </div>

      <div className={styles.visuals}>
        <div className={styles.dot} />
        <div className={styles.wave} />
      </div>
    </div>
  );
}
