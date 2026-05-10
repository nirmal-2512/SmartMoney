import { generateContent } from './gemini.js';
import { Transaction, Category, Budget } from '../../database/models/index.js';
import { Op } from 'sequelize';

const buildFinancialContext = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [transactions, budgets] = await Promise.all([
    Transaction.findAll({
      where: {
        userId,
        date: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth },
      },
      include: [{ model: Category, as: 'Category', attributes: ['name'] }],
      order: [['date', 'DESC']],
      limit: 50,
    }),
    Budget.findAll({
      where: { userId },
      include: [{ model: Category, attributes: ['name'] }],
    }),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += parseFloat(t.amount);
    else if (t.type === 'expense') totalExpense += parseFloat(t.amount);
  });

  const transactionSummary = transactions
    .slice(0, 20)
    .map((t) => `${t.date}: ${t.title} - ${t.type} - ${t.currency} ${t.amount} (${t.Category ? t.Category.name : 'Uncategorised'})`)
    .join('\n');

  const budgetSummary = budgets
    .map((b) => `${b.Category ? b.Category.name : 'Unknown'}: budget ${b.currency} ${b.amount} (${b.periodType})`)
    .join('\n');

  return `
Current Month Financial Summary:
- Total Income: ${totalIncome.toFixed(2)}
- Total Expense: ${totalExpense.toFixed(2)}
- Balance: ${(totalIncome - totalExpense).toFixed(2)}

Recent Transactions (last 20):
${transactionSummary || 'No transactions this month'}

Active Budgets:
${budgetSummary || 'No budgets set'}
  `.trim();
};

export const chat = async (userId, message, conversationHistory = []) => {
  const financialContext = await buildFinancialContext(userId);

  const systemPrompt = `
You are SmartMoney AI, a personal finance advisor. You help users understand their spending, manage budgets, and make better financial decisions.

Here is the user's current financial data:
${financialContext}

Guidelines:
- Be concise, helpful and friendly
- Give specific advice based on the user's actual data
- If asked about spending, refer to their actual transactions
- Suggest actionable improvements
- Keep responses under 200 words unless a detailed explanation is needed
- Do not make up financial data that is not in the context above
  `.trim();

  const historyText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\nConversation History:\n${historyText}\n\nUser: ${message}\n\nAssistant:`;

  const response = await generateContent(fullPrompt);
  return response.trim();
};