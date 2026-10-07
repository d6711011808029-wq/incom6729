import React from 'react';
import { 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  Database, 
  Download, 
  Target,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatThaiMonthYear, THAI_MONTHS } from '../constants/categories';
import { getPreviousMonth, getNextMonth } from '../utils/analytics';
import { projectId } from '../lib/firebase';

interface NavbarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenExportModal: () => void;
  onLoadSampleData: () => void;
  isSeeding: boolean;
  transactionCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenBudgetModal,
  onOpenExportModal,
  onLoadSampleData,
  isSeeding,
  transactionCount,
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const now = new Date();
  const currentActualMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isViewingCurrentMonth = currentMonth === currentActualMonth;

  // Generate list of 12 months for quick selection dropdown
  const monthOptions = [];
  const startYear = now.getFullYear();
  for (let y = startYear - 1; y <= startYear + 1; y++) {
    for (let m = 1; m <= 12; m++) {
      const val = `${y}-${String(m).padStart(2, '0')}`;
      monthOptions.push({
        value: val,
        label: formatThaiMonthYear(val),
      });
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Firebase Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                  เว็บจัดการรายรับรายจ่าย
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Firebase: <code className="font-mono text-emerald-800">{projectId}</code>
                  </span>
                  <span>•</span>
                  <span>{transactionCount} รายการ</span>
                </div>
              </div>
            </div>

            {/* Mobile Auth button */}
            <div className="md:hidden flex items-center gap-2">
              {!loading && (
                user ? (
                  <button
                    onClick={() => signOut()}
                    title="ออกจากระบบ"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => signInWithGoogle()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    เข้าสู่ระบบ
                  </button>
                )
              )}
            </div>
          </div>

          {/* Month Selector Bar */}
          <div className="flex items-center justify-between md:justify-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 self-center md:self-auto w-full md:w-auto">
            <button
              onClick={() => onMonthChange(getPreviousMonth(currentMonth))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-emerald-600 mr-1.5 hidden sm:inline" />
              <select
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 text-sm py-1 px-2 pr-7 rounded-lg appearance-none cursor-pointer focus:outline-hidden hover:bg-white/60 transition"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1.5 text-slate-400 text-xs">▼</span>
            </div>

            <button
              onClick={() => onMonthChange(getNextMonth(currentMonth))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isViewingCurrentMonth && (
              <button
                onClick={() => onMonthChange(currentActualMonth)}
                className="text-xs px-2 py-1 bg-white text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 border border-slate-200 transition-all shadow-2xs ml-1"
              >
                เดือนนี้
              </button>
            )}
          </div>

          {/* Action Buttons & Desktop User */}
          <div className="flex items-center gap-2 justify-end overflow-x-auto pb-1 md:pb-0">
            {transactionCount === 0 && (
              <button
                onClick={onLoadSampleData}
                disabled={isSeeding}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg hover:bg-indigo-100 transition whitespace-nowrap"
                title="โหลดชุดข้อมูลตัวอย่างภาษาไทยเพื่อทดสอบกราฟและสรุปผล"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isSeeding ? 'animate-spin' : ''}`} />
                {isSeeding ? 'กำลังโหลด...' : 'ตัวอย่างข้อมูล'}
              </button>
            )}

            <button
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition shadow-2xs whitespace-nowrap"
            >
              <Target className="w-4 h-4 text-amber-500" />
              <span>งบประมาณ</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition shadow-2xs whitespace-nowrap"
              title="ส่งออกรายงาน Excel / CSV"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">ส่งออก</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/30 transition whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>บันทึกรายการ</span>
            </button>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center pl-2 border-l border-slate-200 ml-1">
              {!loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full border border-emerald-300 ring-2 ring-emerald-500/10 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col text-left max-w-[120px]">
                      <span className="text-xs font-semibold text-slate-800 truncate leading-tight">
                        {user.displayName || 'ผู้ใช้งาน'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ออกจากระบบ"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signInWithGoogle()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition shadow-2xs whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                    เข้าสู่ระบบ Google
                  </button>
                )
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
