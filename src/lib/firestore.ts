import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, Timestamp, type Unsubscribe,
  doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CardId, TransactionCategory } from './cards';

export interface Transaction {
  id?: string;
  userId: string;
  cardId: CardId;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  date: Timestamp;
  month: string;       // "YYYY-MM"
  rebateEarned: number;
  pointsEarned: number;
}

export function subscribeToTransactions(
  userId: string,
  onData: (txns: Transaction[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const txns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
    onData(txns);
  });
}

export async function addTransaction(txn: Omit<Transaction, 'id'>): Promise<void> {
  await addDoc(collection(db, 'transactions'), txn);
}

export async function updateTransaction(id: string, txn: Partial<Transaction>): Promise<void> {
  const ref = doc(db, 'transactions', id);
  await updateDoc(ref, txn);
}

export async function deleteTransaction(id: string): Promise<void> {
  const ref = doc(db, 'transactions', id);
  await deleteDoc(ref);
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export interface UserSettings {
  creditLimits: Record<string, number>;
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  const ref = doc(db, 'settings', userId);
  await updateDoc(ref, settings as any).catch(async (err) => {
    // If doc doesn't exist, create it
    if (err.code === 'not-found') {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(ref, settings);
    } else {
      throw err;
    }
  });
}

export function subscribeToUserSettings(
  userId: string,
  onData: (settings: UserSettings) => void,
): Unsubscribe {
  const ref = doc(db, 'settings', userId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onData(snap.data() as UserSettings);
    }
  });
}
