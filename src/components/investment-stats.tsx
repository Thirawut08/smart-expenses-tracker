'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { PiggyBank } from 'lucide-react';
import { investmentAccountNames } from '@/lib/data';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function InvestmentStats({ transactions, monthLabel }: { transactions: Transaction[], monthLabel: string }) {
  const { totalIncome, totalExpense, totalNet } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalIncome: 0, totalExpense: 0, totalNet: 0 };
    }
    
    const investmentTransactions = transactions.filter(t => investmentAccountNames.includes(t.account.name));

    const income = investmentTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = investmentTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalNet: income - expense,
    };
  }, [transactions]);

  const cardTitle = `สรุปการออมและการลงทุน (${monthLabel})`;
  
  const hasInvestmentTransactions = useMemo(() => 
    transactions.some(t => investmentAccountNames.includes(t.account.name)), 
    [transactions]
  );
  
  if (!hasInvestmentTransactions) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>ไม่มีข้อมูลสำหรับบัญชีออมทรัพย์และการลงทุน</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                    <PiggyBank className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">ยังไม่มีข้อมูล</h3>
                    <p>เพิ่มธุรกรรมในบัญชีลงทุนเพื่อดูสรุป</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>สรุปรายรับ-รายจ่ายสำหรับบัญชีลงทุนทั้งหมด</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-8">
        <div className="flex flex-col items-center text-center">
            <span className="text-sm text-muted-foreground">คงเหลือสุทธิ (ลงทุน)</span>
            <span className={`text-4xl font-bold ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currencyFormatter.format(totalNet)}
            </span>
        </div>
        <div className="w-full flex justify-around mt-8 text-lg">
            <div className="text-center">
                <span className="text-muted-foreground">รายรับ</span>
                <p className="font-semibold text-green-600 text-2xl">{currencyFormatter.format(totalIncome)}</p>
            </div>
            <div className="text-center">
                <span className="text-muted-foreground">รายจ่าย</span>
                <p className="font-semibold text-red-600 text-2xl">{currencyFormatter.format(totalExpense)}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
