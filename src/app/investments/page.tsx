'use client';

import { InvestmentBreakdownChart } from '@/components/investment-breakdown-chart';
import { InvestmentPerformanceChart } from '@/components/investment-performance-chart';

export default function InvestmentsPage() {
  // Mock data based on the image provided
  const investmentData = [
    { name: 'KGI Port', investment: 3000, current: 3100 },
    { name: 'JITTA Ranking VN', investment: 5000, current: 4900 },
    { name: 'JITTA ETF (เติบโต)', investment: 5000, current: 4800 },
    { name: 'KBANK Port', investment: 3000, current: 2300 },
    { name: 'Make Saving', investment: 2000, current: 1500 },
    { name: 'BitKub', investment: 1000, current: 800 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">ภาพรวมการลงทุน</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InvestmentBreakdownChart data={investmentData} />
        <InvestmentPerformanceChart data={investmentData} />
      </div>
    </div>
  );
}
