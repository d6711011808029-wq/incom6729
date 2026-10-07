import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { MonthlyStats } from '../types/finance';
import { formatThaiCurrency } from '../constants/categories';

interface SummaryCardsProps {
  stats: MonthlyStats;
  previousStats?: MonthlyStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, previousStats }) => {
  const { totalIncome, totalExpense, netBalance, savingsRate, avgExpensePerDay } = stats;

  // Calculate MoM percentage change if previous stats exist
  const incomeDiff = previousStats && previousStats.totalIncome > 0
    ? ((totalIncome - previousStats.totalIncome) / previousStats.totalIncome) * 100
    : null;

  const expenseDiff = previousStats && previousStats.totalExpense > 0
    ? ((totalExpense - previousStats.totalExpense) / previousStats.totalExpense) * 100
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับรวมประจำเดือน
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {formatThaiCurrency(totalIncome)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {incomeDiff !== null ? (
            <span className={`inline-flex items-center font-medium ${incomeDiff >= 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {incomeDiff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(incomeDiff).toFixed(1)}% เทียบเดือนก่อน
            </span>
          ) : (
            <span className="text-slate-400">สรุปภาพรวมรายรับ</span>
          )}
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายรวมประจำเดือน
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {formatThaiCurrency(totalExpense)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {expenseDiff !== null ? (
            <span className={`inline-flex items-center font-medium ${expenseDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {expenseDiff > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(expenseDiff).toFixed(1)}% เทียบเดือนก่อน
            </span>
          ) : (
            <span className="text-slate-400">สรุปภาพรวมรายจ่าย</span>
          )}
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className={`absolute top-0 right-0 w-24 h-24 ${netBalance >= 0 ? 'bg-teal-50' : 'bg-amber-50'} rounded-full blur-xl -mr-6 -mt-6 pointer-events-none`}></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ยอดเงินคงเหลือสุทธิ
          </span>
          <div className={`w-9 h-9 rounded-xl ${netBalance >= 0 ? 'bg-teal-100/70 text-teal-600' : 'bg-amber-100/70 text-amber-600'} flex items-center justify-center`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${netBalance >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
          {formatThaiCurrency(netBalance)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>{netBalance >= 0 ? 'สถานะกระแสเงินสด: เป็นบวก' : 'รายจ่ายเกินรายรับในเดือนนี้'}</span>
        </div>
      </div>

      {/* Savings Rate & Daily Avg */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            อัตราการออมเงิน
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-bold text-indigo-900 tracking-tight">
            {savingsRate.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">ของรายรับ</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          <span>เฉลี่ยใช้จ่ายวันละ {formatThaiCurrency(avgExpensePerDay)}</span>
        </div>
      </div>
    </div>
  );
};
