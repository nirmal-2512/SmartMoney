import 'dotenv/config';
import app from './app.js';
import sequelize from './config/database.js';
import './database/models/index.js'; // registers all models

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true });
    console.log('Models synced');

    app.listen(PORT, () => {
      console.log(`SmartMoney API running on http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();