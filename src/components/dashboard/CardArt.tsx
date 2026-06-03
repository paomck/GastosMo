'use client';
import { useState } from 'react';
import styles from './CardArt.module.css';
import { CARDS, getCardCycleStatus, type CardId } from '@/lib/cards';
import { Calendar, CreditCard as CardIcon, Info, CheckCircle } from 'lucide-react';

import type { UserCardConfig } from '@/lib/firestore';

interface CardArtProps {
  cardId: CardId;
  monthSpend?: number;
  rewardEarned?: number;
  creditLimit?: number;
  userConfig?: UserCardConfig;
  active?: boolean;
  onClick?: () => void;
  isPaid?: boolean;
  onTogglePaid?: (e: React.MouseEvent) => void;
}

const LAST4: Record<string, string> = {
  eastwest: '7890', 'bdo-amex': '1234', 'bdo-diamond': '4321',
};

export default function CardArt({ cardId, monthSpend = 0, rewardEarned = 0, creditLimit, userConfig, active, onClick, isPaid, onTogglePaid }: CardArtProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const card = CARDS[cardId];
  const actualLimit = creditLimit || card.creditLimit;
  const [c1, c2, c3] = card.grad;
  const isLight = cardId === 'bdo-amex';
  const { status, closeDate, dueDate } = getCardCycleStatus(cardId, userConfig);
  const last4 = LAST4[cardId] || '8888';

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`${styles.perspective} ${active ? styles.active : ''}`}>
      <div 
        className={`${styles.cardInner} ${isFlipped ? styles.isFlipped : ''}`}
        onClick={onClick}
      >
        {/* FRONT */}
        <div
          className={styles.cardFront}
          style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)` }}
        >
          {/* Status Light */}
          <div className={`${styles.statusLight} ${styles[status]}`} title={`Status: ${status}`} />
          
          <button className={styles.flipBtn} onClick={toggleFlip} title="View Details">
            <Info size={14} />
          </button>
          
          <button 
            className={`${styles.paidBtn} ${isPaid ? styles.isPaid : ''}`} 
            onClick={onTogglePaid} 
            title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}
          >
            <CheckCircle size={14} />
          </button>

      {/* Shine overlay */}
      <div className={styles.shine} />

      {/* Top row */}
      <div className={styles.top}>
        <div>
          <div className={styles.bank} style={{ color: card.mutedColor }}>{card.bank}</div>
          <div className={styles.cardName} style={{ color: card.textColor }}>{card.name}</div>
        </div>
        <NetworkBadge network={card.network} textColor={card.textColor} isLight={isLight} />
      </div>

      {/* Chip */}
      <div className={styles.chipRow}>
        <div className={`${styles.chip} ${isLight ? styles.chipDark : styles.chipGold}`}>
          <div className={styles.chipLines} />
        </div>
        {card.network !== 'AMEX' && (
          <svg className={styles.contactless} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" stroke={card.textColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            <path d="M12 6C8.69 6 6 8.69 6 12s2.69 6 6 6 6-2.69 6-6" stroke={card.textColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.75"/>
            <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2" stroke={card.textColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
          </svg>
        )}
      </div>

      {/* Card number */}
      <div className={styles.number} style={{ color: card.textColor }}>
        •••• &nbsp; •••• &nbsp; •••• &nbsp; {last4}
      </div>

      {/* Bottom row */}
      <div className={styles.bottom}>
        <div style={{ position: 'relative' }}>
          {isPaid && <div className={styles.paidStamp}>PAID</div>}
          <div className={styles.label} style={{ color: card.mutedColor }}>This Month</div>
          <div className={`${styles.value} ${isPaid ? styles.valueStrikethrough : ''}`} style={{ color: card.textColor }}>
            ₱{monthSpend.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={styles.label} style={{ color: card.mutedColor }}>{card.pointsLabel}</div>
          <div className={styles.value} style={{ color: card.textColor }}>
            {card.pointsLabel === 'cashback'
              ? `₱${rewardEarned.toFixed(2)}`
              : `${Math.round(rewardEarned)}`}
          </div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className={styles.utilizationContainer}>
        <div className={styles.utilizationBg} style={{ background: card.mutedColor }} />
        <div 
          className={styles.utilizationFill} 
          style={{ 
            width: `${Math.min(100, (monthSpend / actualLimit) * 100)}%`,
            background: card.textColor 
          }} 
        />
      </div>

      {/* Reward pill */}
      <div className={styles.rewardPill} style={{ color: card.mutedColor }}>
        {card.rewardLabel}
      </div>
    </div>

    {/* BACK */}
    <div 
      className={styles.cardBack}
      style={{ background: `linear-gradient(135deg, ${c3} 0%, ${c2} 50%, ${c1} 100%)` }}
    >
      <button className={styles.flipBtn} onClick={toggleFlip}>
        <CardIcon size={14} />
      </button>

      <div className={styles.backContent}>
        <div className={styles.backHeader}>
          <div className={styles.bankSmall} style={{ color: card.mutedColor }}>{card.bank}</div>
          <div className={styles.statusText} style={{ color: card.textColor }}>
            Status: <span className={styles[`text-${status}`]}>{status.toUpperCase()}</span>
          </div>
        </div>

        <div className={styles.dateGrid}>
          <div className={styles.dateItem}>
            <Calendar size={16} color={card.mutedColor} />
            <div>
              <div className={styles.labelSmall} style={{ color: card.mutedColor }}>Statement Close</div>
              <div className={styles.valueSmall} style={{ color: card.textColor }}>
                {closeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className={styles.dateItem}>
            <Calendar size={16} color={card.mutedColor} />
            <div>
              <div className={styles.labelSmall} style={{ color: card.mutedColor }}>Payment Due</div>
              <div className={styles.valueSmall} style={{ color: card.textColor }}>
                {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.backStats}>
          <div className={styles.statItem}>
            <div className={styles.labelSmall} style={{ color: card.mutedColor }}>Credit Limit</div>
            <div className={styles.valueSmall} style={{ color: card.textColor }}>
              ₱{actualLimit.toLocaleString()}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.labelSmall} style={{ color: card.mutedColor }}>Available</div>
            <div className={styles.valueSmall} style={{ color: card.textColor }}>
              ₱{(actualLimit - monthSpend).toLocaleString()}
            </div>
          </div>
        </div>

        <div className={styles.magStrip} />
        <div className={styles.cvvArea}>
          <div className={styles.cvvBox}>***</div>
          <div className={styles.labelSmall} style={{ color: card.mutedColor }}>CVV</div>
        </div>
      </div>
    </div>
  </div>
</div>
);
}

function NetworkBadge({ network, textColor, isLight }: { network: string; textColor: string; isLight: boolean }) {
  if (network === 'VISA') return (
    <span className={styles.networkVisa} style={{ color: textColor }}>VISA</span>
  );
  if (network === 'AMEX') return (
    <span className={styles.networkAmex} style={{ color: textColor }}>AMERICAN<br/>EXPRESS</span>
  );
  if (network === 'MASTERCARD') return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EB001B', mixBlendMode: 'screen' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F79E1B', marginLeft: -6, mixBlendMode: 'screen' }} />
      <span style={{ color: textColor, fontSize: '0.6rem', fontWeight: 600, marginLeft: 4 }}>mastercard</span>
    </div>
  );
  if (network === 'DIGITAL') return null;
  return (
    <div className={styles.networkUp}>
      <span style={{ background: '#CC0000', color: '#fff', padding: '1px 5px', borderRadius: 3, fontSize: '0.6rem', fontWeight: 700 }}>CUP</span>
      <span style={{ color: textColor, fontSize: '0.6rem', fontWeight: 600 }}>UnionPay</span>
    </div>
  );
}
