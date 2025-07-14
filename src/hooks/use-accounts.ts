import { useState, useEffect, useCallback } from 'react';
import type { Account } from '@/lib/types';
import { accounts as defaultAccounts } from '@/lib/data';

const ACCOUNTS_STORAGE_KEY = 'ledger-ai-accounts';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Load from localStorage or preload from data.ts
  useEffect(() => {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      setAccounts(JSON.parse(stored));
    } else {
      setAccounts(defaultAccounts);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(defaultAccounts));
    }
  }, []);

  // Save to localStorage when accounts change
  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts(prev => [...prev, newAccount]);
    return true;
  }, [accounts]);

  const editAccount = useCallback((id: string, update: Partial<Omit<Account, 'id'>>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...update } : a));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    accounts,
    addAccount,
    editAccount,
    deleteAccount,
    setAccounts, // for advanced use
  };
} 