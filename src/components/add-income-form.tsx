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
import { accounts } from '@/lib/data';
import { TimePicker } from './time-picker';
import { useEffect, useMemo } from 'react';

const incomeFormSchema = z.object({
  date: z.date({ required_error: 'กรุณาระบุวันที่' }),
  accountNumber: z.string({ required_error: 'กรุณาเลือกบัญชี' }).min(1, 'กรุณาเลือกบัญชี'),
  amount: z.coerce.number().positive('จำนวนเงินต้องเป็นบวก'),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface AddIncomeFormProps {
  initialData?: {
      id: string;
      date: Date;
      amount: number;
      accountNumber: string;
  } | null;
  onSubmit: (data: IncomeFormValues) => void;
  onCancel: () => void;
}

export function AddIncomeForm({ initialData, onSubmit, onCancel }: AddIncomeFormProps) {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      date: initialData?.date ?? new Date(),
      accountNumber: initialData?.accountNumber ?? '',
      amount: initialData?.amount ?? undefined,
    },
  });
  
  // Reset form when initialData changes
  useEffect(() => {
    form.reset({
      date: initialData?.date ?? new Date(),
      accountNumber: initialData?.accountNumber ?? '',
      amount: initialData?.amount ?? undefined,
    });
  }, [initialData, form]);

  const selectedAccountNumber = form.watch('accountNumber');
  
  const selectedAccount = useMemo(() => {
    return accounts.find(acc => acc.accountNumber === selectedAccountNumber);
  }, [selectedAccountNumber]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
             <FormField
              control={form.control}
              name="accountNumber"
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
                        <SelectItem key={account.id} value={account.accountNumber}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
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
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>ยกเลิก</Button>
            <Button type="submit">
                {initialData ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกรายรับ'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
