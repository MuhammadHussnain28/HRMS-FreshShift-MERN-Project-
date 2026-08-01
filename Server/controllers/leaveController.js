import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  submitLeave,
  decideLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
} from '../services/leaveService.js';
import { getAllBalances } from '../services/leaveBalanceService.js';

export const handleSubmitLeave = asyncHandler(async (req, res) => {
  const leave = await submitLeave(req.user.id, req.body);
  return sendSuccess(res, leave, 'Leave request submitted successfully', 201);
});

export const handleDecideLeave = asyncHandler(async (req, res) => {
  const leave = await decideLeave(req.params.id, req.user.id, req.body.decision);
  return sendSuccess(res, leave, `Leave request ${req.body.decision}`);
});

export const handleGetMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await getMyLeaves(req.user.id);
  return sendSuccess(res, leaves);
});

export const handleGetAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await getAllLeaves(req.query.status);
  return sendSuccess(res, leaves);
});

export const handleGetLeaveById = asyncHandler(async (req, res) => {
  const leave = await getLeaveById(req.params.id);
  
  // ownerOrAdmin check
  if (leave.employee._id.toString() !== req.user.id && req.user.role !== 'hr_admin') {
    const error = new Error('Access denied. Insufficient permissions.');
    error.statusCode = 403;
    throw error;
  }
  
  return sendSuccess(res, leave);
});

export const handleGetMyBalances = asyncHandler(async (req, res) => {
  const year = new Date().getFullYear();
  const balances = await getAllBalances(req.user.id, year);
  return sendSuccess(res, balances);
});
