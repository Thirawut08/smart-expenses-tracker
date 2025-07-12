'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Transaction, Template } from '@/lib/types';
import { accounts } from '@/lib/data';
import type { TransactionFormValues } from '@/components/transaction-form';
import { useToast } from '@/hooks/use-toast';

const TRANSACTIONS_STORAGE_KEY = 'ledger-ai-transactions';
const TEMPLATES_STORAGE_KEY = 'ledger-ai-templates';

export function useLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
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
  
  const handleDialogClose = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Delay resetting to avoid form flicker
      setTimeout(() => {
        setEditingTemplate(undefined);
        setEditingTransaction(undefined);
      }, 300);
    }
  }, []);

  const handleSaveTransaction = useCallback((data: TransactionFormValues, saveAsTemplate: boolean) => {
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
        amount: data.amount!,
        date: data.date!,
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
        amount: data.amount!,
        date: data.date!,
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
  }, [editingTransaction, handleDialogClose, toast]);
  
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
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      toast({ 
        variant: "destructive",
        title: "ลบธุรกรรมสำเร็จ", 
        description: `ลบรายการ "${transactionToDelete.purpose}" เรียบร้อยแล้ว` 
      });
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, toast]);

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
    setTransactions // Exposing for filtering if needed
  };
}
