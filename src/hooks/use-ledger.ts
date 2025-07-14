'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Transaction, Template } from '@/lib/types';
import { accounts, defaultPurposes } from '@/lib/data';
import type { UnifiedFormValues } from '@/components/transaction-form';
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
    const uniquePurposes = [...new Set(newPurposes)].sort((a, b) => a.localeCompare(b));
    setPurposes(uniquePurposes);
    try {
        localStorage.setItem(PURPOSES_STORAGE_KEY, JSON.stringify(uniquePurposes));
    } catch (error) {
        console.error("Failed to save purposes to localStorage", error);
    }
  }, []);

  const addPurpose = useCallback((newPurpose: string) => {
    if (!newPurpose) return;
    const trimmedPurpose = newPurpose.trim();
    const reservedNames = ['ลงทุน', 'ออมทรัพย์', 'อื่นๆ'];
    
    if (reservedNames.includes(trimmedPurpose)) {
      toast({
        variant: 'destructive',
        title: 'ไม่สามารถเพิ่มได้',
        description: `"${trimmedPurpose}" เป็นชื่อที่ระบบสงวนไว้`
      });
      return;
    }
    
    if (purposes.includes(trimmedPurpose)) {
      toast({
        variant: 'destructive',
        title: 'ชื่อวัตถุประสงค์ซ้ำ',
        description: `มีวัตถุประสงค์ชื่อ "${trimmedPurpose}" อยู่แล้ว`
      });
      return;
    }

    const newPurposes = [...purposes, trimmedPurpose];
    updateAndSavePurposes(newPurposes);
    toast({
      title: 'เพิ่มวัตถุประสงค์สำเร็จ',
      description: `"${trimmedPurpose}" ถูกเพิ่มในรายการแล้ว`
    });

  }, [purposes, updateAndSavePurposes, toast]);
  
  const editPurpose = useCallback(async (oldPurpose: string, newPurpose: string) => {
    // Re-classify transactions
     try {
        const response = await fetch('/api/reclassify-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactions, oldPurpose, newPurpose }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reclassify');

        updateAndSaveTransactions(data.updatedTransactions.map((t:any) => ({...t, date: new Date(t.date)})));
    } catch (error) {
        console.error("Failed to re-classify transactions:", error);
        toast({ variant: 'destructive', title: 'เกิดข้อผิดพลาดในการอัปเดตธุรกรรม' });
        return; // Stop if transaction update fails
    }
    
    // Update purpose list
    const newPurposes = purposes.map(p => p === oldPurpose ? newPurpose : p);
    updateAndSavePurposes(newPurposes);

  }, [purposes, updateAndSavePurposes, transactions, updateAndSaveTransactions, toast]);

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

            updateAndSaveTransactions(data.updatedTransactions.map((t:any) => ({...t, date: new Date(t.date)})));
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

  }, [purposes, updateAndSavePurposes, transactions, updateAndSaveTransactions, toast]);


  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setEditingTemplate(undefined);
      setEditingTransaction(undefined);
    }
    setIsDialogOpen(open);
  }, []);

  const handleSaveTransaction = useCallback((data: Transaction | UnifiedFormValues | (Transaction | UnifiedFormValues)[], saveAsTemplate: boolean) => {
    if (Array.isArray(data)) {
      data.forEach(tx => handleSaveTransaction(tx, false));
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
    
    // Add purpose only if it's new and not a reserved name. The function handles checks.
    const reservedNames = ['ลงทุน', 'ออมทรัพย์', 'อื่นๆ'];
    if (!purposes.includes(finalData.purpose) && !reservedNames.includes(finalData.purpose)) {
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
      toast({ title: "เพิ่มธุรกรรมสำเร็จ", description: `เพิ่มรายการ "${finalData.purpose}" เรียบร้อยแล้ว` });
    }
    
    if (saveAsTemplate && !editingTransaction) {
      const newTemplate: Template = {
        id: new Date().toISOString() + Math.random(),
        name: `${finalData.purpose} (${finalData.type === 'income' ? 'รายรับ' : 'รายจ่าย'})`,
        type: finalData.type,
        accountNumber: finalData.accountNumber,
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
