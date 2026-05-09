import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Dashboard and financial reports
 */

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Get dashboard summary for current month
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', reportsController.getDashboard);

/**
 * @swagger
 * /reports/monthly:
 *   get:
 *     summary: Get monthly report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Month in YYYY-MM format (e.g. 2026-05)
 *     responses:
 *       200:
 *         description: Monthly report
 */
router.get('/monthly', reportsController.getMonthlyReport);

/**
 * @swagger
 * /reports/category-breakdown:
 *   get:
 *     summary: Get spending breakdown by category
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get('/category-breakdown', reportsController.getCategoryBreakdown);

export default router;