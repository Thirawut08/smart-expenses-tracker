"use client";

import { useState, useEffect } from "react";

export function useExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setRate(32.5);
    setIsLoading(false);
  }, []);

  return { rate, isLoading, error: null, refetch: () => {} };
}
