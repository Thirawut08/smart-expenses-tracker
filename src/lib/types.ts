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
