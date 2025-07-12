
export async function getUsdToThbRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate.host/convert?from=USD&to=THB');
    console.log('ExchangeRateHost fetch status:', response.status);
    const data = await response.json();
    console.log('ExchangeRateHost response data:', data);
    if (data && data.success === true && data.info && typeof data.info.rate === 'number') {
      return data.info.rate;
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
