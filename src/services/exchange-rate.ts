
export async function getUsdToThbRate(): Promise<number> {
  try {
    const API_KEY = '0413258644998b6d98d7b6f99bcd344e';
    // ใช้ access_key แทน api_key และรองรับ data.info.quote
    const API_URL = `https://api.exchangerate.host/convert?from=USD&to=THB&amount=1&access_key=${API_KEY}`;
    const response = await fetch(API_URL);
    console.log('ExchangeRateHost fetch status:', response.status);
    const data = await response.json();
    console.log('ExchangeRateHost response data:', data);
    if (data && data.success === true) {
      // ใช้ data.info.quote หรือ data.result
      if (typeof data.info?.quote === 'number') {
        return data.info.quote;
      }
      if (typeof data.result === 'number') {
        return data.result;
      }
    }
    if (data && data.success === false) {
      console.error('ExchangeRateHost API error:', data.error);
    }
    throw new Error('Invalid data format');
  } catch (error) {
    console.error('Could not fetch real-time exchange rate:', error);
    return 36.50; // fallback
  }
}
