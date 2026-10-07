import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag, 
  PlusCircle, 
  SlidersHorizontal 
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';
import { formatThaiCurrency, getCategoryInfo, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedMonth,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Must match selected month
      if (!tx.date.startsWith(selectedMonth)) return false;

      // Filter by type
      if (filterType !== 'all' && tx.type !== filterType) return false;

      // Filter by category
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const catMatch = tx.category.toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, filterType, filterCategory, searchTerm]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    for (const tx of filtered) {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // Categories list for filter dropdown
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  const handleDeleteConfirm = (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            รายการบันทึกประจำเดือน ({filtered.length} รายการ)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ค้นหา ตรวจสอบ และจัดการประวัติรายการรายรับรายจ่าย
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารายการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">ทุกประเภท</option>
            <option value="income">เฉพาะรายรับ (+)</option>
            <option value="expense">เฉพาะรายจ่าย (-)</option>
          </select>

          {/* Category filter */}
          {allCategories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer max-w-[130px] truncate"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transactions list */}
      <div className="pt-4">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 mb-1">
              ยังไม่พบรายการตามเงื่อนไข
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {transactions.length === 0 
                ? 'ยังไม่มีการบันทึกรายการในเดือนนี้ เริ่มต้นบันทึกรายรับหรือรายจ่ายรายการแรกกันเลย' 
                : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองเพื่อดูรายการที่ต้องการ'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              เพิ่มรายการใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map(([dateStr, items]) => {
              const dayIncome = items
                .filter((i) => i.type === 'income')
                .reduce((s, i) => s + i.amount, 0);
              const dayExpense = items
                .filter((i) => i.type === 'expense')
                .reduce((s, i) => s + i.amount, 0);

              // Format date header
              const [y, m, d] = dateStr.split('-');
              const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
              const thaiDate = dateObj.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              });

              return (
                <div key={dateStr} className="space-y-2">
                  {/* Date section header */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {thaiDate}
                    </span>
                    <div className="flex items-center gap-3">
                      {dayIncome > 0 && (
                        <span className="text-emerald-700">
                          รับ: +{formatThaiCurrency(dayIncome)}
                        </span>
                      )}
                      {dayExpense > 0 && (
                        <span className="text-rose-600">
                          จ่าย: -{formatThaiCurrency(dayExpense)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* List cards */}
                  <div className="space-y-1.5">
                    {items.map((tx) => {
                      const catInfo = getCategoryInfo(tx.category, tx.type);
                      const isIncome = tx.type === 'income';

                      return (
                        <div
                          key={tx.id}
                          className="group p-3 rounded-xl border border-slate-100 hover:border-slate-200/90 hover:bg-slate-50/70 transition flex items-center justify-between gap-3"
                        >
                          {/* Left: Icon & Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isIncome
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-rose-100 text-rose-600'
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft className="w-5 h-5" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 truncate">
                                  {tx.description || tx.category}
                                </span>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border hidden sm:inline-block ${catInfo.bgColor}`}
                                >
                                  {tx.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span className="sm:hidden">{tx.category} • </span>
                                <span>{tx.date}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Action buttons */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                isIncome ? 'text-emerald-600' : 'text-slate-900'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatThaiCurrency(tx.amount)}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEdit(tx)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="แก้ไขรายการ"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteConfirm(tx.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="ลบรายการ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
