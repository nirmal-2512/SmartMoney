import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  defaultCurrency: Joi.string().length(3),
  avatarUrl: Joi.string().uri().allow(null, ''),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});