
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsdToThbRate } from '@/services/exchange-rate';
import { useToast } from './use-toast';

export function useExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRate = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedRate = await getUsdToThbRate();
      setRate(fetchedRate);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch exchange rate:", err);
      setError('ไม่สามารถโหลดอัตราแลกเปลี่ยนได้');
      toast({
        variant: 'destructive',
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดอัตราแลกเปลี่ยนล่าสุดได้ จะใช้ค่าเริ่มต้นแทน',
      });
      // Fallback to a default rate if API fails
      setRate(36.50); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRate(); // ดึงครั้งแรกตอน mount
    const interval = setInterval(fetchRate, 60 * 1000); // ดึงใหม่ทุก 1 นาที
    return () => clearInterval(interval); // ล้าง interval ตอน unmount
  }, [fetchRate]);

  return { rate, isLoading, error, refetch: fetchRate };
}
