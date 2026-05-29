'use client';
import { useState, useMemo, useEffect } from 'react';
import styles from './RecentTransactions.module.css';
import { subscribeToRecentTransactions, currentMonth, type Transaction } from '@/lib/firestore';
import { CARDS, getCardCycleStatus, type CardId } from '@/lib/cards';
import { Edit2, Trash2, XCircle } from 'lucide-react';

interface RecentTransactionsProps {
  userId: string;
  selectedCardId: CardId | null;
  onClearFilter: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  ewRebateEarned: number;
  onViewAll: () => void;
}

export default function RecentTransactions({ 
  userId, 
  selectedCardId, 
  onClearFilter, 
  onEdit, 
  onDelete,
  ewRebateEarned,
  onViewAll
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to exactly the 5 most recent transactions for this month/card
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const month = currentMonth();
    const unsub = subscribeToRecentTransactions(
      userId,
      month,
      5,
      selectedCardId,
      (txns) => {
        setTransactions(txns);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId, selectedCardId]);

  const totalOwed = useMemo(() => {
    if (!selectedCardId) return 0;
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions, selectedCardId]);

  const dueDateStr = useMemo(() => {
    if (!selectedCardId) return '';
    const { dueDate } = getCardCycleStatus(selectedCardId);
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedCardId]);

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>
            {selectedCardId ? `${CARDS[selectedCardId].name} Activity` : 'Recent Activity'}
          </h2>
          
          {selectedCardId && (
            <div className={styles.summary}>
              <span className={styles.summaryLabel}>TOTAL OWED:</span>
              <span className={styles.summaryValue}>₱{totalOwed.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              <span className={styles.summaryDivider}>|</span>
              <span className={styles.summaryLabel}>DUE:</span>
              <span className={styles.summaryValue}>{dueDateStr}</span>
            </div>
          )}
        </div>

        {selectedCardId && (
          <button className={styles.clearBtn} onClick={onClearFilter}>
            Clear Filter <XCircle size={14} style={{ marginLeft: 6 }} />
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.empty}>
          <p>Loading activity...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.empty}>
          <p>No transactions found{selectedCardId ? ' for this card' : ''}.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Card</th>
                <th style={{ textAlign: 'center' }}>Rate</th>
                <th style={{ textAlign: 'right' }}>Reward Log</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td data-label="Date">{t.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td data-label="Merchant">
                    <div className={styles.merchantStack}>
                      <div className={styles.merchant}>{t.merchant}</div>
                      <div className={styles.category}>{t.category}</div>
                    </div>
                  </td>
                  <td data-label="Card">
                    <span 
                      className={styles.cardBadge} 
                      style={{ background: CARDS[t.cardId].grad[1] }}
                    >
                      {CARDS[t.cardId].network}
                    </span>
                  </td>
                  <td data-label="Rate" style={{ textAlign: 'center' }}>
                    {t.cardId === 'eastwest' ? (
                      <span className={`${styles.rateBadge} ${t.rebateEarned / t.amount > 0.01 ? styles.highRate : styles.lowRate}`}>
                        {t.rebateEarned / t.amount > 0.01 ? '8.88%' : '0.30%'}
                      </span>
                    ) : (
                      <span className={styles.pointsLabel}>
                        {t.cardId === 'bdo-amex' ? '1pt/₱45' : '1pt/₱1k'}
                      </span>
                    )}
                  </td>
                  <td data-label="Log" style={{ textAlign: 'right' }}>
                    <div className={styles.spendStack}>
                      <span className={styles.spentHighlight}>
                        ₱{t.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className={styles.earnedMuted}>
                        {t.cardId === 'eastwest' ? (
                          `+₱${t.rebateEarned.toFixed(2)} earned`
                        ) : (
                          `+${Math.round(t.pointsEarned)} pts`
                        )}
                      </div>
                    </div>
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'center' }}>
                    <div className={styles.actionBtns}>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => onEdit(t)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                        onClick={() => onDelete(t)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.loadMoreWrap}>
            <button 
              className={styles.loadMoreBtn} 
              onClick={onViewAll}
            >
              View All Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
