import { Router } from 'express';
import { taskMasterController } from '../controllers/task-master.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { checkPermission } from '../../../middleware/permission.middleware';
import { Module, Permission } from '../../../models/permission.model';
import {
  validate,
  stringValidation,
  optionalStringValidation,
  enumValidation,
  dateValidation,
} from '../../../utils/validators';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task Master validation rules
const createTaskMasterValidation = [
  stringValidation('title', 1, 200),
  stringValidation('description', 1, 1000),
  stringValidation('plantId', 1),
  stringValidation('assignedTo', 1),
  stringValidation('assignedBy', 1),
  enumValidation('priority', ['low', 'medium', 'high', 'urgent']),
  enumValidation('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  body('frequencyValue').optional().isInt({ allow_leading_zeroes: false }).withMessage('frequencyValue must be a number'),
  body('frequencyUnit').optional().isIn(['days', 'weeks', 'months']).withMessage('frequencyUnit must be days, weeks, or months'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('estimatedDuration is required and must be a positive number (minimum 1 minute)'),
  dateValidation('startDate'), // Required field - when task generation should begin
  optionalStringValidation('instructions', 2000),
];

const updateTaskMasterValidation = [
  optionalStringValidation('title', 200),
  optionalStringValidation('description', 1000),
  optionalStringValidation('plantId'),
  optionalStringValidation('assignedTo'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('priority must be low, medium, high, or urgent'),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']).withMessage('frequency must be daily, weekly, monthly, quarterly, yearly, or custom'),
  body('frequencyValue').optional().isInt({ allow_leading_zeroes: false }).withMessage('frequencyValue must be a number'),
  body('frequencyUnit').optional().isIn(['days', 'weeks', 'months']).withMessage('frequencyUnit must be days, weeks, or months'),
  body('estimatedDuration').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = parseInt(value);
    return !isNaN(num) && num > 0;
  }).withMessage('estimatedDuration must be a positive number'),
  body('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  optionalStringValidation('instructions', 2000),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Routes
router.post(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(createTaskMasterValidation),
  taskMasterController.createTaskMaster.bind(taskMasterController)
);

router.get(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskMasterController.getTaskMasters.bind(taskMasterController)
);

router.get(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskMasterController.getTaskMaster.bind(taskMasterController)
);

router.put(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(updateTaskMasterValidation),
  taskMasterController.updateTaskMaster.bind(taskMasterController)
);

router.delete(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.DELETE),
  taskMasterController.deleteTaskMaster.bind(taskMasterController)
);

export default router;
