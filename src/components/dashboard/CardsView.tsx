'use client';
import { useState, useEffect } from 'react';
import styles from './CardsView.module.css';
import { CARDS, CARD_ORDER, type CardId } from '@/lib/cards';
import { CreditCard, Calendar, ShieldCheck, Tag, Plus, Trash2, Edit3, Check, X, AlertTriangle, Landmark } from 'lucide-react';
import { currentMonth, type Transaction, type UserCardConfig } from '@/lib/firestore';

interface CardsViewProps {
  userId: string;
  userLimits: Record<string, UserCardConfig>;
  onSaveLimits: (limits: Record<string, UserCardConfig>) => Promise<void>;
  transactions: Transaction[];
}

export default function CardsView({ userId, userLimits, onSaveLimits, transactions }: CardsViewProps) {
  const [editingLimitId, setEditingLimitId] = useState<CardId | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');
  const [localLimits, setLocalLimits] = useState<Record<CardId, UserCardConfig>>(userLimits as Record<CardId, UserCardConfig>);
  const [saving, setSaving] = useState(false);

  // Custom confirm modal state
  const [cardIdToDelete, setCardIdToDelete] = useState<CardId | null>(null);

  // Add card state
  const [newCardId, setNewCardId] = useState<CardId | ''>('');
  const [newCardLimit, setNewCardLimit] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  const disabledCards = CARD_ORDER.filter(id => !(id in localLimits));

  const month = currentMonth();
  const currentMonthSpend = transactions
    .filter((t) => t.month === month)
    .reduce((acc, t) => {
      acc[t.cardId] = (acc[t.cardId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Sync local state when userLimits prop changes (e.g. from Firestore)
  useEffect(() => {
    setLocalLimits(userLimits as Record<CardId, UserCardConfig>);
  }, [userLimits]);

  // Sync new card and bank selections when local limits change
  useEffect(() => {
    if (disabledCards.length > 0) {
      const banks = Array.from(new Set(disabledCards.map(id => CARDS[id].bank)));
      const nextBank = banks.includes(selectedBank) ? selectedBank : banks[0];
      setSelectedBank(nextBank);

      const filtered = disabledCards.filter(id => CARDS[id].bank === nextBank);
      if (filtered.length > 0) {
        const nextCardId = filtered.includes(newCardId as CardId) ? (newCardId as CardId) : filtered[0];
        setNewCardId(nextCardId);
        setNewCardLimit(CARDS[nextCardId].creditLimit.toLocaleString('en-US'));
      }
    } else {
      setSelectedBank('');
      setNewCardId('');
      setNewCardLimit('');
    }
  }, [localLimits, disabledCards]);

  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank);
    const filtered = disabledCards.filter(id => CARDS[id].bank === bank);
    if (filtered.length > 0) {
      setNewCardId(filtered[0]);
      setNewCardLimit(CARDS[filtered[0]].creditLimit.toLocaleString('en-US'));
    }
  };

  const startEdit = (id: CardId, current: UserCardConfig) => {
    setEditingLimitId(id);
    setTempLimit(current.limit.toLocaleString('en-US'));
  };

  const saveLimit = async () => {
    if (editingLimitId) {
      try {
        setSaving(true);
        const rawLimit = parseInt(tempLimit.replace(/\D/g, '')) || 0;
        const currentConfig = localLimits[editingLimitId] || {};
        const newLimits = { ...localLimits, [editingLimitId]: { ...currentConfig, limit: rawLimit } };
        setLocalLimits(newLimits);
        await onSaveLimits(newLimits);
        setEditingLimitId(null);
      } catch (err) {
        console.error("Error saving limit:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSelectNewCard = (id: CardId) => {
    setNewCardId(id);
    setNewCardLimit(CARDS[id].creditLimit.toLocaleString('en-US'));
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardId) return;

    try {
      setSaving(true);
      const rawLimit = parseInt(newCardLimit.replace(/\D/g, '')) || 0;
      const newLimits = { ...localLimits, [newCardId]: { limit: rawLimit } };
      setLocalLimits(newLimits);
      await onSaveLimits(newLimits);
    } catch (err) {
      console.error("Error adding card:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (id: CardId) => {
    try {
      setSaving(true);
      const newLimits = { ...localLimits };
      delete newLimits[id];
      setLocalLimits(newLimits);
      await onSaveLimits(newLimits);
    } catch (err) {
      console.error("Error deleting card:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Card Management Form */}
        <section className={`glass-card ${styles.cardForm}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <Plus size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Add New Card</h2>
          </div>
          
          {disabledCards.length > 0 ? (
            <form className={styles.form} onSubmit={handleAddCard}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Select Bank</label>
                  <div className={styles.inputWrap}>
                    <Landmark size={16} className={styles.icon} />
                    <select
                      className={styles.select}
                      value={selectedBank}
                      onChange={(e) => handleSelectBank(e.target.value)}
                      required
                    >
                      {Array.from(new Set(disabledCards.map(id => CARDS[id].bank))).map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Select Card</label>
                  <div className={styles.inputWrap}>
                    <CreditCard size={16} className={styles.icon} />
                    <select 
                      className={styles.select}
                      value={newCardId}
                      onChange={(e) => handleSelectNewCard(e.target.value as CardId)}
                      required
                    >
                      {disabledCards
                        .filter(id => CARDS[id].bank === selectedBank)
                        .map(id => (
                          <option key={id} value={id}>
                            {CARDS[id].name} ({CARDS[id].rewardLabel})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Credit Limit (₱)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 100,000" 
                    value={newCardLimit}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (!raw) {
                        setNewCardLimit('');
                        return;
                      }
                      setNewCardLimit(parseInt(raw).toLocaleString('en-US'));
                    }}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Statement Day</label>
                  <input 
                    type="number" 
                    value={newCardId ? CARDS[newCardId].closeDay : 15}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Due Date Rules</label>
                <input 
                  type="text" 
                  value={newCardId ? (CARDS[newCardId].dueDay ? `Fixed (Day ${CARDS[newCardId].dueDay})` : `${CARDS[newCardId].dueOffset} Days after Statement`) : ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} disabled={saving}>
                {saving ? 'Saving...' : 'Add to Dashboard'}
              </button>
            </form>
          ) : (
            <div className={styles.noCardsMsg}>
              <div className={styles.successIconWrap}>
                <Check size={20} />
              </div>
              <h3 className={styles.noCardsTitle}>All Cards Linked</h3>
              <p className={styles.noCardsText}>
                Your credit card portfolio is fully optimized. All available credit cards are linked and active on your dashboard.
              </p>
              <span className={styles.noCardsSubtext}>
                To edit limits or remove a card, use the controls in the Card Overview table.
              </span>
            </div>
          )}
        </section>

        {/* Card Overview Table */}
        <section className={`glass-card ${styles.multipliers}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <ShieldCheck size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Card Overview</h2>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Credit Limit</th>
                  <th>Utilization</th>
                  <th>Reward</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {CARD_ORDER.filter(id => id in localLimits).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                      No active credit cards. Use the form on the left to link a card!
                    </td>
                  </tr>
                ) : (
                  CARD_ORDER.filter(id => id in localLimits).map(id => (
                    <tr key={id}>
                      <td data-label="Card" className={styles.cardNameCell}>
                        <div className={styles.dot} style={{ background: CARDS[id].grad[1] }} />
                        <div className={styles.cardNameStack}>
                          <span className={styles.bankName}>{CARDS[id].bank}</span>
                          <span className={styles.cardName}>{CARDS[id].name}</span>
                        </div>
                      </td>
                      <td data-label="Limit" className={styles.limitText}>
                        {editingLimitId === id ? (
                          <div className={styles.editWrap}>
                            <input 
                              type="text" 
                              className={styles.inlineInput}
                              value={tempLimit}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                if (!raw) {
                                  setTempLimit('');
                                  return;
                                }
                                setTempLimit(parseInt(raw).toLocaleString('en-US'));
                              }}
                              autoFocus
                            />
                            <button className={styles.saveBtn} onClick={saveLimit}><Check size={14} /></button>
                            <button className={styles.cancelBtn} onClick={() => setEditingLimitId(null)}><X size={14} /></button>
                          </div>
                        ) : (
                          <div className={styles.limitValue}>
                            ₱{(localLimits[id]?.limit || 0).toLocaleString()}
                            <button className={styles.editIconBtn} onClick={() => startEdit(id, localLimits[id])}>
                              <Edit3 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td data-label="Utilization">
                        {(() => {
                          const spend = currentMonthSpend[id] || 0;
                          const limit = localLimits[id]?.limit || 1;
                          const utilPercent = Math.round((spend / limit) * 100);
                          return (
                            <div className={styles.utilizationWrap}>
                              <div className={styles.utilBar}>
                                <div className={styles.utilFill} style={{ width: `${Math.min(100, utilPercent)}%`, background: CARDS[id].grad[1] }} />
                              </div>
                              <span className={styles.utilPercent}>{utilPercent}%</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td data-label="Reward" className={styles.rewardText}>{CARDS[id].rewardLabel}</td>
                      <td data-label="Actions">
                        <div className={styles.actionsCell}>
                          <button 
                            className={styles.deleteCardBtn}
                            onClick={() => setCardIdToDelete(id)}
                            title="Remove Card"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Annual Fee Tracker */}
        <section className={`glass-card ${styles.fees}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <Calendar size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Annual Fee Tracker</h2>
          </div>

          <div className={styles.feeList}>
            <div className={styles.feeItem}>
              <div className={styles.feeInfo}>
                <span className={styles.feeCard}>EastWest Visa Platinum</span>
                <span className={styles.feeDate}>Next: Dec 12, 2026</span>
              </div>
              <div className={styles.feeCost}>
                <span className={styles.feeAmount}>₱5,000.00</span>
                <span className={styles.feeDays}>240 days left</span>
              </div>
            </div>
            <div className={styles.feeItem}>
              <div className={styles.feeInfo}>
                <span className={styles.feeCard}>BDO Amex Platinum</span>
                <span className={styles.feeDate}>Next: Aug 05, 2026</span>
              </div>
              <div className={styles.feeCost}>
                <span className={styles.feeAmount}>₱4,500.00</span>
                <span className={styles.feeDays}>110 days left</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Custom Premium Confirm Modal Dialog */}
      {cardIdToDelete && (
        <div className={styles.confirmOverlay} onClick={() => setCardIdToDelete(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningIconWrap}>
              <AlertTriangle size={24} />
            </div>
            
            <h3 className={styles.confirmTitle}>Remove Card?</h3>
            <p className={styles.confirmText}>
              Are you sure you want to remove the <strong>{CARDS[cardIdToDelete].bank} {CARDS[cardIdToDelete].name}</strong> from your dashboard? This will temporarily hide it from your HUD and limits.
            </p>
            
            <div className={styles.confirmActions}>
              <button 
                className={styles.deleteConfirmBtn} 
                onClick={async () => {
                  const id = cardIdToDelete;
                  setCardIdToDelete(null);
                  await handleDeleteCard(id);
                }}
              >
                Remove
              </button>
              <button className={styles.cancelConfirmBtn} onClick={() => setCardIdToDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
