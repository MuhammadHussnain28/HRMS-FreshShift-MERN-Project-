import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  clockIn,
  clockOut,
  getMyAttendance,
  getEmployeeAttendance,
  getAllAttendance,
} from '../services/attendanceService.js';

export const handleClockIn = asyncHandler(async (req, res) => {
  const record = await clockIn(req.user.id);
  return sendSuccess(res, record, 'Clocked in successfully', 201);
});

export const handleClockOut = asyncHandler(async (req, res) => {
  const record = await clockOut(req.user.id);
  return sendSuccess(res, record, 'Clocked out successfully');
});

export const handleGetMyAttendance = asyncHandler(async (req, res) => {
  const records = await getMyAttendance(req.user.id);
  return sendSuccess(res, records);
});

export const handleGetEmployeeAttendance = asyncHandler(async (req, res) => {
  const records = await getEmployeeAttendance(req.params.employeeId);
  return sendSuccess(res, records);
});

export const handleGetAllAttendance = asyncHandler(async (req, res) => {
  const records = await getAllAttendance(req.query);
  return sendSuccess(res, records);
});
