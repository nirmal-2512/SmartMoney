import { Router } from 'express';
import multer from 'multer';
import * as importsController from './imports.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';
import validate from '../../common/middlewares/validate.js';
import { confirmRowSchema } from './imports.validators.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['text/csv', 'application/pdf', 'application/vnd.ms-excel'];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and PDF files are allowed'));
    }
  },
});

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Imports
 *   description: Bank statement import
 */

/**
 * @swagger
 * /imports:
 *   get:
 *     summary: Get all imports
 *     tags: [Imports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of imports
 */
router.get('/', importsController.getAllImports);

/**
 * @swagger
 * /imports:
 *   post:
 *     summary: Upload a CSV or PDF bank statement
 *     tags: [Imports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Import created and staged
 */
router.post('/', upload.single('file'), importsController.createImport);

/**
 * @swagger
 * /imports/{id}:
 *   get:
 *     summary: Get import by ID
 *     tags: [Imports]
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
 *         description: Import found
 */
router.get('/:id', importsController.getImportById);

/**
 * @swagger
 * /imports/{id}/rows:
 *   get:
 *     summary: Get staged rows for review
 *     tags: [Imports]
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
 *         description: Import rows
 */
router.get('/:id/rows', importsController.getImportRows);

/**
 * @swagger
 * /imports/{id}/rows/{rowId}:
 *   patch:
 *     summary: Override category for a specific row
 *     tags: [Imports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rowId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Row updated
 */
router.patch('/:id/rows/:rowId', validate(confirmRowSchema), importsController.updateImportRow);

/**
 * @swagger
 * /imports/{id}/confirm:
 *   post:
 *     summary: Confirm import and save all rows as transactions
 *     tags: [Imports]
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
 *         description: Transactions imported
 */
router.post('/:id/confirm', importsController.confirmImport);

/**
 * @swagger
 * /imports/{id}:
 *   delete:
 *     summary: Delete an import
 *     tags: [Imports]
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
 *         description: Import deleted
 */
router.delete('/:id', importsController.deleteImport);

export default router;