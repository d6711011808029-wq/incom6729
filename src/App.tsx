/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { BudgetBar } from './components/BudgetBar';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ExportModal } from './components/ExportModal';
import { InsightsCard } from './components/InsightsCard';
import { Transaction, Budget, TransactionType } from './types/finance';
import { 
  subscribeTransactions, 
  subscribeBudgets, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  saveMonthlyBudget 
} from './services/transactionService';
import { testConnection, projectId } from './lib/firebase';
import { calculateMonthlyStats, getPreviousMonth } from './utils/analytics';
import { seedSampleDataForMonth } from './utils/sampleData';
import { LogIn, Sparkles, AlertCircle, Database, CheckCircle2 } from 'lucide-react';

function DashboardContent() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  // Selected viewing month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [guestTransactions, setGuestTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('guest_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [guestBudgets, setGuestBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('guest_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Test Firebase connection on mount as mandated by Skill
  useEffect(() => {
    testConnection().then((connected) => {
      setDbConnected(connected);
    });
  }, []);

  // Save guest transactions to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_transactions', JSON.stringify(guestTransactions));
      localStorage.setItem('guest_budgets', JSON.stringify(guestBudgets));
    }
  }, [guestTransactions, guestBudgets, user]);

  // Subscribe to Firebase Firestore if logged in
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setIsLoadingData(true);
      const unsubTx = subscribeTransactions(
        user.uid,
        (data) => {
          setTransactions(data);
          setIsLoadingData(false);
        },
        (err) => {
          console.error('Failed to subscribe to transactions:', err);
          setIsLoadingData(false);
        }
      );

      const unsubBudget = subscribeBudgets(
        user.uid,
        (data) => {
          setBudgets(data);
        },
        (err) => {
          console.error('Failed to subscribe to budgets:', err);
        }
      );

      return () => {
        unsubTx();
        unsubBudget();
      };
    } else {
      // Guest mode
      setTransactions(guestTransactions);
      setBudgets(guestBudgets);
      setIsLoadingData(false);
    }
  }, [user, authLoading, guestTransactions, guestBudgets]);

  const activeTransactions = user ? transactions : guestTransactions;
  const activeBudgets = user ? budgets : guestBudgets;

  // Current Month Stats
  const currentStats = useMemo(() => {
    return calculateMonthlyStats(activeTransactions, currentMonth);
  }, [activeTransactions, currentMonth]);

  // Previous Month Stats for MoM comparison
  const previousMonthStr = useMemo(() => getPreviousMonth(currentMonth), [currentMonth]);
  const previousStats = useMemo(() => {
    return calculateMonthlyStats(activeTransactions, previousMonthStr);
  }, [activeTransactions, previousMonthStr]);

  // Current Month Budget
  const currentBudget = useMemo(() => {
    return activeBudgets.find((b) => b.month === currentMonth && b.category === 'all');
  }, [activeBudgets, currentMonth]);

  // Handlers
  const handleSaveTransaction = async (txData: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => {
    if (user) {
      if (editingTransaction) {
        await updateTransaction(
          user.uid,
          editingTransaction.id,
          txData,
          editingTransaction.createdAt
        );
      } else {
        await addTransaction(user.uid, txData);
      }
    } else {
      // Guest mode
      if (editingTransaction) {
        setGuestTransactions((prev) =>
          prev.map((t) =>
            t.id === editingTransaction.id
              ? { ...t, ...txData, updatedAt: new Date().toISOString() }
              : t
          )
        );
      } else {
        const newId = `guest_tx_${Date.now()}`;
        const newTx: Transaction = {
          id: newId,
          userId: 'guest',
          ...txData,
          createdAt: new Date().toISOString(),
        };
        setGuestTransactions((prev) => [newTx, ...prev]);
      }
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      await deleteTransaction(id);
    } else {
      setGuestTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSaveBudget = async (limitAmount: number) => {
    if (user) {
      await saveMonthlyBudget(
        user.uid,
        currentMonth,
        limitAmount,
        currentBudget?.id,
        currentBudget?.createdAt
      );
    } else {
      const budgetId = currentBudget?.id || `guest_bg_${currentMonth}`;
      const newBudget: Budget = {
        id: budgetId,
        userId: 'guest',
        month: currentMonth,
        category: 'all',
        limitAmount,
        createdAt: currentBudget?.createdAt || new Date().toISOString(),
        ...(currentBudget ? { updatedAt: new Date().toISOString() } : {}),
      };
      setGuestBudgets((prev) => {
        const filtered = prev.filter((b) => b.month !== currentMonth || b.category !== 'all');
        return [...filtered, newBudget];
      });
    }
  };

  const handleLoadSampleData = async () => {
    try {
      setIsSeeding(true);
      if (user) {
        await seedSampleDataForMonth(user.uid, currentMonth);
      } else {
        // Seed into guest state
        const [year, month] = currentMonth.split('-');
        const sampleTxs: Transaction[] = [
          { id: `guest_${Date.now()}_1`, userId: 'guest', type: 'income', amount: 48000, category: 'เงินเดือน / ค่าจ้างประจำ', description: 'เงินเดือนประจำเดือน', date: `${year}-${month}-01`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_2`, userId: 'guest', type: 'income', amount: 6500, category: 'งานเสริม / ฟรีแลนซ์', description: 'งานออกแบบและพัฒนาเว็บไซต์', date: `${year}-${month}-12`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_3`, userId: 'guest', type: 'expense', amount: 8500, category: 'ที่พัก / ค่าน้ำ-ไฟ-เน็ต', description: 'ค่าเช่าห้องพักประจำเดือน', date: `${year}-${month}-02`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_4`, userId: 'guest', type: 'expense', amount: 1650, category: 'ที่พัก / ค่าน้ำ-ไฟ-เน็ต', description: 'ค่าน้ำ ค่าไฟ ค่าอินเทอร์เน็ต', date: `${year}-${month}-03`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_5`, userId: 'guest', type: 'expense', amount: 1200, category: 'การเดินทาง / ยานพาหนะ', description: 'เติมน้ำมันรถยนต์', date: `${year}-${month}-05`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_6`, userId: 'guest', type: 'expense', amount: 450, category: 'อาหารและเครื่องดื่ม', description: 'มื้อกลางวันกับทีมงาน', date: `${year}-${month}-07`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_7`, userId: 'guest', type: 'expense', amount: 2500, category: 'ช้อปปิ้ง / ของใช้', description: 'ซื้อเสื้อผ้าและของใช้จำเป็น', date: `${year}-${month}-10`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_8`, userId: 'guest', type: 'expense', amount: 5000, category: 'ออมเงิน / ลงทุน', description: 'ซื้อกองทุนรวม DCA', date: `${year}-${month}-15`, createdAt: new Date().toISOString() },
          { id: `guest_${Date.now()}_9`, userId: 'guest', type: 'expense', amount: 650, category: 'สุขภาพ / ยารักษาโรค', description: 'วิตามินบำรุงสุขภาพ', date: `${year}-${month}-18`, createdAt: new Date().toISOString() },
        ];
        setGuestTransactions((prev) => [...sampleTxs, ...prev]);
        setGuestBudgets((prev) => [
          ...prev.filter(b => b.month !== currentMonth),
          { id: `guest_bg_${currentMonth}`, userId: 'guest', month: currentMonth, category: 'all', limitAmount: 25000, createdAt: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Failed to seed sample data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-16 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        isSeeding={isSeeding}
        transactionCount={currentStats.transactionCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Guest Warning / Cloud Sync Banner */}
        {!user && !authLoading && (
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  กำลังใช้งานในโหมดทดลอง (Guest Mode)
                </p>
                <p className="text-xs text-slate-600">
                  เข้าสู่ระบบด้วย Google เพื่อซิงค์และบันทึกข้อมูลแบบเรียลไทม์ลงใน Firebase โครงการ <strong className="font-mono text-emerald-800">{projectId}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              เข้าสู่ระบบเพื่อบันทึก Firebase
            </button>
          </div>
        )}

        {/* 1. Monthly Summary Cards */}
        <SummaryCards stats={currentStats} previousStats={previousStats} />

        {/* 2. Monthly Budget Progress Bar */}
        <BudgetBar
          budget={currentBudget}
          totalExpense={currentStats.totalExpense}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 3. Analytical Charts */}
        <AnalyticsCharts stats={currentStats} />

        {/* 4. Automated Financial Insights */}
        <InsightsCard stats={currentStats} budget={currentBudget} />

        {/* 5. Transactions History & Filter List */}
        <TransactionList
          transactions={activeTransactions}
          selectedMonth={currentMonth}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
        />

      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultDate={`${currentMonth}-01`}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={currentMonth}
        existingBudget={currentBudget}
        onSaveBudget={handleSaveBudget}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={activeTransactions}
        currentMonth={currentMonth}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
