import { parse } from 'csv-parse/sync';

export const parseCSV = (buffer) => {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
};

export const normaliseCSVRow = (row) => {
  // Handle common bank CSV column name variations
  const date =
    row.date || row.Date || row.DATE ||
    row.transaction_date || row.TransactionDate || null;

  const description =
    row.description || row.Description || row.DESCRIPTION ||
    row.merchant || row.Merchant || row.narration || row.Narration || null;

  const amount =
    row.amount || row.Amount || row.AMOUNT ||
    row.debit || row.Debit || row.credit || row.Credit || null;

  const type =
    row.type || row.Type || row.TYPE ||
    row.transaction_type || row.TransactionType || null;

  if (!date || !description || !amount) return null;

  const parsedAmount = Math.abs(parseFloat(amount.toString().replace(/[^0-9.-]/g, '')));
  if (isNaN(parsedAmount)) return null;

  // Determine type from amount sign or type column
  let transactionType = 'expense';
  if (type) {
    const t = type.toLowerCase();
    if (t.includes('credit') || t.includes('income')) transactionType = 'income';
    else if (t.includes('debit') || t.includes('expense')) transactionType = 'expense';
    else if (t.includes('refund')) transactionType = 'refund';
  } else if (parseFloat(amount) > 0 && (row.credit || row.Credit)) {
    transactionType = 'income';
  }

  return {
    date: new Date(date).toISOString().split('T')[0],
    description: description.trim(),
    amount: parsedAmount,
    currency: row.currency || row.Currency || process.env.BASE_CURRENCY || 'INR',
    type: transactionType,
    rawData: row,
  };
};