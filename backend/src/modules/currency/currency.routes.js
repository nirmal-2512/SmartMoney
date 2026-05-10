import { Router } from 'express';
import * as currencyController from './currency.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency conversion and exchange rates
 */

/**
 * @swagger
 * /currency/supported:
 *   get:
 *     summary: Get list of supported currencies
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of supported currencies
 */
router.get('/supported', currencyController.getSupportedCurrencies);

/**
 * @swagger
 * /currency/rate:
 *   get:
 *     summary: Get exchange rate between two currencies
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exchange rate
 */
router.get('/rate', currencyController.getExchangeRate);

/**
 * @swagger
 * /currency/convert:
 *   get:
 *     summary: Convert amount between currencies
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Converted amount
 */
router.get('/convert', currencyController.convertAmount);

/**
 * @swagger
 * /currency/refresh:
 *   post:
 *     summary: Refresh all exchange rates from base currency (INR)
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rates refreshed
 */
router.post('/refresh', currencyController.refreshRates);

export default router;