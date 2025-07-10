'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Transaction } from '@/lib/types';
import { accounts } from '@/lib/data';
import { WalletCards } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

export function AccountBalances({ transactions }: { transactions: Transaction[] }) {
  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();

    // Initialize all accounts with 0 balance
    accounts.forEach(acc => {
      balances.set(acc.name, 0);
    });

    // Calculate balances from transactions
    transactions.forEach(t => {
      const currentBalance = balances.get(t.account.name) ?? 0;
      balances.set(t.account.name, currentBalance + t.amount);
    });

    return Array.from(balances.entries())
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => b.balance - a.balance); // Sort by balance descending

  }, [transactions]);

  const totalBalance = useMemo(() => {
      return accountBalances.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accountBalances])

  return (
    <Card>
      <CardHeader>
        <CardTitle>ยอดคงเหลือแต่ละบัญชี</CardTitle>
        <CardDescription>
          สรุปยอดเงินคงเหลือในทุกบัญชีของคุณ (คำนวณจากทุกธุรกรรม)
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="text-right mb-4">
            <p className="text-sm text-muted-foreground">ยอดรวมทุกบัญชี</p>
            <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencyFormatter.format(totalBalance)}
            </p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {transactions.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>บัญชี</TableHead>
                  <TableHead className="text-right">ยอดคงเหลือ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountBalances.map((acc) => (
                  <TableRow key={acc.name}>
                    <TableCell className="font-medium">{acc.name}</TableCell>
                    <TableCell className={`text-right font-semibold ${acc.balance >= 0 ? '' : 'text-red-600'}`}>
                      {currencyFormatter.format(acc.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                <WalletCards className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold">ยังไม่มียอดคงเหลือ</h3>
                <p>เพิ่มธุรกรรมเพื่อดูยอดคงเหลือในบัญชีของคุณ</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
