'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAccounts } from '@/hooks/use-accounts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TimePicker } from './time-picker';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { investmentAccountNames, savingAccountNames } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { HighPerfDropdown } from './ui/high-perf-dropdown';
import { DateTimePicker } from './date-time-picker';

// สร้าง schema แบบแยกก่อนค่อยรวม discriminated union
const normalSchema = z.object({
  mode: z.literal('normal'),
  type: z.enum(['income', 'expense'], { required_error: 'กรุณาเลือกประเภทธุรกรรม' }),
  accountId: z.string({ required_error: 'กรุณาเลือกบัญชี' }).min(1, 'กรุณาเลือกบัญชี'),
  purpose: z.string().min(1, 'วัตถุประสงค์เป็นสิ่งจำเป็น'),
  customPurpose: z.string().optional(),
  amount: z.union([
    z.coerce.number().positive('จำนวนเงินต้องเป็นบวก'),
    z.nan()
  ]),
  date: z.union([
    z.date({ required_error: 'กรุณาระบุวันที่' }),
    z.undefined(),
    z.null()
  ]),
  sender: z.string().optional(),
  recipient: z.string().optional(),
  details: z.string().optional(),
});

const transferSchema = z.object({
  mode: z.literal('transfer'),
  fromAccount: z.string().min(1, 'กรุณาเลือกบัญชีต้นทาง'),
  toAccount: z.string().min(1, 'กรุณาเลือกบัญชีปลายทาง'),
  amount: z.coerce.number().positive('จำนวนเงินต้องเป็นบวก'),
  date: z.date({ required_error: 'กรุณาระบุวันที่' }),
  details: z.string().optional(),
});

const unifiedSchema = z.discriminatedUnion('mode', [normalSchema, transferSchema]) as any;


export type UnifiedFormValues = z.infer<typeof unifiedSchema>;

interface TransactionFormProps {
  initialData?: Partial<UnifiedFormValues & { validationResult?: string }>;
  onSubmit: (data: UnifiedFormValues, saveAsTemplate: boolean) => void;
  isEditing?: boolean;
  isTemplate?: boolean;
  availablePurposes: (string | { name: string; emoji?: string })[];
  transactions?: Transaction[]; // เพิ่ม prop นี้ (optional เพื่อไม่พังโหมดอื่น)
}

// เพิ่มฟังก์ชันคำนวณยอดเงินของแต่ละบัญชี
function getAccountBalance(accountId: string, transactions: Transaction[]): { balance: number, currency: 'THB' | 'USD' } | null {
  if (!accountId) return null;
  let balance = 0;
  let currency: 'THB' | 'USD' = 'THB';
  for (const tx of transactions) {
    if (tx.account.id === accountId) {
      currency = tx.account.currency;
      balance += tx.type === 'income' ? tx.amount : -tx.amount;
    }
  }
  return { balance, currency };
}

// เพิ่มฟังก์ชัน getContrastColor
function getContrastColor(bg: string) {
  if (!bg) return '#222';
  // แปลง hex เป็น rgb
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);
  // คำนวณ contrast
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return yiq >= 128 ? '#222' : '#fff';
}

// เพิ่มฟังก์ชัน formatCurrency ถ้ายังไม่มีในไฟล์นี้
function formatCurrency(amount: number, currency: 'THB' | 'USD') {
  if (currency === 'THB') return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return amount;
}

function simplePurposeEmoji(name: string): string {
  if (name.includes('อาหาร')) return '🍽️';
  if (name.includes('เดินทาง')) return '🚗';
  if (name.includes('ชอป')) return '🛍️';
  if (name.includes('บันเทิง')) return '🎬';
  if (name.includes('ที่พัก')) return '🏠';
  if (name.includes('สาธารณูปโภค')) return '💡';
  if (name.includes('สุขภาพ')) return '🏥';
  if (name.includes('ศึกษา')) return '📚';
  if (name.includes('เงินเดือน')) return '💵';
  if (name.includes('อื่น')) return '✨';
  return '✨';
}

