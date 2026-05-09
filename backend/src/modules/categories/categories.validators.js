import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  icon: Joi.string().max(50).allow(null, ''),
  color: Joi.string().max(20).allow(null, ''),
  type: Joi.string().valid('income', 'expense').required(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100),
  icon: Joi.string().max(50).allow(null, ''),
  color: Joi.string().max(20).allow(null, ''),
}).min(1);