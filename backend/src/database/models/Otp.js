import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Otp = sequelize.define('Otp', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: true },  // nullable now — no user yet on register
  email: { type: DataTypes.STRING, allowNull: false },
  otpHash: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('email_verification', 'password_reset'), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  usedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  pendingData: { type: DataTypes.JSONB, allowNull: true, defaultValue: null }, // stores registration data
}, { tableName: 'otps', timestamps: true, updatedAt: false });

export default Otp;