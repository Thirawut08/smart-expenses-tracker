'use client';

import { useState, useMemo } from 'react';
import { useLedger } from '@/hooks/use-ledger';
import { useAccounts } from '@/hooks/use-accounts';
import { thaiMonths } from '@/lib/data';
import { HighPerfDropdown } from '../ui/high-perf-dropdown';
import { AccountBalances } from '@/components/account-balances';
import { TransactionTemplates } from '@/components/transaction-templates';
import { UnifiedDashboardChart } from '@/components/unified-dashboard-chart';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


export function DashboardPage() {
  const { transactions, templates, handleUseTemplate } = useLedger();
  const { accounts } = useAccounts();
  const allAccountTypes = useMemo(() => {
    const types = accounts.flatMap(a => Array.isArray(a.types) ? a.types : [a.types]).filter(Boolean);
    return ['all', ...Array.from(new Set(types))];
  }, [accounts]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'total' | 'invest' | 'save'>('total');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');

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
    <div className="space-y-8 md:space-y-10 lg:space-y-12">
      {/* Section: Header + Filter + Mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 pb-2 md:pb-4">
        <div className="flex items-center gap-3 md:gap-5">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">แดชบอร์ด</h1>
          <span className="text-sm text-muted-foreground border rounded px-2 py-1 bg-muted/50">
            {new Date().toLocaleDateString('th-TH')}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <HighPerfDropdown
            options={[{ value: 'all', label: 'ทุกเดือน' }, ...thaiMonths.map(month => ({ value: month.value.toString(), label: month.label + (month.value === new Date().getMonth() ? ' (ปัจจุบัน)' : '') }))]}
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="เลือกเดือน"
            className="w-full md:w-[160px] font-semibold"
          />
          <div className="flex gap-1 ml-2">
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedMode === 'total' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              onClick={() => setSelectedMode('total')}
            >ทั้งหมด</button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedMode === 'invest' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              onClick={() => setSelectedMode('invest')}
            >ลงทุน</button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedMode === 'save' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              onClick={() => setSelectedMode('save')}
            >ออม</button>
          </div>
        </div>
      </div>

      {/* Unified Interactive Graph */}
      <UnifiedDashboardChart
        transactions={filteredTransactions}
        mode={selectedMode}
        periodLabel={currentMonthLabel}
      />

      {/* Account Balances (flat table) */}
      <div className="h-full p-0">
        <AccountBalances transactions={transactions} flatTable />
      </div>

      {/* Section: Exchange Rate */}
      <div className="flex justify-center pt-2 pb-2 md:pt-4 md:pb-4">
        <a
          href="https://th.tradingview.com/chart/?symbol=OANDA%3AUSDTHB"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-center font-semibold hover:underline w-full max-w-xs"
        >
          ดูกราฟอัตราแลกเปลี่ยน USD/THB (TradingView)
        </a>
      </div>

      {/* Section: Templates (minimal, ไม่มี Card) */}
      <div className="p-0">
        <TransactionTemplates templates={templates} onUseTemplate={handleUseTemplate} />
      </div>
    </div>
  );
}
