import { Router } from 'express';
import * as budgetsController from './budgets.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';
import validate from '../../common/middlewares/validate.js';
import { createBudgetSchema, updateBudgetSchema } from './budgets.validators.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management
 */

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 */
router.get('/', budgetsController.getAllBudgets);

/**
 * @swagger
 * /budgets/{id}/status:
 *   get:
 *     summary: Get budget status (spent vs limit)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget status with spent amount and percentage
 */
router.get('/:id/status', budgetsController.getBudgetStatus);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Get budget by ID
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget found
 */
router.get('/:id', budgetsController.getBudgetById);

/**
 * @swagger
 * /budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount, periodStart, periodEnd]
 *             properties:
 *               categoryId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               periodType:
 *                 type: string
 *                 enum: [monthly, weekly, custom]
 *               periodStart:
 *                 type: string
 *               periodEnd:
 *                 type: string
 *               rollover:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Budget created
 */
router.post('/', validate(createBudgetSchema), budgetsController.createBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   patch:
 *     summary: Update a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget updated
 */
router.patch('/:id', validate(updateBudgetSchema), budgetsController.updateBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget deleted
 */
router.delete('/:id', budgetsController.deleteBudget);

export default router;