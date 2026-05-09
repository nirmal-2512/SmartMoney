import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('budget_overrun', 'anomaly', 'import_complete', 'report_ready'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sentViaEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  paranoid: false,
  updatedAt: false,
});

Notification.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Notification, { foreignKey: 'userId' });

export default Notification;