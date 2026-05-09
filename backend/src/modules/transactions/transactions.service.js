import { Op } from 'sequelize';
import Decimal from 'decimal.js';
import { Transaction, Category } from '../../database/models/index.js';

const applyFilters = (query) => {
  const where = {};

  if (query.type) where.type = query.type;
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.search) where.title = { [Op.iLike]: `%${query.search}%` };

  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date[Op.gte] = query.startDate;
    if (query.endDate) where.date[Op.lte] = query.endDate;
  }

  return where;
};

export const getAllTransactions = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'date';
  const sortOrder = query.sortOrder || 'DESC';

  const where = { userId, ...applyFilters(query) };

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'icon', 'color', 'type'] }],
    order: [[sortBy, sortOrder]],
    limit,
    offset,
  });

  return {
    transactions: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    where: { id: transactionId, userId },
    include: [{ model: Category, as: 'Category', attributes: ['id', 'name', 'icon', 'color', 'type'] }],
  });

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    err.code = 'TRANSACTION_NOT_FOUND';
    throw err;
  }

  return transaction;
};

export const createTransaction = async (userId, data) => {
  // Use Decimal.js for precision
  const amount = new Decimal(data.amount).toDecimalPlaces(4).toNumber();

  const transaction = await Transaction.create({
    ...data,
    amount,
    userId,
    amountBase: amount,
    baseCurrency: data.currency || 'USD',
    exchangeRate: 1,
  });

  return getTransactionById(userId, transaction.id);
};

export const updateTransaction = async (userId, transactionId, data) => {
  const transaction = await Transaction.findOne({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    err.code = 'TRANSACTION_NOT_FOUND';
    throw err;
  }

  if (data.amount) {
    data.amount = new Decimal(data.amount).toDecimalPlaces(4).toNumber();
  }

  await transaction.update(data);
  return getTransactionById(userId, transactionId);
};

export const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    err.code = 'TRANSACTION_NOT_FOUND';
    throw err;
  }

  await transaction.destroy();
  return { message: 'Transaction deleted successfully' };
};

export const getTransactionSummary = async (userId, { startDate, endDate }) => {
  const where = { userId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const transactions = await Transaction.findAll({ where });

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

  const balance = totalIncome.minus(totalExpense);

  return {
    totalIncome: totalIncome.toDecimalPlaces(4).toNumber(),
    totalExpense: totalExpense.toDecimalPlaces(4).toNumber(),
    balance: balance.toDecimalPlaces(4).toNumber(),
    transactionCount: transactions.length,
  };
};