'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Transaction, Template } from '@/lib/types';
import { useAccounts } from '@/hooks/use-accounts';
import type { UnifiedFormValues } from '@/components/transaction-form';
import { useToast } from '@/hooks/use-toast';
import { defaultPurposes } from '@/lib/data';

const TRANSACTIONS_STORAGE_KEY = 'ledger-ai-transactions';
const TEMPLATES_STORAGE_KEY = 'ledger-ai-templates';
const PURPOSES_STORAGE_KEY = 'ledger-ai-purposes';

const sortTransactions = (transactions: Transaction[]) => {
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export function useLedger() {
  const { accounts } = useAccounts();
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
        localStorage.setItem(PURPOSES_STORAGE_KEY, JSON.stringify(defaultPurposes));
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
    // unique by name
    const uniquePurposes = Array.from(new Set(newPurposes.map(p => p.trim())));
    setPurposes(uniquePurposes);
    try {
      localStorage.setItem(PURPOSES_STORAGE_KEY, JSON.stringify(uniquePurposes));
    } catch (error) {
      console.error("Failed to save purposes to localStorage", error);
    }
  }, []);

  const addPurpose = useCallback((newPurpose: string) => {
    if (!newPurpose) return;
    const trimmedName = newPurpose.trim();
    if (purposes.some(p => p === trimmedName)) {
      toast({
        variant: 'destructive',
        title: 'ชื่อวัตถุประสงค์ซ้ำ',
        description: `มีวัตถุประสงค์ชื่อ "${trimmedName}" อยู่แล้ว`
      });
      return;
    }
    const newPurposes = [...purposes, trimmedName];
    updateAndSavePurposes(newPurposes);
    toast({
      title: 'เพิ่มวัตถุประสงค์สำเร็จ',
      description: `"${trimmedName}" ถูกเพิ่มในรายการแล้ว`
    });
  }, [purposes, updateAndSavePurposes, toast]);
  
  const editPurpose = useCallback((oldPurposeName: string, updated: string) => {
    // Update purpose in list
    const newPurposes = purposes.map(p => p === oldPurposeName ? updated.trim() : p);
    updateAndSavePurposes(newPurposes);
    // Update transactions' purpose name if changed
    if (oldPurposeName !== updated) {
      setTransactions(prev => prev.map(t => t.purpose === oldPurposeName ? { ...t, purpose: updated } : t));
    }
    // (Optional) update templates if needed
  }, [purposes, updateAndSavePurposes]);

  const removePurpose = useCallback(async (purposeToRemove: string, action?: 'reclassify' | 'deleteAll') => {
    // Re-classify or delete transactions if needed
    if (action) {
      try {
        const response = await fetch('/api/reclassify-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions,
            oldPurpose: purposeToRemove,
            newPurpose: 'อื่นๆ',
            deleteTransactions: action === 'deleteAll'
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update transactions');
        setTransactions(data.updatedTransactions.map((t:any) => ({...t, date: new Date(t.date)})));
      } catch (error) {
        console.error("Failed to update transactions:", error);
        toast({ variant: 'destructive', title: 'เกิดข้อผิดพลาดในการอัปเดตธุรกรรม' });
        return;
      }
    }
    // Remove purpose from list
    const newPurposes = purposes.filter(p => p !== purposeToRemove);
    updateAndSavePurposes(newPurposes);
    toast({ variant: 'destructive', title: 'ลบวัตถุประสงค์สำเร็จ' });
  }, [purposes, updateAndSavePurposes, transactions, toast]);


  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setEditingTemplate(undefined);
      setEditingTransaction(undefined);
    }
    setIsDialogOpen(open);
  }, []);

  const handleSaveTransaction = useCallback((data: Transaction | UnifiedFormValues | (Transaction | UnifiedFormValues)[], saveAsTemplate: boolean) => {
    console.log('handleSaveTransaction', data);
    console.log('accounts in useLedger:', accounts);
    console.log('transactions before save:', transactions);
    if (Array.isArray(data)) {
      // กรณีโอนระหว่างบัญชี รับ array ของ Transaction หรือ UnifiedFormValues
      const newTransactions: Transaction[] = data.map(tx => {
        const selectedAccount = accounts.find(acc => acc.id === tx.accountId);
        console.log('DEBUG tx.accountId:', tx.accountId, 'selectedAccount:', selectedAccount?.name);
        if (!selectedAccount) return null;
        return {
          id: new Date().toISOString() + Math.random(),
          account: selectedAccount,
          purpose: tx.purpose,
          amount: tx.amount,
          date: tx.date,
          type: tx.type,
          details: tx.details,
          sender: tx.sender,
          recipient: tx.recipient,
        };
      }).filter(Boolean) as Transaction[];
      updateAndSaveTransactions([...transactions, ...newTransactions]);
      toast({ title: "เพิ่มธุรกรรมสำเร็จ", description: `เพิ่มรายการโอนระหว่างบัญชีเรียบร้อยแล้ว` });
      handleDialogClose(false);
      console.log('transactions after save:', [...transactions, ...newTransactions]);
      return;
    }
    const selectedAccount = accounts.find(acc => acc.id === data.accountId);
    if (!selectedAccount) {
      toast({ variant: 'destructive', title: 'ไม่พบบัญชี' });
      return;
    }
    
    if (!data.amount || !data.date) {
        toast({ variant: 'destructive', title: 'ข้อมูลไม่ครบถ้วน', description: 'กรุณากรอกจำนวนเงินและวันที่' });
        return;
    }
    
    const finalData = { ...data };
    if (data.purpose === 'อื่นๆ' && data.customPurpose) {
      finalData.purpose = data.customPurpose.trim();
    }
    
    // Add purpose only if it's new. ไม่ต้องเช็ค reservedNames
    if (!purposes.some(p => p === finalData.purpose)) {
        addPurpose(finalData.purpose);
    }
    

    if (editingTransaction) {
      // Update existing transaction
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        account: selectedAccount,
        purpose: finalData.purpose,
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

      toast({ title: "อัปเดตธุรกรรมสำเร็จ", description: `อัปเดตรายการ "${finalData.purpose}" เรียบร้อยแล้ว` });

    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: new Date().toISOString() + Math.random(),
        account: selectedAccount,
        purpose: finalData.purpose,
        amount: data.amount,
        date: data.date,
        type: data.type,
        details: data.details,
        sender: data.sender,
        recipient: data.recipient,
      };
      updateAndSaveTransactions([...transactions, newTransaction]);
      console.log('transactions after save:', [...transactions, newTransaction]);
    }
    
    if (saveAsTemplate && !editingTransaction) {
      const newTemplate: Template = {
        id: new Date().toISOString() + Math.random(),
        name: `${finalData.purpose} (${finalData.type === 'income' ? 'รายรับ' : 'รายจ่าย'})`,
        type: finalData.type,
        purpose: finalData.purpose,
        sender: finalData.sender,
        recipient: finalData.recipient,
        details: finalData.details,
      };
      updateAndSaveTemplates([...templates, newTemplate]);
      toast({ title: "บันทึกเทมเพลตสำเร็จ", description: `เทมเพลต "${newTemplate.name}" ถูกสร้างแล้ว` });
    }

    handleDialogClose(false);
  }, [editingTransaction, handleDialogClose, toast, templates, transactions, updateAndSaveTransactions, updateAndSaveTemplates, addPurpose, purposes]);
  
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
        accountNumber: editingTransaction.account.id,
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
    addPurpose,
    setIsDialogOpen,
    setTransactionToDelete,
    handleSaveTransaction,
    handleUseTemplate,
    handleEditTransaction,
    handleDeleteRequest,
    confirmDelete,
    handleDialogClose,
    dialogInitialData,
    editPurpose,
    removePurpose,
  };
}
