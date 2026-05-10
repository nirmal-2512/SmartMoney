import { Router } from 'express';
import * as aiController from './ai.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered financial features
 */

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI financial advisor
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', aiController.chat);

/**
 * @swagger
 * /ai/categorise:
 *   post:
 *     summary: Auto categorise a transaction using AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, type]
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense, refund, transfer]
 *     responses:
 *       200:
 *         description: Suggested category
 */
router.post('/categorise', aiController.categoriseTransaction);

/**
 * @swagger
 * /ai/reports/{month}:
 *   get:
 *     summary: Get existing AI monthly report
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: AI report
 */
router.get('/reports/:month', aiController.getMonthlyReport);

/**
 * @swagger
 * /ai/reports/{month}/generate:
 *   post:
 *     summary: Generate AI monthly report
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: Generated report
 */
router.post('/reports/:month/generate', aiController.generateMonthlyReport);

export default router;