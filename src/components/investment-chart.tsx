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
import { investmentAccountNames } from "@/lib/data";
import { useAccounts } from "@/hooks/use-accounts";
import { TrendingUp, Loader2 } from "lucide-react";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import { Skeleton } from "./ui/skeleton";
import { convertToTHB } from "@/lib/utils";

const thbFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number, currency: "THB" | "USD" | undefined) => {
  if (currency === "USD") {
    return usdFormatter.format(value);
  }
  return thbFormatter.format(value);
};

export function InvestmentChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { rate: usdToThbRate, isLoading: isRateLoading } = useExchangeRate();
  const { accounts } = useAccounts();

  const { chartData, totalInvestmentInTHB } = useMemo(() => {
    if (isRateLoading || !usdToThbRate) {
      return { chartData: [], totalInvestmentInTHB: 0 };
    }
    // กรองธุรกรรมที่ purpose มีคำว่า 'ลงทุน'
    const investmentTransactions = transactions.filter(
      (t) => t.purpose && t.purpose.includes("ลงทุน"),
    );
    if (investmentTransactions.length === 0) {
      return { chartData: [], totalInvestmentInTHB: 0 };
    }
    // สร้าง balances ตามบัญชีที่พบในธุรกรรมลงทุน
    const balances = new Map<
      string,
      { balance: number; currency: "THB" | "USD" }
    >();
    investmentTransactions.forEach((t) => {
      const accName = t.account.name;
      const accCurrency = t.account.currency;
      const prev = balances.get(accName) || {
        balance: 0,
        currency: accCurrency,
      };
      const amount = t.type === "income" ? t.amount : -t.amount;
      balances.set(accName, {
        balance: prev.balance + amount,
        currency: accCurrency,
      });
    });
    const dataWithValues = Array.from(balances.entries())
      .map(([name, { balance, currency }]) => {
        const balanceInTHB = convertToTHB(balance, currency, usdToThbRate || 0);
        return { name, value: balance, valueInTHB: balanceInTHB, currency };
      })
      .filter((item) => item.value !== 0)
      .sort((a, b) => b.valueInTHB - a.valueInTHB);
    const chartData = dataWithValues.map((item) => ({
      ...item,
      chartValue: Math.abs(item.valueInTHB),
    }));
    const totalInvestmentInTHB = dataWithValues.reduce(
      (sum, item) => sum + item.valueInTHB,
      0,
    );
    return { chartData, totalInvestmentInTHB };
  }, [transactions, usdToThbRate, isRateLoading]);

  // Guard: ถ้าข้อมูลยังไม่พร้อมหรือ format ผิด
  if (
    isRateLoading ||
    !usdToThbRate ||
    !Array.isArray(chartData) ||
    !Array.isArray(accounts) ||
    accounts.length === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ภาพรวมการลงทุน</CardTitle>
          <CardDescription>
            กำลังโหลดข้อมูลอัตราแลกเปลี่ยนหรือบัญชี...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground bg-muted/30 rounded-lg">
            <Loader2 className="w-16 h-16 mb-4 animate-spin" />
            <h3 className="text-xl font-semibold">กำลังโหลดข้อมูล...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

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
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ภาพรวมการลงทุน</CardTitle>
        <CardDescription>สัดส่วนยอดเงินคงเหลือในบัญชีลงทุน</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {isRateLoading ? (
          <div className="flex flex-col items-center justify-center h-[318px]">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square h-[250px]"
            >
              <ResponsiveContainer>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => {
                          const { payload } = props;
                          const originalValueFormatted = formatCurrency(
                            payload.value,
                            payload.currency,
                          );
                          const thbValueFormatted = thbFormatter.format(
                            payload.valueInTHB,
                          );

                          let displayValue = `${originalValueFormatted}`;
                          if (payload.currency === "USD") {
                            displayValue += ` (${thbValueFormatted})`;
                          }

                          return `${payload.name}: ${displayValue}`;
                        }}
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
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 flex flex-col items-center text-center">
              <span className="text-sm text-muted-foreground">
                ยอดลงทุนรวม (เทียบเท่า THB)
              </span>
              <span
                className={`text-2xl font-bold ${totalInvestmentInTHB >= 0 ? "" : "text-red-600"}`}
              >
                {thbFormatter.format(totalInvestmentInTHB)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
