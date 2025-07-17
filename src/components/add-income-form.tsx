'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAccounts } from '@/hooks/use-accounts';
import { TimePicker } from './time-picker';
import { useEffect, useMemo } from 'react';
import { HighPerfDropdown } from './ui/high-perf-dropdown';
import { DateTimePicker } from './date-time-picker';

const incomeFormSchema = z.object({
  date: z.date({ required_error: 'กรุณาระบุวันที่' }),
  accountId: z.string({ required_error: 'กรุณาเลือกบัญชี' }).min(1, 'กรุณาเลือกบัญชี'),
  amount: z.coerce.number().positive('จำนวนเงินต้องเป็นบวก'),
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
  if (!bg) return '#222';
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return yiq >= 128 ? '#222' : '#fff';
}

export function AddIncomeForm({ initialData, onSubmit, onCancel }: AddIncomeFormProps) {
  const { accounts } = useAccounts();
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      date: initialData?.date ?? new Date(),
      accountId: initialData?.accountId ?? '',
      amount: initialData?.amount ?? undefined,
    },
  });
  
  // Reset form when initialData changes
  useEffect(() => {
    form.reset({
      date: initialData?.date ?? new Date(),
      accountId: initialData?.accountId ?? '',
      amount: initialData?.amount ?? undefined,
    });
  }, [initialData, form]);

  const selectedAccountId = form.watch('accountId');
  
  const selectedAccount = useMemo(() => accounts.find(acc => acc.id === selectedAccountId), [selectedAccountId, accounts]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-3">
        <h2 className="text-xl font-bold mb-4">เพิ่มรายการรายรับ</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            {/* ใช้ DateTimePicker แทน Date+Time เดิม */}
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">วันที่และเวลา</FormLabel>
                <DateTimePicker value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="flex-1">
            <FormField control={form.control} name="accountId" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">บัญชี</FormLabel>
                <HighPerfDropdown
                  options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="เลือกบัญชี..."
                />
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">จำนวนเงิน</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={event => field.onChange(event.target.valueAsNumber || undefined)}
                    className={cn(selectedAccount && 'pl-8', 'h-12 text-lg w-full px-4')}
                  />
                  {selectedAccount && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                      {selectedAccount.currency === 'USD' ? '$' : '฿'}
                    </span>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onCancel} className="h-9 px-4 text-sm font-semibold">ยกเลิก</Button>
          <Button type="submit" className="h-9 px-6 text-sm font-bold">
            {initialData ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกรายรับ'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
