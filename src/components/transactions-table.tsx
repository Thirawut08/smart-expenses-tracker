import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Ban } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ธุรกรรมล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          {transactions.length === 0 && <TableCaption>ยังไม่มีการบันทึกธุรกรรม เริ่มเพิ่มได้เลย!</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ประเภท</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>บัญชี</TableHead>
              <TableHead>วัตถุประสงค์</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.type === 'income' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      รายรับ
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      <TrendingDown className="mr-1 h-3 w-3" />
                      รายจ่าย
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{format(transaction.date, 'd MMM yyyy, HH:mm', { locale: th })}</TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.account.name}</div>
                </TableCell>
                <TableCell>{transaction.purpose}</TableCell>
                <TableCell>
                  {transaction.details && <div className="text-sm text-muted-foreground italic">"{transaction.details}"</div>}
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'}`}>
                  {currencyFormatter.format(Math.abs(transaction.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
            <Ban className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">ไม่พบธุรกรรม</h3>
            <p>คลิก "เพิ่มธุรกรรม" เพื่อบันทึกรายการแรกของคุณ</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
