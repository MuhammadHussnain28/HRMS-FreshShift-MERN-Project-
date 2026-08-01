import Attendance from '../models/Attendance.js';
import { todayYMD } from '../utils/dateUtils.js';

export const clockIn = async (employeeId) => {
  const today = todayYMD();

  const record = await Attendance.create({
    employee: employeeId,
    date: today,
    clockIn: new Date(),
  });

  return record;
};

export const clockOut = async (employeeId) => {
  const today = todayYMD();

  const record = await Attendance.findOne({ employee: employeeId, date: today });

  if (!record) {
    const error = new Error('No clock-in record found for today. Please clock in first.');
    error.statusCode = 400;
    throw error;
  }

  if (record.clockOut) {
    const error = new Error('Already clocked out for today.');
    error.statusCode = 400;
    throw error;
  }

  record.clockOut = new Date();
  await record.save();

  return record;
};

export const getMyAttendance = async (employeeId) => {
  const records = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
  return records;
};

export const getEmployeeAttendance = async (employeeId) => {
  const records = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
  return records;
};

export const getAllAttendance = async (query) => {
  const filter = {};

  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }

  const records = await Attendance.find(filter)
    .populate('employee', 'name email department')
    .sort({ date: -1 });

  return records;
};
