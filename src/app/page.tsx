'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { MonthlyStats } from '@/components/monthly-stats';
import { TransactionsTable } from '@/components/transactions-table';
import { LedgerAiHeader } from '@/components/ledger-ai-header';
import type { Transaction, Template } from '@/lib/types';
import { accounts, thaiMonths } from '@/lib/data';
import type { TransactionFormValues } from '@/components/transaction-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountBalances } from '@/components/account-balances';
import { MonthInfoTable } from '@/components/month-info-table';
import { TransactionTemplates } from '@/components/transaction-templates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const TRANSACTIONS_STORAGE_KEY = 'ledger-ai-transactions';
const TEMPLATES_STORAGE_KEY = 'ledger-ai-templates';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const { toast } = useToast();

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date), // Convert date string back to Date object
        }));
        setTransactions(parsedTransactions);
      }

      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        description: "ไม่สามารถโหลดข้อมูลธุรกรรมที่บันทึกไว้ได้",
      });
    }
  }, [toast]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, [transactions]);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error("Failed to save templates to localStorage", error);
    }
  }, [templates]);


  const handleSaveTransaction = (data: TransactionFormValues, saveAsTemplate: boolean) => {
    const selectedAccount = accounts.find(acc => acc.accountNumber === data.accountNumber);
    if (!selectedAccount) {
      console.error("Account not found");
      return;
    }

    if (editingTransaction) {
      // Update existing transaction
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        account: selectedAccount,
        purpose: data.purpose,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        date: data.date,
        type: data.type,
        details: data.details,
        sender: data.sender,
        recipient: data.recipient,
      };
      setTransactions(prev =>
        prev.map(t => t.id === editingTransaction.id ? updatedTransaction : t)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      toast({ title: "อัปเดตธุรกรรมสำเร็จ", description: `อัปเดตรายการ "${data.purpose}" เรียบร้อยแล้ว` });

    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        account: selectedAccount,
        purpose: data.purpose,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        date: data.date,
        type: data.type,
        details: data.details,
        sender: data.sender,
        recipient: data.recipient,
      };
      
      setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      toast({ title: "เพิ่มธุรกรรมสำเร็จ", description: `เพิ่มรายการ "${data.purpose}" เรียบร้อยแล้ว` });
    }
    
    if (saveAsTemplate && !editingTransaction) {
      const newTemplate: Template = {
        id: new Date().toISOString() + Math.random(),
        name: `${data.purpose} (${data.type === 'income' ? 'รายรับ' : 'รายจ่าย'})`,
        type: data.type,
        accountNumber: data.accountNumber,
        purpose: data.purpose,
        sender: data.sender,
        recipient: data.recipient,
        details: data.details,
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast({ title: "บันทึกเทมเพลตสำเร็จ", description: `เทมเพลต "${newTemplate.name}" ถูกสร้างแล้ว` });
    }

    handleDialogClose(false);
  };
  
  const handleUseTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditingTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingTemplate(undefined);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      toast({ 
        variant: "destructive",
        title: "ลบธุรกรรมสำเร็จ", 
        description: `ลบรายการ "${transactionToDelete.purpose}" เรียบร้อยแล้ว` 
      });
      setTransactionToDelete(null);
    }
  };
  
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Delay resetting to avoid form flicker
      setTimeout(() => {
        setEditingTemplate(undefined);
        setEditingTransaction(undefined);
      }, 300);
    }
  }

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
    
    // Sanitize and quote values
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
        t.amount, // amount is a number, doesn't need quotes unless it contains commas
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

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return transactions;
    }
    return transactions.filter(t => new Date(t.date).getMonth().toString() === selectedMonth);
  }, [transactions, selectedMonth]);

  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') {
      return 'ทั้งหมด';
    }
    const month = thaiMonths.find(m => m.value === parseInt(selectedMonth, 10));
    return month ? month.label : 'ทั้งหมด';
  }, [selectedMonth]);
  
  const getDialogInitialData = () => {
    if (editingTransaction) {
      return {
        ...editingTransaction,
        amount: Math.abs(editingTransaction.amount),
        accountNumber: editingTransaction.account.accountNumber,
      };
    }
    if (editingTemplate) {
      return {
        ...editingTemplate,
        amount: undefined, // Let user fill this
        date: undefined, // Let user fill this
      };
    }
    return undefined;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <LedgerAiHeader />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold font-headline">แดชบอร์ด</h1>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกเดือน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกเดือน</SelectItem>
                  {thaiMonths.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportToCsv} disabled={transactions.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
              <AddTransactionDialog
                key={editingTransaction?.id || editingTemplate?.id || 'new'}
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                onSave={handleSaveTransaction}
                initialData={getDialogInitialData()}
                isEditing={!!editingTransaction}
              >
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  เพิ่มธุรกรรม
                </Button>
              </AddTransactionDialog>
            </div>
          </div>
          
          <div className="grid gap-8 mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <MonthlyStats transactions={filteredTransactions} monthLabel={currentMonthLabel} />
                </div>
                <div className="lg:col-span-3">
                    <AccountBalances transactions={transactions} />
                </div>
            </div>
            <TransactionTemplates templates={templates} onUseTemplate={handleUseTemplate} />
            <MonthInfoTable />
          </div>

          <div>
            <TransactionsTable 
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteRequest}
            />
          </div>
        </main>
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
