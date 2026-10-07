import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Check } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatThaiMonthYear } from '../constants/categories';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentMonth: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentMonth,
}) => {
  const [scope, setScope] = useState<'month' | 'all'>('month');

  if (!isOpen) return null;

  const handleExport = () => {
    const listToExport = scope === 'month'
      ? transactions.filter((t) => t.date.startsWith(currentMonth))
      : transactions;

    if (listToExport.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    // CSV columns: วันที่, ประเภท, หมวดหมู่, รายละเอียด, จำนวนเงิน (บาท)
    const headers = ['วันที่ (Date)', 'ประเภท (Type)', 'หมวดหมู่ (Category)', 'รายละเอียด (Description)', 'จำนวนเงิน (Amount THB)'];
    const rows = listToExport.map((t) => [
      `"${t.date}"`,
      `"${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
      `"${t.category}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Excel displays Thai characters properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = scope === 'month'
      ? `รายการรายรับรายจ่าย_${currentMonth}.csv`
      : `รายการรายรับรายจ่าย_ทั้งหมด.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const monthCount = transactions.filter((t) => t.date.startsWith(currentMonth)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ส่งออกรายงาน (CSV / Excel)
              </h2>
              <p className="text-xs text-slate-500">
                ดาวน์โหลดข้อมูลสำหรับเปิดใน Microsoft Excel หรือ Google Sheets
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

        {/* Content */}
        <div className="p-5 space-y-4">
          <label className="block text-xs font-semibold text-slate-700">
            เลือกขอบเขตข้อมูลที่ต้องการดาวน์โหลด:
          </label>

          <div className="space-y-2">
            <label
              onClick={() => setScope('month')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                scope === 'month'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <p className="text-xs font-bold">
                  เฉพาะเดือนปัจจุบัน ({formatThaiMonthYear(currentMonth)})
                </p>
                <p className="text-[11px] text-slate-500">
                  จำนวน {monthCount} รายการ
                </p>
              </div>
              {scope === 'month' && <Check className="w-4 h-4 text-emerald-600" />}
            </label>

            <label
              onClick={() => setScope('all')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                scope === 'all'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <p className="text-xs font-bold">
                  ประวัติทั้งหมดทุกเดือน (All Records)
                </p>
                <p className="text-[11px] text-slate-500">
                  จำนวน {transactions.length} รายการ
                </p>
              </div>
              {scope === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลดไฟล์ CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
