import express from 'express';
import {
  listEmployees,
  getMyProfile,
  getEmployee,
  adminUpdateEmployee,
  selfUpdateProfile,
  deleteEmployee,
} from '../controllers/employeeController.js';
import verifyToken from '../middlewares/verifyToken.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { adminUpdateSchema, selfUpdateSchema } from '../validators/employeeValidators.js';

const router = express.Router();

// /me routes MUST come before /:id to prevent Express matching "me" as an ID
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, validate(selfUpdateSchema), selfUpdateProfile);

router.get('/', verifyToken, authorize('hr_admin'), listEmployees);
router.get('/:id', verifyToken, authorize('hr_admin'), getEmployee);
router.put('/:id', verifyToken, authorize('hr_admin'), validate(adminUpdateSchema), adminUpdateEmployee);
router.delete('/:id', verifyToken, authorize('hr_admin'), deleteEmployee);

export default router;
