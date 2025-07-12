'use client';

import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CandlestickChart, AlertCircle, Info } from 'lucide-react';

const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 4,
});

export function ExchangeRateDisplay() {
  const { rate, isLoading, error } = useExchangeRate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CandlestickChart className="h-5 w-5" />
          <span>อัตราแลกเปลี่ยน</span>
        </CardTitle>
        <CardDescription>
          อัตราแลกเปลี่ยน USD เป็น THB ล่าสุด
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div className="flex flex-col">
                <span className="font-semibold">เกิดข้อผิดพลาด</span>
                <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        {!isLoading && !error && rate && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">1 USD เท่ากับ</p>
              <p className="text-3xl font-bold tracking-tight">
                {thbFormatter.format(rate)}
              </p>
            </div>
            {rate >= 33.5 && (
              <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>เป็นช่วงเวลาที่ดีในการพิจารณาแลกเงินบาทเป็นดอลลาร์</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
