'use client';
import { useEffect, useState, useMemo } from 'react';
import { subscribeToTransactions, currentMonth, type Transaction } from './firestore';
import { calcEastwestRebate, calcPoints, EASTWEST_CAP, CARDS } from './cards';

export interface CardStats {
  spend: number;
  reward: number;
  lifetimeReward: number;
}

export interface MonthlyStats {
  ewSpend: number; ewRebate: number; ewCapHit: boolean;
  amexSpend: number; amexPoints: number;
  diamondSpend: number; diamondPoints: number;
  totalSpend: number;
  lifetimeRebate: number;
  lifetimeAmexPoints: number;
  lifetimeDiamondPoints: number;
  cardStats: Record<string, CardStats>;
}

export function useTransactions(userId: string) {
  const [all, setAll] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToTransactions(userId, (txns) => {
      setAll(txns);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const month = currentMonth();
  const thisMonth = useMemo(() => all.filter((t) => t.month === month), [all, month]);

  const stats = useMemo<MonthlyStats>(() => {
    let ewSpend = 0, ewRebate = 0;
    let amexSpend = 0, amexPoints = 0;
    let diamondSpend = 0, diamondPoints = 0;
    
    let lifetimeRebate = 0;
    let lifetimeAmexPoints = 0;
    let lifetimeDiamondPoints = 0;

    // Initialize stats object for all defined cards
    const cardStats: Record<string, CardStats> = {};
    for (const id of Object.keys(CARDS)) {
      cardStats[id] = { spend: 0, reward: 0, lifetimeReward: 0 };
    }

    // Calculate Lifetime totals first
    for (const t of all) {
      if (!cardStats[t.cardId]) {
        cardStats[t.cardId] = { spend: 0, reward: 0, lifetimeReward: 0 };
      }
      cardStats[t.cardId].lifetimeReward += t.rebateEarned || t.pointsEarned || 0;

      if (t.cardId === 'eastwest') lifetimeRebate += t.rebateEarned;
      else if (t.cardId === 'bdo-amex') lifetimeAmexPoints += t.pointsEarned;
      else if (t.cardId === 'bdo-diamond') lifetimeDiamondPoints += t.pointsEarned;
    }

    // Recalculate monthly in chronological order for correct cap logic
    const sorted = [...thisMonth].sort((a, b) => a.date.seconds - b.date.seconds);
    for (const t of sorted) {
      const id = t.cardId;
      if (!cardStats[id]) {
        cardStats[id] = { spend: 0, reward: 0, lifetimeReward: 0 };
      }

      let earned = 0;
      if (id === 'eastwest') {
        earned = calcEastwestRebate(t.amount, ewRebate);
      } else {
        const card = CARDS[id];
        if (card) {
          if (card.pointsLabel === 'cashback') {
            const rate = card.rebateRate || 0.01;
            const cap = card.rebateCap !== undefined ? card.rebateCap : Infinity;
            const remaining = Math.max(0, cap - cardStats[id].reward);
            earned = Math.min(t.amount * rate, remaining);
          } else {
            earned = calcPoints(t.amount, card.pointDivisor || 30);
          }
        }
      }

      cardStats[id].spend += t.amount;
      cardStats[id].reward += earned;

      if (id === 'eastwest') {
        ewSpend += t.amount; ewRebate += earned;
      } else if (id === 'bdo-amex') {
        amexSpend += t.amount;
        amexPoints += earned;
      } else if (id === 'bdo-diamond') {
        diamondSpend += t.amount;
        diamondPoints += earned;
      }
    }

    const totalSpend = Object.values(cardStats).reduce((acc, curr) => acc + curr.spend, 0);

    return {
      ewSpend, ewRebate, ewCapHit: ewRebate >= EASTWEST_CAP,
      amexSpend, amexPoints, diamondSpend, diamondPoints,
      totalSpend,
      lifetimeRebate, lifetimeAmexPoints, lifetimeDiamondPoints,
      cardStats,
    };
  }, [all, thisMonth]);

  return { all, thisMonth, stats, loading };
}
