'use client';

import { useMemo } from 'react';
import { useLedger } from '@/hooks/use-ledger';
import { TransactionsTable } from '@/components/transactions-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function IncomePage() {
  const { transactions, handleEditTransaction, handleDeleteRequest } = useLedger();

  const incomeTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'income');
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">ภาพรวมรายรับ</h1>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>รายการรายรับ</CardTitle>
            <CardDescription>ธุรกรรมทั้งหมดที่เป็นรายรับของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsTable
                transactions={incomeTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteRequest}
            />
          </CardContent>
        </Card>
    </div>
  );
}
