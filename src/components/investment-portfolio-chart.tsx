'use client';

import { useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from './ui/chart';
import type { Transaction } from '@/lib/types';
import { investmentAccountNames } from '@/lib/data';
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
  const { chartData, chartConfig, totalValue } = useMemo(() => {
    const investmentBalances = new Map<string, number>();

    // Initialize all investment accounts with a balance of 0
    investmentAccountNames.forEach(accName => {
        investmentBalances.set(accName, 0);
    });

    const investmentTransactions = transactions.filter(t => 
        investmentAccountNames.includes(t.account.name)
    );

    // Calculate the net balance for each investment account
    investmentTransactions.forEach(t => {
        const currentBalance = investmentBalances.get(t.account.name) ?? 0;
        // The amount is already positive for income and negative for expense
        investmentBalances.set(t.account.name, currentBalance + t.amount);
    });

    const data = Array.from(investmentBalances.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0) // Only show accounts with a positive balance in the chart
      .map((item, index) => ({
        ...item,
        fill: chartColors[index % chartColors.length],
      }));
      
    const value = data.reduce((acc, curr) => acc + curr.value, 0);

    const config: ChartConfig = data.reduce((acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);

    return { chartData: data, chartConfig: config, totalValue: value };
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
