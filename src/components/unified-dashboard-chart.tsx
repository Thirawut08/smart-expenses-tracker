import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from './ui/chart';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useAccounts } from '@/hooks/use-accounts';
import { investmentAccountNames, savingAccountNames } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { Loader2, PieChartIcon, TrendingUp, PiggyBank } from 'lucide-react';
import { ChartContainer } from './ui/chart';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
];

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function UnifiedDashboardChart({ transactions, mode, periodLabel }: {
  transactions: Transaction[];
  mode: 'total' | 'invest' | 'save';
  periodLabel: string;
}) {
  const { rate: usdToThbRate, isLoading: isRateLoading } = useExchangeRate();
  const { accounts } = useAccounts();

  // Prepare chart data for each mode
  const { chartData, total, emptyIcon, emptyText, legend } = useMemo(() => {
    if (!usdToThbRate || isRateLoading) {
      return { chartData: [], total: 0, emptyIcon: Loader2, emptyText: 'กำลังโหลดข้อมูล...', legend: [] };
    }
    if (mode === 'total') {
      // Income vs Expense (THB)
      const getAmountInTHB = (t: Transaction) => {
        return t.account && t.account.currency === 'USD'
          ? t.amount * usdToThbRate
          : t.amount;
      };
      const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + getAmountInTHB(t), 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(getAmountInTHB(t)), 0);
      return {
        chartData: [
          { name: 'รายรับ', value: income, fill: '#22c55e' },
          { name: 'รายจ่าย', value: expense, fill: '#ef4444' },
        ],
        total: income - expense,
        emptyIcon: PieChartIcon,
        emptyText: 'ยังไม่มีสถิติ',
        legend: [
          { label: 'รายรับ', color: '#22c55e' },
          { label: 'รายจ่าย', color: '#ef4444' },
        ],
      };
    } else if (mode === 'invest') {
      // กรองธุรกรรมที่ purpose มีคำว่า 'ลงทุน'
      const investmentTransactions = transactions.filter(t => t.purpose && t.purpose.includes('ลงทุน'));
      const balances = new Map<string, number>();
      investmentTransactions.forEach(t => {
        const accName = t.account.name;
        const prev = balances.get(accName) || 0;
        // แปลง USD เป็น THB ก่อนรวมยอด
        const amountInTHB = t.account && t.account.currency === 'USD'
          ? t.amount * usdToThbRate
          : t.amount;
        const amount = t.type === 'income' ? amountInTHB : -amountInTHB;
        balances.set(accName, prev + amount);
      });
      const data = Array.from(balances.entries())
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value !== 0);
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return {
        chartData: data.map((item, i) => ({ ...item, fill: COLORS[i % COLORS.length] })),
        total,
        emptyIcon: TrendingUp,
        emptyText: 'ยังไม่มีข้อมูลการลงทุน',
        legend: data.map((item, i) => ({ label: item.name, color: COLORS[i % COLORS.length] })),
      };
    } else if (mode === 'save') {
      // กรองธุรกรรมที่ purpose มีคำว่า 'ออม'
      const savingTransactions = transactions.filter(t => t.purpose && t.purpose.includes('ออม'));
      const balances = new Map<string, number>();
      savingTransactions.forEach(t => {
        const accName = t.account.name;
        const prev = balances.get(accName) || 0;
        // แปลง USD เป็น THB ก่อนรวมยอด
        const amountInTHB = t.account && t.account.currency === 'USD'
          ? t.amount * usdToThbRate
          : t.amount;
        const amount = t.type === 'income' ? amountInTHB : -amountInTHB;
        balances.set(accName, prev + amount);
      });
      const data = Array.from(balances.entries())
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value !== 0);
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return {
        chartData: data.map((item, i) => ({ ...item, fill: COLORS[i % COLORS.length] })),
        total,
        emptyIcon: PiggyBank,
        emptyText: 'ยังไม่มีข้อมูลเงินออม',
        legend: data.map((item, i) => ({ label: item.name, color: COLORS[i % COLORS.length] })),
      };
    }
    return { chartData: [], total: 0, emptyIcon: PieChartIcon, emptyText: 'ยังไม่มีข้อมูล', legend: [] };
  }, [transactions, mode, usdToThbRate, isRateLoading]);

  // Empty state
  if (!isRateLoading && chartData.length === 0) {
    const Icon = emptyIcon;
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Icon className="w-12 h-12 mb-2 opacity-60" />
        <div className="text-base font-medium">{emptyText}</div>
        <div className="text-xs mt-1">เพิ่มธุรกรรมเพื่อดูข้อมูล</div>
      </div>
    );
  }

  // Main chart
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-2 flex flex-col items-center">
        <div className="text-xl font-bold">
          {mode === 'total' ? `ภาพรวม (${periodLabel})` : mode === 'invest' ? `ลงทุน (${periodLabel})` : `ออม (${periodLabel})`}
        </div>
      </div>
      <div className="w-full max-w-md mx-auto">
        <ChartContainer config={{}} className="w-full">
          <ResponsiveContainer width="100%" aspect={1}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel formatter={(value, name) => `${name}: ${currencyFormatter.format(value as number)}`} />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="30%"
                outerRadius="60%"
                strokeWidth={5}
                labelLine={false}
                isAnimationActive={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
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
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {currencyFormatter.format(value as number)}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        {legend.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      {/* ยอดรวม THB และ USD */}
      <div className="mt-4 flex flex-col items-center text-center">
        <span className="text-sm text-muted-foreground">
          {mode === 'total' ? 'คงเหลือสุทธิ' : mode === 'invest' ? 'ยอดลงทุนรวม' : 'ยอดออมรวม'}
        </span>
        <span className={`text-2xl font-bold ${total >= 0 ? '' : 'text-red-600'}`}>
          {isRateLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : currencyFormatter.format(total)}
        </span>
        {/* แสดงยอด USD ถ้ามี */}
        {(() => {
          let usdSum = 0;
          if (mode === 'invest') {
            // รวม USD เฉพาะธุรกรรมลงทุน
            const investmentTransactions = transactions.filter(t => t.purpose && t.purpose.includes('ลงทุน'));
            investmentTransactions.forEach(t => {
              if (t.account && t.account.currency === 'USD') {
                usdSum += t.type === 'income' ? t.amount : -t.amount;
              }
            });
          } else if (mode === 'save') {
            // รวม USD เฉพาะธุรกรรมออม
            const savingTransactions = transactions.filter(t => t.purpose && t.purpose.includes('ออม'));
            savingTransactions.forEach(t => {
              if (t.account && t.account.currency === 'USD') {
                usdSum += t.type === 'income' ? t.amount : -t.amount;
              }
            });
          }
          if (usdSum !== 0) {
            // แสดงเป็น 892.00 USD (ไม่มี $ ซ้ำ)
            return <span className="text-xs text-muted-foreground mt-1">({usdSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)</span>;
          }
          return null;
        })()}
      </div>
    </div>
  );
} 