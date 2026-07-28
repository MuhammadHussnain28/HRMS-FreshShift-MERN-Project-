import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('employee', 'hr_admin').default('employee'),
  department: Joi.string().trim().max(100),
  designation: Joi.string().trim().max(100),
  phone: Joi.string().trim().max(20),
  joiningDate: Joi.date(),
  monthlySalary: Joi.number().min(0),
  employmentStatus: Joi.string().valid('active', 'inactive', 'terminated'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
