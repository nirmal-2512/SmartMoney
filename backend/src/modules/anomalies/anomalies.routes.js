import { Router } from 'express';
import * as anomaliesController from './anomalies.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Anomalies
 *   description: Anomaly detection
 */

/**
 * @swagger
 * /anomalies:
 *   get:
 *     summary: Get all undismissed anomalies
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of anomalies
 */
router.get('/', anomaliesController.getAllAnomalies);

/**
 * @swagger
 * /anomalies/recompute-baselines:
 *   post:
 *     summary: Recompute category baselines for anomaly detection
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Baselines recomputed
 */
router.post('/recompute-baselines', anomaliesController.recomputeBaselines);

/**
 * @swagger
 * /anomalies/detect/{transactionId}:
 *   post:
 *     summary: Run anomaly detection on a specific transaction
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Anomalies detected
 */
router.post('/detect/:transactionId', anomaliesController.detectForTransaction);

/**
 * @swagger
 * /anomalies/{id}/dismiss:
 *   patch:
 *     summary: Dismiss an anomaly
 *     tags: [Anomalies]
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
 *         description: Anomaly dismissed
 */
router.patch('/:id/dismiss', anomaliesController.dismissAnomaly);

export default router;