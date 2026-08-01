import express from 'express';
import {
  handleClockIn,
  handleClockOut,
  handleGetMyAttendance,
  handleGetEmployeeAttendance,
  handleGetAllAttendance,
} from '../controllers/attendanceController.js';
import verifyToken from '../middlewares/verifyToken.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// Specific routes MUST come before /:employeeId to prevent param collision
router.post('/clock-in', verifyToken, handleClockIn);
router.post('/clock-out', verifyToken, handleClockOut);
router.get('/me', verifyToken, handleGetMyAttendance);

router.get('/', verifyToken, authorize('hr_admin'), handleGetAllAttendance);
router.get('/:employeeId', verifyToken, authorize('hr_admin'), handleGetEmployeeAttendance);

export default router;
