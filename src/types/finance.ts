export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  category: string; // 'all' or specific category
  limitAmount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage (0-100)
  transactionCount: number;
  avgExpensePerDay: number;
  expensesByCategory: { [category: string]: number };
  incomesByCategory: { [category: string]: number };
  dailyTrend: {
    date: string;
    day: number;
    income: number;
    expense: number;
    balance: number;
  }[];
}
