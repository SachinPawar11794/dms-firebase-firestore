import { body, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from './response';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return ResponseHelper.error(
      res,
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      errors.array()
    );
  };
};

// Common validation rules
export const emailValidation = body('email')
  .isEmail()
  .withMessage('Invalid email format')
  .normalizeEmail();

export const stringValidation = (field: string, minLength: number = 1, maxLength: number = 255) =>
  body(field)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`);

export const optionalStringValidation = (field: string, maxLength: number = 255) =>
  body(field)
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must not exceed ${maxLength} characters`);

export const numberValidation = (field: string, min?: number, max?: number) => {
  let validator = body(field).isNumeric().withMessage(`${field} must be a number`);
  if (min !== undefined) {
    validator = validator.isInt({ min }).withMessage(`${field} must be at least ${min}`);
  }
  if (max !== undefined) {
    validator = validator.isInt({ max }).withMessage(`${field} must be at most ${max}`);
  }
  return validator;
};

export const dateValidation = (field: string) =>
  body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid ISO 8601 date`);

export const enumValidation = (field: string, allowedValues: string[]) =>
  body(field)
    .isIn(allowedValues)
    .withMessage(`${field} must be one of: ${allowedValues.join(', ')}`);

// Plant validation
export const validatePlant = [
  stringValidation('name', 1, 255),
  stringValidation('code', 1, 50),
  optionalStringValidation('address', 500),
  optionalStringValidation('city', 100),
  optionalStringValidation('state', 100),
  optionalStringValidation('country', 100),
  optionalStringValidation('postalCode', 20),
  optionalStringValidation('contactPerson', 255),
  body('contactEmail').optional().isEmail().withMessage('Invalid email format').normalizeEmail(),
  optionalStringValidation('contactPhone', 20),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
