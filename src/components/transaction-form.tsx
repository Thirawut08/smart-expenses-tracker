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
import { accounts, purposes } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TimePicker } from './time-picker';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Label } from '@/components/ui/label';

export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'กรุณาเลือกประเภทธุรกรรม' }),
  accountNumber: z.string({ required_error: 'กรุณาเลือกบัญชี' }).min(1, 'กรุณาเลือกบัญชี'),
  purpose: z.string().min(1, 'วัตถุประสงค์เป็นสิ่งจำเป็น'),
  amount: z.coerce.number().positive('จำนวนเงินต้องเป็นบวก'),
  date: z.date({ required_error: 'กรุณาระบุวันที่' }),
  sender: z.string().optional(),
  recipient: z.string().optional(),
  details: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  initialData?: Partial<TransactionFormValues & { validationResult?: string }>;
  onSubmit: (data: TransactionFormValues, saveAsTemplate: boolean) => void;
  isEditing?: boolean;
  isTemplate?: boolean;
}

export function TransactionForm({ initialData, onSubmit, isEditing = false, isTemplate = false }: TransactionFormProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  
  // Create a version of the schema for the form that allows amount and date to be optional,
  // which is useful when using a template.
  const formSchema = transactionFormSchema.extend({
    amount: transactionFormSchema.shape.amount.optional(),
    date: transactionFormSchema.shape.date.optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(transactionFormSchema), // Still validate against the strict schema on submit
    defaultValues: {
      type: 'expense',
      date: initialData?.date === undefined ? new Date() : initialData.date,
      ...initialData,
      amount: initialData?.amount === undefined ? undefined : initialData.amount,
      details: initialData?.details ?? '',
      sender: initialData?.sender ?? '',
      recipient: initialData?.recipient ?? '',
    },
  });

  const handleSubmit = (data: TransactionFormValues) => {
    onSubmit(data, saveAsTemplate);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
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
                    <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} onChange={event => field.onChange(event.target.valueAsNumber)} />
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

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>วัตถุประสงค์</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกวัตถุประสงค์" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {purposes.map(purpose => (
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
        </form>
      </Form>
    </>
  );
}
