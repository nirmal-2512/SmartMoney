import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';
import Category from './Category.js';

const CategoryBaseline = sequelize.define('CategoryBaseline', {
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
  month: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  mean: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  stdDev: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  sampleCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  computedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'category_baselines',
  paranoid: false,
  timestamps: false,
});

CategoryBaseline.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
CategoryBaseline.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' });

export default CategoryBaseline;