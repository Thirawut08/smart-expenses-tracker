'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Transaction, Template } from '@/lib/types';
import { accounts, defaultPurposes } from '@/lib/data';
import type { TransactionFormValues } from '@/components/transaction-form';
import { useToast } from '@/hooks/use-toast';

const TRANSACTIONS_STORAGE_KEY = 'ledger-ai-transactions';
const TEMPLATES_STORAGE_KEY = 'ledger-ai-templates';
const PURPOSES_STORAGE_KEY = 'ledger-ai-purposes';

const sortTransactions = (transactions: Transaction[]) => {
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export function useLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
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
        setTransactions(sortTransactions(parsedTransactions));
      }

      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }

      const storedPurposes = localStorage.getItem(PURPOSES_STORAGE_KEY);
      if (storedPurposes) {
        setPurposes(JSON.parse(storedPurposes));
      } else {
        setPurposes(defaultPurposes);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        description: "ไม่สามารถโหลดข้อมูลที่บันทึกไว้ได้",
      });
    }
  }, [toast]);

  const updateAndSaveTransactions = useCallback((newTransactions: Transaction[]) => {
    const sorted = sortTransactions(newTransactions);
    setTransactions(sorted);
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, []);
  
  const updateAndSaveTemplates = useCallback((newTemplates: Template[]) => {
    setTemplates(newTemplates);
     try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(newTemplates));
    } catch (error) {
      console.error("Failed to save templates to localStorage", error);
    }
  }, []);
  
  const updateAndSavePurposes = useCallback((newPurposes: string[]) => {
    const uniquePurposes = [...new Set(newPurposes)].sort((a, b) => a.localeCompare(b));
    setPurposes(uniquePurposes);
    try {
        localStorage.setItem(PURPOSES_STORAGE_KEY, JSON.stringify(uniquePurposes));
    } catch (error) {
        console.error("Failed to save purposes to localStorage", error);
    }
  }, []);

  const addPurpose = useCallback((newPurpose: string) => {
    if (newPurpose && !purposes.includes(newPurpose) && newPurpose !== 'ลงทุน' && newPurpose !== 'ออมทรัพย์') {
        const newPurposes = [...purposes, newPurpose];
        updateAndSavePurposes(newPurposes);
    }
  }, [purposes, updateAndSavePurposes]);


  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setEditingTemplate(undefined);
      setEditingTransaction(undefined);
    }
    setIsDialogOpen(open);
  }, []);

  const handleSaveTransaction = useCallback((data: TransactionFormValues, saveAsTemplate: boolean) => {
    const selectedAccount = accounts.find(acc => acc.accountNumber === data.accountNumber);
    if (!selectedAccount) {
      toast({ variant: 'destructive', title: 'ไม่พบบัญชี' });
      return;
    }
    
    if (!data.amount || !data.date) {
        toast({ variant: 'destructive', title: 'ข้อมูลไม่ครบถ้วน', description: 'กรุณากรอกจำนวนเงินและวันที่' });
        return;
    }

    if (data.purpose === 'อื่นๆ' && data.customPurpose) {
        addPurpose(data.customPurpose);
    }

    if (editingTransaction) {
      // Update existing transaction
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        account: selectedAccount,
        purpose: data.purpose,
        amount: data.amount,
        date: data.date,
        type: data.type,
        details: data.details,
        sender: data.sender,
        recipient: data.recipient,
      };
      
      updateAndSaveTransactions(
        transactions.map(t => t.id === editingTransaction.id ? updatedTransaction : t)
      );

      toast({ title: "อัปเดตธุรกรรมสำเร็จ", description: `อัปเดตรายการ "${data.purpose}" เรียบร้อยแล้ว` });

    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        account: selectedAccount,
        purpose: data.purpose,
        amount: data.amount,
        date: data.date,
        type: data.type,
        details: data.details,
        sender: data.sender,
        recipient: data.recipient,
      };
      
      updateAndSaveTransactions([...transactions, newTransaction]);
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
      updateAndSaveTemplates([...templates, newTemplate]);
      toast({ title: "บันทึกเทมเพลตสำเร็จ", description: `เทมเพลต "${newTemplate.name}" ถูกสร้างแล้ว` });
    }

    handleDialogClose(false);
  }, [editingTransaction, handleDialogClose, toast, templates, transactions, updateAndSaveTransactions, updateAndSaveTemplates, addPurpose]);
  
  const handleUseTemplate = useCallback((template: Template) => {
    setEditingTemplate(template);
    setEditingTransaction(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingTemplate(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction);
  }, []);

  const confirmDelete = useCallback(() => {
    if (transactionToDelete) {
      updateAndSaveTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      toast({ 
        variant: "destructive",
        title: "ลบธุรกรรมสำเร็จ", 
        description: `ลบรายการ "${transactionToDelete.purpose}" เรียบร้อยแล้ว` 
      });
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, toast, transactions, updateAndSaveTransactions]);

  const dialogInitialData = useMemo(() => {
    if (editingTransaction) {
      return {
        ...editingTransaction,
        accountNumber: editingTransaction.account.accountNumber,
      };
    }
    if (editingTemplate) {
      return {
        ...editingTemplate,
        amount: undefined,
        date: undefined,
      };
    }
    return undefined;
  }, [editingTransaction, editingTemplate]);

  return {
    transactions,
    templates,
    purposes,
    isDialogOpen,
    editingTransaction,
    transactionToDelete,
    
    // Actions
    setIsDialogOpen,
    setTransactionToDelete,
    handleSaveTransaction,
    handleUseTemplate,
    handleEditTransaction,
    handleDeleteRequest,
    confirmDelete,
    handleDialogClose,
    dialogInitialData,
  };
}
