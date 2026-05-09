import { Router } from 'express';
import * as transactionsController from './transactions.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';
import validate from '../../common/middlewares/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from './transactions.validators.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management
 */

/**
 * @swagger
 * /transactions/summary:
 *   get:
 *     summary: Get income, expense and balance summary
 *     tags: [Transactions]
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
 *         description: Summary totals
 */
router.get('/summary', transactionsController.getTransactionSummary);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions with filters and pagination
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense, refund, transfer]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of transactions
 */
router.get('/', transactionsController.getAllTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
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
 *         description: Transaction found
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', transactionsController.getTransactionById);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, amount, type, date]
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense, refund, transfer]
 *               date:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post('/', validate(createTransactionSchema), transactionsController.createTransaction);

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Update a transaction
 *     tags: [Transactions]
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
 *         description: Transaction updated
 */
router.patch('/:id', validate(updateTransactionSchema), transactionsController.updateTransaction);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
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
 *         description: Transaction deleted
 */
router.delete('/:id', transactionsController.deleteTransaction);

export default router;