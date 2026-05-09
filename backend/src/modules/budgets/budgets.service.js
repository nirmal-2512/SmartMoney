import { Op } from 'sequelize';
import Decimal from 'decimal.js';
import { Budget, Category, Transaction } from '../../database/models/index.js';

export const getAllBudgets = async (userId) => {
  const budgets = await Budget.findAll({
    where: { userId },
    include: [{ model: Category, attributes: ['id', 'name', 'icon', 'color', 'type'] }],
    order: [['createdAt', 'DESC']],
  });
  return budgets;
};

export const getBudgetById = async (userId, budgetId) => {
  const budget = await Budget.findOne({
    where: { id: budgetId, userId },
    include: [{ model: Category, attributes: ['id', 'name', 'icon', 'color', 'type'] }],
  });

  if (!budget) {
    const err = new Error('Budget not found');
    err.status = 404;
    err.code = 'BUDGET_NOT_FOUND';
    throw err;
  }

  return budget;
};

export const createBudget = async (userId, data) => {
  const existing = await Budget.findOne({
    where: {
      userId,
      categoryId: data.categoryId,
      periodStart: { [Op.lte]: data.periodEnd },
      periodEnd: { [Op.gte]: data.periodStart },
    },
  });

  if (existing) {
    const err = new Error('A budget for this category already exists in this period');
    err.status = 409;
    err.code = 'BUDGET_EXISTS';
    throw err;
  }

  const budget = await Budget.create({ ...data, userId });
  return getBudgetById(userId, budget.id);
};

export const updateBudget = async (userId, budgetId, data) => {
  const budget = await Budget.findOne({ where: { id: budgetId, userId } });

  if (!budget) {
    const err = new Error('Budget not found');
    err.status = 404;
    err.code = 'BUDGET_NOT_FOUND';
    throw err;
  }

  await budget.update(data);
  return getBudgetById(userId, budgetId);
};

export const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOne({ where: { id: budgetId, userId } });

  if (!budget) {
    const err = new Error('Budget not found');
    err.status = 404;
    err.code = 'BUDGET_NOT_FOUND';
    throw err;
  }

  await budget.destroy();
  return { message: 'Budget deleted successfully' };
};

export const getBudgetStatus = async (userId, budgetId) => {
  const budget = await getBudgetById(userId, budgetId);

  const transactions = await Transaction.findAll({
    where: {
      userId,
      categoryId: budget.categoryId,
      type: { [Op.in]: ['expense', 'transfer'] },
      date: {
        [Op.gte]: budget.periodStart,
        [Op.lte]: budget.periodEnd,
      },
    },
  });

  let spent = new Decimal(0);
  transactions.forEach((t) => {
    spent = spent.plus(new Decimal(t.amount));
  });

  const budgetAmount = new Decimal(budget.amount);
  const remaining = budgetAmount.minus(spent);
  const percentageUsed = budgetAmount.isZero()
    ? 0
    : spent.dividedBy(budgetAmount).times(100).toDecimalPlaces(2).toNumber();

  return {
    budget,
    spent: spent.toDecimalPlaces(4).toNumber(),
    remaining: remaining.toDecimalPlaces(4).toNumber(),
    percentageUsed,
    isOverrun: spent.greaterThan(budgetAmount),
    transactionCount: transactions.length,
  };
};