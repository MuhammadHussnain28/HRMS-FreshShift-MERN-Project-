import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { remainingBalance, getApprovedLeavesSum } from './leaveBalanceService.js';
import { getLeaveRecommendation } from './aiLeaveService.js';
import { logAction } from './auditService.js';
import { LEAVE_POLICY } from '../config/leavePolicy.js';
import { todayYMD } from '../utils/dateUtils.js';

export const submitLeave = async (employeeId, data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const year = startDate.getFullYear();

  // Compute inclusive days
  const timeDiff = endDate.getTime() - startDate.getTime();
  const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

  if (numberOfDays <= 0) {
    const error = new Error('End date must be after or same as start date');
    error.statusCode = 400;
    throw error;
  }

  // Check balance
  const balance = await remainingBalance(employeeId, data.leaveType, year);
  if (numberOfDays > balance) {
    const error = new Error(`Insufficient leave balance. You have ${balance} day(s) remaining for ${data.leaveType}.`);
    error.statusCode = 400;
    throw error;
  }

  const employee = await User.findById(employeeId);

  // Count teammates off
  const teammatesOffCount = await Leave.countDocuments({
    employee: { $ne: employeeId },
    status: 'approved',
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  const usedDays = await getApprovedLeavesSum(employeeId, data.leaveType, year);

  // Call AI
  const aiRecommendation = await getLeaveRecommendation({
    employeeName: employee.name,
    leaveType: data.leaveType,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    reason: data.reason,
    allowedDays: LEAVE_POLICY[data.leaveType],
    usedDays,
    teammatesOffCount,
  });

  const leave = await Leave.create({
    employee: employeeId,
    leaveType: data.leaveType,
    startDate,
    endDate,
    numberOfDays,
    reason: data.reason,
    aiRecommendation,
  });

  return leave;
};

export const decideLeave = async (leaveId, adminId, decision) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leave.status !== 'pending') {
    const error = new Error(`Leave request has already been ${leave.status}`);
    error.statusCode = 400;
    throw error;
  }

  if (leave.employee.toString() === adminId.toString()) {
    const error = new Error('You cannot approve or reject your own leave request');
    error.statusCode = 403;
    throw error;
  }

  leave.status = decision;
  leave.reviewedBy = adminId;
  leave.reviewedAt = new Date();
  await leave.save();

  // Create attendance records if approved
  if (decision === 'approved') {
    const currentDate = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    while (currentDate <= end) {
      const dateStr = todayYMD(currentDate);
      
      // Upsert: Create if doesn't exist, update if it does
      await Attendance.findOneAndUpdate(
        { employee: leave.employee, date: dateStr },
        { 
          $set: { 
            status: 'on-leave',
            // If we are creating it fresh, we don't want clockIn to be null, we just omit it.
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Audit
  await logAction({
    user: adminId,
    action: 'LEAVE_DECISION',
    targetType: 'Leave',
    targetId: leave._id,
    details: { decision, from: leave.startDate, to: leave.endDate },
  });

  return leave;
};

export const getMyLeaves = async (employeeId) => {
  return await Leave.find({ employee: employeeId }).sort({ createdAt: -1 });
};

export const getAllLeaves = async (statusFilter) => {
  const filter = statusFilter ? { status: statusFilter } : {};
  return await Leave.find(filter)
    .populate('employee', 'name email department')
    .sort({ createdAt: -1 });
};

export const getLeaveById = async (leaveId) => {
  const leave = await Leave.findById(leaveId).populate('employee', 'name email department');
  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }
  return leave;
};
