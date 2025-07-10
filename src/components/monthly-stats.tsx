'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { BarChartIcon } from 'lucide-react';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--chart-1))',
  },
  expense: {
    label: 'Expense',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function MonthlyStats({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const monthlyData: { [key: string]: { month: string; income: number; expense: number } } = {};

    transactions.forEach(t => {
      const monthKey = format(t.date, 'yyyy-MM');
      const monthLabel = format(t.date, 'MMM yyyy');

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expense += Math.abs(t.amount);
      }
    });

    return Object.values(monthlyData).sort((a,b) => a.month.localeCompare(b.month));
  }, [transactions]);
  
  if (data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>No data available to display statistics.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[350px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                    <BarChartIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">No Statistics Yet</h3>
                    <p>Add some transactions to see your monthly breakdown.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
        <CardDescription>A summary of your income and expenses per month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `$${value / 1000}k`} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
