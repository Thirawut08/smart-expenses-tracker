'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Transaction } from '@/lib/types';
import { investmentAccountNames, savingAccountNames } from '@/lib/data';
import { WalletCards } from 'lucide-react';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useAccounts } from '@/hooks/use-accounts';
import { convertToTHB } from '@/lib/utils';

const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function formatCurrency(amount: number, currency: 'THB' | 'USD') {
  if (currency === 'THB') return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return amount;
}

const BalanceTable = ({ balances, totalInThb, noDataMessage }: { balances: {name: string, balance: number, currency: 'THB' | 'USD'}[], totalInThb: number, noDataMessage: string }) => {
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
                <p className="text-sm text-muted-foreground">ยอดรวม (เทียบเท่า THB)</p>
                <p className={`text-xl font-bold ${totalInThb >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {thbFormatter.format(totalInThb)}
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
                            {formatCurrency(acc.balance, acc.currency)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function AccountBalances({ transactions, flatTable, filterType }: { transactions: Transaction[], flatTable?: boolean, filterType?: string }) {
  const { rate: usdToThbRate, isLoading: isRateLoading } = useExchangeRate();
  const { accounts } = useAccounts();

  // Group accounts by type (multi-group: 1 account in many types)
  const filteredAccounts = useMemo(() => {
    if (!filterType || filterType === 'all') return accounts;
    return accounts.filter(acc => Array.isArray(acc.types) ? acc.types.includes(filterType) : acc.types === filterType);
  }, [accounts, filterType]);

  const accountsByType = useMemo(() => {
    const groups: Record<string, typeof accounts> = {};
    filteredAccounts.forEach(acc => {
      const types = Array.isArray(acc.types) && acc.types.length > 0 ? acc.types : ['ทั่วไป'];
      types.forEach(type => {
        if (!groups[type]) groups[type] = [];
        groups[type].push(acc);
      });
    });
    return groups;
  }, [filteredAccounts]);

  // Calculate balances for each group
  const balancesByType = useMemo(() => {
    const result: Record<string, { balances: {name: string, balance: number, currency: 'THB' | 'USD'}[], totalInThb: number }> = {};
    Object.entries(accountsByType).forEach(([type, accs]) => {
      const balances = new Map<string, { balance: number, currency: 'THB' | 'USD' }>();
      accs.forEach(acc => {
        balances.set(acc.name, { balance: 0, currency: acc.currency });
      });
      transactions.forEach(t => {
        if (balances.has(t.account.name)) {
          const currentData = balances.get(t.account.name)!;
          const amount = t.type === 'income' ? t.amount : -t.amount;
          balances.set(t.account.name, { ...currentData, balance: currentData.balance + amount });
        }
      });
      const sortedBalances = Array.from(balances.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => a.name.localeCompare(b.name));
      const totalInThb = sortedBalances.reduce((sum, acc) => sum + convertToTHB(acc.balance, acc.currency, usdToThbRate || 0), 0);
      result[type] = { balances: sortedBalances, totalInThb };
    });
    return result;
  }, [accountsByType, transactions, usdToThbRate]);

  if (transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground bg-muted/30 rounded-lg">
            <WalletCards className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">ยังไม่มียอดคงเหลือ</h3>
            <p>เพิ่มธุรกรรมเพื่อดูยอดคงเหลือในบัญชีของคุณ</p>
        </div>
      )
  }

  if (flatTable) {
    // รวมบัญชีทุกประเภทในตารางเดียว โดยแสดง group type
    let allBalances: {type: string, name: string, balance: number, currency: 'THB' | 'USD'}[] = [];
    Object.entries(balancesByType).forEach(([type, { balances }]) => {
      balances.forEach(acc => allBalances.push({ type, ...acc }));
    });
    if (filterType && filterType !== 'all') {
      allBalances = allBalances.filter(acc => acc.type === filterType);
    }
    const totalAll = allBalances.reduce((sum, acc) => sum + convertToTHB(acc.balance, acc.currency, usdToThbRate || 0), 0);
    return (
      <div>
        <div className="text-right mb-4">
          <p className="text-sm text-muted-foreground">ยอดรวม (เทียบเท่า THB)</p>
          <p className={`text-xl font-bold ${totalAll >= 0 ? 'text-green-600' : 'text-red-600'}`}>{thbFormatter.format(totalAll)}</p>
        </div>
        <div className="overflow-visible">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead>บัญชี</TableHead>
                <TableHead className="text-right">ยอดคงเหลือ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBalances.map((acc) => (
                <TableRow key={acc.type + '-' + acc.name}>
                  <TableCell>{acc.type}</TableCell>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell className={`text-right font-semibold ${acc.balance >= 0 ? '' : 'text-red-600'}`}>{formatCurrency(acc.balance, acc.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // แสดงแบบ group ตามประเภท (filterType มีผลด้วย)
  const groupTypes = filterType && filterType !== 'all' ? [filterType] : Object.keys(balancesByType);
  return (
    <Card>
      <CardHeader>
        <CardTitle>ยอดคงเหลือแต่ละบัญชี</CardTitle>
        <CardDescription>
          ยอดเงินคงเหลือแยกตามประเภทบัญชี
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groupTypes.map(type => (
          balancesByType[type] ? (
            <div key={type} className="mb-8">
              <div className="mb-2 text-lg font-semibold">{type}</div>
              <BalanceTable balances={balancesByType[type].balances} totalInThb={balancesByType[type].totalInThb} noDataMessage={`ไม่พบบัญชีประเภท ${type}`} />
            </div>
          ) : null
        ))}
      </CardContent>
    </Card>
  );
}
