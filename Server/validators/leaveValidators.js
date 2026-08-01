import Joi from 'joi';

export const leaveRequestSchema = Joi.object({
  leaveType: Joi.string().valid('casual', 'sick', 'annual').required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  reason: Joi.string().min(5).max(300).required(),
});

export const leaveDecisionSchema = Joi.object({
  decision: Joi.string().valid('approved', 'rejected').required(),
});

export const leaveStatusQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
});
