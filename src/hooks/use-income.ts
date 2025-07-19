"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Income } from "@/lib/types";
import { accounts } from "@/lib/data";
import { useAccounts } from "@/hooks/use-accounts";

const INCOME_STORAGE_KEY = "ledger-ai-incomes";

const sortIncomes = (items: Income[]) => {
  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

export function useIncome() {
  const { accounts } = useAccounts();
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

  const updateAndSaveIncomes = useCallback(
    (newIncomes: Income[]) => {
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
    },
    [toast],
  );

  const addIncome = useCallback(
    (data: { date: Date; accountId: string; amount: number }) => {
      const account = accounts.find((acc) => acc.id === data.accountId);
      if (!account) return;
      const newIncome = {
        id: Date.now().toString(),
        date: data.date,
        amount: data.amount,
        account: account,
      };
      setIncomes((prev) => [newIncome, ...prev]);
      try {
        localStorage.setItem(
          INCOME_STORAGE_KEY,
          JSON.stringify([newIncome, ...incomes]),
        );
      } catch (error) {
        console.error("Failed to save incomes to localStorage", error);
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    },
    [accounts, incomes, toast],
  );

  const editIncome = useCallback(
    (id: string, data: { date: Date; accountId: string; amount: number }) => {
      const account = accounts.find((acc) => acc.id === data.accountId);
      if (!account) return;
      setIncomes((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data, account } : i)),
      );
      try {
        localStorage.setItem(
          INCOME_STORAGE_KEY,
          JSON.stringify(
            incomes.map((i) => (i.id === id ? { ...i, ...data, account } : i)),
          ),
        );
      } catch (error) {
        console.error("Failed to save incomes to localStorage", error);
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    },
    [accounts, incomes, toast],
  );

  const removeIncome = useCallback(
    (id: string) => {
      updateAndSaveIncomes(incomes.filter((i) => i.id !== id));
      toast({ variant: "destructive", title: "ลบรายการสำเร็จ" });
    },
    [incomes, toast, updateAndSaveIncomes],
  );

  const setEditingIncome = useCallback((incomeId: string | null) => {
    setEditingIncomeId(incomeId);
  }, []);

  const editingIncome = useMemo(() => {
    if (!editingIncomeId) return null;
    const found = incomes.find((i) => i.id === editingIncomeId);
    if (!found) return null;
    return {
      id: found.id,
      date: found.date,
      amount: found.amount,
      accountId: found.account.id,
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
    setEditingIncome,
  };
}
