import { NextResponse } from 'next/server';
import { getUsdToThbRate } from '@/services/exchange-rate';

let cachedRate: number | null = null;
let lastFetched = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 นาที

export async function GET() {
  const now = Date.now();
  if (cachedRate !== null && now - lastFetched < CACHE_DURATION) {
    return NextResponse.json({ rate: cachedRate, cached: true });
  }
  const rate = await getUsdToThbRate();
  cachedRate = rate;
  lastFetched = now;
  return NextResponse.json({ rate, cached: false });
} 