import { Router } from 'express';
import multer from 'multer';
import * as transactionsController from './transactions.controller.js';
import { uploadTransactionReceipt } from './transactions.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';
import validate from '../../common/middlewares/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from './transactions.validators.js';

const router = Router();

const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for receipts'));
    }
  },
});

router.use(authenticate);

router.get('/summary', transactionsController.getTransactionSummary);
router.get('/', transactionsController.getAllTransactions);
router.get('/:id', transactionsController.getTransactionById);
router.post('/', validate(createTransactionSchema), transactionsController.createTransaction);
router.patch('/:id', validate(updateTransactionSchema), transactionsController.updateTransaction);
router.delete('/:id', transactionsController.deleteTransaction);
router.post('/:id/receipt', receiptUpload.single('receipt'), uploadTransactionReceipt);

export default router;