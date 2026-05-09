import { Op, fn, col, literal } from 'sequelize';
import Decimal from 'decimal.js';
import { Transaction, Category, Budget } from '../../database/models/index.js';

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const calculateTotals = (transactions) => {
  let totalIncome = new Decimal(0);
  let totalExpense = new Decimal(0);

  transactions.forEach((t) => {
    if (t.type === 'income') {
      totalIncome = totalIncome.plus(new Decimal(t.amount));
    } else if (t.type === 'expense' || t.type === 'transfer') {
      totalExpense = totalExpense.plus(new Decimal(t.amount));
    } else if (t.type === 'refund') {
      totalExpense = totalExpense.minus(new Decimal(t.amount));
    }
  });

  return {
    totalIncome: totalIncome.toDecimalPlaces(4).toNumber(),
    totalExpense: totalExpense.toDecimalPlaces(4).toNumber(),
    balance: totalIncome.minus(totalExpense).toDecimalPlaces(4).toNumber(),
  };
};

export const getDashboard = async (userId) => {
  const { startDate, endDate } = getCurrentMonthRange();

  // Current month transactions
  const transactions = await Transaction.findAll({
    where: {
      userId,
      date: { [Op.gte]: startDate, [Op.lte]: endDate },
    },
    include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'icon', 'color'] }],
    order: [['date', 'DESC']],
  });

  const totals = calculateTotals(transactions);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Category breakdown for this month
  const categoryMap = {};
  transactions
    .filter((t) => t.type === 'expense' || t.type === 'transfer')
    .forEach((t) => {
      const catId = t.categoryId || 'uncategorised';
      const catName = t.Category ? t.Category.name : 'Uncategorised';
      const catIcon = t.Category ? t.Category.icon : null;
      const catColor = t.Category ? t.Category.color : '#94a3b8';

      if (!categoryMap[catId]) {
        categoryMap[catId] = { categoryId: catId, name: catName, icon: catIcon, color: catColor, total: new Decimal(0) };
      }
      categoryMap[catId].total = categoryMap[catId].total.plus(new Decimal(t.amount));
    });

  const categoryBreakdown = Object.values(categoryMap)
    .map((c) => ({ ...c, total: c.total.toDecimalPlaces(4).toNumber() }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Active budgets status
  const budgets = await Budget.findAll({
    where: {
      userId,
      periodStart: { [Op.lte]: endDate },
      periodEnd: { [Op.gte]: startDate },
    },
    include: [{ model: Category, attributes: ['id', 'name', 'icon', 'color'] }],
  });

  const budgetStatus = budgets.map((budget) => {
    const spent = transactions
      .filter(
        (t) =>
          t.categoryId === budget.categoryId &&
          (t.type === 'expense' || t.type === 'transfer')
      )
      .reduce((sum, t) => sum.plus(new Decimal(t.amount)), new Decimal(0));

    const budgetAmount = new Decimal(budget.amount);
    const percentageUsed = budgetAmount.isZero()
      ? 0
      : spent.dividedBy(budgetAmount).times(100).toDecimalPlaces(2).toNumber();

    return {
      id: budget.id,
      category: budget.Category,
      amount: budget.amount,
      spent: spent.toDecimalPlaces(4).toNumber(),
      remaining: budgetAmount.minus(spent).toDecimalPlaces(4).toNumber(),
      percentageUsed,
      isOverrun: spent.greaterThan(budgetAmount),
    };
  });

  return {
    period: { startDate, endDate },
    totals,
    recentTransactions,
    categoryBreakdown,
    budgetStatus,
  };
};

export const getMonthlyReport = async (userId, month) => {
  // month format: YYYY-MM
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

  // Previous month
  const prevStart = new Date(year, monthNum - 2, 1).toISOString().split('T')[0];
  const prevEnd = new Date(year, monthNum - 1, 0).toISOString().split('T')[0];

  const [currentTransactions, prevTransactions] = await Promise.all([
    Transaction.findAll({
      where: { userId, date: { [Op.gte]: startDate, [Op.lte]: endDate } },
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'icon', 'color'] }],
      order: [['date', 'ASC']],
    }),
    Transaction.findAll({
      where: { userId, date: { [Op.gte]: prevStart, [Op.lte]: prevEnd } },
    }),
  ]);

  const current = calculateTotals(currentTransactions);
  const previous = calculateTotals(prevTransactions);

  // Category breakdown
  const categoryMap = {};
  currentTransactions
    .filter((t) => t.type === 'expense' || t.type === 'transfer')
    .forEach((t) => {
      const catId = t.categoryId || 'uncategorised';
      const catName = t.Category ? t.Category.name : 'Uncategorised';
      const catColor = t.Category ? t.Category.color : '#94a3b8';
      const catIcon = t.Category ? t.Category.icon : null;

      if (!categoryMap[catId]) {
        categoryMap[catId] = { categoryId: catId, name: catName, color: catColor, icon: catIcon, total: new Decimal(0), count: 0 };
      }
      categoryMap[catId].total = categoryMap[catId].total.plus(new Decimal(t.amount));
      categoryMap[catId].count++;
    });

  const totalExpense = new Decimal(current.totalExpense);
  const categoryBreakdown = Object.values(categoryMap)
    .map((c) => ({
      ...c,
      total: c.total.toDecimalPlaces(4).toNumber(),
      percentage: totalExpense.isZero()
        ? 0
        : c.total.dividedBy(totalExpense).times(100).toDecimalPlaces(2).toNumber(),
    }))
    .sort((a, b) => b.total - a.total);

  // Day by day spending chart data
  const dailyMap = {};
  currentTransactions.forEach((t) => {
    const day = t.date;
    if (!dailyMap[day]) dailyMap[day] = { date: day, income: new Decimal(0), expense: new Decimal(0) };
    if (t.type === 'income') dailyMap[day].income = dailyMap[day].income.plus(new Decimal(t.amount));
    if (t.type === 'expense' || t.type === 'transfer') dailyMap[day].expense = dailyMap[day].expense.plus(new Decimal(t.amount));
  });

  const dailyBreakdown = Object.values(dailyMap)
    .map((d) => ({
      date: d.date,
      income: d.income.toDecimalPlaces(4).toNumber(),
      expense: d.expense.toDecimalPlaces(4).toNumber(),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    period: { month, startDate, endDate },
    current,
    previous,
    comparison: {
      incomeChange: new Decimal(current.totalIncome).minus(previous.totalIncome).toNumber(),
      expenseChange: new Decimal(current.totalExpense).minus(previous.totalExpense).toNumber(),
      balanceChange: new Decimal(current.balance).minus(previous.balance).toNumber(),
    },
    categoryBreakdown,
    dailyBreakdown,
    transactions: currentTransactions,
  };
};

export const getCategoryBreakdown = async (userId, { startDate, endDate }) => {
  const where = { userId, type: { [Op.in]: ['expense', 'transfer'] } };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const transactions = await Transaction.findAll({
    where,
    include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'icon', 'color'] }],
  });

  const categoryMap = {};
  let grandTotal = new Decimal(0);

  transactions.forEach((t) => {
    const catId = t.categoryId || 'uncategorised';
    const catName = t.Category ? t.Category.name : 'Uncategorised';
    const catColor = t.Category ? t.Category.color : '#94a3b8';
    const catIcon = t.Category ? t.Category.icon : null;

    if (!categoryMap[catId]) {
      categoryMap[catId] = { categoryId: catId, name: catName, color: catColor, icon: catIcon, total: new Decimal(0), count: 0 };
    }
    categoryMap[catId].total = categoryMap[catId].total.plus(new Decimal(t.amount));
    categoryMap[catId].count++;
    grandTotal = grandTotal.plus(new Decimal(t.amount));
  });

  const breakdown = Object.values(categoryMap)
    .map((c) => ({
      ...c,
      total: c.total.toDecimalPlaces(4).toNumber(),
      percentage: grandTotal.isZero()
        ? 0
        : c.total.dividedBy(grandTotal).times(100).toDecimalPlaces(2).toNumber(),
    }))
    .sort((a, b) => b.total - a.total);

  return {
    breakdown,
    grandTotal: grandTotal.toDecimalPlaces(4).toNumber(),
    period: { startDate, endDate },
  };
};