"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useAccounts } from "@/hooks/use-accounts";
import { TimePicker } from "./time-picker";
import { useEffect, useMemo } from "react";
import { HighPerfDropdown } from "./ui/high-perf-dropdown";
import { DateTimePicker } from "./date-time-picker";

const incomeFormSchema = z.object({
  date: z.date({ required_error: "กรุณาระบุวันที่" }),
  accountId: z
    .string({ required_error: "กรุณาเลือกบัญชี" })
    .min(1, "กรุณาเลือกบัญชี"),
  amount: z.coerce.number().positive("จำนวนเงินต้องเป็นบวก"),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface AddIncomeFormProps {
  initialData?: {
    id: string;
    date: Date;
    amount: number;
    accountId: string;
  } | null;
  onSubmit: (data: IncomeFormValues) => void;
  onCancel: () => void;
}

// เพิ่มฟังก์ชัน getContrastColor
function getContrastColor(bg: string) {
  if (!bg) return "#222";
  const hex = bg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#222" : "#fff";
}

export function AddIncomeForm({
  initialData,
  onSubmit,
  onCancel,
}: AddIncomeFormProps) {
  const { accounts } = useAccounts();
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      date: initialData?.date ?? new Date(),
      accountId: initialData?.accountId ?? "",
      amount: initialData?.amount ?? undefined,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    form.reset({
      date: initialData?.date ?? new Date(),
      accountId: initialData?.accountId ?? "",
      amount: initialData?.amount ?? undefined,
    });
  }, [initialData, form]);

  const selectedAccountId = form.watch("accountId");

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === selectedAccountId),
    [selectedAccountId, accounts],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 p-4 max-w-md mx-auto"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onCancel();
          }
        }}
      >
        <h2 className="text-xl font-bold mb-4">เพิ่มรายการรายรับ</h2>
        {/* 1. จำนวนเงิน */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">1</span> จำนวนเงิน
          </FormLabel>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            {...form.register("amount")}
            value={form.watch("amount") ?? ""}
            className={cn(selectedAccount && "pl-8", "h-12 text-lg w-full px-4")}
            autoFocus
            required
            tabIndex={1}
          />
          {selectedAccount && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              {selectedAccount.currency === "USD" ? "$" : "฿"}
            </span>
          )}
        </div>
        {/* 2. บัญชี */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">2</span> บัญชี
          </FormLabel>
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <HighPerfDropdown
                  options={accounts.map((acc) => ({ value: acc.id, label: acc.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="เลือกบัญชี..."
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* 3. วันที่ */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">3</span> วันที่
          </FormLabel>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <DateTimePicker value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* ปุ่มบันทึก/ยกเลิก */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-9 px-4 text-sm font-semibold"
            tabIndex={4}
          >
            ยกเลิก
          </Button>
          <Button type="submit" className="h-9 px-6 text-sm font-bold" tabIndex={5}>
            {initialData ? "บันทึกการเปลี่ยนแปลง" : "บันทึกรายรับ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
