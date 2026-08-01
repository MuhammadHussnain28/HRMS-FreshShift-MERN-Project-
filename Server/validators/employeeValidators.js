import Joi from 'joi';

export const adminUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().lowercase().trim(),
  role: Joi.string().valid('employee', 'hr_admin'),
  department: Joi.string().trim().max(100).allow(''),
  designation: Joi.string().trim().max(100).allow(''),
  phone: Joi.string().trim().max(20).allow(''),
  joiningDate: Joi.date(),
  monthlySalary: Joi.number().min(0),
  employmentStatus: Joi.string().valid('active', 'inactive', 'terminated'),
}).min(1);

export const selfUpdateSchema = Joi.object({
  phone: Joi.string().trim().max(20).allow(''),
}).min(1);
