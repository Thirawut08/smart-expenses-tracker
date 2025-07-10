'use client';

import { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { MonthlyStats } from '@/components/monthly-stats';
import { TransactionsTable } from '@/components/transactions-table';
import { LedgerAiHeader } from '@/components/ledger-ai-header';
import type { Transaction } from '@/lib/types';
import { accounts, thaiMonths } from '@/lib/data';
import type { TransactionFormValues } from '@/components/transaction-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountBalances } from '@/components/account-balances';
import { MonthInfoTable } from '@/components/month-info-table';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

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
          amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
          date: data.date,
          type: data.type,
          details: data.details,
        },
      ].sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    setIsDialogOpen(false);
  };
  
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.date.getMonth().toString() === selectedMonth);
  }, [transactions, selectedMonth]);

  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') {
      return 'ทั้งหมด';
    }
    const month = thaiMonths.find(m => m.value === parseInt(selectedMonth, 10));
    return month ? month.label : 'ทั้งหมด';
  }, [selectedMonth]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LedgerAiHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-headline">แดชบอร์ด</h1>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกเดือน</SelectItem>
                {thaiMonths.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        
        <div className="grid gap-8 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                  <MonthlyStats transactions={filteredTransactions} monthLabel={currentMonthLabel} />
              </div>
              <div className="lg:col-span-3">
                  <AccountBalances transactions={transactions} />
              </div>
          </div>
          <MonthInfoTable />
        </div>

        <div>
          <TransactionsTable transactions={filteredTransactions} />
        </div>
        
      </main>
    </div>
  );
}
