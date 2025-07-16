import { useState, useEffect, useCallback } from 'react';
import type { Account } from '@/lib/types';
import { accounts as defaultAccounts } from '@/lib/data';

const ACCOUNTS_STORAGE_KEY = 'ledger-ai-accounts';

const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'Cash', color: '#7B3F00', currency: 'THB' },
  { id: '2', name: 'KBANK', color: '#007236', currency: 'THB' },
  { id: '3', name: 'SCB', color: '#5A2D82', currency: 'THB' },
  { id: '4', name: 'Kept', color: '#A020F0', currency: 'THB' },
  { id: '5', name: 'Dime!', color: '#BFFF00', currency: 'THB' },
  { id: '6', name: 'Bybit', color: '#FFD700', currency: 'USD' },
  { id: '7', name: 'Binance TH', color: '#F0B90B', currency: 'THB' },
  { id: '8', name: 'TTB', color: '#E5E4E2', currency: 'THB' },
  { id: '9', name: 'Money Plus', color: '#B22222', currency: 'THB' },
  { id: '10', name: 'KTB', color: '#00BFFF', currency: 'THB' },
  { id: '11', name: 'GSB', color: '#FFB6C1', currency: 'THB' },
  { id: '12', name: 'True Wallet', color: '#FFA500', currency: 'THB' },
  { id: '13', name: 'Shopee Pay', color: '#FF4500', currency: 'THB' },
  { id: '14', name: 'Webull', color: '#1E90FF', currency: 'USD' },
  { id: '15', name: 'Dime FCD', color: '#D3D3D3', currency: 'USD' },
  { id: '16', name: 'Dime! USD', color: '#4682B4', currency: 'USD' },
];

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

  // เพิ่ม useEffect สำหรับสร้างบัญชี default ถ้า accounts ว่าง
  useEffect(() => {
    if (accounts.length === 0) {
      setAccounts(DEFAULT_ACCOUNTS);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    }
  }, [accounts, setAccounts]);

  // Save to localStorage when accounts change
  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  // Auto-refresh accounts if localStorage changes (in this tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCOUNTS_STORAGE_KEY) {
        const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (stored) setAccounts(JSON.parse(stored));
      }
    };
    const handleCustomEvent = () => {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) setAccounts(JSON.parse(stored));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('accounts-updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accounts-updated', handleCustomEvent);
    };
  }, []);

  // Trigger custom event after add/edit/delete
  const triggerAccountsUpdated = () => {
    window.dispatchEvent(new Event('accounts-updated'));
  };

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts(prev => {
      const updated = [...prev, newAccount];
      setTimeout(triggerAccountsUpdated, 0);
      return updated;
    });
    return true;
  }, [accounts]);

  const editAccount = useCallback((id: string, update: Partial<Omit<Account, 'id'>>) => {
    setAccounts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...update } : a);
      setTimeout(triggerAccountsUpdated, 0);
      return updated;
    });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => {
      const updated = prev.filter(a => a.id !== id);
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
  };
} 