import { Router } from 'express';
import * as loanController from './loans.controller.js';
import authenticate from '../../common/middlewares/authenticate.js';
import validate from '../../common/middlewares/validate.js';
import { createLoanSchema, updateLoanSchema } from './loans.validators.js';
const router = Router();

router.use(authenticate);

router.get('/', loanController.listLoans);
router.post('/', validate(createLoanSchema), loanController.createLoan);
router.get('/contacts', loanController.getContacts);
router.get('/person/:personName', loanController.getLoansByPerson);
router.get('/:id', loanController.getLoan);
router.patch('/:id', validate(updateLoanSchema), loanController.updateLoan);
router.delete('/:id', loanController.deleteLoan);
router.patch('/:id/settle', loanController.settleLoan);

export default router;