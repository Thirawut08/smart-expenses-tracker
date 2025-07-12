
const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

// Simple in-memory cache to avoid fetching too often
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 1; // Cache for 1 minute

export async function getUsdToThbRate(): Promise<number> {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn("Exchange Rate API key is not set. Using fallback rate.");
    return 36.50;
  }

  const now = Date.now();
  
  // Check if a valid cache exists
  if (cachedRate && now - cachedRate.timestamp < CACHE_DURATION) {
    return cachedRate.rate;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (data.result === 'success' && data.conversion_rates && data.conversion_rates.THB) {
      const rate = data.conversion_rates.THB;
      // Update cache
      cachedRate = { rate, timestamp: now };
      return rate;
    } else {
      throw new Error('Invalid data format from API');
    }
  } catch (error) {
    console.error("Could not fetch real-time exchange rate:", error);
    // If API fails, return the cached rate if it exists, otherwise use fallback
    if (cachedRate) {
        return cachedRate.rate;
    }
    // Fallback to a default rate if API fails on first load
    return 36.50;
  }
}
