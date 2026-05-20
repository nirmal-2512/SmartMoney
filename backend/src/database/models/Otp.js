import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const Otp = sequelize.define(
  'Otp',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('email_verification', 'password_reset'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'otps',
    timestamps: true,
    updatedAt: false,
  }
);

Otp.belongsTo(User, { foreignKey: 'userId' });

export default Otp;