import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'refresh_tokens',
  paranoid: false,
});

// Associations
RefreshToken.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });

export default RefreshToken;