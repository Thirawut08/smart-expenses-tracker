"use client";

import { useMemo } from "react";
import { useLedger } from "@/hooks/use-ledger";
import { InvestmentTransactionsTable } from "@/components/investment-transactions-table";

export default function InvestmentsPage() {
  const { transactions, handleEditTransaction, handleDeleteRequest } =
    useLedger();

  // ใช้ transactions เฉพาะที่ purpose มีคำว่า 'ลงทุน'
  const investmentTransactions = useMemo(() =>
    transactions.filter(
      (t) => t.purpose && t.purpose.includes('ลงทุน')
    ),
    [transactions]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">ภาพรวมการลงทุน</h1>
      </div>
      <InvestmentTransactionsTable
        transactions={investmentTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
}
