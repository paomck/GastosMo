'use client';
import { useState, useMemo } from 'react';
import styles from './BestCardCalculator.module.css';
import { CARDS, EASTWEST_RATE, type CardId, type TransactionCategory } from '@/lib/cards';
import { Calculator, ChevronRight, Sparkles } from 'lucide-react';

interface BestCardCalculatorProps {
  ewRebateEarned: number;
}

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'dining', label: 'Dining' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'travel', label: 'Travel' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'bills', label: 'Bills' },
  { value: 'other', label: 'Other' },
];

export default function BestCardCalculator({ ewRebateEarned }: BestCardCalculatorProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [category, setCategory] = useState<TransactionCategory>('dining');

  const results = useMemo(() => {
    const num = parseFloat(amount) || 0;
    
    // EastWest Logic
    const ewRemaining = Math.max(0, 1250 - ewRebateEarned);
    const ewPotential = num * EASTWEST_RATE;
    const ewActual = Math.min(ewPotential, ewRemaining);

    // Amex Logic
    const amexPoints = Math.floor(num / (CARDS['bdo-amex'].pointDivisor || 45));
    
    // Diamond Logic
    const diamondPoints = Math.floor(num / (CARDS['bdo-diamond'].pointDivisor || 1000));

    // Recommendation
    let bestId: CardId = 'eastwest';
    if (ewRemaining <= 0 || (category !== 'dining' && category !== 'groceries' && ewActual < amexPoints)) {
       bestId = 'bdo-amex';
    }

    return { ewActual, amexPoints, diamondPoints, bestId };
  }, [amount, category, ewRebateEarned]);

  const bestCard = CARDS[results.bestId];

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Sparkles size={18} className={styles.sparkle} />
          <h3 className={styles.title}>CURRENT BEST CARD</h3>
        </div>
        <div className={styles.categoryPicker}>
           {CATEGORIES.map(c => (
             <button 
               key={c.value}
               className={`${styles.catBtn} ${category === c.value ? styles.activeCat : ''}`}
               onClick={() => setCategory(c.value)}
             >
               {c.label}
             </button>
           ))}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.recommendation}>
          <div className={styles.cardInfo}>
            <div className={styles.cardBadge} style={{ background: bestCard.grad[1] }}>
              {bestCard.bank} {bestCard.name}
            </div>
            <p className={styles.reason}>
              {results.bestId === 'eastwest' 
                ? `8.88% active. You still have ₱${(1250 - ewRebateEarned).toFixed(2)} rebate left.`
                : `Cap reached or better points. Use Amex for 1pt/₱45.`}
            </p>
          </div>
          <div className={styles.bestValue}>
            {results.bestId === 'eastwest' 
              ? `+₱${results.ewActual.toFixed(2)}` 
              : `+${results.amexPoints} pts`}
          </div>
        </div>

        <div className={styles.calculatorSection}>
          <div className={styles.inputWrap}>
            <span className={styles.currency}>₱</span>
            <input 
              type="number" 
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
            />
          </div>
          
          <div className={styles.comparison}>
             <div className={styles.compRow}>
               <span>EastWest (8.88%)</span>
               <span className={results.bestId === 'eastwest' ? styles.win : ''}>
                 ₱{results.ewActual.toFixed(2)}
               </span>
             </div>
             <div className={styles.compRow}>
               <span>BDO Amex</span>
               <span className={results.bestId === 'bdo-amex' ? styles.win : ''}>
                 {results.amexPoints} pts
               </span>
             </div>
             <div className={styles.compRow}>
               <span>BDO Diamond</span>
               <span className={results.bestId === 'bdo-diamond' ? styles.win : ''}>
                 {results.diamondPoints} pts
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
