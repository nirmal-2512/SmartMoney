import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  personName: { type: DataTypes.STRING(200), allowNull: false },
  type: { type: DataTypes.ENUM('given', 'taken'), allowNull: false },
  principalAmount: { type: DataTypes.DECIMAL(15, 4), allowNull: false },
  currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'INR' },
  interestRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  interestType: { type: DataTypes.ENUM('simple', 'compound'), allowNull: false, defaultValue: 'simple' },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
  notes: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  status: { type: DataTypes.ENUM('active', 'settled', 'overdue'), allowNull: false, defaultValue: 'active' },
  settledAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
}, { tableName: 'loans', timestamps: true, paranoid: true });

export default Loan;