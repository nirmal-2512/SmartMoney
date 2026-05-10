import Joi from 'joi';

export const confirmRowSchema = Joi.object({
  finalCategoryId: Joi.string().uuid().required(),
});