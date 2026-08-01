import Joi from 'joi';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const attendanceQuerySchema = Joi.object({
  from: Joi.string().pattern(datePattern).messages({
    'string.pattern.base': '"from" must be in YYYY-MM-DD format',
  }),
  to: Joi.string().pattern(datePattern).messages({
    'string.pattern.base': '"to" must be in YYYY-MM-DD format',
  }),
});
