import Joi from 'joi';

export const registerEmployeeValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  employeeId: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(4)
    .max(20)
    .required()
    .messages({
      'string.pattern.base': 'Employee ID must contain only numbers',
      'string.min': 'Employee ID must be at least 4 digits',
      'string.max': 'Employee ID cannot exceed 20 digits',
      'any.required': 'Employee ID is required'
    }),
  department: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Department must be at least 2 characters',
      'string.max': 'Department cannot exceed 50 characters',
      'any.required': 'Department is required'
    })
});

export const updateEmployeeValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  department: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Department must be at least 2 characters',
      'string.max': 'Department cannot exceed 50 characters'
    })
});