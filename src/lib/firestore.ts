import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, Timestamp, type Unsubscribe,
  doc, updateDoc, deleteDoc, setDoc,
  limit, startAfter, getDocs, getCountFromServer, DocumentData, QueryDocumentSnapshot
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
  return onSnapshot(
    q,
    (snap) => {
      const txns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      onData(txns);
    },
    (err) => {
      console.error('Error subscribing to transactions:', err);
      onData([]);
    }
  );
}

export function subscribeToRecentTransactions(
  userId: string,
  month: string,
  limitCount: number = 5,
  cardId: CardId | null = null,
  onData: (txns: Transaction[]) => void
): Unsubscribe {
  let q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('month', '==', month),
    orderBy('date', 'desc')
  );
  if (cardId) {
    q = query(q, where('cardId', '==', cardId));
  }
  q = query(q, limit(limitCount));
  
  return onSnapshot(
    q,
    (snap) => {
      const txns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      onData(txns);
    },
    (err) => {
      console.error('Error subscribing to recent transactions:', err);
      onData([]);
    }
  );
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

export interface UserCardConfig {
  limit: number;
  closeDay?: number;
  dueDay?: number;
  dueOffset?: number;
}

export interface UserSettings {
  creditLimits?: Record<string, number>;
  cardConfigs?: Record<string, UserCardConfig>;
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  const ref = doc(db, 'settings', userId);
  const keys = Object.keys(settings);
  if (keys.length > 0) {
    await setDoc(ref, settings, { mergeFields: keys });
  }
}

export function subscribeToUserSettings(
  userId: string,
  onData: (settings: UserSettings | null) => void,
): Unsubscribe {
  const ref = doc(db, 'settings', userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserSettings);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.error('Error subscribing to user settings:', err);
      onData(null);
    }
  );
}

export async function getTransactionsCount(
  userId: string,
  month: string,
  cardId: CardId | null = null
): Promise<number> {
  let q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('month', '==', month)
  );
  if (cardId) {
    q = query(q, where('cardId', '==', cardId));
  }
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function fetchRecentTransactions(
  userId: string,
  month: string,
  limitCount: number = 5
): Promise<Transaction[]> {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('month', '==', month),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function fetchPaginatedTransactions(
  userId: string,
  month: string,
  pageSize: number = 8,
  startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  cardId: CardId | null = null
): Promise<{ txns: Transaction[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  let q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('month', '==', month),
    orderBy('date', 'desc')
  );

  if (cardId) {
    q = query(q, where('cardId', '==', cardId));
  }

  q = query(q, limit(pageSize));

  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }

  const snap = await getDocs(q);
  const txns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
  const lastVisible = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { txns, lastVisible };
}
