export type CardId =
  | 'eastwest'
  | 'bdo-amex'
  | 'bdo-diamond'
  | 'bpi-amore-cashback'
  | 'hsbc-live-plus'
  | 'sb-complete-cashback'
  | 'ub-cashback-plat'
  | 'bdo-amex-explorer'
  | 'bpi-visa-sig'
  | 'ew-sia-krisflyer'
  | 'ub-rewards-plat'
  | 'metro-titanium-mc'
  | 'rcbc-black-plat'
  | 'rcbc-miles-sig'
  | 'shopee-pay-later'
  | 'bdo-shopmore'
  | 'bdo-gold'
  | 'bpi-rewards'
  | 'bpi-amore-plat'
  | 'ub-miles-world'
  | 'ub-reserve'
  | 'metro-mfree'
  | 'metro-world'
  | 'metro-cashback'
  | 'rcbc-flex'
  | 'rcbc-jcb-plat'
  | 'ew-dolce-vita'
  | 'sb-wave'
  | 'sb-plat-world';

export type TransactionCategory = 'dining' | 'groceries' | 'shopping' | 'travel' | 'bills' | 'transportation' | 'other';
import { checkMerchantEligibility } from './merchantRules';
import type { UserCardConfig } from './firestore';

export interface CardDef {
  id: CardId;
  name: string;
  bank: string;
  network: string;
  rewardLabel: string;
  grad: [string, string, string];
  textColor: string;
  mutedColor: string;
  rebateRate?: number;
  rebateCap?: number;
  pointDivisor?: number;
  pointsLabel: string;
  closeDay: number;
  dueDay?: number;        // Fixed day if applicable
  dueOffset?: number;     // Days after close if variable
  creditLimit: number;
}

