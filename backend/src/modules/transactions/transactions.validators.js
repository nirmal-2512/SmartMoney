import Joi from 'joi';

export const createTransactionSchema = Joi.object({
  categoryId: Joi.string().uuid().allow(null),
  title: Joi.string().min(1).max(255).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  type: Joi.string().valid('income', 'expense', 'refund', 'transfer').required(),
  date: Joi.string().isoDate().required(),
  notes: Joi.string().max(1000).allow(null, ''),
});

export const updateTransactionSchema = Joi.object({
  categoryId: Joi.string().uuid().allow(null),
  title: Joi.string().min(1).max(255),
  amount: Joi.number().positive(),
  currency: Joi.string().length(3),
  type: Joi.string().valid('income', 'expense', 'refund', 'transfer'),
  date: Joi.string().isoDate(),
  notes: Joi.string().max(1000).allow(null, ''),
}).min(1);

export const listTransactionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('income', 'expense', 'refund', 'transfer'),
  categoryId: Joi.string().uuid(),
  startDate: Joi.string().isoDate(),
  endDate: Joi.string().isoDate(),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('date', 'amount', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
});