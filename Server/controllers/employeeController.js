import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  updateSelf,
  softDeleteEmployee,
} from '../services/employeeService.js';

export const listEmployees = asyncHandler(async (req, res) => {
  const employees = await getAllEmployees();
  return sendSuccess(res, employees);
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(req.user.id);
  return sendSuccess(res, employee);
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(req.params.id);
  return sendSuccess(res, employee);
});

export const adminUpdateEmployee = asyncHandler(async (req, res) => {
  const employee = await updateEmployee(req.params.id, req.body, req.user.id);
  return sendSuccess(res, employee, 'Employee updated successfully');
});

export const selfUpdateProfile = asyncHandler(async (req, res) => {
  const employee = await updateSelf(req.user.id, req.body);
  return sendSuccess(res, employee, 'Profile updated successfully');
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await softDeleteEmployee(req.params.id, req.user.id);
  return sendSuccess(res, employee, 'Employee deactivated successfully');
});
