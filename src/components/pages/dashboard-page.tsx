'use client';

import { useState, useMemo } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthlyStats } from '@/components/monthly-stats';
import { useLedger } from '@/hooks/use-ledger';
import { thaiMonths } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountBalances } from '@/components/account-balances';
import { MonthInfoTable } from '@/components/month-info-table';
import { TransactionTemplates } from '@/components/transaction-templates';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InvestmentStats } from '@/components/investment-stats';

export function DashboardPage() {
  const { transactions, templates, handleUseTemplate } = useLedger();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isMonthInfoOpen, setIsMonthInfoOpen] = useState(false);

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
        <div className="grid lg:grid-cols-2 gap-8">
            <MonthlyStats transactions={filteredTransactions} monthLabel={currentMonthLabel} />
            <InvestmentStats transactions={filteredTransactions} monthLabel={currentMonthLabel} />
        </div>
        <AccountBalances transactions={transactions} />
        <TransactionTemplates templates={templates} onUseTemplate={handleUseTemplate} />
        <Collapsible open={isMonthInfoOpen} onOpenChange={setIsMonthInfoOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-6 cursor-pointer">
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">ข้อมูลเดือน</h3>
                  <p className="text-sm text-muted-foreground">ตารางแสดงชื่อเดือนและตัวย่อต่างๆ (กดเพื่อเปิด/ปิด)</p>
                </div>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <MonthInfoTable />
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
