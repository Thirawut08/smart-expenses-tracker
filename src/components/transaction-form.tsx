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
import { useState, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { investmentAccountNames, savingAccountNames } from '@/lib/data';

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
  availablePurposes: string[];
}

export function TransactionForm({ initialData, onSubmit, isEditing = false, isTemplate = false, availablePurposes = [] }: TransactionFormProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [isTransfer, setIsTransfer] = useState(false);
  const { accounts } = useAccounts();

  // ป้องกัน initialData ที่ไม่มี mode (เช่น undefined หรือ transaction จริง)
  const safeInitialData: UnifiedFormValues = (initialData && 'mode' in initialData)
    ? initialData as UnifiedFormValues
    : { mode: 'normal', type: 'expense', accountId: '', purpose: '', amount: 0, date: new Date(), customPurpose: '', details: '', sender: '', recipient: '' };

  const form = useForm<UnifiedFormValues>({
    resolver: zodResolver(unifiedSchema),
    defaultValues: safeInitialData,
    mode: 'onChange',
  });

  // เมื่อสลับโหมด รีเซ็ตค่า default
  useEffect(() => {
    if (isTransfer) {
      form.reset({ mode: 'transfer', fromAccount: '', toAccount: '', amount: undefined, date: new Date(), details: '' });
    } else {
      form.reset(safeInitialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransfer]);

  const selectedAccountId = form.watch('accountId');
  const purposeValue = form.watch('purpose');
  
  const selectedAccount = useMemo(() => accounts.find(acc => acc.id === selectedAccountId), [selectedAccountId, accounts]);

  const allPurposes = useMemo(() => {
    const purposeSet = new Set(availablePurposes);
    if (selectedAccount) {
      if (investmentAccountNames.includes(selectedAccount.name)) {
        return ['ลงทุน'];
      }
      if (savingAccountNames.includes(selectedAccount.name)) {
        return ['ออมทรัพย์'];
      }
    }
    // Ensure 'อื่นๆ' is always an option for general accounts
    purposeSet.add('อื่นๆ');
    return Array.from(purposeSet).sort((a,b) => a === 'อื่นๆ' ? 1 : b === 'อื่นๆ' ? -1 : a.localeCompare(b));
  }, [selectedAccount, availablePurposes]);
  
  useEffect(() => {
    if (selectedAccount) {
      if (investmentAccountNames.includes(selectedAccount.name)) {
        form.setValue('purpose', 'ลงทุน', { shouldValidate: true });
      } else if (savingAccountNames.includes(selectedAccount.name)) {
        form.setValue('purpose', 'ออมทรัพย์', { shouldValidate: true });
      } else {
        const currentPurpose = form.getValues('purpose');
        if (currentPurpose === 'ลงทุน' || currentPurpose === 'ออมทรัพย์') {
            form.setValue('purpose', '', { shouldValidate: true });
        }
      }
    }
  }, [selectedAccountId, form, selectedAccount]);


  // handleSubmit ใหม่ รองรับ schema ใหม่
  const handleSubmit = (data: UnifiedFormValues) => {
    if (data.mode === 'normal' && data.purpose === 'อื่นๆ' && (!data.customPurpose || data.customPurpose.trim() === '')) {
      alert('กรุณาระบุวัตถุประสงค์');
      return;
    }
    if (data.mode === 'transfer') {
      const fromAcc = accounts.find(acc => acc.id === data.fromAccount);
      const toAcc = accounts.find(acc => acc.id === data.toAccount);
      if (!fromAcc || !toAcc || data.fromAccount === data.toAccount) {
        alert('กรุณาเลือกบัญชีต้นทางและปลายทางที่แตกต่างกัน');
        return;
      }
      const base = {
        amount: data.amount,
        date: data.date,
        details: data.details,
      };
      const tx1 = {
        ...base,
        type: 'expense' as const,
        accountId: data.fromAccount,
        purpose: 'โอนออก',
        details: `โอนไปบัญชี ${toAcc.name}${base.details ? ' | ' + base.details : ''}`,
      };
      const tx2 = {
        ...base,
        type: 'income' as const,
        accountId: data.toAccount,
        purpose: 'โอนเข้า',
        details: `โอนจากบัญชี ${fromAcc.name}${base.details ? ' | ' + base.details : ''}`,
      };
      onSubmit(tx1 as any, saveAsTemplate);
      onSubmit(tx2 as any, saveAsTemplate);
      return;
    }
    // ... โหมดปกติ ...
    const finalData = { ...data };
    if (data.mode === 'normal' && data.purpose === 'อื่นๆ' && data.customPurpose) {
      finalData.purpose = data.customPurpose.trim();
    }
    // ลบฟิลด์ mode ออกก่อนส่ง
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        {/* Toggle โอนระหว่างบัญชี */}
        <div className="flex items-center gap-2 mb-2">
          <Switch id="transfer-switch" checked={isTransfer} onCheckedChange={setIsTransfer} />
          <label htmlFor="transfer-switch" className="font-medium">โอนระหว่างบัญชีของฉัน</label>
        </div>
        {form.watch('mode') === 'transfer' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* fromAccount */}
            <FormField
              control={form.control}
              name="fromAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บัญชีต้นทาง</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="เลือกบัญชีต้นทาง" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id} disabled={account.id === form.watch('toAccount')}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* toAccount */}
            <FormField
              control={form.control}
              name="toAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บัญชีปลายทาง</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="เลือกบัญชีปลายทาง" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id} disabled={account.id === form.watch('fromAccount')}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนเงิน</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={event => field.onChange(event.target.valueAsNumber || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>วันที่และเวลา</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP p", { locale: th }) : <span>เลือกวันที่</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar locale={th} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus />
                      <div className="p-2 border-t border-border">
                        <TimePicker date={field.value} setDate={field.onChange} />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* details */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด (ถ้ามี)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="บันทึกรายละเอียดเพิ่มเติม" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2 flex flex-col items-end">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={!(form.formState.isValid && form.watch('fromAccount') && form.watch('toAccount') && form.watch('fromAccount') !== form.watch('toAccount'))}
              >
                บันทึกการโอน
              </Button>
              {form.watch('fromAccount') === form.watch('toAccount') && (
                <div className="text-red-500 text-sm mt-2">กรุณาเลือกบัญชีต้นทางและปลายทางที่แตกต่างกัน</div>
              )}
            </div>
          </div>
        ) : (
          <>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>ประเภทธุรกรรม</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="expense" /></FormControl>
                        <FormLabel className="font-normal">รายจ่าย</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="income" /></FormControl>
                        <FormLabel className="font-normal">รายรับ</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนเงิน</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={event => field.onChange(event.target.valueAsNumber || undefined)}
                          className={cn(selectedAccount && 'pl-8')}
                        />
                         {selectedAccount && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {selectedAccount.currency === 'USD' ? '$' : '฿'}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่และเวลา</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP p", { locale: th }) : <span>เลือกวันที่</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={th}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                        <div className="p-2 border-t border-border">
                          <TimePicker date={field.value} setDate={field.onChange} />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บัญชี</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกบัญชี" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วัตถุประสงค์</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={!!selectedAccount && (investmentAccountNames.includes(selectedAccount.name) || savingAccountNames.includes(selectedAccount.name))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกวัตถุประสงค์" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allPurposes.map(purpose => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {purposeValue === 'อื่นๆ' && (
                <FormField
                  control={form.control}
                  name="customPurpose"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>ระบุวัตถุประสงค์</FormLabel>
                          <FormControl>
                              <Input placeholder="เช่น ค่ากาแฟ, ค่าสมาชิก Netflix" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ผู้จ่าย (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อผู้จ่าย" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ผู้รับ (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อผู้รับ" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด (ถ้ามี)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="บันทึกรายละเอียดเพิ่มเติม" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!(isEditing || isTemplate) && (
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="save-template" checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} />
                <Label htmlFor="save-template">บันทึกเป็นเทมเพลต</Label>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มธุรกรรม'}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
