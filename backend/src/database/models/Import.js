import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const Import = sequelize.define('Import', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.ENUM('csv', 'pdf'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('processing', 'staged', 'confirmed', 'failed'),
    defaultValue: 'processing',
  },
  totalRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  confirmedRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  skippedRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'imports',
  paranoid: false,
});

Import.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Import, { foreignKey: 'userId' });

export default Import;