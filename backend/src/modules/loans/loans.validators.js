import Joi from 'joi';

export const createLoanSchema = Joi.object({
  personName: Joi.string().max(200).required(),
  type: Joi.string().valid('given', 'taken').required(),
  principalAmount: Joi.number().positive().required(),
  currency: Joi.string().max(10).default('INR'),
  interestRate: Joi.number().min(0).max(100).default(0),
  interestType: Joi.string().valid('simple', 'compound').default('simple'),
  startDate: Joi.string().isoDate().required(),
  dueDate: Joi.string().isoDate().allow(null, '').default(null),
  notes: Joi.string().max(1000).allow(null, '').default(null),
});

export const updateLoanSchema = Joi.object({
  personName: Joi.string().max(200),
  principalAmount: Joi.number().positive(),
  currency: Joi.string().max(10),
  interestRate: Joi.number().min(0).max(100),
  interestType: Joi.string().valid('simple', 'compound'),
  startDate: Joi.string().isoDate(),
  dueDate: Joi.string().isoDate().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  status: Joi.string().valid('active', 'overdue'),
}).min(1);