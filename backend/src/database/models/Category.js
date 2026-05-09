import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#6366f1',
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'categories',
});

Category.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Category, { foreignKey: 'userId' });

export default Category;