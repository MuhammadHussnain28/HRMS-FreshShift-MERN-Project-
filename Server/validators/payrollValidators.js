import Joi from 'joi';
import mongoose from 'mongoose';

export const generatePayrollSchema = Joi.object({
  employeeId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'any.invalid': 'Invalid employee ID format',
      'any.required': 'Employee ID is required',
    }),
  month: Joi.number().min(1).max(12).required().messages({
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12',
    'any.required': 'Month is required',
  }),
  year: Joi.number().min(2000).max(2100).required().messages({
    'any.required': 'Year is required',
  }),
});
