import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';
import Category from './Category.js';

const Budget = sequelize.define('Budget', {
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
  periodType: {
    type: DataTypes.ENUM('monthly', 'weekly', 'custom'),
    defaultValue: 'monthly',
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  rollover: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notifiedAtThreshold: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'budgets',
});

Budget.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
User.hasMany(Budget, { foreignKey: 'userId' });

export default Budget;