
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export function useExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRate = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (typeof data.rate === 'number') {
        setRate(data.rate);
        setError(null);
      } else {
        throw new Error('Invalid rate');
      }
    } catch (err: any) {
      console.error('Failed to fetch exchange rate:', err);
      setError('ไม่สามารถโหลดอัตราแลกเปลี่ยนได้');
      toast({
        variant: 'destructive',
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดอัตราแลกเปลี่ยนล่าสุดได้ จะใช้ค่าเริ่มต้นแทน',
      });
      if (rate === null) {
        setRate(36.50);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, rate]);

  useEffect(() => {
    fetchRate(); // ดึงครั้งแรกตอน mount
    // ไม่ต้อง setInterval แล้ว เพราะฝั่ง server cache อยู่แล้ว
  }, [fetchRate]);

  return { rate, isLoading, error, refetch: fetchRate };
}
