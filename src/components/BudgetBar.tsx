import React from 'react';
import { Target, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Budget } from '../types/finance';
import { formatThaiCurrency } from '../constants/categories';

interface BudgetBarProps {
  budget?: Budget;
  totalExpense: number;
  onOpenBudgetModal: () => void;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({
  budget,
  totalExpense,
  onOpenBudgetModal,
}) => {
  if (!budget || budget.limitAmount <= 0) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-2xl p-4 border border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shadow-2xs">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              ยังไม่ได้ตั้งเป้าหมายงบประมาณสำหรับเดือนนี้
            </h4>
            <p className="text-xs text-slate-500">
              กำหนดวงเงินใช้จ่ายสูงสุดเพื่อช่วยควบคุมค่าใช้จ่ายและเพิ่มเงินออม
            </p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 whitespace-nowrap"
        >
          ตั้งงบประมาณรายเดือน
        </button>
      </div>
    );
  }

  const limit = budget.limitAmount;
  const percentage = Math.min(100, Math.round((totalExpense / limit) * 100));
  const rawPercentage = ((totalExpense / limit) * 100).toFixed(1);
  const remaining = limit - totalExpense;
  const isExceeded = remaining < 0;
  const isNearLimit = !isExceeded && percentage >= 85;

  let barColor = 'bg-emerald-500';
  let badgeText = 'อยู่ในเกณฑ์ปกติ';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (isExceeded) {
    barColor = 'bg-rose-500';
    badgeText = `เกินงบประมาณแล้ว (${rawPercentage}%)`;
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = ShieldAlert;
  } else if (isNearLimit) {
    barColor = 'bg-amber-500';
    badgeText = `ใกล้เต็มวงเงิน (${rawPercentage}%)`;
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                สถานะงบประมาณรายเดือน
              </h3>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                <Icon className="w-3 h-3" />
                {badgeText}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500">
            งบประมาณที่ตั้งไว้: <strong className="text-slate-800 font-bold">{formatThaiCurrency(limit)}</strong>
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 ml-1"
          >
            แก้ไข
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2 relative">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600">
        <div>
          ใช้ไปแล้ว: <span className="font-semibold text-slate-900">{formatThaiCurrency(totalExpense)}</span> ({rawPercentage}%)
        </div>
        <div>
          {isExceeded ? (
            <span className="text-rose-600 font-semibold">
              เกินไปแล้ว {formatThaiCurrency(Math.abs(remaining))}
            </span>
          ) : (
            <span className="text-emerald-700 font-medium">
              ใช้ได้อีก {formatThaiCurrency(remaining)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
