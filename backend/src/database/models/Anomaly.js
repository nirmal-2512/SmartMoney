import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';
import Transaction from './Transaction.js';

const Anomaly = sequelize.define('Anomaly', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('z_score', 'duplicate_proximity', 'velocity', 'budget_projection'),
    allowNull: false,
  },
  score: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: false,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isDismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'anomalies',
  paranoid: false,
  updatedAt: false,
});

Anomaly.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Anomaly.belongsTo(Transaction, { foreignKey: 'transactionId', onDelete: 'CASCADE' });

export default Anomaly;