'use client';

import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, ArrowRight, Wallet, TrendingDown } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

export function InvestmentStats({ transactions }: { transactions: Transaction[] }) {
    const { totalDeposits, totalWithdrawals, netInvestment } = useMemo(() => {
        const deposits = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const withdrawals = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        
        return {
            totalDeposits: deposits,
            totalWithdrawals: withdrawals,
            netInvestment: deposits - withdrawals,
        };
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>สรุปการออมและการลงทุน</CardTitle>
                <CardDescription>
                    ภาพรวมของเงินทุนเข้าและออกจากบัญชีเพื่อการลงทุนทั้งหมด
                </CardDescription>
            </CardHeader>
            <CardContent>
                {transactions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
                            <p className="text-sm text-muted-foreground">เงินทุนเข้าทั้งหมด</p>
                            <p className="text-xl font-bold text-green-600">{currencyFormatter.format(totalDeposits)}</p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <TrendingDown className="mx-auto h-8 w-8 text-red-600 mb-2" />
                            <p className="text-sm text-muted-foreground">เงินทุนออกทั้งหมด</p>
                            <p className="text-xl font-bold text-red-600">{currencyFormatter.format(totalWithdrawals)}</p>
                        </div>
                        <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg">
                            <Wallet className="mx-auto h-8 w-8 text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">เงินลงทุนสุทธิ</p>
                            <p className={`text-xl font-bold ${netInvestment >= 0 ? 'text-primary' : 'text-destructive'}`}>{currencyFormatter.format(netInvestment)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[150px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                        <Wallet className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-semibold">ยังไม่มีข้อมูลการลงทุน</h3>
                        <p>เพิ่มธุรกรรมในบัญชีลงทุนเพื่อดูสรุปของคุณ</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
