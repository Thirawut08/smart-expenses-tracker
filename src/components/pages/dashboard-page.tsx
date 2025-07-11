'use client';

import { useState, useMemo } from 'react';
import { MonthlyStats } from '@/components/monthly-stats';
import { useLedger } from '@/hooks/use-ledger';
import { thaiMonths } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountBalances } from '@/components/account-balances';
import { TransactionTemplates } from '@/components/transaction-templates';
import { MonthInfoTable } from '@/components/month-info-table';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InvestmentChart } from '@/components/investment-chart';
import { SavingsChart } from '@/components/savings-chart';


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
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold font-headline">แดชบอร์ด</h1>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] font-semibold">
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
          
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <MonthlyStats transactions={filteredTransactions} monthLabel={currentMonthLabel} />
            <AccountBalances transactions={transactions} />
            <div className="md:col-span-2">
                <TransactionTemplates templates={templates} onUseTemplate={handleUseTemplate} />
            </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
            <InvestmentChart transactions={transactions} />
            <SavingsChart transactions={transactions} />
        </div>
       </div>
        <Card>
            <CardHeader>
                <CardTitle>ข้อมูลเดือน</CardTitle>
                <CardDescription>
                    ตารางแสดงรายละเอียดของเดือนต่างๆ
                </CardDescription>
            </CardHeader>
            <MonthInfoTable />
        </Card>
    </div>
  );
}
