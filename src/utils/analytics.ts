import { Transaction, MonthlyStats } from '../types/finance';

export function calculateMonthlyStats(transactions: Transaction[], selectedMonth: string): MonthlyStats {
  // selectedMonth: "YYYY-MM"
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  
  let totalIncome = 0;
  let totalExpense = 0;
  const expensesByCategory: { [cat: string]: number } = {};
  const incomesByCategory: { [cat: string]: number } = {};

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Initialize daily array
  const dailyMap: { [day: number]: { income: number; expense: number } } = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = { income: 0, expense: 0 };
  }

  for (const t of monthTransactions) {
    const day = parseInt(t.date.split('-')[2], 10);
    if (t.type === 'income') {
      totalIncome += t.amount;
      incomesByCategory[t.category] = (incomesByCategory[t.category] || 0) + t.amount;
      if (dailyMap[day]) dailyMap[day].income += t.amount;
    } else {
      totalExpense += t.amount;
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      if (dailyMap[day]) dailyMap[day].expense += t.amount;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 && netBalance > 0 ? (netBalance / totalIncome) * 100 : 0;
  
  // Calculate days passed or days with expense
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysCount = selectedMonth === currentMonthStr ? Math.max(1, now.getDate()) : daysInMonth;
  const avgExpensePerDay = totalExpense / daysCount;

  const dailyTrend = [];
  let runningBalance = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayData = dailyMap[d] || { income: 0, expense: 0 };
    runningBalance += (dayData.income - dayData.expense);
    const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
    dailyTrend.push({
      date: dateStr,
      day: d,
      income: dayData.income,
      expense: dayData.expense,
      balance: runningBalance,
    });
  }

  return {
    month: selectedMonth,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    transactionCount: monthTransactions.length,
    avgExpensePerDay,
    expensesByCategory,
    incomesByCategory,
    dailyTrend,
  };
}

export function getPreviousMonth(monthStr: string): string {
  const [yearStr, mStr] = monthStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(mStr, 10) - 1;
  if (m === 0) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function getNextMonth(monthStr: string): string {
  const [yearStr, mStr] = monthStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(mStr, 10) + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}
