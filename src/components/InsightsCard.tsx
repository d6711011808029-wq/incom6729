import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { MonthlyStats, Budget } from '../types/finance';
import { formatThaiCurrency } from '../constants/categories';

interface InsightsCardProps {
  stats: MonthlyStats;
  budget?: Budget;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ stats, budget }) => {
  const { totalIncome, totalExpense, netBalance, savingsRate, expensesByCategory, avgExpensePerDay } = stats;

  if (stats.transactionCount === 0) return null;

  // Find top category
  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
  const topCategoryPct = topCategory && totalExpense > 0 ? (topCategory[1] / totalExpense) * 100 : 0;

  // Estimated month-end total expense based on current daily avg
  const [yearStr, monthStr] = stats.month.split('-');
  const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
  const projectedTotalExpense = avgExpensePerDay * daysInMonth;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold tracking-wide text-indigo-100">
          สรุปบทวิเคราะห์ & คำแนะนำทางการเงิน (Financial Insights)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Insight 1: Savings Status */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5 text-indigo-200 font-semibold">
            {netBalance >= 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            สถานะการเงินเดือนนี้
          </div>
          <p className="text-slate-300 leading-relaxed">
            {netBalance >= 0 ? (
              savingsRate >= 20 ? (
                <>ยอดเยี่ยม! อัตราการออมเงินอยู่ที่ <strong className="text-emerald-400">{savingsRate.toFixed(1)}%</strong> ตรงตามหลักวางแผนการเงิน 50/30/20</>
              ) : (
                <>มีเงินคงเหลือ <strong className="text-teal-300">{formatThaiCurrency(netBalance)}</strong> (ออมได้ {savingsRate.toFixed(1)}%) แนะนำเพิ่มสัดส่วนออมให้อย่างน้อย 20%</>
              )
            ) : (
              <>ระวังรายจ่ายเกินรายรับอยู่ <strong className="text-rose-400">{formatThaiCurrency(Math.abs(netBalance))}</strong> ควรทบทวนการใช้จ่ายหมวดหมู่ที่ไม่จำเป็น</>
            )}
          </p>
        </div>

        {/* Insight 2: Top Expense Category */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5 text-indigo-200 font-semibold">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            หมวดหมู่ที่ใช้เงินมากที่สุด
          </div>
          <p className="text-slate-300 leading-relaxed">
            {topCategory ? (
              <>
                คุณใช้จ่ายไปกับ <strong className="text-amber-300">{topCategory[0]}</strong> มากที่สุดที่{' '}
                <strong className="text-white">{formatThaiCurrency(topCategory[1])}</strong> ({topCategoryPct.toFixed(1)}% ของรายจ่ายทั้งหมด)
              </>
            ) : (
              'ยังไม่มีข้อมูลการใช้จ่ายในหมวดหมู่ต่างๆ'
            )}
          </p>
        </div>

        {/* Insight 3: Spending Pace & Projection */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5 text-indigo-200 font-semibold">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            ประมาณการสิ้นเดือน
          </div>
          <p className="text-slate-300 leading-relaxed">
            เฉลี่ยใช้จ่ายวันละ <strong>{formatThaiCurrency(avgExpensePerDay)}</strong> หากคงอัตรานี้ สิ้นเดือนจะใช้จ่ายประมาณ{' '}
            <strong className="text-sky-300">{formatThaiCurrency(projectedTotalExpense)}</strong>
            {budget && budget.limitAmount > 0 && (
              projectedTotalExpense > budget.limitAmount ? (
                <span className="text-rose-400 block mt-1">⚠️ อาจเกินงบที่ตั้งไว้ {formatThaiCurrency(budget.limitAmount)}</span>
              ) : (
                <span className="text-emerald-400 block mt-1">✓ อยู่ในกรอบงบประมาณ {formatThaiCurrency(budget.limitAmount)}</span>
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
