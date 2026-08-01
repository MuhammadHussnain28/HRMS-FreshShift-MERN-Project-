import User from '../models/User.js';
import { logAction } from './auditService.js';

export const getAllEmployees = async () => {
  const employees = await User.find();
  return employees;
};

export const getEmployeeById = async (id) => {
  const employee = await User.findById(id);
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

export const updateEmployee = async (id, data, adminUserId) => {
  const employee = await User.findById(id);
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedEmployee = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  await logAction({
    user: adminUserId,
    action: 'EMPLOYEE_UPDATED',
    targetType: 'User',
    targetId: id,
    details: { changedFields: Object.keys(data) },
  });

  return updatedEmployee;
};

export const updateSelf = async (userId, data) => {
  const updatedUser = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedUser;
};

export const softDeleteEmployee = async (id, adminUserId) => {
  const employee = await User.findById(id);
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }

  employee.employmentStatus = 'terminated';
  await employee.save();

  await logAction({
    user: adminUserId,
    action: 'EMPLOYEE_DEACTIVATED',
    targetType: 'User',
    targetId: id,
    details: { previousStatus: employee.employmentStatus },
  });

  return employee;
};
