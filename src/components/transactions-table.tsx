import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Ban } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD', // The request is Thai, but no currency is specified, using a placeholder.
});

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          {transactions.length === 0 && <TableCaption>No transactions recorded yet. Add one to get started!</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Payee</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.type === 'income' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Income
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      <TrendingDown className="mr-1 h-3 w-3" />
                      Expense
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{format(transaction.date, 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.account.name}</div>
                  <div className="text-sm text-muted-foreground">{transaction.account.accountNumber}</div>
                </TableCell>
                <TableCell>{transaction.payee}</TableCell>
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
            <h3 className="text-xl font-semibold">No Transactions Found</h3>
            <p>Click "Add Transaction" to record your first entry.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
