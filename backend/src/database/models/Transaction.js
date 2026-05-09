import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';
import Category from './Category.js';
import { Decimal } from 'decimal.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  amountBase: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  baseCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(15, 6),
    defaultValue: 1,
  },
  rateSource: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense', 'refund', 'transfer'),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'transactions',
});

Transaction.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(Category, { as: 'Category', foreignKey: 'categoryId', onDelete: 'SET NULL' });
User.hasMany(Transaction, { foreignKey: 'userId' });
Category.hasMany(Transaction, { foreignKey: 'categoryId' });

export default Transaction;