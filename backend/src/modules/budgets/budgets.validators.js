import Joi from 'joi';

export const createBudgetSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  periodType: Joi.string().valid('monthly', 'weekly', 'custom').default('monthly'),
  periodStart: Joi.string().isoDate().required(),
  periodEnd: Joi.string().isoDate().required(),
  rollover: Joi.boolean().default(false),
});

export const updateBudgetSchema = Joi.object({
  amount: Joi.number().positive(),
  currency: Joi.string().length(3),
  periodStart: Joi.string().isoDate(),
  periodEnd: Joi.string().isoDate(),
  rollover: Joi.boolean(),
}).min(1);