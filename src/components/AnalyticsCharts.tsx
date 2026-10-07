import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Info,
  DollarSign
} from 'lucide-react';
import { MonthlyStats } from '../types/finance';
import { formatThaiCurrency, getCategoryInfo } from '../constants/categories';

interface AnalyticsChartsProps {
  stats: MonthlyStats;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'daily' | 'trend'>('category');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; income: number; expense: number } | null>(null);

  const { expensesByCategory, dailyTrend, totalExpense, totalIncome } = stats;

  // Prepare categories sorted by amount descending
  const categoryEntries = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      info: getCategoryInfo(category, 'expense'),
    }))
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut Chart Calculation
  const donutRadius = 70;
  const donutStrokeWidth = 24;
  const circumference = 2 * Math.PI * donutRadius;
  let accumulatedAngle = 0;

  const donutSlices = categoryEntries.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += (item.percentage / 100) * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Daily Chart Calculation (find max for scaling)
  const maxDailyValue = Math.max(
    ...dailyTrend.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            กราฟวิเคราะห์ข้อมูลการเงินประจำเดือน
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            สัดส่วนหมวดหมู่ เปรียบเทียบรายรับ-รายจ่าย และแนวโน้มกระแสเงินสด
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-pink-500" />
            สัดส่วนหมวดหมู่
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            รายรับ-รายจ่ายรายวัน
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            แนวโน้มเงินสะสม
          </button>
        </div>
      </div>

      {/* Chart Views */}
      <div className="pt-4">
        {/* VIEW 1: Categories Donut & Breakdown */}
        {activeTab === 'category' && (
          <div>
            {categoryEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <PieIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">ยังไม่มีรายการค่าใช้จ่ายในเดือนนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* SVG Donut */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                    <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                      <circle
                        cx="90"
                        cy="90"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth={donutStrokeWidth}
                      />
                      {donutSlices.map((slice, idx) => (
                        <circle
                          key={idx}
                          cx="90"
                          cy="90"
                          r={donutRadius}
                          fill="transparent"
                          stroke={slice.info.color}
                          strokeWidth={donutStrokeWidth}
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      ))}
                    </svg>
                    {/* Donut Center Info */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        รายจ่ายรวม
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 px-3 truncate max-w-[160px]">
                        {formatThaiCurrency(totalExpense)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {categoryEntries.length} หมวดหมู่
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories List with Progress Bars */}
                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    จัดอันดับค่าใช้จ่ายตามหมวดหมู่ (Top Categories)
                  </h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {categoryEntries.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.info.color }}
                            />
                            <span className="font-semibold text-slate-800">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {formatThaiCurrency(item.amount)}
                            </span>
                            <span className="text-slate-400 font-mono w-12 text-right">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.info.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Daily Income vs Expense Bar Chart */}
        {activeTab === 'daily' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  รายรับ (Income)
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-rose-500"></span>
                  รายจ่าย (Expense)
                </span>
              </div>
              {hoveredDay && (
                <div className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                  วันที่ {hoveredDay.day}: รับ +{formatThaiCurrency(hoveredDay.income)} | จ่าย -{formatThaiCurrency(hoveredDay.expense)}
                </div>
              )}
            </div>

            {/* Daily Bar Chart Visualizer */}
            <div className="h-56 w-full flex items-end gap-1 pt-4 pb-2 border-b border-slate-200 overflow-x-auto">
              {dailyTrend.map((item) => {
                const incHeight = maxDailyValue > 0 ? (item.income / maxDailyValue) * 100 : 0;
                const expHeight = maxDailyValue > 0 ? (item.expense / maxDailyValue) * 100 : 0;
                const hasActivity = item.income > 0 || item.expense > 0;

                return (
                  <div
                    key={item.day}
                    className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredDay({ day: item.day, income: item.income, expense: item.expense })}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Income Bar */}
                      <div
                        className="w-1/2 bg-emerald-500/90 rounded-t-xs transition-all duration-300 group-hover:bg-emerald-600"
                        style={{ height: `${Math.max(incHeight, item.income > 0 ? 6 : 0)}%` }}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 bg-rose-500/90 rounded-t-xs transition-all duration-300 group-hover:bg-rose-600"
                        style={{ height: `${Math.max(expHeight, item.expense > 0 ? 6 : 0)}%` }}
                      />
                    </div>

                    {/* Day number below */}
                    <span className={`text-[10px] mt-1 ${hasActivity ? 'font-bold text-slate-700' : 'text-slate-400'}`}>
                      {item.day % 2 === 1 ? item.day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-right">
              เลื่อนเมาส์เหนือแท่งกราฟเพื่อดูรายละเอียดรายรับรายจ่ายในแต่ละวัน
            </p>
          </div>
        )}

        {/* VIEW 3: Cumulative Balance Trend */}
        {activeTab === 'trend' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">
                กระแสเงินสดสุทธิสะสมตลอดทั้งเดือน (Cumulative Net Balance)
              </span>
              <span className={`text-xs font-bold ${stats.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                สิ้นเดือนคงเหลือ: {formatThaiCurrency(stats.netBalance)}
              </span>
            </div>

            {/* Trend SVG area */}
            <div className="h-48 w-full relative">
              {(() => {
                const balances = dailyTrend.map((d) => d.balance);
                const minBal = Math.min(0, ...balances);
                const maxBal = Math.max(100, ...balances);
                const range = maxBal - minBal || 1;
                const width = 800;
                const height = 180;
                const pad = 20;

                const points = dailyTrend.map((d, idx) => {
                  const x = pad + (idx / (dailyTrend.length - 1)) * (width - 2 * pad);
                  const y = height - pad - ((d.balance - minBal) / range) * (height - 2 * pad);
                  return `${x},${y}`;
                });

                const polylineStr = points.join(' ');
                const zeroY = height - pad - ((0 - minBal) / range) * (height - 2 * pad);

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Zero baseline */}
                    <line
                      x1={pad}
                      y1={zeroY}
                      x2={width - pad}
                      y2={zeroY}
                      stroke="#cbd5e1"
                      strokeDasharray="4"
                      strokeWidth="1.5"
                    />

                    {/* Curve */}
                    <polyline
                      fill="none"
                      stroke={stats.netBalance >= 0 ? '#10b981' : '#f43f5e'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylineStr}
                    />

                    {/* Point circles */}
                    {dailyTrend.map((d, idx) => {
                      if (d.income === 0 && d.expense === 0) return null;
                      const x = pad + (idx / (dailyTrend.length - 1)) * (width - 2 * pad);
                      const y = height - pad - ((d.balance - minBal) / range) * (height - 2 * pad);
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#ffffff"
                          stroke={d.balance >= 0 ? '#10b981' : '#f43f5e'}
                          strokeWidth="2.5"
                        >
                          <title>{`วันที่ ${d.day}: คงเหลือสะสม ${formatThaiCurrency(d.balance)}`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
              <span>วันที่ 1 ของเดือน</span>
              <span>วันที่ 15</span>
              <span>สิ้นเดือน</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
