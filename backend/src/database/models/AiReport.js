import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const AiReport = sequelize.define('AiReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  month: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  narrative: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  modelUsed: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ai_reports',
  paranoid: false,
  timestamps: false,
});

AiReport.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

export default AiReport;