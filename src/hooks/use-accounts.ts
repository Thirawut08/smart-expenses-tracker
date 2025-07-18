"use client";

import { useState, useEffect, useCallback } from "react";
import type { Account } from "@/lib/types";

const ACCOUNTS_STORAGE_KEY = "ledger-ai-accounts";

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "1", name: "Cash", currency: "THB", types: ["ทั่วไป"] },
  { id: "2", name: "KBANK", currency: "THB", types: ["ทั่วไป"] },
  { id: "3", name: "SCB", currency: "THB", types: ["ทั่วไป"] },
  { id: "4", name: "Kept", currency: "THB", types: ["ทั่วไป"] },
  { id: "5", name: "Dime!", currency: "THB", types: ["ทั่วไป"] },
  { id: "6", name: "Bybit", currency: "USD", types: ["ทั่วไป"] },
  { id: "7", name: "Binance TH", currency: "THB", types: ["ทั่วไป"] },
  { id: "8", name: "TTB", currency: "THB", types: ["ทั่วไป"] },
  { id: "9", name: "Money Plus", currency: "THB", types: ["ทั่วไป"] },
  { id: "10", name: "KTB", currency: "THB", types: ["ทั่วไป"] },
  { id: "11", name: "GSB", currency: "THB", types: ["ทั่วไป"] },
  { id: "12", name: "True Wallet", currency: "THB", types: ["ทั่วไป"] },
  { id: "13", name: "Shopee Pay", currency: "THB", types: ["ทั่วไป"] },
  { id: "14", name: "Webull", currency: "USD", types: ["ทั่วไป"] },
  { id: "15", name: "Dime FCD", currency: "USD", types: ["ทั่วไป"] },
  { id: "16", name: "Dime! USD", currency: "USD", types: ["ทั่วไป"] },
];

export function useAccounts() {
  // เริ่มต้น accounts เป็น [] เสมอ (เพื่อ SSR/CSR ตรงกัน)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // โหลดจาก localStorage เฉพาะฝั่ง client (หลัง mount)
  useEffect(() => {
    if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
        try {
      setAccounts(JSON.parse(stored));
        } catch (e) {
          setAccounts([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when accounts change (หลังโหลดแล้วเท่านั้น)
  useEffect(() => {
    if (isLoaded) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts, isLoaded]);

  // Auto-refresh accounts if localStorage changes (in this tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCOUNTS_STORAGE_KEY) {
        const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        console.log(
          "[DEBUG] handleStorageChange: loaded from localStorage:",
          stored,
        );
        if (stored) setAccounts(JSON.parse(stored));
      }
    };
    const handleCustomEvent = () => {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      console.log(
        "[DEBUG] handleCustomEvent: loaded from localStorage:",
        stored,
      );
      if (stored) setAccounts(JSON.parse(stored));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("accounts-updated", handleCustomEvent);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("accounts-updated", handleCustomEvent);
    };
  }, []);

  // Trigger custom event after add/edit/delete
  const triggerAccountsUpdated = () => {
    window.dispatchEvent(new Event("accounts-updated"));
  };

  const addAccount = useCallback(
    (account: Omit<Account, "id">) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
      setAccounts((prev) => {
      const updated = [...prev, newAccount];
      setTimeout(triggerAccountsUpdated, 0);
      return updated;
    });
    return true;
    },
    [accounts],
  );

  const editAccount = useCallback(
    (id: string, update: Partial<Omit<Account, "id">>) => {
      setAccounts((prev) => {
        const updated = prev.map((a) =>
          a.id === id ? { ...a, ...update } : a,
        );
      setTimeout(triggerAccountsUpdated, 0);
        setTimeout(() => {
          const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
          console.log(
            "[DEBUG] accounts in localStorage after editAccount:",
            stored,
          );
        }, 100);
      return updated;
    });
    },
    [],
  );

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      setTimeout(triggerAccountsUpdated, 0);
      return updated;
    });
  }, []);

  return {
    accounts,
    addAccount,
    editAccount,
    deleteAccount,
    setAccounts, // for advanced use
    isLoaded, // เพิ่ม flag สำหรับเช็คสถานะโหลดข้อมูล
  };
} 
