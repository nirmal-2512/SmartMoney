import bcrypt from 'bcrypt';
import { User } from '../../database/models/index.js';

export const getProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  const { passwordHash, deletedAt, ...safeUser } = user.toJSON();
  return safeUser;
};

export const updateProfile = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  await user.update(data);
  const { passwordHash, deletedAt, ...safeUser } = user.toJSON();
  return safeUser;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user || !user.passwordHash) {
    const err = new Error('User not found or uses OAuth login');
    err.status = 400;
    err.code = 'INVALID_OPERATION';
    throw err;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 401;
    err.code = 'INVALID_PASSWORD';
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash });
  return { message: 'Password changed successfully' };
};

export const deleteAccount = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  await user.destroy();
  return { message: 'Account deleted successfully' };
};