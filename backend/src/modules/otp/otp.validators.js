import Joi from 'joi';

export const sendOtpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  type: Joi.string().valid('email_verification', 'password_reset').required(),
});

export const verifyEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),  // changed from userId to email
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyResetOtpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});