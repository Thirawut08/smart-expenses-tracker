'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { MonthlyStats } from '@/components/monthly-stats';
import { TransactionsTable } from '@/components/transactions-table';
import { LedgerAiHeader } from '@/components/ledger-ai-header';
import type { Transaction } from '@/lib/types';
import { accounts } from '@/lib/data';
import type { TransactionFormValues } from '@/components/transaction-form';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addTransaction = (data: TransactionFormValues) => {
    const selectedAccount = accounts.find(acc => acc.accountNumber === data.accountNumber);
    if (!selectedAccount) {
      console.error("Account not found");
      return;
    }

    setTransactions(prev =>
      [
        ...prev,
        {
          id: new Date().toISOString() + Math.random(),
          account: selectedAccount,
          purpose: data.purpose,
          payer: data.payer,
          payee: data.payee,
          amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
          date: data.date,
          type: data.type,
        },
      ].sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LedgerAiHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">แดชบอร์ด</h1>
          <AddTransactionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onTransactionAdd={addTransaction}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              เพิ่มธุรกรรม
            </Button>
          </AddTransactionDialog>
        </div>
        <div className="grid gap-8">
          <MonthlyStats transactions={transactions} />
          <TransactionsTable transactions={transactions} />
        </div>
      </main>
    </div>
  );
}