export const CARDS: Record<CardId, CardDef> = {
  // --- ORIGINAL FLEET ---
  'eastwest': {
    id: 'eastwest', name: 'Visa Platinum', bank: 'EastWest', network: 'VISA',
    rewardLabel: '8.88% Cashback', grad: ['#3D0066', '#8B1585', '#C21A9A'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.55)',
    rebateRate: 0.0888, rebateCap: 1250, pointsLabel: 'cashback',
    closeDay: 15, dueDay: 11, creditLimit: 100000,
  },
  'bdo-amex': {
    id: 'bdo-amex', name: 'Amex Platinum', bank: 'BDO', network: 'AMEX',
    rewardLabel: '1 pt / ₱45', grad: ['#7A7A7A', '#C8C5C0', '#9A9A9A'],
    textColor: '#1A1A1A', mutedColor: 'rgba(0,0,0,0.45)',
    pointDivisor: 45, pointsLabel: 'MR Points',
    closeDay: 9, dueOffset: 25, creditLimit: 250000,
  },
  'bdo-diamond': {
    id: 'bdo-diamond', name: 'Diamond UnionPay', bank: 'BDO', network: 'UnionPay',
    rewardLabel: '1 pt / ₱1,000', grad: ['#080818', '#151E38', '#0A1428'],
    textColor: '#B8CCE8', mutedColor: 'rgba(184,204,232,0.5)',
    pointDivisor: 1000, pointsLabel: 'Peso Points',
    closeDay: 9, dueOffset: 25, creditLimit: 150000,
  },

  // --- ADDED PRESTIGE DIRECTORY ---
  'bpi-amore-cashback': {
    id: 'bpi-amore-cashback', name: 'Amore Cashback', bank: 'BPI', network: 'VISA',
    rewardLabel: '4% Groceries / 1% Bills', grad: ['#A81C1C', '#D83F3F', '#F07575'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    rebateRate: 0.04, rebateCap: 1250, pointsLabel: 'cashback',
    closeDay: 20, dueOffset: 20, creditLimit: 80000,
  },
  'hsbc-live-plus': {
    id: 'hsbc-live-plus', name: 'Live+ Credit Card', bank: 'HSBC', network: 'VISA',
    rewardLabel: '8% Dining & Shopping', grad: ['#B20E10', '#E22026', '#FF6368'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.65)',
    rebateRate: 0.08, rebateCap: 1000, pointsLabel: 'cashback',
    closeDay: 18, dueOffset: 22, creditLimit: 120000,
  },
  'sb-complete-cashback': {
    id: 'sb-complete-cashback', name: 'Complete Cashback', bank: 'Security Bank', network: 'MASTERCARD',
    rewardLabel: 'Up to 5% Cashback', grad: ['#003366', '#005CB9', '#338AE5'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    rebateRate: 0.05, rebateCap: 1000, pointsLabel: 'cashback',
    closeDay: 10, dueOffset: 21, creditLimit: 100000,
  },
  'ub-cashback-plat': {
    id: 'ub-cashback-plat', name: 'Cash Back Platinum', bank: 'UnionBank', network: 'VISA',
    rewardLabel: '1.5% Unlimited Cashback', grad: ['#0C2340', '#1D4ED8', '#60A5FA'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    rebateRate: 0.015, pointsLabel: 'cashback',
    closeDay: 25, dueOffset: 25, creditLimit: 150000,
  },
  'bdo-amex-explorer': {
    id: 'bdo-amex-explorer', name: 'Amex Explorer', bank: 'BDO', network: 'AMEX',
    rewardLabel: '1 mile / ₱40 spend', grad: ['#00778B', '#00A3C4', '#4CD3E3'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.65)',
    pointDivisor: 40, pointsLabel: 'Miles',
    closeDay: 9, dueOffset: 25, creditLimit: 200000,
  },
  'bpi-visa-sig': {
    id: 'bpi-visa-sig', name: 'Visa Signature', bank: 'BPI', network: 'VISA',
    rewardLabel: '1 pt / ₱20 (1.85% Forex)', grad: ['#3A0007', '#730014', '#B0263E'],
    textColor: '#E8D3A7', mutedColor: 'rgba(232,211,167,0.6)',
    pointDivisor: 20, pointsLabel: 'BPI Points',
    closeDay: 5, dueOffset: 20, creditLimit: 300000,
  },
  'ew-sia-krisflyer': {
    id: 'ew-sia-krisflyer', name: 'KrisFlyer World', bank: 'EastWest', network: 'MASTERCARD',
    rewardLabel: '1 mile / ₱12 spend', grad: ['#0B1B3D', '#1B365D', '#4B6B94'],
    textColor: '#D4AF37', mutedColor: 'rgba(212,175,55,0.6)',
    pointDivisor: 12, pointsLabel: 'KF Miles',
    closeDay: 15, dueOffset: 25, creditLimit: 500000,
  },
  'ub-rewards-plat': {
    id: 'ub-rewards-plat', name: 'Rewards Visa Platinum', bank: 'UnionBank', network: 'VISA',
    rewardLabel: '1 pt / ₱30 (3x Dining)', grad: ['#1A1A1A', '#333333', '#666666'],
    textColor: '#F59E0B', mutedColor: 'rgba(245,158,11,0.55)',
    pointDivisor: 30, pointsLabel: 'UB Points',
    closeDay: 17, dueOffset: 25, creditLimit: 750000,
  },
  'metro-titanium-mc': {
    id: 'metro-titanium-mc', name: 'Titanium Mastercard', bank: 'Metrobank', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱20 (2x Spend)', grad: ['#1F2937', '#4B5563', '#9CA3AF'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 20, pointsLabel: 'Metro Points',
    closeDay: 2, dueOffset: 21, creditLimit: 60000,
  },
  'rcbc-black-plat': {
    id: 'rcbc-black-plat', name: 'Black Card Platinum', bank: 'RCBC', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱36 spend', grad: ['#0E1111', '#1C2321', '#3A3F3F'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.5)',
    pointDivisor: 36, pointsLabel: 'RCBC Points',
    closeDay: 15, dueOffset: 25, creditLimit: 250000,
  },
  'rcbc-miles-sig': {
    id: 'rcbc-miles-sig', name: 'Visa Platinum Airmiles', bank: 'RCBC', network: 'VISA',
    rewardLabel: '1 mile / ₱25 spend', grad: ['#1C3D5A', '#2B6CB0', '#4299E1'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 25, pointsLabel: 'Preferred Miles',
    closeDay: 15, dueOffset: 25, creditLimit: 180000,
  },
  'shopee-pay-later': {
    id: 'shopee-pay-later', name: 'SPayLater', bank: 'Shopee', network: 'DIGITAL',
    rewardLabel: '0% Installment Promos', grad: ['#EE4D2D', '#FF7337', '#FF9668'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.7)',
    pointDivisor: 100, pointsLabel: 'Shopee Coins',
    closeDay: 24, dueDay: 5, creditLimit: 50000,
  },

  // --- ADDITIONAL DIRECTORY CARDS ---
  'bdo-shopmore': {
    id: 'bdo-shopmore', name: 'ShopMore Mastercard', bank: 'BDO', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱250 (SM Promo)', grad: ['#0033A0', '#0054E6', '#4D94FF'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 250, pointsLabel: 'BDO Points',
    closeDay: 20, dueOffset: 25, creditLimit: 50000,
  },
  'bdo-gold': {
    id: 'bdo-gold', name: 'Gold Visa/Mastercard', bank: 'BDO', network: 'VISA',
    rewardLabel: '1 pt / ₱50', grad: ['#B8860B', '#DAA520', '#FFD700'],
    textColor: '#1A1A1A', mutedColor: 'rgba(0,0,0,0.6)',
    pointDivisor: 50, pointsLabel: 'BDO Points',
    closeDay: 15, dueOffset: 25, creditLimit: 100000,
  },
  'bpi-rewards': {
    id: 'bpi-rewards', name: 'Rewards Card', bank: 'BPI', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱35', grad: ['#8B0000', '#B22222', '#CD5C5C'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 35, pointsLabel: 'BPI Points',
    closeDay: 12, dueOffset: 20, creditLimit: 40000,
  },
  'bpi-amore-plat': {
    id: 'bpi-amore-plat', name: 'Amore Platinum Cashback', bank: 'BPI', network: 'VISA',
    rewardLabel: '4% Dining / 1% Supermarket', grad: ['#000000', '#2E2E2E', '#5C5C5C'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    rebateRate: 0.04, rebateCap: 1250, pointsLabel: 'cashback',
    closeDay: 10, dueOffset: 20, creditLimit: 150000,
  },
  'ub-miles-world': {
    id: 'ub-miles-world', name: 'Miles+ World', bank: 'UnionBank', network: 'MASTERCARD',
    rewardLabel: '1 mile / ₱30', grad: ['#0C2340', '#1C3F60', '#3D6889'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 30, pointsLabel: 'Miles',
    closeDay: 5, dueOffset: 25, creditLimit: 250000,
  },
  'ub-reserve': {
    id: 'ub-reserve', name: 'Reserve', bank: 'UnionBank', network: 'VISA',
    rewardLabel: 'Premium Perks', grad: ['#000000', '#111111', '#222222'],
    textColor: '#D4AF37', mutedColor: 'rgba(212,175,55,0.6)',
    pointDivisor: 20, pointsLabel: 'Points',
    closeDay: 1, dueOffset: 25, creditLimit: 1000000,
  },
  'metro-mfree': {
    id: 'metro-mfree', name: 'M Free Mastercard', bank: 'Metrobank', network: 'MASTERCARD',
    rewardLabel: 'Zero Annual Fee', grad: ['#E6E6FA', '#D8BFD8', '#DDA0DD'],
    textColor: '#1A1A1A', mutedColor: 'rgba(0,0,0,0.6)',
    pointDivisor: 0, pointsLabel: 'None',
    closeDay: 22, dueOffset: 21, creditLimit: 40000,
  },
  'metro-world': {
    id: 'metro-world', name: 'World Mastercard', bank: 'Metrobank', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱20 (2x Intl)', grad: ['#2F4F4F', '#40826D', '#66CDAA'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 20, pointsLabel: 'Metro Points',
    closeDay: 15, dueOffset: 21, creditLimit: 300000,
  },
  'metro-cashback': {
    id: 'metro-cashback', name: 'Cashback Visa', bank: 'Metrobank', network: 'VISA',
    rewardLabel: 'Up to 8% Cashback', grad: ['#4682B4', '#5F9EA0', '#87CEEB'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    rebateRate: 0.08, rebateCap: 1000, pointsLabel: 'cashback',
    closeDay: 20, dueOffset: 21, creditLimit: 100000,
  },
  'rcbc-flex': {
    id: 'rcbc-flex', name: 'Flex Visa', bank: 'RCBC', network: 'VISA',
    rewardLabel: '2x Points on 2 Categories', grad: ['#00BFFF', '#1E90FF', '#4169E1'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 36, pointsLabel: 'RCBC Points',
    closeDay: 7, dueOffset: 25, creditLimit: 50000,
  },
  'rcbc-jcb-plat': {
    id: 'rcbc-jcb-plat', name: 'JCB Platinum', bank: 'RCBC', network: 'JCB',
    rewardLabel: '1 pt / ₱36 (Japan Perks)', grad: ['#C71585', '#DB7093', '#FF69B4'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 36, pointsLabel: 'RCBC Points',
    closeDay: 10, dueOffset: 25, creditLimit: 150000,
  },
  'ew-dolce-vita': {
    id: 'ew-dolce-vita', name: 'Dolce Vita Titanium', bank: 'EastWest', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱100', grad: ['#FFB6C1', '#FFC0CB', '#FFE4E1'],
    textColor: '#1A1A1A', mutedColor: 'rgba(0,0,0,0.6)',
    pointDivisor: 100, pointsLabel: 'Points',
    closeDay: 18, dueOffset: 21, creditLimit: 80000,
  },
  'sb-wave': {
    id: 'sb-wave', name: 'Wave Mastercard', bank: 'Security Bank', network: 'MASTERCARD',
    rewardLabel: '1% Online Cashback', grad: ['#20B2AA', '#48D1CC', '#40E0D0'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    rebateRate: 0.01, rebateCap: 3000, pointsLabel: 'cashback',
    closeDay: 10, dueOffset: 21, creditLimit: 75000,
  },
  'sb-plat-world': {
    id: 'sb-plat-world', name: 'World Mastercard', bank: 'Security Bank', network: 'MASTERCARD',
    rewardLabel: '1 pt / ₱20 (3x Travel)', grad: ['#36454F', '#536872', '#708090'],
    textColor: '#FFFFFF', mutedColor: 'rgba(255,255,255,0.6)',
    pointDivisor: 20, pointsLabel: 'Points',
    closeDay: 15, dueOffset: 21, creditLimit: 350000,
  }
};

export const CARD_ORDER: CardId[] = [
  'eastwest',
  'bdo-amex',
  'bdo-diamond',
  'bpi-amore-cashback',
  'hsbc-live-plus',
  'sb-complete-cashback',
  'ub-cashback-plat',
  'bdo-amex-explorer',
  'bpi-visa-sig',
  'ew-sia-krisflyer',
  'ub-rewards-plat',
  'metro-titanium-mc',
  'rcbc-black-plat',
  'rcbc-miles-sig',
  'rcbc-flex',
  'rcbc-jcb-plat',
  'bdo-shopmore',
  'bdo-gold',
  'bpi-rewards',
  'bpi-amore-plat',
  'ub-miles-world',
  'ub-reserve',
  'metro-mfree',
  'metro-world',
  'metro-cashback',
  'ew-dolce-vita',
  'sb-wave',
  'sb-plat-world',
  'shopee-pay-later',
];

export const EASTWEST_CAP = 1250;
export const EASTWEST_RATE = 0.0888;

export function calcEastwestRebate(amount: number, alreadyEarned: number, merchantName: string = '', category: string = ''): number {
  const isEligible = checkMerchantEligibility(merchantName, category);
  const rate = isEligible ? EASTWEST_RATE : 0.003;
  
  const remaining = Math.max(0, EASTWEST_CAP - alreadyEarned);
  return Math.min(amount * rate, remaining);
}

export function calcPoints(amount: number, divisor: number): number {
  return Math.floor(amount / divisor);
}

export function calcCardReward(
  cardId: CardId,
  amount: number,
  alreadyEarned: number,
  merchantName: string = '',
  category: string = ''
): { reward: number; type: 'cashback' | 'points' } {
  const card = CARDS[cardId];
  if (!card) return { reward: 0, type: 'points' };

  if (card.pointsLabel === 'cashback') {
    if (cardId === 'eastwest') {
      const earned = calcEastwestRebate(amount, alreadyEarned, merchantName, category);
      return { reward: earned, type: 'cashback' };
    }
    const rate = card.rebateRate || 0.01;
    const cap = card.rebateCap !== undefined ? card.rebateCap : Infinity;
    const remaining = Math.max(0, cap - alreadyEarned);
    const earned = Math.min(amount * rate, remaining);
    return { reward: earned, type: 'cashback' };
  } else {
    const divisor = card.pointDivisor || 30;
    const earned = calcPoints(amount, divisor);
    return { reward: earned, type: 'points' };
  }
}

export function getSmartRecommendation(ewRebateEarned: number): {
  cardId: CardId; headline: string; sub: string; status: 'active' | 'capped';
} {
  if (ewRebateEarned >= EASTWEST_CAP) {
    return {
      cardId: 'bdo-amex', status: 'capped',
      headline: 'Switch to BDO Amex',
      sub: 'EastWest ₱1,250 cap reached. Amex earns 1 pt/₱45 — far better than Diamond\'s 1 pt/₱1,000.',
    };
  }
  const remaining = EASTWEST_CAP - ewRebateEarned;
  const spendLeft = remaining / EASTWEST_RATE;
  return {
    cardId: 'eastwest', status: 'active',
    headline: 'Use EastWest First',
    sub: `Best rate at 8.88%. ₱${remaining.toFixed(2)} rebate left this month — spend ₱${spendLeft.toFixed(2)} more to maximize.`,
  };
}

export type CycleStatus = 'green' | 'yellow' | 'red';

export function getCardCycleStatus(cardId: CardId, userConfig?: UserCardConfig): { 
  status: CycleStatus; 
  closeDate: Date; 
  dueDate: Date; 
} {
  const card = CARDS[cardId];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const closeDay = userConfig?.closeDay ?? card.closeDay;
  const dueDay = userConfig?.dueDay ?? card.dueDay;
  const dueOffset = userConfig?.dueOffset ?? card.dueOffset;

  // 1. Determine the "Target" Closing Date for a transaction made TODAY
  let targetClose = new Date(currentYear, currentMonth, closeDay);
  
  // If today is past this month's closing day, the transaction belongs to NEXT month's cycle
  if (now.getDate() > closeDay) {
    targetClose = new Date(currentYear, currentMonth + 1, closeDay);
  }

  // 2. Calculate the Due Date for THAT specific target closing date
  let targetDue: Date;
  if (dueDay) {
    // Fixed due day (usually follows the close day, potentially in the next month)
    const dueMonthOffset = dueDay < closeDay ? 1 : 0;
    targetDue = new Date(targetClose.getFullYear(), targetClose.getMonth() + dueMonthOffset, dueDay);
  } else {
    // Variable due date (e.g., 25 days after close)
    targetDue = new Date(targetClose.getTime() + (dueOffset || 0) * 24 * 60 * 60 * 1000);
  }

  // 3. Determine Status Light
  // We check the status relative to the "Upcoming" payment (the one that JUST closed)
  let upcomingClose = new Date(currentYear, currentMonth, closeDay);
  if (now.getDate() <= closeDay) {
    upcomingClose = new Date(currentYear, currentMonth - 1, closeDay);
  }
  
  let upcomingDue: Date;
  if (dueDay) {
    const dueMonthOffset = dueDay < closeDay ? 1 : 0;
    upcomingDue = new Date(upcomingClose.getFullYear(), upcomingClose.getMonth() + dueMonthOffset, dueDay);
  } else {
    upcomingDue = new Date(upcomingClose.getTime() + (dueOffset || 0) * 24 * 60 * 60 * 1000);
  }

  const daysToDue = (upcomingDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  let status: CycleStatus = 'green';
  if (now > upcomingClose && now <= upcomingDue) {
    status = 'yellow';
    if (daysToDue <= 3) status = 'red';
  }

  return { status, closeDate: targetClose, dueDate: targetDue };
}

/**
 * Returns the billing cycle month (YYYY-MM) for a given transaction date and card close day.
 * If the transaction happens after the close day, it belongs to the next month's billing cycle.
 */
export function getCycleMonth(date: Date, closeDay: number): string {
  const d = new Date(date);
  if (d.getDate() > closeDay) {
    // Moves to next month's cycle
    d.setMonth(d.getMonth() + 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
