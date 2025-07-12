
const API_URL = "https://v6.exchangerate-api.com/v6/latest/USD";

// Simple in-memory cache to avoid fetching too often
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // Cache for 1 hour

export async function getUsdToThbRate(): Promise<number> {
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
    // If API fails, return the cached rate if it exists, otherwise throw
    if (cachedRate) {
        return cachedRate.rate;
    }
    throw error;
  }
}
