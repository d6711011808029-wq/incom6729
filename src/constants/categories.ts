import { CategoryInfo } from '../types/finance';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', bgColor: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'transport', name: 'การเดินทาง / ยานพาหนะ', type: 'expense', icon: 'Car', color: '#3b82f6', bgColor: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'housing', name: 'ที่พัก / ค่าน้ำ-ไฟ-เน็ต', type: 'expense', icon: 'Home', color: '#8b5cf6', bgColor: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', bgColor: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'entertainment', name: 'ความบันเทิง / ท่องเที่ยว', type: 'expense', icon: 'Film', color: '#06b6d4', bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 'health', name: 'สุขภาพ / ยารักษาโรค', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bgColor: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'education', name: 'การศึกษา / พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: '#10b981', bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'family', name: 'ครอบครัว / คนรัก', type: 'expense', icon: 'Users', color: '#f59e0b', bgColor: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'investment_exp', name: 'ออมเงิน / ลงทุน', type: 'expense', icon: 'TrendingUp', color: '#14b8a6', bgColor: 'bg-teal-50 text-teal-600 border-teal-200' },
  { id: 'debt', name: 'ชำระหนี้ / บัตรเครดิต', type: 'expense', icon: 'CreditCard', color: '#64748b', bgColor: 'bg-slate-50 text-slate-600 border-slate-200' },
  { id: 'other_exp', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8', bgColor: 'bg-gray-50 text-gray-600 border-gray-200' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้างประจำ', type: 'income', icon: 'Briefcase', color: '#10b981', bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'bonus', name: 'โบนัส / ค่าคอมมิชชัน', type: 'income', icon: 'Gift', color: '#059669', bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: '#0ea5e9', bgColor: 'bg-sky-50 text-sky-600 border-sky-200' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#6366f1', bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'dividend', name: 'เงินปันผล / ดอกเบี้ย', type: 'income', icon: 'PiggyBank', color: '#84cc16', bgColor: 'bg-lime-50 text-lime-600 border-lime-200' },
  { id: 'parent', name: 'ครอบครัวให้ / ของขวัญ', type: 'income', icon: 'Heart', color: '#f43f5e', bgColor: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 'other_inc', name: 'รายรับอื่นๆ', type: 'income', icon: 'CircleDollarSign', color: '#14b8a6', bgColor: 'bg-teal-50 text-teal-600 border-teal-200' },
];

export function getCategoryInfo(name: string, type: 'income' | 'expense'): CategoryInfo {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const match = list.find(c => c.name === name || c.id === name);
  if (match) return match;
  return {
    id: 'unknown',
    name: name,
    type,
    icon: type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight',
    color: type === 'income' ? '#10b981' : '#f97316',
    bgColor: type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'
  };
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export function formatThaiMonthYear(monthStr: string): string {
  // monthStr is "YYYY-MM"
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, mStr] = monthStr.split('-');
  const mIndex = parseInt(mStr, 10) - 1;
  const yearCE = parseInt(yearStr, 10);
  const yearBE = yearCE + 543;
  const monthName = THAI_MONTHS[mIndex] || '';
  return `${monthName} ${yearBE}`;
}

export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
