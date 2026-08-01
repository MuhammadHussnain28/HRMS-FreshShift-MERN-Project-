import express from 'express';
import {
  handleSubmitLeave,
  handleDecideLeave,
  handleGetMyLeaves,
  handleGetAllLeaves,
  handleGetLeaveById,
  handleGetMyBalances,
} from '../controllers/leaveController.js';
import verifyToken from '../middlewares/verifyToken.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { leaveRequestSchema, leaveDecisionSchema, leaveStatusQuerySchema } from '../validators/leaveValidators.js';

const router = express.Router();

// Order matters: /me and /balance/me before /:id
router.post('/', verifyToken, validate(leaveRequestSchema), handleSubmitLeave);
router.get('/me', verifyToken, handleGetMyLeaves);
router.get('/balance/me', verifyToken, handleGetMyBalances);

router.get('/', verifyToken, authorize('hr_admin'), validate(leaveStatusQuerySchema), handleGetAllLeaves);
router.put('/:id/decision', verifyToken, authorize('hr_admin'), validate(leaveDecisionSchema), handleDecideLeave);
router.get('/:id', verifyToken, handleGetLeaveById); // ownerOrAdmin is checked in controller

export default router;
