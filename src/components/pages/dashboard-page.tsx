'use client';

import { useState, useMemo } from 'react';
import { MonthlyStats } from '@/components/monthly-stats';
import { useLedger } from '@/hooks/use-ledger';
import { thaiMonths } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountBalances } from '@/components/account-balances';
import { TransactionTemplates } from '@/components/transaction-templates';

export function DashboardPage() {
  const { transactions, templates, handleUseTemplate } = useLedger();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return transactions;
    }
    return transactions.filter(t => new Date(t.date).getMonth().toString() === selectedMonth);
  }, [transactions, selectedMonth]);

  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') {
      return 'ทั้งหมด';
    }
    const month = thaiMonths.find(m => m.value === parseInt(selectedMonth, 10));
    return month ? month.label : 'ทั้งหมด';
  }, [selectedMonth]);
  
  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          </div>
          
      <div className="grid gap-8">
        <MonthlyStats transactions={filteredTransactions} monthLabel={currentMonthLabel} />
        <AccountBalances transactions={transactions} />
        <TransactionTemplates templates={templates} onUseTemplate={handleUseTemplate} />
      </div>
    </div>
  );
}
