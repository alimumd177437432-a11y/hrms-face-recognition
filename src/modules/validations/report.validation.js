import Joi from 'joi';

export const monthlyReportValidation = Joi.object({
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12'
    }),
  year: Joi.number()
    .integer()
    .min(2020)
    .max(2100)
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be at least 2020',
      'number.max': 'Year cannot exceed 2100'
    })
});