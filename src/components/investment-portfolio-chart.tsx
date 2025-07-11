'use client';

import { useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from './ui/chart';
import type { Transaction } from '@/lib/types';
import { accounts, investmentAccountNames } from '@/lib/data';
import { PieChart as PieChartIcon } from 'lucide-react';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface InvestmentPortfolioChartProps {
    transactions: Transaction[];
}

export function InvestmentPortfolioChart({ transactions }: InvestmentPortfolioChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const investmentBalances = new Map<string, number>();

    // Initialize investment accounts with 0 balance
    investmentAccountNames.forEach(accName => {
      investmentBalances.set(accName, 0);
    });

    // Calculate balances from transactions
    transactions.forEach(t => {
      if (investmentAccountNames.includes(t.account.name)) {
        const currentBalance = investmentBalances.get(t.account.name) ?? 0;
        // For investments, we usually care about the net positive value.
        // Expenses in investment accounts are typically buying assets, thus increasing portfolio value.
        // We'll treat all amounts as positive contributions to the balance for this chart.
        investmentBalances.set(t.account.name, currentBalance + Math.abs(t.amount));
      }
    });

    const data = Array.from(investmentBalances.entries())
      .filter(([, balance]) => balance > 0) // Only show accounts with a positive balance
      .map(([name, value], index) => ({
        name,
        value,
        fill: chartColors[index % chartColors.length],
      }));

    const config: ChartConfig = data.reduce((acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);

    config.value = { label: 'Value' };

    return { chartData: data, chartConfig: config };
  }, [transactions]);
  
  if (chartData.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>สัดส่วนการลงทุน</CardTitle>
                <CardDescription>ภาพรวมสัดส่วนของพอร์ตการออมและการลงทุนทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                    <PieChartIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">ยังไม่มีข้อมูลการลงทุน</h3>
                    <p>เพิ่มธุรกรรมในบัญชีลงทุนเพื่อดูสัดส่วนของคุณ</p>
                </div>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สัดส่วนการลงทุน</CardTitle>
        <CardDescription>
          ภาพรวมสัดส่วนของพอร์ตการออมและการลงทุนทั้งหมด
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
          <ResponsiveContainer>
             <PieChart>
              <Tooltip
                formatter={(value) => currencyFormatter.format(value as number)}
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={true}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 12 + innerRadius + (outerRadius - innerRadius);
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;


                  return (
                    <text
                      x={x}
                      y={y}
                      className="fill-muted-foreground text-xs"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {chartData[index].name} ({percentage.toFixed(0)}%)
                    </text>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
