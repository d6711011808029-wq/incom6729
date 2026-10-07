import { Transaction } from '../types/finance';
import { addTransaction } from '../services/transactionService';

export const SAMPLE_TRANSACTIONS = [
  // Income
  { type: 'income' as const, amount: 48000, category: 'เงินเดือน / ค่าจ้างประจำ', description: 'เงินเดือนประจำเดือน', dayOffset: 1 },
  { type: 'income' as const, amount: 6500, category: 'งานเสริม / ฟรีแลนซ์', description: 'รับจ้างเขียนโค้ดและดีไซน์', dayOffset: 12 },
  { type: 'income' as const, amount: 1200, category: 'เงินปันผล / ดอกเบี้ย', description: 'ปันผลกองทุนรวม K-SET50', dayOffset: 18 },
  
  // Expenses
  { type: 'expense' as const, amount: 8500, category: 'ที่พัก / ค่าน้ำ-ไฟ-เน็ต', description: 'ค่าเช่าคอนโด + อินเทอร์เน็ตไฟเบอร์', dayOffset: 2 },
  { type: 'expense' as const, amount: 1650, category: 'ที่พัก / ค่าน้ำ-ไฟ-เน็ต', description: 'ค่าไฟฟ้า + ค่าน้ำประปา', dayOffset: 3 },
  { type: 'expense' as const, amount: 450, category: 'อาหารและเครื่องดื่ม', description: 'บุฟเฟต์ชาบูกับเพื่อนที่ทำงาน', dayOffset: 4 },
  { type: 'expense' as const, amount: 85, category: 'อาหารและเครื่องดื่ม', description: 'กาแฟอเมริกาโน่เย็นร้านโปรด', dayOffset: 5 },
  { type: 'expense' as const, amount: 120, category: 'การเดินทาง / ยานพาหนะ', description: 'BTS ไป-กลับที่ทำงาน', dayOffset: 5 },
  { type: 'expense' as const, amount: 1200, category: 'การเดินทาง / ยานพาหนะ', description: 'เติมน้ำมันรถยนต์ E20 เต็มถัง', dayOffset: 8 },
  { type: 'expense' as const, amount: 1490, category: 'ช้อปปิ้ง / ของใช้', description: 'ซื้อรองเท้าผ้าใบโปรโมชัน 10.10', dayOffset: 10 },
  { type: 'expense' as const, amount: 350, category: 'อาหารและเครื่องดื่ม', description: 'มื้อเย็นก๋วยเตี๋ยวเรือ + เครื่องดื่ม', dayOffset: 11 },
  { type: 'expense' as const, amount: 280, category: 'ความบันเทิง / ท่องเที่ยว', description: 'ตั๋วหนัง Major Cineplex IMAX', dayOffset: 14 },
  { type: 'expense' as const, amount: 5000, category: 'ออมเงิน / ลงทุน', description: 'DCA หุ้นและกองทุนสำรองเลี้ยงชีพ', dayOffset: 15 },
  { type: 'expense' as const, amount: 650, category: 'สุขภาพ / ยารักษาโรค', description: 'วิตามินซีและอาหารเสริมบำรุงสุขภาพ', dayOffset: 17 },
  { type: 'expense' as const, amount: 3200, category: 'ครอบครัว / คนรัก', description: 'ส่งเงินให้คุณแม่ประจำเดือน', dayOffset: 20 },
  { type: 'expense' as const, amount: 590, category: 'ช้อปปิ้ง / ของใช้', description: 'ของใช้ในบ้านจากซูเปอร์มาร์เก็ต', dayOffset: 22 },
  { type: 'expense' as const, amount: 180, category: 'อาหารและเครื่องดื่ม', description: 'ข้าวผัดกะเพราไข่ดาว + ชานมไข่มุก', dayOffset: 25 },
];

export async function seedSampleDataForMonth(userId: string, targetMonth: string) {
  // targetMonth: YYYY-MM
  const [year, month] = targetMonth.split('-');
  
  for (const item of SAMPLE_TRANSACTIONS) {
    const dayStr = String(Math.min(item.dayOffset, 28)).padStart(2, '0');
    const date = `${year}-${month}-${dayStr}`;
    await addTransaction(userId, {
      type: item.type,
      amount: item.amount,
      category: item.category,
      description: item.description,
      date,
    });
  }
}
