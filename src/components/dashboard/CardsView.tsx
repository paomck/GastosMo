'use client';
import { useState, useEffect } from 'react';
import styles from './CardsView.module.css';
import { CARDS, CARD_ORDER, type CardId } from '@/lib/cards';
import { CreditCard, Calendar, ShieldCheck, Tag, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface CardsViewProps {
  userId: string;
  userLimits: Record<string, number>;
  onSaveLimits: (limits: Record<string, number>) => Promise<void>;
}

export default function CardsView({ userId, userLimits, onSaveLimits }: CardsViewProps) {
  const [editingLimitId, setEditingLimitId] = useState<CardId | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');
  const [localLimits, setLocalLimits] = useState<Record<CardId, number>>(userLimits);
  const [saving, setSaving] = useState(false);

  // Sync local state when userLimits prop changes (e.g. from Firestore)
  useEffect(() => {
    setLocalLimits(userLimits);
  }, [userLimits]);

  const startEdit = (id: CardId, current: number) => {
    setEditingLimitId(id);
    setTempLimit(current.toString());
  };

  const saveLimit = async () => {
    if (editingLimitId) {
      setSaving(true);
      const newLimits = { ...localLimits, [editingLimitId]: parseInt(tempLimit) || 0 };
      setLocalLimits(newLimits);
      await onSaveLimits(newLimits);
      setEditingLimitId(null);
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
          
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Card Name</label>
              <input type="text" placeholder="e.g., Titanium Rewards" />
            </div>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Credit Limit (₱)</label>
                <input type="number" placeholder="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Statement Day</label>
                <input type="number" placeholder="15" max="31" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Due Date Logic</label>
              <select className={styles.select}>
                <option>Fixed Day of Month</option>
                <option>25 Days after Statement</option>
                <option>20 Days after Statement</option>
              </select>
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              Add to Fleet
            </button>
          </form>
        </section>

        {/* Fleet Overview Table */}
        <section className={`glass-card ${styles.multipliers}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrap}>
              <ShieldCheck size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Fleet Overview</h2>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Credit Limit</th>
                  <th>Utilization</th>
                  <th>Reward</th>
                </tr>
              </thead>
              <tbody>
                {CARD_ORDER.map(id => (
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
                            type="number" 
                            className={styles.inlineInput}
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            autoFocus
                          />
                          <button className={styles.saveBtn} onClick={saveLimit}><Check size={14} /></button>
                          <button className={styles.cancelBtn} onClick={() => setEditingLimitId(null)}><X size={14} /></button>
                        </div>
                      ) : (
                        <div className={styles.limitValue}>
                          ₱{localLimits[id].toLocaleString()}
                          <button className={styles.editIconBtn} onClick={() => startEdit(id, localLimits[id])}>
                            <Edit3 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td data-label="Utilization">
                      <div className={styles.utilizationWrap}>
                         <div className={styles.utilBar}>
                            <div className={styles.utilFill} style={{ width: '15%', background: CARDS[id].grad[1] }} />
                         </div>
                         <span className={styles.utilPercent}>15%</span>
                      </div>
                    </td>
                    <td data-label="Reward" className={styles.rewardText}>{CARDS[id].rewardLabel}</td>
                  </tr>
                ))}
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
    </div>
  );
}
