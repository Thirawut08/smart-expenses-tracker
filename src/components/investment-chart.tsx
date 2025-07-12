'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/lib/types';
import { investmentAccountNames } from '@/lib/data';
import { TrendingUp } from 'lucide-react';

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
];

export function InvestmentChart({ transactions }: { transactions: Transaction[] }) {
  const { chartData, totalInvestment } = useMemo(() => {
    const investmentTransactions = transactions.filter(t => investmentAccountNames.includes(t.account.name));

    if (investmentTransactions.length === 0) {
      return { chartData: [], totalInvestment: 0 };
    }

    const balances = new Map<string, number>();

    investmentAccountNames.forEach(name => {
      balances.set(name, 0);
    });

    investmentTransactions.forEach(t => {
      const currentBalance = balances.get(t.account.name) ?? 0;
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances.set(t.account.name, currentBalance + amount);
    });
    
    const dataWithValues = Array.from(balances.entries())
      .map(([name, balance]) => ({ name, value: balance }))
      .filter(item => item.value !== 0) 
      .sort((a, b) => b.value - a.value);

    const chartData = dataWithValues.map(item => ({
        ...item,
        chartValue: Math.abs(item.value)
    }));

    const totalInvestment = dataWithValues.reduce((sum, item) => sum + item.value, 0);
    
    return { chartData, totalInvestment };
  }, [transactions]);
  
  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ภาพรวมการลงทุน</CardTitle>
                <CardDescription>ไม่มีข้อมูลการลงทุน</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                    <TrendingUp className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">ยังไม่มีข้อมูลการลงทุน</h3>
                    <p>เพิ่มธุรกรรมในบัญชีลงทุนของคุณ</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ภาพรวมการลงทุน</CardTitle>
        <CardDescription>สัดส่วนยอดเงินคงเหลือในบัญชีลงทุน</CardDescription>
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
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-col items-center text-center">
            <span className="text-sm text-muted-foreground">ยอดลงทุนรวม</span>
            <span className={`text-2xl font-bold ${totalInvestment >= 0 ? '' : 'text-red-600'}`}>
              {currencyFormatter.format(totalInvestment)}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}
