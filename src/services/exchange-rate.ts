
export async function getUsdToThbRate(): Promise<number> {
  try {
    const API_KEY = '0413258644998b6d98d7b6f99bcd344e';
    // ใส่ amount=1 และใช้ api_key แทน access_key
    const API_URL = `https://api.exchangerate.host/convert?from=USD&to=THB&amount=1&api_key=${API_KEY}`;
    const response = await fetch(API_URL);
    console.log('ExchangeRateHost fetch status:', response.status);
    const data = await response.json();
    console.log('ExchangeRateHost response data:', data);
    if (data && data.success === true) {
      // ใช้ data.info.rate หรือ data.result
      if (typeof data.info?.rate === 'number') {
        return data.info.rate;
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
