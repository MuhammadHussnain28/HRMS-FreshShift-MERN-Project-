import Leave from '../models/Leave.js';
import { LEAVE_POLICY } from '../config/leavePolicy.js';
import mongoose from 'mongoose';

export const getApprovedLeavesSum = async (employeeId, leaveType, year) => {
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const result = await Leave.aggregate([
    {
      $match: {
        employee: new mongoose.Types.ObjectId(employeeId),
        leaveType,
        status: 'approved',
        startDate: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: '$numberOfDays' },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalDays : 0;
};

export const remainingBalance = async (employeeId, leaveType, year) => {
  const allowed = LEAVE_POLICY[leaveType];
  if (allowed === undefined) {
    throw new Error(`Invalid leave type: ${leaveType}`);
  }

  const used = await getApprovedLeavesSum(employeeId, leaveType, year);
  return allowed - used;
};

export const getAllBalances = async (employeeId, year) => {
  const balances = {};
  for (const leaveType of Object.keys(LEAVE_POLICY)) {
    const used = await getApprovedLeavesSum(employeeId, leaveType, year);
    balances[leaveType] = {
      allowed: LEAVE_POLICY[leaveType],
      used,
      remaining: LEAVE_POLICY[leaveType] - used,
    };
  }
  return balances;
};
