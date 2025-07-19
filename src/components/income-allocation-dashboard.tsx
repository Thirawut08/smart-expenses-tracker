"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  HandCoins,
  PiggyBank,
  Briefcase,
  Landmark,
  Loader2,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const thbFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface AllocationCardProps {
  title: string;
  amount: number;
  percentage: string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

const AllocationCard = ({
  title,
  amount,
  percentage,
  icon: Icon,
  color,
  isLoading,
}: AllocationCardProps) => (
  <Card className="flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent className="flex flex-col justify-end flex-grow">
      {isLoading ? (
        <Skeleton className="h-8 w-3/4 mb-1" />
      ) : (
        <div className="text-2xl font-bold">{thbFormatter.format(amount)}</div>
      )}
      <p className="text-xs text-muted-foreground">{percentage}</p>
    </CardContent>
  </Card>
);

export function IncomeAllocationDashboard({
  totalIncome,
  isLoading,
}: {
  totalIncome: number;
  isLoading?: boolean;
}) {
  const spending = totalIncome * 0.5;
  const savings = totalIncome * 0.3;
  const investment = totalIncome * 0.2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>สรุปการจัดสรรรายได้ (50/30/20)</CardTitle>
        <CardDescription>
          แบ่งรายได้ของคุณตามหลักการ 50% (ใช้จ่าย), 30% (ออม), 20% (ลงทุน)
          {isLoading && (
            <span className="text-xs text-muted-foreground ml-2">
              (กำลังโหลดอัตราแลกเปลี่ยน...)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AllocationCard
            title="เงินใช้ (50%)"
            amount={spending}
            percentage="สำหรับค่าใช้จ่ายในชีวิตประจำวัน"
            icon={HandCoins}
            color="text-sky-500"
            isLoading={isLoading}
          />
          <AllocationCard
            title="เงินออม (30%)"
            amount={savings}
            percentage="สำหรับเป้าหมายและเหตุฉุกเฉิน"
            icon={PiggyBank}
            color="text-green-500"
            isLoading={isLoading}
          />
          <AllocationCard
            title="ลงทุน (20%)"
            amount={investment}
            percentage="เพื่อสร้างความมั่งคั่งในอนาคต"
            icon={Briefcase}
            color="text-amber-500"
            isLoading={isLoading}
          />
          <Card className="lg:col-span-1 md:col-span-2 bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                รายได้รวมทั้งหมด
              </CardTitle>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Landmark className="h-4 w-4" />
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-1/2 bg-primary-foreground/20" />
              ) : (
                <div className="text-2xl font-bold">
                  {thbFormatter.format(totalIncome)}
                </div>
              )}
              <p className="text-xs">ยอดรวมก่อนการจัดสรร</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
