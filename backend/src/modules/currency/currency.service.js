import { Op } from 'sequelize';
import { ExchangeRateCache } from '../../database/models/index.js';

const CACHE_TTL_HOURS = 24;

export const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;

  const cacheExpiry = new Date();
  cacheExpiry.setHours(cacheExpiry.getHours() - CACHE_TTL_HOURS);

  const cached = await ExchangeRateCache.findOne({
    where: {
      fromCurrency,
      toCurrency,
      fetchedAt: { [Op.gte]: cacheExpiry },
    },
  });

  if (cached) return parseFloat(cached.rate);

  const rate = await fetchFreshRate(fromCurrency, toCurrency);

  await ExchangeRateCache.upsert({
    fromCurrency,
    toCurrency,
    rate,
    fetchedAt: new Date(),
  });

  return rate;
};

const fetchFreshRate = async (fromCurrency, toCurrency) => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.result !== 'success') {
    const err = new Error(`Failed to fetch exchange rate: ${data['error-type']}`);
    err.status = 503;
    err.code = 'EXCHANGE_RATE_FETCH_FAILED';
    throw err;
  }

  return data.conversion_rate;
};

export const convertAmount = async (amount, fromCurrency, toCurrency) => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return {
    originalAmount: amount,
    convertedAmount: parseFloat((amount * rate).toFixed(4)),
    exchangeRate: rate,
    fromCurrency,
    toCurrency,
  };
};

export const getSupportedCurrencies = () => {
  return [
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'SAR', name: 'Saudi Riyal' },
  ];
};

export const refreshAllRates = async () => {
  const baseCurrency = process.env.BASE_CURRENCY || 'INR';
  const currencies = getSupportedCurrencies().map((c) => c.code);

  const results = [];
  for (const currency of currencies) {
    if (currency === baseCurrency) continue;
    try {
      const rate = await fetchFreshRate(baseCurrency, currency);
      await ExchangeRateCache.upsert({
        fromCurrency: baseCurrency,
        toCurrency: currency,
        rate,
        fetchedAt: new Date(),
      });
      results.push({ currency, rate, status: 'success' });
    } catch {
      results.push({ currency, status: 'failed' });
    }
  }
  return results;
};