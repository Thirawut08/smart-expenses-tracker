'use client';

import { useLedger } from '@/hooks/use-ledger';
import { InvestmentStats } from '@/components/investment-stats';
import { TransactionsTable } from '@/components/transactions-table';
import { investmentAccountNames } from '@/lib/data';
import { useMemo } from 'react';

export default function InvestmentsPage() {
  const { transactions, handleEditTransaction, handleDeleteRequest } = useLedger();

  const investmentTransactions = useMemo(() => {
    return transactions.filter(t => investmentAccountNames.includes(t.account.name));
  }, [transactions]);

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold font-headline">ภาพรวมการออมและการลงทุน</h1>
        </div>
      <InvestmentStats transactions={transactions} monthLabel="ทั้งหมด" />
      
      <div>
        <h2 className="text-2xl font-bold mb-4">ธุรกรรมการลงทุน</h2>
        <TransactionsTable
          transactions={investmentTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteRequest}
        />
      </div>
    </div>
  );
}
