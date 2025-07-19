"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/lib/types";
import { PiggyBank } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function SavingsChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { accounts } = useAccounts();
  const { chartData, totalSavings } = useMemo(() => {
    // กรองธุรกรรมที่ purpose มีคำว่า 'ออม'
    const savingTransactions = transactions.filter(
      (t) => t.purpose && t.purpose.includes('ออม')
    );
    if (savingTransactions.length === 0) {
      return { chartData: [], totalSavings: 0 };
    }
    // สร้าง balances ตามบัญชีที่พบในธุรกรรมออม
    const balances = new Map<string, number>();
    savingTransactions.forEach((t) => {
      const accName = t.account.name;
      const prev = balances.get(accName) || 0;
      const amount = t.type === "income" ? t.amount : -t.amount;
      balances.set(accName, prev + amount);
    });
    const dataWithValues = Array.from(balances.entries())
      .map(([name, balance]) => ({ name, value: balance }))
      .filter((item) => item.value !== 0)
      .sort((a, b) => b.value - a.value);
    const chartData = dataWithValues.map((item) => ({
      ...item,
      chartValue: Math.abs(item.value),
    }));
    const totalSavings = dataWithValues.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    return { chartData, totalSavings };
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <PiggyBank className="w-12 h-12 mb-2 opacity-60" />
        <div className="text-base font-medium">ยังไม่มีข้อมูลเงินออม</div>
        <div className="text-xs mt-1">เพิ่มธุรกรรมในบัญชีออมทรัพย์ของคุณ</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-2">
        <div className="text-xl font-bold">ภาพรวมเงินออม</div>
        <div className="text-sm text-muted-foreground">
          สัดส่วนยอดเงินคงเหลือในบัญชีออมทรัพย์
        </div>
      </div>
      <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
        <ResponsiveContainer>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) =>
                    `${props.payload.name}: ${currencyFormatter.format(props.payload.value)}`
                  }
                  hideLabel
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="chartValue"
              nameKey="name"
              innerRadius="30%"
              outerRadius="60%"
              strokeWidth={5}
              labelLine={false}
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
                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

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
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    ["#222", "#8884d8", "#82ca9d", "#ffc658", "#ff8042"][
                      index % 5
                    ]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-4 flex flex-col items-center text-center">
        <span className="text-sm text-muted-foreground">ยอดออมรวม</span>
        <span
          className={`text-2xl font-bold ${totalSavings >= 0 ? "" : "text-red-600"}`}
        >
          {currencyFormatter.format(totalSavings)}
        </span>
      </div>
    </div>
  );
}
