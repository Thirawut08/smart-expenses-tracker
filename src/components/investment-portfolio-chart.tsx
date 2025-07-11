'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from './ui/chart';

const chartData = [
  { name: 'BitKub', value: 800, fill: 'hsl(var(--chart-1))' },
  { name: 'Make Saving', value: 1500, fill: 'hsl(var(--chart-2))' },
  { name: 'KBANK Port', value: 2300, fill: 'hsl(var(--chart-3))' },
  { name: 'JITTA ETF', value: 4800, fill: 'hsl(var(--chart-4))' },
  { name: 'JITTA Ranking', value: 4900, fill: 'hsl(var(--chart-5))' },
  { name: 'KGI Port', value: 3100, fill: 'hsl(var(--chart-1))' },
];

const chartConfig = {
  value: {
    label: 'Value',
  },
  BitKub: {
    label: 'BitKub',
    color: 'hsl(var(--chart-1))',
  },
  'Make Saving': {
    label: 'Make Saving',
    color: 'hsl(var(--chart-2))',
  },
  'KBANK Port': {
    label: 'KBANK Port',
    color: 'hsl(var(--chart-3))',
  },
  'JITTA ETF': {
    label: 'JITTA ETF',
    color: 'hsl(var(--chart-4))',
  },
  'JITTA Ranking': {
    label: 'JITTA Ranking',
    color: 'hsl(var(--chart-5))',
  },
  'KGI Port': {
    label: 'KGI Port',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});


export function InvestmentPortfolioChart() {
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

                  return (
                    <text
                      x={x}
                      y={y}
                      className="fill-muted-foreground text-xs"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {chartData[index].name} ({((value / chartData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%)
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
