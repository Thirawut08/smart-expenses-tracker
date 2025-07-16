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

// สร้าง schema แบบแยกก่อนค่อยรวม discriminated union
const normalSchema = z.object({
  mode: z.literal('normal'),
  type: z.enum(['income', 'expense'], { required_error: 'กรุณาเลือกประเภทธุรกรรม' }),
  accountId: z.string({ required_error: 'กรุณาเลือกบัญชี' }).min(1, 'กรุณาเลือกบัญชี'),
  purpose: z.string().min(1, 'วัตถุประสงค์เป็นสิ่งจำเป็น'),
  customPurpose: z.string().optional(),
  amount: z.coerce.number().positive('จำนวนเงินต้องเป็นบวก'),
  date: z.date({ required_error: 'กรุณาระบุวันที่' }),
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

  // หาบัญชีเงินสดเป็น default
  const defaultAccount = accounts.find(acc => acc.name === 'เงินสด' || acc.name === 'Cash');

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 pt-2">
        {/* โหมดธุรกรรม */}
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
        {/* จำนวนเงิน + ประเภทธุรกรรม */}
        {!isTransfer ? (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormLabel className="text-sm">จำนวนเงิน</FormLabel>
                <div className="flex items-center">
                  <span className="mr-1">{currencySymbol}</span>
                  <Input type="number" placeholder="0.00" {...form.register('amount')} className="h-10 text-base" />
                </div>
              </div>
              <div className="flex-1 flex items-end">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <div className="flex w-full gap-2">
                      <Button type="button" variant={field.value === 'expense' ? 'secondary' : 'outline'} className="flex-1 h-10 px-0" onClick={() => field.onChange('expense')}>
                        💸 รายจ่าย
                      </Button>
                      <Button type="button" variant={field.value === 'income' ? 'secondary' : 'outline'} className="flex-1 h-10 px-0" onClick={() => field.onChange('income')}>
                        💰 รายรับ
                      </Button>
                    </div>
                  )}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormLabel className="text-sm">บัญชีต้นทาง</FormLabel>
                <FormField control={form.control} name="fromAccount" render={({ field }) => (
                  <FormItem>
                    <HighPerfDropdown
                      options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="เลือกบัญชีต้นทาง..."
                    />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex-1">
                <FormLabel className="text-sm">บัญชีปลายทาง</FormLabel>
                <FormField control={form.control} name="toAccount" render={({ field }) => (
                  <FormItem>
                    <HighPerfDropdown
                      options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="เลือกบัญชีปลายทาง..."
                    />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <FormLabel className="text-sm">จำนวนเงิน</FormLabel>
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} className="h-10 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex-1">
                <FormLabel className="text-sm">วันที่</FormLabel>
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full pl-3 text-left font-normal h-10">
                            {field.value instanceof Date && !isNaN(field.value.getTime()) ? format(field.value, "PPP p", { locale: th }) : <span>เลือกวันที่</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar locale={th} mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date > new Date() || date < new Date("1900-01-01")}/>
                        <div className="p-2 border-t border-border">
                          <TimePicker date={field.value instanceof Date ? field.value : (typeof field.value === 'string' ? new Date(field.value ?? '') : new Date())} setDate={field.onChange} />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <div className="mt-2">
              <FormLabel className="text-sm">รายละเอียด (ถ้ามี)</FormLabel>
              <FormField control={form.control} name="details" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="บันทึกรายละเอียดเพิ่มเติม" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </>
        )}
        {/* วันที่ */}
        {/* บัญชี + วัตถุประสงค์ */}
        {!isTransfer && (
          <div className="flex gap-2">
            <div className="flex-1">
              <FormLabel className="text-sm">บัญชี</FormLabel>
              <FormField control={form.control} name="accountId" render={({ field }) => (
                <FormItem>
                  <HighPerfDropdown
                    options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="เลือกบัญชี..."
                  />
                  {/* ยอดเงินคงเหลือ */}
                  {(() => { const accBalance = getAccountBalance(field.value || '', transactions); return accBalance && (
                    <div className="text-xs text-muted-foreground mt-1">ยอดเงิน: {formatCurrency(accBalance.balance, accBalance.currency)}</div>
                  )})()}
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex-1">
              <FormLabel className="text-sm">วัตถุประสงค์</FormLabel>
              <FormField control={form.control} name="purpose" render={({ field }) => (
                <FormItem>
                  <HighPerfDropdown
                    options={allPurposes.filter(Boolean).map(purpose => ({ value: purpose, label: purpose }))}
                    value={field.value || ''}
                    onChange={value => { field.onChange(value); if (value !== 'อื่นๆ') setCustomPurpose(''); }}
                    placeholder="เลือกวัตถุประสงค์..."
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
          </div>
        )}
        {/* รายละเอียดเพิ่มเติม (collapsible) */}
        {!isTransfer && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sender" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">ผู้จ่าย (ถ้ามี)</FormLabel>
                <FormControl><Input placeholder="ชื่อผู้จ่าย" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="recipient" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">ผู้รับ (ถ้ามี)</FormLabel>
                <FormControl><Input placeholder="ชื่อผู้รับ" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="details" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-sm">รายละเอียด (ถ้ามี)</FormLabel>
                <FormControl><Textarea placeholder="บันทึกรายละเอียดเพิ่มเติม" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}
        {/* Toggle เทมเพลต + ปุ่มบันทึก */}
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} id="save-as-template" />
          <label htmlFor="save-as-template" className="text-sm">บันทึกเป็นเทมเพลต</label>
        </div>
        <Button className="w-full h-10 text-base font-bold mt-2">เพิ่มธุรกรรม</Button>
      </form>
    </Form>
  );
}
