import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { generateJSON } from '../ai/gemini.js';

export const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

export const parsePDFWithAI = async (text) => {
  if (!text || text.trim().length < 50) {
    const err = new Error('PDF appears to be scanned or image-based. Text extraction failed.');
    err.status = 422;
    err.code = 'PDF_UNREADABLE';
    throw err;
  }

  const prompt = `
Extract all financial transactions from the following bank statement text.

Return ONLY a JSON array. Each object must have exactly these fields:
- date: string in YYYY-MM-DD format
- description: string (merchant or transaction name, cleaned up)
- amount: number (always positive)
- type: string — "income" if money came in, "expense" if money went out, "refund" if a reversal
- currency: string (3-letter ISO code, default to "INR" if not clear)

Rules:
- Skip non-transaction lines (headers, footers, account summaries)
- Clean up description — remove extra spaces, codes, and reference numbers
- If you cannot determine type, default to "expense"
- Return empty array [] if no transactions found

Bank statement text:
${text.slice(0, 8000)}

Return ONLY the JSON array, no explanation, no markdown.
`;

  const transactions = await generateJSON(prompt);

  if (!Array.isArray(transactions)) {
    const err = new Error('AI returned invalid transaction data');
    err.status = 500;
    err.code = 'AI_PARSE_ERROR';
    throw err;
  }

  return transactions.map((t) => ({
    date: t.date,
    description: t.description,
    amount: Math.abs(parseFloat(t.amount)),
    currency: t.currency || 'INR',
    type: t.type || 'expense',
    rawData: t,
  }));
};