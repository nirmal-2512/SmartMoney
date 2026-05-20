import * as otpService from './otp.service.js';
import User from '../../database/models/User.js';

export async function sendOtp(req, res, next) {
  try {
    const { userId, email, type } = req.body;
    const result = await otpService.sendOtp(userId, email, type);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailOtp(req, res, next) {
  try {
    const { userId, otp } = req.body;
    const result = await otpService.verifyEmailOtp(userId, otp);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.json({ message: `If that email exists, an OTP has been sent` });
    }

    await otpService.sendOtp(user.id, email, 'password_reset');
    res.json({
      message: `If that email exists, an OTP has been sent`,
      userId: user.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyResetOtp(req, res, next) {
  try {
    const { userId, otp } = req.body;
    const result = await otpService.verifyPasswordResetOtp(userId, otp);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await otpService.resetPassword(resetToken, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}