import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Otp } from '../../database/models/index.js';
import { sendOtpEmail } from '../../common/email.service.js';

function generateNumericOtp() {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return String(num).padStart(6, '0');
}

export async function sendOtp(userId, email, type, pendingData = null) {
  // Invalidate existing OTPs for this email + type
  await Otp.destroy({ where: { email, type, usedAt: null } });

  const otp = generateNumericOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({ userId, email, otpHash, type, expiresAt, pendingData });
  await sendOtpEmail(email, otp, type);

  return { message: `OTP sent to ${email}` };
}

async function verifyOtpRecord(email, otpCode, type) {
  const record = await Otp.findOne({
    where: { email, type, usedAt: null, expiresAt: { [Op.gt]: new Date() } },
    order: [['createdAt', 'DESC']],
  });

  if (!record) {
    const err = new Error('OTP is invalid or has expired');
    err.status = 400; err.code = 'OTP_INVALID';
    throw err;
  }

  const match = await bcrypt.compare(otpCode, record.otpHash);
  if (!match) {
    const err = new Error('Incorrect OTP');
    err.status = 400; err.code = 'OTP_INCORRECT';
    throw err;
  }

  await record.update({ usedAt: new Date() });
  return record;
}

export async function verifyEmailOtp(email, otpCode) {
  const record = await verifyOtpRecord(email, otpCode, 'email_verification');

  // Create the user now using the stored pending data
  const { User, RefreshToken } = await import('../../database/models/index.js');
  const { generateAccessToken, generateRefreshToken } = await import('../../common/utils/jwt.js');

  const { fullName, passwordHash } = record.pendingData;

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    authProvider: 'local',
    isEmailVerified: true,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await RefreshToken.create({ userId: user.id, tokenHash, expiresAt });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      defaultCurrency: user.defaultCurrency,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export async function verifyPasswordResetOtp(userId, otpCode) {
  const { User } = await import('../../database/models/index.js');
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404; err.code = 'USER_NOT_FOUND'; throw err;
  }

  await verifyOtpRecord(user.email, otpCode, 'password_reset');

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
    err.status = 400; err.code = 'RESET_TOKEN_INVALID'; throw err;
  }

  if (payload.purpose !== 'password_reset') {
    const err = new Error('Invalid reset token');
    err.status = 400; err.code = 'RESET_TOKEN_INVALID'; throw err;
  }

  const { User } = await import('../../database/models/index.js');
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.update({ passwordHash: hashedPassword }, { where: { id: payload.userId } });
  return { message: 'Password reset successfully' };
}