import { Router } from 'express';
import * as otpController from './otp.controller.js';
import validate from '../../common/middlewares/validate.js';
import {
  sendOtpSchema,
  verifyEmailOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from './otp.validators.js';

const router = Router();

// Send OTP (email_verification or password_reset)
router.post('/send-otp', validate(sendOtpSchema), otpController.sendOtp);

// Verify email after registration
router.post('/verify-otp', validate(verifyEmailOtpSchema), otpController.verifyEmailOtp);

// Forgot password — send reset OTP
router.post('/forgot-password', validate(forgotPasswordSchema), otpController.forgotPassword);

// Verify the reset OTP — returns a short-lived resetToken
router.post('/verify-reset-otp', validate(verifyResetOtpSchema), otpController.verifyResetOtp);

// Use resetToken + new password to change password
router.post('/reset-password', validate(resetPasswordSchema), otpController.resetPassword);

export default router;