import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const ExchangeRateCache = sequelize.define('ExchangeRateCache', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fromCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  toCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  rate: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
  },
  fetchedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'exchange_rate_cache',
  paranoid: false,
  timestamps: false,
});

export default ExchangeRateCache;