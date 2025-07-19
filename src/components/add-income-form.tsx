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
import { parseDayMonthToDate, isValidTime24h } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const incomeFormSchema = z.object({
  day: z
    .string({ required_error: "กรุณาระบุวัน" })
    .refine((val) => /^\d{1,2}$/.test(val) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 31, {
      message: "วันต้องเป็นตัวเลข 1-31",
    }),
  month: z
    .string({ required_error: "กรุณาระบุเดือน" })
    .refine((val) => /^\d{1,2}$/.test(val) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 12, {
      message: "เดือนต้องเป็นตัวเลข 1-12",
    }),
  hour: z.string().min(1).refine(val => Number(val) >= 0 && Number(val) <= 23, { message: "ชั่วโมงไม่ถูกต้อง" }),
  minute: z.string().min(1).refine(val => Number(val) >= 0 && Number(val) <= 59, { message: "นาทีไม่ถูกต้อง" }),
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
  const { toast } = useToast();
  const todayStr = format(new Date(), "dd/MM/yyyy");
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      day: initialData?.date instanceof Date
        ? initialData.date.getDate().toString().padStart(2, "0")
        : (typeof initialData?.day === "string" ? initialData.day : todayStr.split("/")[0]),
      month: initialData?.date instanceof Date
        ? (initialData.date.getMonth() + 1).toString().padStart(2, "0")
        : (typeof initialData?.month === "string" ? initialData.month : todayStr.split("/")[1]),
      hour: initialData?.date instanceof Date
        ? initialData.date.getHours().toString().padStart(2, "0")
        : (initialData?.time?.split(":")[0] || ""),
      minute: initialData?.date instanceof Date
        ? initialData.date.getMinutes().toString().padStart(2, "0")
        : (initialData?.time?.split(":")[1] || ""),
      accountId: initialData?.accountId ?? "",
      amount: initialData?.amount ?? undefined,
    },
  });
  
  // Reset form when initialData changes
  useEffect(() => {
    form.reset({
      day: initialData?.date instanceof Date
        ? initialData.date.getDate().toString().padStart(2, "0")
        : (typeof initialData?.day === "string" ? initialData.day : todayStr.split("/")[0]),
      month: initialData?.date instanceof Date
        ? (initialData.date.getMonth() + 1).toString().padStart(2, "0")
        : (typeof initialData?.month === "string" ? initialData.month : todayStr.split("/")[1]),
      hour: initialData?.date instanceof Date
        ? initialData.date.getHours().toString().padStart(2, "0")
        : (initialData?.time?.split(":")[0] || ""),
      minute: initialData?.date instanceof Date
        ? initialData.date.getMinutes().toString().padStart(2, "0")
        : (initialData?.time?.split(":")[1] || ""),
      accountId: initialData?.accountId ?? "",
      amount: initialData?.amount ?? undefined,
    });
  }, [initialData, form]);

  // ถ้า initialData มีเวลาเดิม ให้แยกชั่วโมง/นาทีมา setValue
  useEffect(() => {
    if (initialData?.time) {
      const [h, m] = initialData.time.split(":");
      form.setValue("hour", h);
      form.setValue("minute", m);
    }
  }, [initialData?.time]);

  const selectedAccountId = form.watch("accountId");
  
  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === selectedAccountId),
    [selectedAccountId, accounts],
  );

  const handleSubmit = (data: IncomeFormValues) => {
    // เติมวัน/เดือน/เวลาเป็นปัจจุบันถ้าไม่ได้กรอก
    const now = new Date();
    const day = data.day || now.getDate().toString().padStart(2, "0");
    const month = data.month || (now.getMonth() + 1).toString().padStart(2, "0");
    const hour = data.hour || now.getHours().toString().padStart(2, "0");
    const minute = data.minute || now.getMinutes().toString().padStart(2, "0");
    const dateObj = parseDayMonthToDate(day, month);
    if (!dateObj) {
      form.setError("day", { message: "วันหรือเดือนไม่ถูกต้อง" });
      form.setError("month", { message: "วันหรือเดือนไม่ถูกต้อง" });
      return;
    }
    dateObj.setHours(Number(hour), Number(minute), 0, 0);
    const finalData = { ...data, day, month, hour, minute, date: dateObj };
    onSubmit(finalData as any);
    toast({ title: "บันทึกรายรับสำเร็จ", description: "เพิ่มรายการรายรับเรียบร้อยแล้ว" });
  };

  // กำหนด tabIndex อัตโนมัติด้วยตัวแปร counter เพื่อรองรับการเพิ่ม/ลบฟิลด์ในอนาคต
  let tabIndexCounter = 1;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 p-4 max-w-2xl w-full mx-auto"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onCancel();
          }
        }}
      >
        <h2 className="text-xl font-bold mb-4">เพิ่มรายการรายรับ</h2>
        {/* จำนวนเงิน */}
        <div>
          <FormLabel className="block mb-1 font-medium">จำนวนเงิน<span className="text-red-500 text-xs align-super">*</span></FormLabel>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            {...form.register("amount")}
            value={form.watch("amount") ?? ""}
            className={cn(selectedAccount && "pl-8", "h-12 text-lg w-full px-4")}
            autoFocus
            required
            tabIndex={tabIndexCounter++}
          />
          {selectedAccount && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              {selectedAccount.currency === "USD" ? "$" : "฿"}
            </span>
          )}
        </div>
        {/* บัญชี (button group) */}
        <div>
          <FormLabel className="block mb-1 font-medium">บัญชี<span className="text-red-500 text-xs align-super">*</span></FormLabel>
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-wrap gap-2">
                  {accounts.map((acc) => (
                    <button
                      type="button"
                      key={acc.id}
                      className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${field.value === acc.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-gray-300 hover:border-primary'}`}
                      onClick={() => field.onChange(acc.id)}
                      tabIndex={tabIndexCounter++}
                    >
                      {acc.name}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* วันที่ + เวลา (แนวเดียวกัน) */}
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2 flex-1 items-end">
            <div className="flex-1">
              <FormLabel className="block mb-1 font-medium">วัน<span className="text-red-500 text-xs align-super">*</span></FormLabel>
              <FormField
                control={form.control}
                name="day"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Input
                      type="text"
                      placeholder=""
                      maxLength={2}
                      {...field}
                      className={cn("w-full", fieldState.invalid && "border-red-500")}
                      tabIndex={tabIndexCounter++}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormLabel className="block mb-1 font-medium">เดือน<span className="text-red-500 text-xs align-super">*</span></FormLabel>
              <FormField
                control={form.control}
                name="month"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Input
                      type="text"
                      placeholder=""
                      maxLength={2}
                      {...field}
                      className={cn("w-full", fieldState.invalid && "border-red-500")}
                      tabIndex={tabIndexCounter++}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <FormLabel className="block mb-1 font-medium opacity-60">ปี</FormLabel>
              <Input
                type="text"
                value={new Date().getFullYear()}
                readOnly
                tabIndex={-1}
                className="w-full bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
          {/* เวลา */}
          <div className="flex flex-col gap-1">
            <FormLabel className="block mb-1 font-medium">เวลา<span className="text-red-500 text-xs align-super">*</span></FormLabel>
            <div className="flex flex-row gap-2">
              <FormField
                control={form.control}
                name="hour"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={23}
                    placeholder="HH"
                    className={cn("w-16 text-center", form.formState.errors.hour && "border-red-500")}
                    tabIndex={tabIndexCounter++}
                  />
                )}
              />
              <span className="self-center">:</span>
              <FormField
                control={form.control}
                name="minute"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={59}
                    placeholder="MM"
                    className={cn("w-16 text-center", form.formState.errors.minute && "border-red-500")}
                    tabIndex={tabIndexCounter++}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* ปุ่มบันทึก/ยกเลิก */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-9 px-4 text-sm font-semibold"
            tabIndex={tabIndexCounter++}
          >
            ยกเลิก
          </Button>
          <Button type="submit" className="h-9 px-6 text-sm font-bold" tabIndex={tabIndexCounter++}>
            {initialData ? "บันทึกการเปลี่ยนแปลง" : "บันทึกรายรับ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
