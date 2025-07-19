import type { UnifiedFormValues } from "@/components/transaction-form";

export interface Account {
  id: string;
  name: string;
  currency: "THB" | "USD";
  types: string[]; // ประเภทบัญชีหลายประเภท เช่น ['ทั่วไป', 'ลงทุน']
}

export interface Transaction {
  id: string;
  account: Account;
  purpose: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
  sender?: string;
  recipient?: string;
  details?: string;
}

export type Template = {
  id: string;
  name: string;
  type: "income" | "expense";
  purpose: string;
  accountId?: string; // เพิ่ม accountId
  sender?: string;
  recipient?: string;
  details?: string;
  amount?: number;
};

export interface Income {
  id: string;
  date: Date;
  account: Account;
  amount: number;
}
