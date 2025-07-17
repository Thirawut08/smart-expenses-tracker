import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Ban, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn, convertToTHB } from '@/lib/utils';
import { defaultPurposes } from '@/lib/data';

function formatCurrency(amount: number, currency: 'THB' | 'USD', type?: 'income' | 'expense') {
  const absAmount = Math.abs(amount);
  if (currency === 'THB') return `${type === 'expense' ? '-' : ''}฿${absAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  if (currency === 'USD') return `${type === 'expense' ? '-' : ''}$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return amount;
}

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  const tableType = transactions.length > 0 ? transactions[0].type : 'expense';

  return (
    <div className="w-full">
        <Table className="w-full table-fixed">
          {transactions.length === 0 && <TableCaption>ยังไม่มีการบันทึกธุรกรรม</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10 w-12"></TableHead>
              <TableHead className="sticky left-12 bg-card z-10">บัญชี</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead>วัตถุประสงค์</TableHead>
              <TableHead>ผู้จ่าย</TableHead>
              <TableHead>ผู้รับ</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="w-12 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              console.log('DEBUG table row transaction:', transaction);
              console.log('DEBUG table row account:', { id: transaction.account.id, name: transaction.account.name, currency: transaction.account.currency });
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
                  <TableCell>
                    {transaction.purpose}
                  </TableCell>
                  <TableCell>{transaction.sender || '-'}</TableCell>
                  <TableCell>{transaction.recipient || '-'}</TableCell>
                  <TableCell className={cn('text-right font-medium', transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500')}>
                    {formatCurrency(transaction.amount, transaction.account.currency, transaction.type)}
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
              );
            })}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
            <Ban className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">ไม่พบธุรกรรม{tableType === 'income' ? 'รายรับ' : 'รายจ่าย'}</h3>
            <p>คลิก "เพิ่มธุรกรรม" เพื่อบันทึกรายการแรกของคุณ</p>
          </div>
        )}
    </div>
  );
}
