import { generateContent } from './gemini.js';
import { Transaction, Category, Budget, AiReport } from '../../database/models/index.js';
import { Op } from 'sequelize';

export const generateMonthlyReport = async (userId, month) => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

  // Check if report already exists
  const existing = await AiReport.findOne({ where: { userId, month: startDate } });
  if (existing) return existing;

  const transactions = await Transaction.findAll({
    where: { userId, date: { [Op.gte]: startDate, [Op.lte]: endDate } },
    include: [{ model: Category, as: 'Category', attributes: ['name'] }],
  });

  if (transactions.length === 0) {
    const err = new Error('No transactions found for this month');
    err.status = 404;
    err.code = 'NO_DATA';
    throw err;
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  transactions.forEach((t) => {
    const catName = t.Category ? t.Category.name : 'Uncategorised';
    if (t.type === 'income') {
      totalIncome += parseFloat(t.amount);
    } else if (t.type === 'expense' || t.type === 'transfer') {
      totalExpense += parseFloat(t.amount);
      categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(t.amount);
    }
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => `- ${name}: ${total.toFixed(2)}`)
    .join('\n');

  const prompt = `
You are a personal finance advisor. Write a friendly, insightful monthly financial report narrative for a user based on their data.

Month: ${month}
Total Income: ${totalIncome.toFixed(2)}
Total Expense: ${totalExpense.toFixed(2)}
Net Balance: ${(totalIncome - totalExpense).toFixed(2)}
Total Transactions: ${transactions.length}

Spending by Category:
${categoryBreakdown}

Write a 3-4 paragraph narrative that:
1. Summarises the month overall
2. Highlights notable spending patterns
3. Points out areas of concern or improvement
4. Ends with one actionable tip for next month

Keep it friendly, specific and under 300 words.
  `.trim();

  const narrative = await generateContent(prompt);

  const report = await AiReport.create({
    userId,
    month: startDate,
    narrative: narrative.trim(),
    modelUsed: 'gemini-2.0-flash',
    generatedAt: new Date(),
  });

  return report;
};

export const getMonthlyReport = async (userId, month) => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];

  const report = await AiReport.findOne({ where: { userId, month: startDate } });

  if (!report) {
    const err = new Error('No report found for this month. Generate one first.');
    err.status = 404;
    err.code = 'REPORT_NOT_FOUND';
    throw err;
  }

  return report;
};