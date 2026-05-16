'use client';
import { useState } from 'react';
import styles from './AddTransactionDialog.module.css';
import { CARDS, CARD_ORDER, calcEastwestRebate, calcPoints, type CardId, type TransactionCategory, EASTWEST_RATE } from '@/lib/cards';
import { checkMerchantEligibility, getMerchantStatus } from '@/lib/merchantRules';
import { X, Plus, CreditCard, DollarSign, Store, Tag, Sparkles, Info, HelpCircle } from 'lucide-react';
import { addTransaction, updateTransaction, currentMonth, type Transaction } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

interface AddTransactionDialogProps {
  userId: string;
  ewRebateEarned: number;
  initialTransaction?: Transaction;
  onClose?: () => void;
}

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'dining', label: 'Dining' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'travel', label: 'Travel' },
  { value: 'bills', label: 'Bills' },
  { value: 'other', label: 'Other' },
];

export default function AddTransactionDialog({ userId, ewRebateEarned, initialTransaction, onClose }: AddTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(!!initialTransaction);
  const [loading, setLoading] = useState(false);
  const [cardId, setCardId] = useState<CardId>(initialTransaction?.cardId || 'eastwest');
  const [amount, setAmount] = useState(initialTransaction?.amount.toString() || '');
  const [merchant, setMerchant] = useState(initialTransaction?.merchant || '');
  const [category, setCategory] = useState<TransactionCategory>(initialTransaction?.category || 'dining');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    setLoading(true);
    const numAmount = parseFloat(amount);
    const month = initialTransaction?.month || currentMonth();

    let rebate = 0;
    let points = 0;

    // For EastWest, we need to consider the rebate earned EXCLUDING the current transaction if editing
    const currentEwRebate = initialTransaction?.cardId === 'eastwest' 
      ? ewRebateEarned - initialTransaction.rebateEarned 
      : ewRebateEarned;

    if (cardId === 'eastwest') {
      rebate = calcEastwestRebate(numAmount, currentEwRebate, merchant, category);
    } else {
      points = calcPoints(numAmount, CARDS[cardId].pointDivisor || 1);
    }

    try {
      if (initialTransaction?.id) {
        await updateTransaction(initialTransaction.id, {
          cardId,
          amount: numAmount,
          merchant,
          category,
          rebateEarned: rebate,
          pointsEarned: points,
        });
      } else {
        await addTransaction({
          userId,
          cardId,
          amount: numAmount,
          merchant,
          category,
          date: Timestamp.now(),
          month,
          rebateEarned: rebate,
          pointsEarned: points,
        });
      }
      setIsOpen(false);
      if (onClose) onClose();
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAmount('');
    setMerchant('');
    setCategory('dining');
    setCardId('eastwest');
  };

  if (!isOpen && !initialTransaction) {
    return (
      <button className={styles.fab} onClick={() => setIsOpen(true)}>
        <Plus size={24} />
      </button>
    );
  }

  const handleOverlayClick = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialTransaction ? 'Edit Transaction' : 'Log Transaction'}</h2>
          <button className={styles.close} onClick={handleOverlayClick}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Card Selector */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Select Card</label>
            <div className={styles.cardChips}>
              {CARD_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.cardChip} ${cardId === id ? styles.cardChipActive : ''}`}
                  onClick={() => setCardId(id)}
                  style={{ '--chip-color': CARDS[id].grad[1] } as any}
                >
                  {CARDS[id].bank} {CARDS[id].name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Amount (₱)</label>
              <div className={styles.inputWrap}>
                <span className={styles.icon}>₱</span>
                <input
                  type="number"
                  step="0.01"
                  className={styles.input}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Category</label>
              <div className={styles.inputWrap}>
                <Tag size={16} className={styles.icon} />
                <select
                  className={styles.input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Merchant</label>
            <div className={styles.inputWrap}>
              <Store size={16} className={styles.icon} />
              <input
                type="text"
                className={styles.input}
                placeholder="Where did you swipe?"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Real-time Rebate Preview */}
          {cardId === 'eastwest' && merchant && (
            <div className={`${styles.rebatePreview} animate-fade-in`}>
              {(() => {
                const status = getMerchantStatus(merchant, category);
                if (status === 'eligible') {
                  return (
                    <div className={styles.eligible}>
                      <Sparkles size={14} />
                      <span>8.88% Rewards Qualified (Verified)</span>
                    </div>
                  );
                } else if (status === 'exclusion') {
                  return (
                    <div className={styles.ineligible}>
                      <Info size={14} />
                      <span>0.30% Base Rate (Verified Exclusion)</span>
                    </div>
                  );
                } else {
                  return (
                    <div className={styles.unlisted}>
                      <HelpCircle size={14} />
                      <span>Store Unlisted (Predicted 8.88%)</span>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : initialTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
