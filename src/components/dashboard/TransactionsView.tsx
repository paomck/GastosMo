'use client';
import { useState, useEffect, useMemo } from 'react';
import styles from './TransactionsView.module.css';
import { 
  fetchPaginatedTransactions, 
  getTransactionsCount, 
  currentMonth,
  type Transaction 
} from '@/lib/firestore';
import { CARDS, getCardCycleStatus, type CardId } from '@/lib/cards';
import { Edit2, Trash2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface TransactionsViewProps {
  userId: string;
  allTransactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  ewRebateEarned: number;
}

export default function TransactionsView({
  userId,
  allTransactions,
  onEdit,
  onDelete,
  ewRebateEarned
}: TransactionsViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<CardId | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // pageTokens[pageIndex] holds the lastVisible document snapshot of pageIndex
  // so pageIndex + 1 starts after it. pageTokens[0] is null (first page starts after nothing).
  const [pageTokens, setPageTokens] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);

  // Fetch count and reset pagination whenever the card filter changes
  useEffect(() => {
    if (!userId) return;
    
    const initPagination = async () => {
      setLoading(true);
      try {
        const month = currentMonth();
        const count = await getTransactionsCount(userId, month, selectedCardId);
        setTotalCount(count);
        const pages = Math.ceil(count / 8) || 1;
        setTotalPages(pages);
        
        // Reset tokens and page to 1
        setPageTokens([null]);
        setCurrentPage(1);

        const { txns, lastVisible } = await fetchPaginatedTransactions(userId, month, 8, null, selectedCardId);
        setTransactions(txns);
        
        if (pages > 1) {
          setPageTokens([null, lastVisible]);
        }
      } catch (err) {
        console.error("Error initializing pagination:", err);
      } finally {
        setLoading(false);
      }
    };

    initPagination();
  }, [userId, selectedCardId]);

  // Reactively update current page when the real-time allTransactions list changes (e.g. after edit/delete)
  useEffect(() => {
    if (!userId || loading) return;
    
    const syncWithDatabase = async () => {
      try {
        const month = currentMonth();
        const count = await getTransactionsCount(userId, month, selectedCardId);
        setTotalCount(count);
        const pages = Math.ceil(count / 8) || 1;
        setTotalPages(pages);

        const targetPage = Math.min(currentPage, pages);
        
        // Fetch fresh data for the target page using the corresponding page token
        const cursor = pageTokens[targetPage - 1] || null;
        const { txns, lastVisible } = await fetchPaginatedTransactions(userId, month, 8, cursor, selectedCardId);
        
        setTransactions(txns);
        setCurrentPage(targetPage);
        
        setPageTokens(prev => {
          const nextTokens = [...prev.slice(0, targetPage)];
          if (targetPage < pages) {
            nextTokens[targetPage] = lastVisible;
          }
          return nextTokens;
        });
      } catch (err) {
        console.error("Error syncing transactions page:", err);
      }
    };

    syncWithDatabase();
  }, [allTransactions]);

  const goToPage = async (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage || loading) return;

    setLoading(true);
    try {
      const month = currentMonth();
      let currentTokens = [...pageTokens];
      
      // If we don't have the token for this page yet, we need to fetch sequentially to populate tokens
      if (currentTokens[targetPage - 1] === undefined) {
        let lastLoadedPage = 1;
        while (lastLoadedPage < targetPage && currentTokens[lastLoadedPage] !== undefined) {
          lastLoadedPage++;
        }
        
        let cursor = currentTokens[lastLoadedPage - 1];
        for (let p = lastLoadedPage; p < targetPage; p++) {
          const { lastVisible } = await fetchPaginatedTransactions(userId, month, 8, cursor, selectedCardId);
          currentTokens[p] = lastVisible;
          cursor = lastVisible;
        }
        setPageTokens(currentTokens);
      }

      // Query page using computed cursor
      const cursor = currentTokens[targetPage - 1];
      const { txns, lastVisible } = await fetchPaginatedTransactions(userId, month, 8, cursor, selectedCardId);
      
      if (targetPage < totalPages) {
        currentTokens[targetPage] = lastVisible;
        setPageTokens(currentTokens);
      }
      
      setTransactions(txns);
      setCurrentPage(targetPage);
    } catch (err) {
      console.error("Error going to page:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalOwed = useMemo(() => {
    if (!selectedCardId) return 0;
    // Calculate total spend in current month for the selected card
    return allTransactions
      .filter(t => t.cardId === selectedCardId && t.month === currentMonth())
      .reduce((acc, t) => acc + t.amount, 0);
  }, [allTransactions, selectedCardId]);

  const dueDateStr = useMemo(() => {
    if (!selectedCardId) return '';
    const { dueDate } = getCardCycleStatus(selectedCardId);
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedCardId]);

  // Generate numbered list page buttons to show (e.g. Page 1, 2, 3...)
  const pageNumbers = useMemo(() => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages]);

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>
            {selectedCardId ? `${CARDS[selectedCardId].name} Ledger` : 'Comprehensive Ledger'}
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
      </div>

      {/* Card Filter Badges */}
      <div className={styles.cardFilters}>
        <button 
          className={`${styles.filterBtn} ${!selectedCardId ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCardId(null)}
        >
          All Cards
        </button>
        {Object.entries(CARDS).map(([id, card]) => (
          <button
            key={id}
            className={`${styles.filterBtn} ${selectedCardId === id ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCardId(id as CardId)}
            style={{ 
              borderLeft: selectedCardId === id ? `4px solid ${card.grad[1]}` : '1px solid var(--border-glass)'
            }}
          >
            {card.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>
          <p>Loading transactions ledger...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.empty}>
          <p>No transactions found{selectedCardId ? ' for this card' : ''} in the current month.</p>
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

          {/* Numbered Pagination Footer */}
          {totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <button 
                className={`${styles.paginationBtn} ${styles.textBtn}`}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              
              {pageNumbers.map(page => (
                <button
                  key={page}
                  className={`${styles.paginationBtn} ${currentPage === page ? styles.activePage : ''}`}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              ))}

              <button 
                className={`${styles.paginationBtn} ${styles.textBtn}`}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
