export interface Account {
  id: string;
  name: string;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  account: Account;
  purpose: string;
  payer: string;
  payee: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
  details?: string;
}