export function TransactionForm({ initialData, onSubmit, isEditing = false, isTemplate = false, availablePurposes = [], transactions = [] }: TransactionFormProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [isTransfer, setIsTransfer] = useState(false);
  const { accounts } = useAccounts();
  const [customPurpose, setCustomPurpose] = useState('');

  // หาบัญชี default: เงินสด > Cash > บัญชีแรก
  const defaultAccount = accounts.find(acc => acc.name === 'เงินสด')
    || accounts.find(acc => acc.name === 'Cash')
    || accounts[0];

  // ป้องกัน initialData ที่ไม่มี mode (เช่น undefined หรือ transaction จริง)
  const safeInitialData: UnifiedFormValues = (initialData && 'mode' in initialData)
    ? initialData as UnifiedFormValues
    : { mode: 'normal', type: 'expense', accountId: defaultAccount?.id ?? '', purpose: '', amount: undefined, date: new Date(), customPurpose: '', details: '', sender: '', recipient: '' };

  const form = useForm<UnifiedFormValues>({
    resolver: zodResolver(unifiedSchema),
    defaultValues: safeInitialData,
    mode: 'onChange',
  });

  // ใช้ ref กัน reset/setValue ซ้ำ
  const didInit = useRef(false);

  // Reset เฉพาะตอน toggle โหมด และ accounts พร้อม
  useEffect(() => {
    if (accounts.length === 0) return;
    if (isTransfer) {
      console.log('RESET form (isTransfer=true)', form.getValues());
      form.reset({ mode: 'transfer', fromAccount: defaultAccount?.id ?? '', toAccount: '', amount: undefined, date: new Date(), details: '' });
    } else {
      console.log('RESET form (isTransfer=false)', form.getValues());
      form.reset(safeInitialData);
    }
    didInit.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransfer, accounts.length]);

  // Set defaultAccount เฉพาะตอน mount/ accounts พร้อมครั้งแรก
  useEffect(() => {
    if (didInit.current) return;
    if (accounts.length === 0) return;
    if (form.watch('mode') === 'normal' && !form.watch('accountId')) {
      if (defaultAccount?.id) form.setValue('accountId', defaultAccount.id);
    }
    if (form.watch('mode') === 'transfer' && !form.watch('fromAccount')) {
      if (defaultAccount?.id) form.setValue('fromAccount', defaultAccount.id);
    }
  }, [accounts.length]);

  const selectedAccountId = form.watch('accountId');
  const purposeValue = form.watch('purpose');
  
  const selectedAccount = useMemo(() => accounts.find(acc => acc.id === selectedAccountId), [selectedAccountId, accounts]);
  const currencySymbol = selectedAccount?.currency === 'USD' ? '$' : '฿';

  // allPurposes: string[]
  const allPurposes: string[] = useMemo(() => {
    if (Array.isArray(availablePurposes) && availablePurposes.length > 0) {
      if (typeof availablePurposes[0] === 'object') {
        // fallback: แปลง object เป็น string
        return (availablePurposes as any[]).map(p => typeof p === 'string' ? p : p.name);
      } else {
        // string[]
        return (availablePurposes as string[]).filter(Boolean);
      }
    }
    return [];
  }, [availablePurposes]);

  useEffect(() => {
    // ไม่ต้อง set purpose อัตโนมัติสำหรับบัญชีพิเศษอีกต่อไป
  }, [selectedAccountId, form, selectedAccount]);


  // handleSubmit ใหม่ รองรับ schema ใหม่
  const handleSubmit = (data: UnifiedFormValues) => {
    // เพิ่ม validation สำหรับโหมดโอน
    if (isTransfer) {
      const from = form.getValues('fromAccount');
      const to = form.getValues('toAccount');
      const amount = form.getValues('amount');
      const date = form.getValues('date');
      console.log('[TRANSFER SUBMIT] accounts:', accounts);
      console.log('[TRANSFER SUBMIT] fromAccount:', from, 'toAccount:', to, 'amount:', amount, 'date:', date);
      if (!from || !to) {
        alert('กรุณาเลือกบัญชีต้นทางและปลายทาง');
        return;
      }
      if (from === to) {
        alert('บัญชีต้นทางและปลายทางต้องไม่เหมือนกัน');
        return;
      }
    }
    let finalData = { ...data };
    if (finalData.purpose === 'อื่นๆ' && customPurpose.trim()) {
      finalData.purpose = customPurpose.trim();
    }
    delete (finalData as any).mode;
    onSubmit(finalData as any, saveAsTemplate);
  };

  // Debug log
  console.log({
    fromAccount: form.watch('fromAccount'),
    toAccount: form.watch('toAccount'),
    amount: form.watch('amount'),
    date: form.watch('date'),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Switch
            checked={isTransfer}
            onCheckedChange={setIsTransfer}
            id="toggle-transfer-mode"
          />
          <label htmlFor="toggle-transfer-mode" className="cursor-pointer select-none text-sm font-medium">
            โอนระหว่างบัญชี
          </label>
        </div>
        <div>
          <FormLabel className="block mb-1 font-medium">จำนวนเงิน</FormLabel>
          <Input
            type="number"
            placeholder="0.00"
            {...form.register('amount')}
            className="h-14 text-3xl px-4 w-full"
            autoFocus
            required={!isTemplate}
          />
        </div>
        {!isTransfer && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={form.watch('type') === 'expense' ? 'secondary' : 'outline'}
              className="flex-1"
              onClick={() => form.setValue('type', 'expense')}
            >รายจ่าย</Button>
            <Button
              type="button"
              variant={form.watch('type') === 'income' ? 'secondary' : 'outline'}
              className="flex-1"
              onClick={() => form.setValue('type', 'income')}
            >รายรับ</Button>
          </div>
        )}
        <div>
          <FormLabel className="block mb-1 font-medium">วันที่และเวลา</FormLabel>
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <DateTimePicker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )} />
        </div>
        {isTransfer ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <FormLabel className="block mb-1 font-medium">บัญชีต้นทาง</FormLabel>
              <FormField control={form.control} name="fromAccount" render={({ field }) => (
                <FormItem>
                  <HighPerfDropdown
                    options={accounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="เลือกบัญชีต้นทาง..."
                    className="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex-1">
              <FormLabel className="block mb-1 font-medium">บัญชีปลายทาง</FormLabel>
              <FormField control={form.control} name="toAccount" render={({ field }) => (
                <FormItem>
                  <HighPerfDropdown
                    options={accounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="เลือกบัญชีปลายทาง..."
                    className="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        ) : (
          // ฟิลด์บัญชี: แสดงทั้งในโหมดปกติและ isTemplate
          <div>
            <FormLabel className="block mb-1 font-medium">บัญชี</FormLabel>
            <FormField control={form.control} name="accountId" render={({ field }) => (
              <FormItem>
                <HighPerfDropdown
                  options={accounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="เลือกบัญชี..."
                  className="w-full"
                />
                {/* ยอดเงินคงเหลือ */}
                {(() => { const accBalance = getAccountBalance(field.value || '', transactions); return accBalance && (
                  <div className="text-xs text-muted-foreground mt-1">ยอดเงิน: {formatCurrency(accBalance.balance, accBalance.currency)}</div>
                )})()}
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <FormLabel className="block mb-1 font-medium">ผู้จ่าย (ถ้ามี)</FormLabel>
            <FormField control={form.control} name="sender" render={({ field }) => (
              <FormItem>
                <Input placeholder="ชื่อผู้จ่าย" {...field} value={field.value ?? ''} className="w-full" />
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="flex-1">
            <FormLabel className="block mb-1 font-medium">ผู้รับ (ถ้ามี)</FormLabel>
            <FormField control={form.control} name="recipient" render={({ field }) => (
              <FormItem>
                <Input placeholder="ชื่อผู้รับ" {...field} value={field.value ?? ''} className="w-full" />
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <div>
          <FormLabel className="block mb-1 font-medium">รายละเอียด (ถ้ามี)</FormLabel>
          <FormField control={form.control} name="details" render={({ field }) => (
            <FormItem>
              <Textarea placeholder="บันทึกรายละเอียดเพิ่มเติมพิมพ์เทิม" {...field} value={field.value ?? ''} className="w-full h-20 px-4 py-2 rounded border text-base bg-background resize-none" />
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div>
          <FormLabel className="block mb-1 font-medium">วัตถุประสงค์</FormLabel>
          <FormField control={form.control} name="purpose" render={({ field }) => (
            <FormItem>
              <HighPerfDropdown
                options={allPurposes.filter(Boolean).map(purpose => ({ value: purpose, label: purpose }))}
                value={field.value || ''}
                onChange={value => { field.onChange(value); if (value !== 'อื่นๆ') setCustomPurpose(''); }}
                placeholder="เลือกวัตถุประสงค์..."
                className="w-full"
              />
              {field.value === 'อื่นๆ' && (
                <div className="mt-2">
                  <Input
                    placeholder="กรอกวัตถุประสงค์ใหม่"
                    value={customPurpose}
                    onChange={e => setCustomPurpose(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )} />
        </div>
        {/* Toggle เทมเพลต + ปุ่มบันทึก */}
        {!isEditing && (
          <div className="flex items-center gap-2 mb-2">
            <Switch checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} id="save-as-template" />
            <label htmlFor="save-as-template" className="text-sm">บันทึกเป็นเทมเพลต</label>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          {isEditing && (
            <Button type="button" variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('close-transaction-dialog'))}>ยกเลิก</Button>
          )}
          <Button type="submit" className="font-bold">{isEditing ? 'บันทึก' : 'เพิ่มธุรกรรม'}</Button>
        </div>
      </form>
    </Form>
  );
}
