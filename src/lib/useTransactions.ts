'use client';
import { useEffect, useState, useMemo } from 'react';
import { subscribeToTransactions, currentMonth, type Transaction } from './firestore';
import { calcEastwestRebate, calcPoints, EASTWEST_CAP, CARDS } from './cards';

export interface MonthlyStats {
  ewSpend: number; ewRebate: number; ewCapHit: boolean;
  amexSpend: number; amexPoints: number;
  diamondSpend: number; diamondPoints: number;
  totalSpend: number;
  lifetimeRebate: number;
  lifetimeAmexPoints: number;
  lifetimeDiamondPoints: number;
}

export function useTransactions(userId: string) {
  const [all, setAll] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
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

    // Calculate Lifetime totals first
    for (const t of all) {
      if (t.cardId === 'eastwest') lifetimeRebate += t.rebateEarned;
      else if (t.cardId === 'bdo-amex') lifetimeAmexPoints += t.pointsEarned;
      else if (t.cardId === 'bdo-diamond') lifetimeDiamondPoints += t.pointsEarned;
    }

    // Recalculate monthly in chronological order for correct cap logic
    const sorted = [...thisMonth].sort((a, b) => a.date.seconds - b.date.seconds);
    for (const t of sorted) {
      if (t.cardId === 'eastwest') {
        const earned = calcEastwestRebate(t.amount, ewRebate);
        ewSpend += t.amount; ewRebate += earned;
      } else if (t.cardId === 'bdo-amex') {
        amexSpend += t.amount;
        amexPoints += calcPoints(t.amount, CARDS['bdo-amex'].pointDivisor!);
      } else {
        diamondSpend += t.amount;
        diamondPoints += calcPoints(t.amount, CARDS['bdo-diamond'].pointDivisor!);
      }
    }
    return {
      ewSpend, ewRebate, ewCapHit: ewRebate >= EASTWEST_CAP,
      amexSpend, amexPoints, diamondSpend, diamondPoints,
      totalSpend: ewSpend + amexSpend + diamondSpend,
      lifetimeRebate, lifetimeAmexPoints, lifetimeDiamondPoints,
    };
  }, [all, thisMonth]);

  return { all, thisMonth, stats, loading };
}
