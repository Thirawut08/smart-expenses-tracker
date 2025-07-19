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

// --- Types ---
export type UnifiedFormValues = any; // จะกำหนดในฟังก์ชัน

interface TransactionFormProps {
  initialData?: Partial<UnifiedFormValues & { validationResult?: string }>;
  onSubmit: (data: UnifiedFormValues, saveAsTemplate: boolean) => void;
  isEditing?: boolean;
  isTemplate?: boolean;
  availablePurposes: (string | { name: string; emoji?: string })[];
  transactions?: Transaction[]; // เพิ่ม prop นี้ (optional เพื่อไม่พังโหมดอื่น)
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
    date: z.union([
      z.date({ required_error: "กรุณาระบุวันที่" }),
      z.undefined(),
      z.null(),
    ]),
    sender: z.string().optional(),
    recipient: z.string().optional(),
    details: z.string().optional(),
  });

  const transferSchema = z.object({
    mode: z.literal("transfer"),
    fromAccount: z.string().min(1, "กรุณาเลือกบัญชีต้นทาง"),
    toAccount: z.string().min(1, "กรุณาเลือกบัญชีปลายทาง"),
    amount: z.coerce.number().positive("จำนวนเงินต้องเป็นบวก"),
    date: z.date({ required_error: "กรุณาระบุวันที่" }),
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
  const safeInitialData: UnifiedFormValues =
    initialData && "mode" in initialData
      ? (initialData as UnifiedFormValues)
      : {
          mode: "normal",
          type: "expense",
          accountId: defaultAccount?.id ?? "",
          purpose: "",
          amount: undefined,
          date: new Date(),
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
        date: new Date(),
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
    let finalData = { ...data };
    if (finalData.purpose === "อื่นๆ" && customPurpose.trim()) {
      finalData.purpose = customPurpose.trim();
    }
    delete (finalData as any).mode;
    onSubmit(finalData as any, saveAsTemplate);
  };

  // --- Render ---
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 p-4 max-w-md mx-auto"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (isEditing) {
              window.dispatchEvent(new CustomEvent("close-transaction-dialog"));
            }
          }
        }}
      >
        {/* 1. ประเภท */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">1</span> ประเภท
          </FormLabel>
          <RadioGroup
            value={form.watch("type")}
            onValueChange={(val) => form.setValue("type", val)}
            className="flex gap-4"
            name="type"
          >
            <RadioGroupItem value="expense" id="type-expense" />
            <label htmlFor="type-expense" className="mr-4 cursor-pointer">
              รายจ่าย
            </label>
            <RadioGroupItem value="income" id="type-income" />
            <label htmlFor="type-income" className="cursor-pointer">
              รายรับ
            </label>
          </RadioGroup>
        </div>
        {/* 2. จำนวนเงิน */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">2</span> จำนวนเงิน
          </FormLabel>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            {...form.register("amount")}
            className="h-14 text-3xl px-4 w-full"
            autoFocus
            required={!isTemplate && !isTransfer}
            tabIndex={2}
          />
        </div>
        {/* 3. บัญชี */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">3</span> บัญชี
          </FormLabel>
          <FormField
            control={form.control}
            name={isTransfer ? "fromAccount" : "accountId"}
            render={({ field }) => (
              <FormItem>
                <HighPerfDropdown
                  options={accounts.map((acc) => ({
                    value: acc.id,
                    label: `${acc.name} (${acc.currency})`,
                  }))}
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder={isTransfer ? "เลือกบัญชีต้นทาง..." : "เลือกบัญชี..."}
                  className="w-full"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* 4. วันที่ */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">4</span> วันที่
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
        {/* 5. รายละเอียด */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">5</span> รายละเอียด (ถ้ามี)
          </FormLabel>
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <Textarea
                  placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                  {...field}
                  value={field.value ?? ""}
                  className="w-full h-20 px-4 py-2 rounded border text-base bg-background resize-none"
                  tabIndex={5}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      (e.target as HTMLTextAreaElement).form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                    }
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* 6. วัตถุประสงค์ */}
        <div>
          <FormLabel className="block mb-1 font-medium">
            <span className="text-xs mr-1 text-muted-foreground">6</span> วัตถุประสงค์
          </FormLabel>
          <FormField
            control={form.control}
            name="purpose"
            render={({ field, fieldState }) => (
              <FormItem>
                <HighPerfDropdown
                  options={allPurposes
                    .filter((p) => p && p !== "อื่นๆ")
                    .map((purpose) => ({ value: purpose, label: purpose }))}
                  value={field.value || ""}
                  onChange={(value) => field.onChange(value)}
                  placeholder="เลือกวัตถุประสงค์..."
                  className="w-full"
                  // (ถ้า HighPerfDropdown รองรับ prop สำหรับตำแหน่ง search ให้ส่ง prop เช่น searchPosition="bottom")
                />
                {fieldState.error && fieldState.error.message && (
                  <FormMessage />
                )}
              </FormItem>
            )}
          />
        </div>
        {/* ปุ่มบันทึก/ยกเลิก */}
        <div className="flex justify-end gap-2 pt-4">
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.dispatchEvent(new CustomEvent("close-transaction-dialog"))}
              tabIndex={7}
            >
              ยกเลิก
            </Button>
          )}
          <Button type="submit" className="font-bold" tabIndex={8}>
            {isEditing ? "บันทึก" : "เพิ่มธุรกรรม"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
