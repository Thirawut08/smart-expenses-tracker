'use client';

import { useMemo, useState } from 'react';
import { PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionModal } from '@/components/add-transaction-modal';
import { TransactionsTable } from '@/components/transactions-table';
import { useLedger } from '@/hooks/use-ledger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TransactionsPage() {
  const {
    transactions,
    isDialogOpen,
    editingTransaction,
    transactionToDelete,
    handleSaveTransaction,
    handleDialogClose,
    dialogInitialData,
    setIsDialogOpen,
    handleEditTransaction,
    handleDeleteRequest,
    setTransactionToDelete,
    confirmDelete,
    purposes
  } = useLedger();

  const { toast } = useToast();
  
  const incomeTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'income');
  }, [transactions]);
  
  const expenseTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'expense');
  }, [transactions]);

  // DEBUG LOG
  console.log('all transactions', transactions);
  console.log('expenseTransactions', expenseTransactions);

  const handleExportToCsv = () => {
    if (transactions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'ไม่มีข้อมูลให้ส่งออก',
        description: 'กรุณาเพิ่มธุรกรรมก่อนทำการส่งออก',
      });
      return;
    }

    const headers = ['Date', 'Type', 'Account', 'Purpose', 'Sender', 'Recipient', 'Details', 'Amount'];
    
    const escapeCsvCell = (cell: any): string => {
      const cellStr = String(cell ?? '').replace(/"/g, '""');
      return `"${cellStr}"`;
    };

    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        escapeCsvCell(format(t.date, 'yyyy-MM-dd HH:mm:ss')),
        escapeCsvCell(t.type),
        escapeCsvCell(t.account.name),
        escapeCsvCell(t.purpose),
        escapeCsvCell(t.sender),
        escapeCsvCell(t.recipient),
        escapeCsvCell(t.details),
        t.amount,
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger-ai-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'ส่งออกข้อมูลสำเร็จ',
      description: 'ไฟล์ CSV ของคุณได้ถูกดาวน์โหลดแล้ว',
    });
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleAddTransaction = (data: any) => {
    handleSaveTransaction(data);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="space-y-8 w-full max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold font-headline">ธุรกรรมทั้งหมด</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportToCsv} disabled={transactions.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มธุรกรรม
              </Button>
              <AddTransactionModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddTransaction}
              />
            </div>
          </div>
          {/* Minimal, no Card, no CardHeader, no CardContent */}
          <div className="w-full">
            <div className="text-xl font-semibold mb-2">รายการธุรกรรม</div>
            <Tabs defaultValue="expense" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">รายจ่าย</TabsTrigger>
                <TabsTrigger value="income">รายรับ</TabsTrigger>
              </TabsList>
              <TabsContent value="expense" className="mt-4">
                  <TransactionsTable 
                      transactions={expenseTransactions}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteRequest}
                  />
              </TabsContent>
              <TabsContent value="income" className="mt-4">
                  <TransactionsTable 
                      transactions={incomeTransactions}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteRequest}
                  />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ จะเป็นการลบข้อมูลธุรกรรมนี้อย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>ดำเนินการต่อ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
