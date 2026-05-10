import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import passport from './config/passport.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';
import budgetsRoutes from './modules/budgets/budgets.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import currencyRoutes from './modules/currency/currency.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import importsRoutes from './modules/imports/imports.routes.js';
import anomaliesRoutes from './modules/anomalies/anomalies.routes.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/categories', categoriesRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/budgets', budgetsRoutes);
app.use('/reports', reportsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/currency', currencyRoutes);
app.use('/ai', aiRoutes);
app.use('/imports', importsRoutes);
app.use('/anomalies', anomaliesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;