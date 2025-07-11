'use client';

import { useMemo } from 'react';
import { useLedger } from '@/hooks/use-ledger';
import { investmentAccountNames } from '@/lib/data';
import { TransactionsTable } from '@/components/transactions-table';

export default function InvestmentsPage() {
  const { transactions, handleEditTransaction, handleDeleteRequest } = useLedger();

  const investmentTransactions = useMemo(() => {
    return transactions.filter(t => investmentAccountNames.includes(t.account.name));
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">ภาพรวมการลงทุน</h1>
      </div>
      <TransactionsTable
        transactions={investmentTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
}
