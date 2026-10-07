import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { Budget } from '../types/finance';
import { formatThaiMonthYear, formatThaiCurrency } from '../constants/categories';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  existingBudget?: Budget;
  onSaveBudget: (limitAmount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  existingBudget,
  onSaveBudget,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBudget && existingBudget.limitAmount > 0) {
      setAmount(existingBudget.limitAmount.toString());
    } else {
      setAmount('25000');
    }
    setError(null);
  }, [existingBudget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('กรุณาระบุวงเงินงบประมาณที่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSaveBudget(num);
      onClose();
    } catch (err: unknown) {
      console.error('Error saving budget:', err);
      setError('ไม่สามารถบันทึกงบประมาณได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ตั้งงบประมาณรายเดือน
              </h2>
              <p className="text-xs text-slate-500">
                ประจำเดือน {formatThaiMonthYear(currentMonth)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              วงเงินค่าใช้จ่ายสูงสุด (บาท/เดือน)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="100"
                placeholder="20,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-xl font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Quick choices */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">
              เลือกตามตัวเลขแนะนำ:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15000, 20000, 30000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`py-1.5 text-xs rounded-lg border font-medium transition ${
                    amount === val.toString()
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ฿{(val / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
