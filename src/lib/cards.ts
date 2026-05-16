export type CardId = 'eastwest' | 'bdo-amex' | 'bdo-diamond';
export type TransactionCategory = 'dining' | 'groceries' | 'shopping' | 'travel' | 'bills' | 'other';
import { checkMerchantEligibility } from './merchantRules';

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
};

export const CARD_ORDER: CardId[] = ['eastwest', 'bdo-amex', 'bdo-diamond'];

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

export function getCardCycleStatus(cardId: CardId): { 
  status: CycleStatus; 
  closeDate: Date; 
  dueDate: Date; 
} {
  const card = CARDS[cardId];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Determine the "Target" Closing Date for a transaction made TODAY
  let targetClose = new Date(currentYear, currentMonth, card.closeDay);
  
  // If today is past this month's closing day, the transaction belongs to NEXT month's cycle
  if (now.getDate() > card.closeDay) {
    targetClose = new Date(currentYear, currentMonth + 1, card.closeDay);
  }

  // 2. Calculate the Due Date for THAT specific target closing date
  let targetDue: Date;
  if (card.dueDay) {
    // Fixed due day (usually follows the close day, potentially in the next month)
    const dueMonthOffset = card.dueDay < card.closeDay ? 1 : 0;
    targetDue = new Date(targetClose.getFullYear(), targetClose.getMonth() + dueMonthOffset, card.dueDay);
  } else {
    // Variable due date (e.g., 25 days after close)
    targetDue = new Date(targetClose.getTime() + (card.dueOffset || 0) * 24 * 60 * 60 * 1000);
  }

  // 3. Determine Status Light
  // We check the status relative to the "Upcoming" payment (the one that JUST closed)
  let upcomingClose = new Date(currentYear, currentMonth, card.closeDay);
  if (now.getDate() <= card.closeDay) {
    upcomingClose = new Date(currentYear, currentMonth - 1, card.closeDay);
  }
  
  let upcomingDue: Date;
  if (card.dueDay) {
    const dueMonthOffset = card.dueDay < card.closeDay ? 1 : 0;
    upcomingDue = new Date(upcomingClose.getFullYear(), upcomingClose.getMonth() + dueMonthOffset, card.dueDay);
  } else {
    upcomingDue = new Date(upcomingClose.getTime() + (card.dueOffset || 0) * 24 * 60 * 60 * 1000);
  }

  const daysToDue = (upcomingDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  let status: CycleStatus = 'green';
  if (now > upcomingClose && now <= upcomingDue) {
    status = 'yellow';
    if (daysToDue <= 3) status = 'red';
  }

  return { status, closeDate: targetClose, dueDate: targetDue };
}
