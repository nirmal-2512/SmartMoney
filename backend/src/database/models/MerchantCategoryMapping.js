import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';
import Category from './Category.js';

const MerchantCategoryMapping = sequelize.define('MerchantCategoryMapping', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  merchantNamePattern: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  source: {
    type: DataTypes.ENUM('ai', 'user_override'),
    defaultValue: 'ai',
  },
}, {
  tableName: 'merchant_category_mappings',
  paranoid: false,
  updatedAt: false,
});

MerchantCategoryMapping.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
MerchantCategoryMapping.belongsTo(Category, { foreignKey: 'categoryId' });

export default MerchantCategoryMapping;