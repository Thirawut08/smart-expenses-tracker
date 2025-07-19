"use client";

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
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/lib/types";
import { useMemo } from "react";
import { PieChartIcon, Loader2 } from "lucide-react";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import { convertToTHB } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const chartConfig = {
  income: {
    label: "รายรับ",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "รายจ่าย",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MonthlyStats({
  transactions,
  monthLabel,
}: {
  transactions: Transaction[];
  monthLabel: string;
}) {
  const { rate: usdToThbRate, isLoading: isRateLoading } = useExchangeRate();

  const { chartData, totalIncome, totalExpense, totalNet } = useMemo(() => {
    if (!transactions || transactions.length === 0 || !usdToThbRate) {
      return { chartData: [], totalIncome: 0, totalExpense: 0, totalNet: 0 };
    }

    const getAmountInTHB = (t: Transaction) => {
      return convertToTHB(t.amount, t.account.currency, usdToThbRate);
    };

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + getAmountInTHB(t), 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Math.abs(getAmountInTHB(t)), 0);

    return {
      chartData: [
        { name: "รายรับ", value: income, fill: "var(--color-income)" },
        { name: "รายจ่าย", value: expense, fill: "var(--color-expense)" },
      ],
      totalIncome: income,
      totalExpense: expense,
      totalNet: income - expense,
    };
  }, [transactions, usdToThbRate]);

  const cardTitle = `ภาพรวม (${monthLabel})`;

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>ไม่มีข้อมูลสำหรับแสดงสถิติ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground bg-muted/30 rounded-lg">
            <PieChartIcon className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">ยังไม่มีสถิติ</h3>
            <p>เพิ่มธุรกรรมเพื่อดูภาพรวมของคุณ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>
          สรุปสัดส่วนรายรับและรายจ่ายทั้งหมด (THB)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) =>
                      `${name}: ${currencyFormatter.format(value as number)}`
                    }
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
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
                  if (value === 0) return null;
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
                      {currencyFormatter.format(value as number)}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-col items-center text-center">
          <span className="text-sm text-muted-foreground">คงเหลือสุทธิ</span>
          <span
            className={`text-2xl font-bold ${totalNet >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {isRateLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              currencyFormatter.format(totalNet)
            )}
          </span>
        </div>
        <div className="w-full flex justify-around mt-4 text-sm">
          <div className="text-center">
            <span className="text-muted-foreground">รายรับทั้งหมด</span>
            <p className="font-semibold text-green-600">
              {isRateLoading ? (
                <Loader2 className="w-4 h-4 inline animate-spin" />
              ) : (
                currencyFormatter.format(totalIncome)
              )}
            </p>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">รายจ่ายทั้งหมด</span>
            <p className="font-semibold text-red-600">
              {isRateLoading ? (
                <Loader2 className="w-4 h-4 inline animate-spin" />
              ) : (
                currencyFormatter.format(totalExpense)
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
