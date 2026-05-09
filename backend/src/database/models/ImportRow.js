import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Import from './Import.js';
import Category from './Category.js';

const ImportRow = sequelize.define('ImportRow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  importId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
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
  type: {
    type: DataTypes.ENUM('income', 'expense', 'refund'),
    allowNull: false,
  },
  suggestedCategoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  finalCategoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  confidence: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: true,
  },
  needsReview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  duplicateOf: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'skipped'),
    defaultValue: 'pending',
  },
  rawData: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  tableName: 'import_rows',
  paranoid: false,
  updatedAt: false,
});

ImportRow.belongsTo(Import, { foreignKey: 'importId', onDelete: 'CASCADE' });
Import.hasMany(ImportRow, { foreignKey: 'importId' });
ImportRow.belongsTo(Category, { as: 'suggestedCategory', foreignKey: 'suggestedCategoryId' });
ImportRow.belongsTo(Category, { as: 'finalCategory', foreignKey: 'finalCategoryId' });

export default ImportRow;