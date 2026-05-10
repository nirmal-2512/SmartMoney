import * as currencyService from './currency.service.js';

export const getSupportedCurrencies = (req, res) => {
  const currencies = currencyService.getSupportedCurrencies();
  res.status(200).json({ currencies });
};

export const getExchangeRate = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({
        error: { code: 'MISSING_PARAMS', message: 'from and to are required' },
      });
    }
    const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
    res.status(200).json({ from: from.toUpperCase(), to: to.toUpperCase(), rate });
  } catch (err) {
    next(err);
  }
};

export const convertAmount = async (req, res, next) => {
  try {
    const { amount, from, to } = req.query;
    if (!amount || !from || !to) {
      return res.status(400).json({
        error: { code: 'MISSING_PARAMS', message: 'amount, from and to are required' },
      });
    }
    const result = await currencyService.convertAmount(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase()
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const refreshRates = async (req, res, next) => {
  try {
    const results = await currencyService.refreshAllRates();
    res.status(200).json({ message: 'Rates refreshed', results });
  } catch (err) {
    next(err);
  }
};