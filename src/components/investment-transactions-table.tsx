import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Ban, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { Skeleton } from './ui/skeleton';

const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value: number, currency: 'THB' | 'USD' | undefined, type: 'income' | 'expense') => {
    const amount = type === 'income' ? value : -value;
    if (currency === 'USD') {
        return usdFormatter.format(amount);
    }
    return thbFormatter.format(amount);
}


interface InvestmentTransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function InvestmentTransactionsTable({ transactions, onEdit, onDelete }: InvestmentTransactionsTableProps) {
  const { rate: usdToThbRate, isLoading: isRateLoading } = useExchangeRate();

  return (
    <div>
        <Table>
          {transactions.length === 0 && <TableCaption>ยังไม่มีการบันทึกธุรกรรม</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10 w-[50px]"></TableHead>
              <TableHead className="sticky left-[50px] bg-card z-10 min-w-[150px]">บัญชี</TableHead>
              <TableHead className="min-w-[150px]">วันที่</TableHead>
              <TableHead className="min-w-[200px]">รายละเอียด</TableHead>
              <TableHead className="text-right min-w-[120px]">จำนวนเงิน</TableHead>
              <TableHead className="text-right min-w-[120px]">
                เทียบเท่า (THB)
                {isRateLoading && <span className="text-xs font-normal ml-1">(loading...)</span>}
              </TableHead>
              <TableHead className="w-[50px] text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const amountInTHB = transaction.account.currency === 'USD'
                ? transaction.amount * (usdToThbRate || 0)
                : transaction.amount;
              const amountInThbFormatted = thbFormatter.format(transaction.type === 'income' ? amountInTHB : -amountInTHB);

              return (
              <TableRow key={transaction.id}>
                <TableCell className="sticky left-0 bg-card z-10">
                  {transaction.type === 'income' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      <TrendingUp className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      <TrendingDown className="h-3 w-3" />
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="sticky left-[50px] bg-card z-10">
                  <div className="font-medium">{transaction.account.name}</div>
                </TableCell>
                <TableCell>{format(transaction.date, 'd MMM yyyy, HH:mm', { locale: th })}</TableCell>
                <TableCell>
                  {transaction.details ? <div className="text-sm text-muted-foreground italic max-w-xs truncate">"{transaction.details}"</div> : '-'}
                </TableCell>
                <TableCell className={cn('text-right font-medium', transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500')}>
                  {formatCurrency(transaction.amount, transaction.account.currency, transaction.type)}
                </TableCell>
                <TableCell className={cn('text-right font-medium text-muted-foreground', transaction.type === 'income' ? 'text-green-600/80 dark:text-green-400/80' : 'text-red-600/80 dark:text-red-500/80')}>
                  {isRateLoading && transaction.account.currency === 'USD' ? <Skeleton className="h-5 w-24 float-right" /> : amountInThbFormatted}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">เปิดเมนู</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>แก้ไข</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(transaction)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>ลบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
            <Ban className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">ไม่พบธุรกรรมการลงทุน</h3>
            <p>คลิก "เพิ่มธุรกรรม" เพื่อบันทึกรายการแรกของคุณ</p>
          </div>
        )}
    </div>
  );
}
