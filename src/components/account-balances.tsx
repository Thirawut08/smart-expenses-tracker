'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Transaction } from '@/lib/types';
import { accounts, investmentAccountNames, savingAccountNames } from '@/lib/data';
import { WalletCards } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

const BalanceTable = ({ balances, total, noDataMessage }: { balances: {name: string, balance: number}[], total: number, noDataMessage: string }) => {
    if (balances.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[150px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                <WalletCards className="w-12 h-12 mb-3" />
                <h3 className="text-lg font-semibold">{noDataMessage}</h3>
                <p className="text-sm">เพิ่มธุรกรรมเพื่อดูยอดคงเหลือ</p>
            </div>
        )
    }

    return (
        <div>
            <div className="text-right mb-4">
                <p className="text-sm text-muted-foreground">ยอดรวม</p>
                <p className={`text-xl font-bold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currencyFormatter.format(total)}
                </p>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                        <TableHead>บัญชี</TableHead>
                        <TableHead className="text-right">ยอดคงเหลือ</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {balances.map((acc) => (
                        <TableRow key={acc.name}>
                        <TableCell className="font-medium">{acc.name}</TableCell>
                        <TableCell className={`text-right font-semibold ${acc.balance >= 0 ? '' : 'text-red-600'}`}>
                            {currencyFormatter.format(acc.balance)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function AccountBalances({ transactions }: { transactions: Transaction[] }) {
    
  const calculateBalances = (accountNames: string[]) => {
    const balances = new Map<string, number>();

    // Initialize filtered accounts with 0 balance
    accounts
        .filter(acc => accountNames.includes(acc.name))
        .forEach(acc => {
            balances.set(acc.name, 0);
        });

    // Calculate balances from transactions
    transactions.forEach(t => {
      if (balances.has(t.account.name)) {
        const currentBalance = balances.get(t.account.name) ?? 0;
        const amount = t.type === 'income' ? t.amount : -t.amount;
        balances.set(t.account.name, currentBalance + amount);
      }
    });

    const sortedBalances = Array.from(balances.entries())
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => b.balance - a.balance);

    const total = sortedBalances.reduce((sum, acc) => sum + acc.balance, 0);
    
    return { balances: sortedBalances, total };
  };

  const { balances: investmentBalances, total: totalInvestment } = useMemo(() => calculateBalances(investmentAccountNames), [transactions]);
  
  const { balances: savingBalances, total: totalSaving } = useMemo(() => calculateBalances(savingAccountNames), [transactions]);
  
  const { balances: generalBalances, total: totalGeneral } = useMemo(() => {
    const generalAccountNames = accounts
        .map(a => a.name)
        .filter(name => !investmentAccountNames.includes(name) && !savingAccountNames.includes(name));
    return calculateBalances(generalAccountNames);
  }, [transactions]);


  const totalBalance = useMemo(() => {
      return transactions.reduce((sum, t) => {
        const amount = t.type === 'income' ? t.amount : -t.amount;
        return sum + amount;
      }, 0);
  }, [transactions])

  if (transactions.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>ยอดคงเหลือแต่ละบัญชี</CardTitle>
            <CardDescription>
              สรุปยอดเงินคงเหลือในทุกบัญชีของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                <WalletCards className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold">ยังไม่มียอดคงเหลือ</h3>
                <p>เพิ่มธุรกรรมเพื่อดูยอดคงเหลือในบัญชีของคุณ</p>
            </div>
          </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ยอดคงเหลือแต่ละบัญชี</CardTitle>
        <CardDescription>
          ยอดเงินคงเหลือแยกตามประเภทบัญชี
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">บัญชีทั่วไป</TabsTrigger>
                <TabsTrigger value="saving">บัญชีออม</TabsTrigger>
                <TabsTrigger value="investment">บัญชีลงทุน</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
                <BalanceTable balances={generalBalances} total={totalGeneral} noDataMessage="ไม่พบบัญชีทั่วไป" />
            </TabsContent>
            <TabsContent value="saving" className="mt-4">
                <BalanceTable balances={savingBalances} total={totalSaving} noDataMessage="ไม่พบบัญชีออมทรัพย์" />
            </TabsContent>
            <TabsContent value="investment" className="mt-4">
                <BalanceTable balances={investmentBalances} total={totalInvestment} noDataMessage="ไม่พบบัญชีลงทุน" />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
