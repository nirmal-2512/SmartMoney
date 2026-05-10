import 'dotenv/config';
import app from './app.js';
import sequelize from './config/database.js';
import './database/models/index.js'; // registers all models
import cron from 'node-cron';
import { User } from './database/models/index.js';
import { recomputeBaselines } from './modules/anomalies/anomalies.service.js';



// Nightly baseline recompute at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running nightly baseline recompute...');
  const users = await User.findAll({ attributes: ['id'] });
  for (const user of users) {
    await recomputeBaselines(user.id);
  }
  console.log('Baseline recompute complete.');
});


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