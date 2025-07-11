'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/lib/types';
import { savingAccountNames } from '@/lib/data';
import { PiggyBank } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
].reverse();

export function SavingsChart({ transactions }: { transactions: Transaction[] }) {
  const { chartData, totalSavings } = useMemo(() => {
    const savingTransactions = transactions.filter(t => savingAccountNames.includes(t.account.name));

    if (savingTransactions.length === 0) {
      return { chartData: [], totalSavings: 0 };
    }

    const balances = new Map<string, number>();

    savingAccountNames.forEach(name => {
      balances.set(name, 0);
    });

    savingTransactions.forEach(t => {
      const currentBalance = balances.get(t.account.name) ?? 0;
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances.set(t.account.name, currentBalance + amount);
    });
    
    const chartData = Array.from(balances.entries())
      .map(([name, balance]) => ({ name, value: balance }))
      .filter(item => item.value > 0) // Only show accounts with a positive balance
      .sort((a, b) => b.value - a.value);

    const totalSavings = chartData.reduce((sum, item) => sum + item.value, 0);
    
    return { chartData, totalSavings };
  }, [transactions]);
  
  if (totalSavings === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ภาพรวมเงินออม</CardTitle>
                <CardDescription>ไม่มีข้อมูลเงินออม</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                    <PiggyBank className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">ยังไม่มีข้อมูลเงินออม</h3>
                    <p>เพิ่มธุรกรรมในบัญชีออมทรัพย์ของคุณ</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ภาพรวมเงินออม</CardTitle>
        <CardDescription>สัดส่วนยอดเงินคงเหลือในบัญชีออมทรัพย์</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ChartContainer config={{}} className="mx-auto aspect-square h-[200px]">
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => currencyFormatter.format(value as number)} />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                strokeWidth={5}
              >
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-col items-center text-center">
            <span className="text-sm text-muted-foreground">ยอดออมรวม</span>
            <span className="text-2xl font-bold">
              {currencyFormatter.format(totalSavings)}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}
