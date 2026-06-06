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

router.post('/send-otp', validate(sendOtpSchema), otpController.sendOtp);
router.post('/verify-otp', validate(verifyEmailOtpSchema), otpController.verifyEmailOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), otpController.forgotPassword);
router.post('/verify-reset-otp', validate(verifyResetOtpSchema), otpController.verifyResetOtp);
router.post('/reset-password', validate(resetPasswordSchema), otpController.resetPassword);

export default router;