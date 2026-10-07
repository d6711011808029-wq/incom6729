import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Transaction, Budget } from '../types/finance';

function generateValidId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
}

export async function addTransaction(
  userId: string,
  tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<Transaction> {
  const id = generateValidId('tx');
  const path = `transactions/${id}`;
  const now = new Date().toISOString();
  
  const newTx: Transaction = {
    id,
    userId,
    type: tx.type,
    amount: Number(tx.amount),
    category: tx.category.trim(),
    description: (tx.description || '').trim(),
    date: tx.date,
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'transactions', id), newTx);
    return newTx;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTransaction(
  userId: string,
  id: string,
  tx: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>,
  originalCreatedAt: string
): Promise<void> {
  const path = `transactions/${id}`;
  const now = new Date().toISOString();

  const updatedData: Record<string, unknown> = {
    userId,
    createdAt: originalCreatedAt,
    updatedAt: now,
  };

  if (tx.type !== undefined) updatedData.type = tx.type;
  if (tx.amount !== undefined) updatedData.amount = Number(tx.amount);
  if (tx.category !== undefined) updatedData.category = tx.category.trim();
  if (tx.description !== undefined) updatedData.description = (tx.description || '').trim();
  if (tx.date !== undefined) updatedData.date = tx.date;

  try {
    await setDoc(doc(db, 'transactions', id), updatedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const path = `transactions/${id}`;
  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colPath = 'transactions';
  const q = query(
    collection(db, colPath),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Transaction;
        list.push({ ...data, id: docSnap.id });
      });
      // Sort descending by date, then createdAt
      list.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      onData(list);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

// Monthly Budget methods
export async function saveMonthlyBudget(
  userId: string,
  month: string, // YYYY-MM
  limitAmount: number,
  existingBudgetId?: string,
  existingCreatedAt?: string
): Promise<void> {
  const id = existingBudgetId || `bg_${month.replace('-', '_')}_${userId.slice(0, 8)}`;
  const path = `budgets/${id}`;
  const now = new Date().toISOString();

  const budgetData: Budget = {
    id,
    userId,
    month,
    category: 'all',
    limitAmount: Number(limitAmount),
    createdAt: existingCreatedAt || now,
    ...(existingCreatedAt ? { updatedAt: now } : {}),
  };

  try {
    await setDoc(doc(db, 'budgets', id), budgetData);
  } catch (error) {
    handleFirestoreError(error, existingBudgetId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export function subscribeBudgets(
  userId: string,
  onData: (budgets: Budget[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colPath = 'budgets';
  const q = query(
    collection(db, colPath),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Budget[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Budget), id: docSnap.id });
      });
      onData(list);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}
