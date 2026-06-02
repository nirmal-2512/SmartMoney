import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { User, RefreshToken } from '../../database/models/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../common/utils/jwt.js';

import { sendOtp } from '../otp/otp.service.js';

const formatUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  defaultCurrency: user.defaultCurrency,
  authProvider: user.authProvider,
  isEmailVerified: user.isEmailVerified,
});

const saveRefreshToken = async (userId, refreshToken) => {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await RefreshToken.create({ userId, tokenHash, expiresAt });
};

// At the bottom of the register function, before the return:
export const register = async ({ fullName, email, password }) => {
  // ... existing code ...

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  // Add this — send OTP automatically on register
  await sendOtp(user.id, email, 'email_verification');

  return { accessToken, refreshToken, user: formatUser(user) };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken, user: formatUser(user) };
};

export const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const stored = await RefreshToken.findOne({
    where: {
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!stored) {
    const err = new Error('Refresh token revoked or expired');
    err.status = 401;
    err.code = 'TOKEN_REVOKED';
    throw err;
  }

  const user = await User.findByPk(payload.sub);
  if (!user) {
    const err = new Error('User not found');
    err.status = 401;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  // Revoke old token
  await stored.update({ revokedAt: new Date() });

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: formatUser(user) };
};

export const logout = async (userId) => {
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { userId, revokedAt: null } }
  );
  return { message: 'Logged out successfully' };
};

export const googleCallback = async ({ googleId, email, fullName, avatarUrl }) => {
  let user = await User.findOne({ where: { googleId } });

  if (!user) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      user = await existing.update({ googleId, avatarUrl });
    } else {
      user = await User.create({
        googleId,
        email,
        fullName,
        avatarUrl,
        authProvider: 'google',
        isEmailVerified: true,
      });
    }
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken, user: formatUser(user) };
};

