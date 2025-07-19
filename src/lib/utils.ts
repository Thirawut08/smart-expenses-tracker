import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// แปลงยอดเงินเป็น THB ตามเรต
export function convertToTHB(
  amount: number,
  currency: "THB" | "USD",
  rate: number,
) {
  return currency === "USD" ? amount * rate : amount;
}

// --- Date/Time Parsing & Validation ---

/**
 * แปลง string เป็น Date (รองรับ DD/MM, DD/MM/YYYY, ปี พ.ศ./ค.ศ.)
 * - ถ้าไม่กรอกปี ให้เติมปีปัจจุบัน
 * - ถ้ากรอกปี พ.ศ. ให้แปลงเป็น ค.ศ.
 * - ถ้า invalid return undefined
 */
export function parseDateInput(input: string): Date | undefined {
  if (!input) return undefined;
  const today = new Date();
  const parts = input.trim().split("/");
  if (parts.length < 2) return undefined;
  let [d, m, y] = parts;
  const day = parseInt(d, 10);
  const month = parseInt(m, 10) - 1;
  let year = y ? parseInt(y, 10) : today.getFullYear();
  if (!y) year = today.getFullYear();
  if (year > 2200) return undefined; // ป้องกันปีผิด
  if (year > 2100) year -= 543; // ถ้าเป็น พ.ศ. ให้แปลงเป็น ค.ศ.
  if (year > 2500) year -= 543; // เผื่อกรณีกรอก 2567
  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;
  const date = new Date(year, month, day);
  // ตรวจสอบว่าวัน/เดือน/ปีถูกต้อง
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/**
 * แปลง DD/MM (string) + ปีปัจจุบัน เป็น Date (ถ้า invalid return undefined)
 */
export function parseDayMonthToDate(dd: string, mm: string): Date | undefined {
  const today = new Date();
  const year = today.getFullYear();
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10) - 1;
  if (isNaN(day) || isNaN(month)) return undefined;
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/**
 * ตรวจสอบว่า string เป็นเวลา 24 ชั่วโมง (HH:mm) ที่ถูกต้อง
 */
export function isValidTime24h(val: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
}
