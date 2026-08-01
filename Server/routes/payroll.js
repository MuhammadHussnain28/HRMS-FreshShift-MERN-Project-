import express from 'express';
import {
  generatePayrollController,
  getEmployeePayroll,
  downloadPayslip,
} from '../controllers/payrollController.js';
import verifyToken from '../middlewares/verifyToken.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { generatePayrollSchema } from '../validators/payrollValidators.js';

const router = express.Router();

router.use(verifyToken);

router.post('/generate', authorize('hr_admin'), validate(generatePayrollSchema), generatePayrollController);
router.get('/:employeeId', getEmployeePayroll);
router.get('/:id/download', downloadPayslip);

export default router;
