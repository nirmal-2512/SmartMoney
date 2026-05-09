import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
    logging: false,
    define: {
      underscored: true,
      paranoid: true,
      timestamps: true,
    },
  }
);

export default sequelize;