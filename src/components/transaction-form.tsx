"use client";

// --- React & Hooks ---
import { useState, useMemo, useEffect, useRef } from "react";

// --- Form & Validation ---
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useAccounts } from "@/hooks/use-accounts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TimePicker } from "./time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Transaction } from "@/lib/types";
import { HighPerfDropdown } from "./ui/high-perf-dropdown";
import { DateTimePicker } from "./date-time-picker";
import { parseDayMonthToDate, isValidTime24h } from "@/lib/utils";

// --- Types ---
export type UnifiedFormValues = any; // จะกำหนดในฟังก์ชัน

interface TransactionFormProps {
  initialData?: Partial<UnifiedFormValues & { validationResult?: string }>;
  onSubmit: (data: UnifiedFormValues, saveAsTemplate: boolean) => void;
  isEditing?: boolean;
  isTemplate?: boolean;
  availablePurposes: (string | { name: string; emoji?: string })[];
  transactions?: Transaction[];
  showTemplateSelector?: boolean;
  templateSelector?: React.ReactNode;
}

/**
 * ฟังก์ชันคำนวณยอดเงินของแต่ละบัญชี
 */
function getAccountBalance(
  accountId: string,
  transactions: Transaction[],
): { balance: number; currency: "THB" | "USD" } | null {
  if (!accountId) return null;
  let balance = 0;
  let currency: "THB" | "USD" = "THB";
  for (const tx of transactions) {
    if (tx.account.id === accountId) {
      currency = tx.account.currency;
      balance += tx.type === "income" ? tx.amount : -tx.amount;
    }
  }
  return { balance, currency };
}

/**
 * ฟังก์ชันคำนวณ contrast สี
 */
function getContrastColor(bg: string) {
  if (!bg) return "#222";
  const hex = bg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#222" : "#fff";
}

/**
 * ฟังก์ชัน format เงิน
 */
