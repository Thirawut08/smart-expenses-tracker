import type { UnifiedFormValues } from '@/components/transaction-form';

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  color?: string;
  currency: 'THB' | 'USD';
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

export type Template = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  accountNumber: string;
  purpose: string;
  sender?: string;
  recipient?: string;
  details?: string;
};

export interface Income {
    id: string;
    date: Date;
    account: Account;
    amount: number;
}
