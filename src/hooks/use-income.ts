'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Income } from '@/lib/types';
import { accounts } from '@/lib/data';

const INCOME_STORAGE_KEY = 'ledger-ai-incomes';

const sortIncomes = (items: Income[]) => {
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export function useIncome() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedIncomes = localStorage.getItem(INCOME_STORAGE_KEY);
      if (storedIncomes) {
        const parsed = JSON.parse(storedIncomes).map((i: any) => ({
          ...i,
          date: new Date(i.date),
        }));
        setIncomes(sortIncomes(parsed));
      }
    } catch (error) {
      console.error("Failed to load incomes from localStorage", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาดในการโหลดข้อมูลรายรับ",
      });
    }
  }, [toast]);

  const updateAndSaveIncomes = useCallback((newIncomes: Income[]) => {
    const sorted = sortIncomes(newIncomes);
    setIncomes(sorted);
    try {
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error("Failed to save incomes to localStorage", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      });
    }
  }, [toast]);

  const addIncome = useCallback((data: { date: Date; accountNumber: string; amount: number; }) => {
    const account = accounts.find(a => a.accountNumber === data.accountNumber);
    if (!account) {
      toast({ variant: 'destructive', title: 'ไม่พบบัญชี' });
      return;
    }
    const newIncome: Income = {
      id: new Date().toISOString() + Math.random(),
      date: data.date,
      account,
      amount: data.amount,
    };
    updateAndSaveIncomes([...incomes, newIncome]);
    toast({ title: 'บันทึกรายรับสำเร็จ' });
  }, [incomes, toast, updateAndSaveIncomes]);
  
  const editIncome = useCallback((id: string, data: { date: Date; accountNumber: string; amount: number; }) => {
      const account = accounts.find(a => a.accountNumber === data.accountNumber);
      if (!account) {
        toast({ variant: 'destructive', title: 'ไม่พบบัญชี' });
        return;
      }
      
      const updatedIncomes = incomes.map(income => 
          income.id === id ? { ...income, date: data.date, account, amount: data.amount } : income
      );
      updateAndSaveIncomes(updatedIncomes);
      toast({ title: 'แก้ไขรายรับสำเร็จ' });
      setEditingIncomeId(null);
  }, [incomes, toast, updateAndSaveIncomes]);

  const removeIncome = useCallback((id: string) => {
    updateAndSaveIncomes(incomes.filter(i => i.id !== id));
    toast({ variant: 'destructive', title: 'ลบรายการสำเร็จ' });
  }, [incomes, toast, updateAndSaveIncomes]);
  
  const setEditingIncome = useCallback((incomeId: string | null) => {
      setEditingIncomeId(incomeId);
  }, []);

  const editingIncome = useMemo(() => {
    if (!editingIncomeId) return null;
    const found = incomes.find(i => i.id === editingIncomeId);
    if (!found) return null;
    return {
        id: found.id,
        date: found.date,
        amount: found.amount,
        accountNumber: found.account.accountNumber,
    };
  }, [editingIncomeId, incomes]);

  return { 
      incomes, 
      addIncome, 
      editIncome,
      removeIncome,
      isFormOpen,
      setIsFormOpen,
      editingIncome,
      setEditingIncome
    };
}
