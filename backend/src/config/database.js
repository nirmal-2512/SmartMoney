import { Sequelize } from 'sequelize';
import 'dotenv/config';

let sequelize;

if (process.env.DATABASE_URL) {
  // Render production — uses single connection string
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // required for Render's PostgreSQL
      },
    },
    define: {
      underscored: true,
      paranoid: true,
      timestamps: true,
    },
  });
} else {
  // Local development — uses individual vars
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
      define: {
        underscored: true,
        paranoid: true,
        timestamps: true,
      },
    }
  );
}

export default sequelize;