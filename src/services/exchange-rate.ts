
export async function getUsdToThbRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate.host/convert?from=USD&to=THB');
    console.log('ExchangeRateHost fetch status:', response.status);
    const data = await response.json();
    console.log('ExchangeRateHost response data:', data);
    if (data && data.info && data.info.rate) {
      return data.info.rate;
    }
    throw new Error('Invalid data format');
  } catch (error) {
    console.error('Could not fetch real-time exchange rate:', error);
    return 36.50; // fallback
  }
}
