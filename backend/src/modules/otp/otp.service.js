import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Otp from '../../database/models/Otp.js';
import User from '../../database/models/User.js';
import { sendOtpEmail } from '../../common/email.service.js';

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function generateNumericOtp() {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return String(num).padStart(OTP_LENGTH, '0');
}

async function invalidateExistingOtps(userId, type) {
  await Otp.destroy({ where: { userId, type, usedAt: null } });
}

export async function sendOtp(userId, email, type) {
  await invalidateExistingOtps(userId, type);

  const otp = generateNumericOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({ userId, email, otpHash, type, expiresAt });
  await sendOtpEmail(email, otp, type);

  return { message: `OTP sent to ${email}` };
}

export async function verifyOtp(userId, otpCode, type) {
  const record = await Otp.findOne({
    where: {
      userId,
      type,
      usedAt: null,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!record) {
    const err = new Error('OTP is invalid or has expired');
    err.status = 400;
    err.code = 'OTP_INVALID';
    throw err;
  }

  const match = await bcrypt.compare(otpCode, record.otpHash);
  if (!match) {
    const err = new Error('Incorrect OTP');
    err.status = 400;
    err.code = 'OTP_INCORRECT';
    throw err;
  }

  await record.update({ usedAt: new Date() });
  return record;
}

export async function verifyEmailOtp(userId, otpCode) {
  await verifyOtp(userId, otpCode, 'email_verification');

  await User.update({ isEmailVerified: true }, { where: { id: userId } });

  return { message: 'Email verified successfully' };
}

export async function verifyPasswordResetOtp(userId, otpCode) {
  await verifyOtp(userId, otpCode, 'password_reset');

  const resetToken = jwt.sign(
    { userId, purpose: 'password_reset' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  return { resetToken };
}

export async function resetPassword(resetToken, newPassword) {
  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
  } catch {
    const err = new Error('Reset token is invalid or expired');
    err.status = 400;
    err.code = 'RESET_TOKEN_INVALID';
    throw err;
  }

  if (payload.purpose !== 'password_reset') {
    const err = new Error('Invalid reset token');
    err.status = 400;
    err.code = 'RESET_TOKEN_INVALID';
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.update(
    { passwordHash: hashedPassword },
    { where: { id: payload.userId } }
  );

  return { message: 'Password reset successfully' };
}