function formatCurrency(amount: number, currency: "THB" | "USD") {
  if (currency === "THB")
    return `฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
  if (currency === "USD")
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  return amount;
}

function simplePurposeEmoji(name: string): string {
  if (name.includes("อาหาร")) return "🍽️";
  if (name.includes("เดินทาง")) return "🚗";
  if (name.includes("ชอป")) return "🛍️";
  if (name.includes("บันเทิง")) return "🎬";
  if (name.includes("ที่พัก")) return "🏠";
  if (name.includes("สาธารณูปโภค")) return "💡";
  if (name.includes("สุขภาพ")) return "🏥";
  if (name.includes("ศึกษา")) return "📚";
  if (name.includes("เงินเดือน")) return "💵";
  if (name.includes("อื่น")) return "✨";
  return "✨";
}

/**
 * TransactionForm - ฟอร์มเพิ่ม/แก้ไขธุรกรรม (รองรับโหมดปกติ, โอน, เทมเพลต)
 */
export function TransactionForm({
  initialData,
  onSubmit,
  isEditing = false,
  isTemplate = false,
  availablePurposes = [],
  transactions = [],
  showTemplateSelector = false,
  templateSelector,
}: TransactionFormProps) {
  // --- Schema ---
  const normalSchema = z.object({
    mode: z.literal("normal"),
    type: z.enum(["income", "expense"], {
      required_error: "กรุณาเลือกประเภทธุรกรรม",
    }),
    accountId: z
      .string({ required_error: "กรุณาเลือกบัญชี" })
      .min(1, "กรุณาเลือกบัญชี"),
    purpose: z.string().optional(),
    customPurpose: z.string().optional(),
    amount: isTemplate
      ? z
          .union([
            z.coerce.number().positive("จำนวนเงินต้องเป็นบวก"),
            z.nan(),
            z.undefined(),
            z.null(),
          ])
          .optional()
      : z.union([
          z.coerce.number().positive("จำนวนเงินต้องเป็นบวก"),
          z.nan(),
        ]),
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
    sender: z.string().optional(),
    recipient: z.string().optional(),
    details: z.string().optional(),
  });

  const transferSchema = z.object({
    mode: z.literal("transfer"),
    fromAccount: z.string().min(1, "กรุณาเลือกบัญชีต้นทาง"),
    toAccount: z.string().min(1, "กรุณาเลือกบัญชีปลายทาง"),
    amount: z.coerce.number().positive("จำนวนเงินต้องเป็นบวก"),
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
    details: z.string().optional(),
  });

  const unifiedSchema = z.discriminatedUnion("mode", [
    normalSchema,
    transferSchema,
  ]) as any;

  // --- State ---
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [isTransfer, setIsTransfer] = useState(false);
  const { accounts } = useAccounts();
  const [customPurpose, setCustomPurpose] = useState("");

  // --- Default Account ---
  const defaultAccount =
    accounts.find((acc) => acc.name === "เงินสด") ||
    accounts.find((acc) => acc.name === "Cash") ||
    accounts[0];

  // --- Safe Initial Data ---
  const todayStr = format(new Date(), "dd/MM/yyyy");
  const safeInitialData: UnifiedFormValues =
    initialData && "mode" in initialData
      ? {
          ...initialData,
          day: initialData.date instanceof Date
            ? initialData.date.getDate().toString().padStart(2, "0")
            : (typeof initialData.day === "string" ? initialData.day : ""),
          month: initialData.date instanceof Date
            ? (initialData.date.getMonth() + 1).toString().padStart(2, "0")
            : (typeof initialData.month === "string" ? initialData.month : ""),
          hour: initialData.date instanceof Date
            ? initialData.date.getHours().toString().padStart(2, "0")
            : (typeof initialData.hour === "string" ? initialData.hour : ""),
          minute: initialData.date instanceof Date
            ? initialData.date.getMinutes().toString().padStart(2, "0")
            : (typeof initialData.minute === "string" ? initialData.minute : ""),
        }
      : {
          mode: "normal",
          type: "expense",
          accountId: defaultAccount?.id ?? "",
          purpose: "",
          amount: undefined,
          day: todayStr.split("/")[0],
          month: todayStr.split("/")[1],
          hour: "",
          minute: "",
          customPurpose: "",
          details: "",
          sender: "",
          recipient: "",
        };

  // --- Form ---
  const form = useForm<UnifiedFormValues>({
    resolver: zodResolver(unifiedSchema),
    defaultValues: safeInitialData,
    mode: "onChange",
  });

  // --- Effect: Reset form on mode/accounts change ---
  const didInit = useRef(false);
  useEffect(() => {
    if (accounts.length === 0) return;
    if (isTransfer) {
      form.reset({
        mode: "transfer",
        fromAccount: defaultAccount?.id ?? "",
        toAccount: "",
        amount: undefined,
        day: new Date().getDate().toString().padStart(2, "0"),
        month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
        hour: new Date().getHours().toString().padStart(2, "0"),
        minute: new Date().getMinutes().toString().padStart(2, "0"),
        details: "",
      });
    } else {
      form.reset(safeInitialData);
    }
    didInit.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransfer, accounts.length]);

  // --- Effect: Set default account on mount ---
  useEffect(() => {
    if (didInit.current) return;
    if (accounts.length === 0) return;
    if (form.watch("mode") === "normal" && !form.watch("accountId")) {
      if (defaultAccount?.id) form.setValue("accountId", defaultAccount.id);
    }
    if (form.watch("mode") === "transfer" && !form.watch("fromAccount")) {
      if (defaultAccount?.id) form.setValue("fromAccount", defaultAccount.id);
    }
  }, [accounts.length]);

  // --- Effect: Reset form when initialData changes (เช่น เลือกเทมเพลตใหม่) ---
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...safeInitialData,
        ...initialData,
        day: initialData.date instanceof Date
          ? initialData.date.getDate().toString().padStart(2, "0")
          : (typeof initialData.day === "string" ? initialData.day : ""),
        month: initialData.date instanceof Date
          ? (initialData.date.getMonth() + 1).toString().padStart(2, "0")
          : (typeof initialData.month === "string" ? initialData.month : ""),
        hour: initialData.date instanceof Date
          ? initialData.date.getHours().toString().padStart(2, "0")
          : (typeof initialData.hour === "string" ? initialData.hour : ""),
        minute: initialData.date instanceof Date
          ? initialData.date.getMinutes().toString().padStart(2, "0")
          : (typeof initialData.minute === "string" ? initialData.minute : ""),
      });
    }
  }, [JSON.stringify(initialData)]);

  // --- Memo: Selected account/currency ---
  const selectedAccountId = form.watch("accountId");
  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === selectedAccountId),
    [selectedAccountId, accounts],
  );
  const currencySymbol = selectedAccount?.currency === "USD" ? "$" : "฿";

  // --- Memo: All purposes ---
  const allPurposes: string[] = useMemo(() => {
    if (Array.isArray(availablePurposes) && availablePurposes.length > 0) {
      if (typeof availablePurposes[0] === "object") {
        return (availablePurposes as any[]).map((p) =>
          typeof p === "string" ? p : p.name,
        );
      } else {
        return (availablePurposes as string[]).filter(Boolean);
      }
    }
    return [];
  }, [availablePurposes]);

  // --- Submit Handler ---
  const handleSubmit = (data: UnifiedFormValues) => {
    if (isTransfer) {
      const from = form.getValues("fromAccount");
      const to = form.getValues("toAccount");
      if (!from || !to) {
        alert("กรุณาเลือกบัญชีต้นทางและปลายทาง");
        return;
      }
      if (from === to) {
        alert("บัญชีต้นทางและปลายทางต้องไม่เหมือนกัน");
        return;
      }
    }
    // แปลงวัน/เดือน/เวลาเป็น Date ก่อนส่งออก
    const dateObj = parseDayMonthToDate(data.day, data.month);
    if (!dateObj) {
      form.setError("day", { message: "วันหรือเดือนไม่ถูกต้อง" });
      form.setError("month", { message: "วันหรือเดือนไม่ถูกต้อง" });
      return;
    }
    const h = Number(data.hour);
    const m = Number(data.minute);
    dateObj.setHours(h, m, 0, 0);
    const finalData = { ...data, date: dateObj };
    if (finalData.purpose === "อื่นๆ" && customPurpose.trim()) {
      finalData.purpose = customPurpose.trim();
    }
    delete (finalData as any).mode;
    onSubmit(finalData as any, saveAsTemplate);
  };

  // --- Render ---
  // ปรับ tabIndex ของ input ทุกฟิลด์ให้เป็นค่าคงที่ (manual) ตามลำดับฟอร์ม
  // ตัวอย่าง:
  // <Input ... tabIndex={1} /> // จำนวนเงิน
  // <button ... tabIndex={2} /> // บัญชี
  // <Input ... tabIndex={3} /> // วัน
  // <Input ... tabIndex={4} /> // เดือน
  // <Input ... tabIndex={5} /> // ชั่วโมง
  // <Input ... tabIndex={6} /> // นาที
  // <Input ... tabIndex={7} /> // วัตถุประสงค์
  // <Input ... tabIndex={8} /> // รายละเอียด
  // <Button ... tabIndex={9} /> // ปุ่มบันทึก
  // <Button ... tabIndex={10} /> // ปุ่มยกเลิก
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4 max-w-md w-full mx-auto flex flex-col"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            window.dispatchEvent(new CustomEvent("close-transaction-dialog"));
          }
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            // กด Enter ที่ input ทั่วไป = submit
            (e.target as HTMLFormElement).form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }
        }}
      >
        {/* เทมเพลต selector (ถ้ามี) */}
        {showTemplateSelector && (
          <div tabIndex={1}>{templateSelector}</div>
        )}
        {/* ประเภท รายรับ/รายจ่าย */}
        <div className="flex flex-row gap-2 items-center">
          <RadioGroup
            value={form.watch("type")}
            onValueChange={(val) => form.setValue("type", val)}
            className="flex gap-2"
            name="type"
            tabIndex={2}
          >
            <RadioGroupItem value="expense" id="type-expense" className="scale-90" tabIndex={3} />
            <label htmlFor="type-expense" className="mr-2 cursor-pointer text-xs">รายจ่าย</label>
            <RadioGroupItem value="income" id="type-income" className="scale-90" tabIndex={4} />
            <label htmlFor="type-income" className="cursor-pointer text-xs">รายรับ</label>
          </RadioGroup>
          <div className="flex-1 flex items-center justify-end">
            <Switch
              checked={isTransfer}
              onCheckedChange={setIsTransfer}
              id="toggle-transfer-mode"
              tabIndex={5}
              className="scale-90"
            />
            <label htmlFor="toggle-transfer-mode" className="ml-2 cursor-pointer select-none text-xs font-medium">โอนระหว่างบัญชี</label>
          </div>
        </div>
        {/* โหมดโอน: บัญชีต้นทาง/ปลายทาง หรือบัญชีเดียว */}
        {isTransfer ? (
          <div className="flex flex-col gap-1">
            <FormLabel className="font-medium text-xs">บัญชีต้นทาง</FormLabel>
            <FormField
              control={form.control}
              name="fromAccount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-2">
                    {accounts.map((acc) => (
                      <button
                        type="button"
                        key={acc.id}
                        className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${field.value === acc.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-gray-300 hover:border-primary'}`}
                        onClick={() => field.onChange(acc.id)}
                        tabIndex={6}
                      >
                        {acc.name} ({acc.currency})
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormLabel className="font-medium text-xs">บัญชีปลายทาง</FormLabel>
            <FormField
              control={form.control}
              name="toAccount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-2">
                    {accounts.map((acc) => (
                      <button
                        type="button"
                        key={acc.id}
                        className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${field.value === acc.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-gray-300 hover:border-primary'}`}
                        onClick={() => field.onChange(acc.id)}
                        tabIndex={7}
                      >
                        {acc.name} ({acc.currency})
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <FormLabel className="font-medium text-xs">บัญชี</FormLabel>
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
                        tabIndex={8}
                      >
                        {acc.name} ({acc.currency})
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* จำนวนเงิน */}
        <div className="flex flex-col gap-1">
          <FormLabel className="font-medium text-xs">จำนวนเงิน<span className="text-red-500 text-xs align-super">*</span></FormLabel>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            {...form.register("amount")}
            className="h-10 text-base px-2 w-full rounded-md"
            required={!isTemplate && !isTransfer}
            tabIndex={9}
          />
        </div>
        {/* วันที่ + เวลา (แนวเดียวกัน) */}
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2 flex-1 items-end">
            <div className="flex-1">
              <FormLabel className="font-medium text-xs">วัน<span className="text-red-500 text-xs align-super">*</span></FormLabel>
              <FormField
                control={form.control}
                name="day"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Input
                      type="text"
                      placeholder="DD"
                      maxLength={2}
                      {...field}
                      className={cn("w-full", fieldState.invalid && "border-red-500")}
                      tabIndex={10}
                    />
                    {/* ไม่ต้องแสดง <FormMessage /> */}
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormLabel className="font-medium text-xs">เดือน<span className="text-red-500 text-xs align-super">*</span></FormLabel>
              <FormField
                control={form.control}
                name="month"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Input
                      type="text"
                      placeholder="MM"
                      maxLength={2}
                      {...field}
                      className={cn("w-full", fieldState.invalid && "border-red-500")}
                      tabIndex={11}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <FormLabel className="font-medium text-xs opacity-60">ปี</FormLabel>
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
            <FormLabel className="font-medium text-xs">เวลา<span className="text-red-500 text-xs align-super">*</span></FormLabel>
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
                    tabIndex={12}
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
                    tabIndex={13}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* วัตถุประสงค์ */}
        <div className="flex flex-col gap-1">
          <FormLabel className="font-medium text-xs">วัตถุประสงค์<span className="text-red-500 text-xs align-super">*</span></FormLabel>
          <FormField
            control={form.control}
            name="purpose"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex flex-wrap gap-2">
                  {allPurposes.filter((p) => p && p !== "อื่นๆ").map((purpose) => (
                    <button
                      type="button"
                      key={purpose}
                      className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${field.value === purpose ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-gray-300 hover:border-primary'}`}
                      onClick={() => field.onChange(purpose)}
                      tabIndex={14}
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
                {fieldState.error && fieldState.error.message && <FormMessage />}
              </FormItem>
            )}
          />
        </div>
        {/* รายละเอียด */}
        <div className="flex flex-col gap-1">
          <FormLabel className="font-medium text-xs">รายละเอียด (ถ้ามี)</FormLabel>
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <Textarea
                  placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                  {...field}
                  value={field.value ?? ""}
                  className="w-full h-14 px-2 py-1 rounded-md border text-xs bg-background resize-none"
                  tabIndex={15}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* ผู้จ่าย/ผู้รับ (2 columns) */}
        <div className="flex flex-col sm:flex-row gap-1">
          <div className="flex-1 flex flex-col gap-1">
            <FormLabel className="font-medium text-xs">ผู้จ่าย (ถ้ามี)</FormLabel>
            <FormField
              control={form.control}
              name="sender"
              render={({ field }) => (
                <FormItem>
                  <Input
                    placeholder="ชื่อผู้จ่าย..."
                    {...field}
                    value={field.value ?? ""}
                    className="w-full px-2 py-1 rounded-md border text-xs bg-background"
                    tabIndex={16}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <FormLabel className="font-medium text-xs">ผู้รับ (ถ้ามี)</FormLabel>
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <Input
                    placeholder="ชื่อผู้รับ..."
                    {...field}
                    value={field.value ?? ""}
                    className="w-full px-2 py-1 rounded-md border text-xs bg-background"
                    tabIndex={17}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* ปุ่มบันทึก/ยกเลิก */}
        <div className="flex justify-end gap-2 pt-2">
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.dispatchEvent(new CustomEvent("close-transaction-dialog"))}
              tabIndex={18}
            >
              ยกเลิก
            </Button>
          )}
          <Button type="submit" className="font-bold text-xs h-8 px-4" tabIndex={19}>
            {isEditing ? "บันทึก" : "เพิ่มธุรกรรม"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
