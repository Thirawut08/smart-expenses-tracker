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
