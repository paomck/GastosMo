'use client';
import { useState, useMemo, useEffect } from 'react';
import styles from './RecentTransactions.module.css';
import { deleteTransaction, type Transaction } from '@/lib/firestore';
import { CARDS, getCardCycleStatus, type CardId } from '@/lib/cards';
import { Edit2, Trash2, XCircle } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import AddTransactionDialog from './AddTransactionDialog';

interface RecentTransactionsProps {
  transactions: Transaction[];
  selectedCardId: CardId | null;
  onClearFilter: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  ewRebateEarned: number;
}

export default function RecentTransactions({ 
  transactions, 
  selectedCardId, 
  onClearFilter, 
  onEdit, 
  onDelete,
  ewRebateEarned
}: RecentTransactionsProps) {
  const [visibleCount, setVisibleCount] = useState(8);

  // Reset pagination when active card filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [selectedCardId]);
  
  const filteredTransactions = useMemo(() => {
    if (!selectedCardId) return transactions;
    return transactions.filter(t => t.cardId === selectedCardId);
  }, [transactions, selectedCardId]);

  const totalOwed = useMemo(() => {
    if (!selectedCardId) return 0;
    return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions, selectedCardId]);

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

      {filteredTransactions.length === 0 ? (
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
              {filteredTransactions.slice(0, visibleCount).map((t) => (
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
                    <div className={styles.spendRow}>
                      <span className={styles.spent}>₱{t.amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })} spent</span>
                      <span className={styles.arrow}>→</span>
                      {t.cardId === 'eastwest' ? (
                        <span className={styles.rebateBadge}>+₱{t.rebateEarned.toFixed(2)} earned</span>
                      ) : (
                        <span className={styles.pointsBadge}>+{Math.round(t.pointsEarned)} pts</span>
                      )}
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

          {filteredTransactions.length > visibleCount && (
            <div className={styles.loadMoreWrap}>
              <button 
                className={styles.loadMoreBtn} 
                onClick={() => setVisibleCount(prev => prev + 8)}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
