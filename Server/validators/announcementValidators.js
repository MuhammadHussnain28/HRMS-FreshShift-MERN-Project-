import Joi from 'joi';

export const announcementSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  message: Joi.string().min(5).max(2000).required().messages({
    'string.min': 'Message must be at least 5 characters long',
    'string.max': 'Message cannot exceed 2000 characters',
    'any.required': 'Message is required',
  }),
});
