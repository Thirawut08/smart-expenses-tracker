'use client';

import { useState } from 'react';
import { PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { TransactionsTable } from '@/components/transactions-table';
import { useLedger } from '@/hooks/use-ledger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
    confirmDelete
  } = useLedger();

  const { toast } = useToast();

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

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold font-headline">ธุรกรรมทั้งหมด</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportToCsv} disabled={transactions.length === 0}>
              <FileDown className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <AddTransactionDialog
              key={editingTransaction?.id || 'new'}
              open={isDialogOpen}
              onOpenChange={handleDialogClose}
              onSave={handleSaveTransaction}
              initialData={dialogInitialData}
              isEditing={!!editingTransaction}
            >
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มธุรกรรม
              </Button>
            </AddTransactionDialog>
          </div>
        </div>
        
        <TransactionsTable 
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteRequest}
        />
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
