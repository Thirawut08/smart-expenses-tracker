import type { TransactionFormValues } from "@/components/transaction-form";

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  account: Account;
  purpose: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
  sender?: string;
  recipient?: string;
  details?: string;
}

export type Template = TransactionFormValues & {
  id: string;
  name: string;
};
