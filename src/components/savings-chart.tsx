'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/lib/types';
import { savingAccountNames, accounts } from '@/lib/data';
import { PiggyBank } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function SavingsChart({ transactions }: { transactions: Transaction[] }) {
  const { chartData, totalSavings } = useMemo(() => {
    const savingTransactions = transactions.filter(t => savingAccountNames.includes(t.account.name));

    if (savingTransactions.length === 0) {
      return { chartData: [], totalSavings: 0 };
    }

    const balances = new Map<string, number>();
    const accountDetails = new Map<string, { name: string, color: string }>();

    savingAccountNames.forEach(name => {
      const account = accounts.find(a => a.name === name);
      if (account) {
          balances.set(name, 0);
          accountDetails.set(name, { name: account.name, color: account.color || '#8884d8' });
      }
    });

    savingTransactions.forEach(t => {
      const currentBalance = balances.get(t.account.name) ?? 0;
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances.set(t.account.name, currentBalance + amount);
    });
    
    const dataWithValues = Array.from(balances.entries())
      .map(([name, balance]) => ({ 
        name, 
        value: balance,
        color: accountDetails.get(name)?.color
      }))
      .filter(item => item.value !== 0)
      .sort((a, b) => b.value - a.value);

    const chartData = dataWithValues.map(item => ({
        ...item,
        chartValue: Math.abs(item.value)
    }));

    const totalSavings = dataWithValues.reduce((sum, item) => sum + item.value, 0);
    
    return { chartData, totalSavings };
  }, [transactions]);
  
  if (chartData.length === 0) {
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
        <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    formatter={(value, name, props) => `${props.payload.name}: ${currencyFormatter.format(props.payload.value)}`} 
                    hideLabel 
                />}
              />
              <Pie
                data={chartData}
                dataKey="chartValue"
                nameKey="name"
                innerRadius="30%"
                outerRadius="60%"
                strokeWidth={5}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180
                  const radius = 25 + innerRadius + (outerRadius - innerRadius)
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)

                  return (
                    <text
                      x={x}
                      y={y}
                      className="fill-muted-foreground text-xs"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                    >
                      {currencyFormatter.format(chartData[index].value)}
                    </text>
                  )
                }}
              >
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-col items-center text-center">
            <span className="text-sm text-muted-foreground">ยอดออมรวม</span>
            <span className={`text-2xl font-bold ${totalSavings >= 0 ? '' : 'text-red-600'}`}>
              {currencyFormatter.format(totalSavings)}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}
