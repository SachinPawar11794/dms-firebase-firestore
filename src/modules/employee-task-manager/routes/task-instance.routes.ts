import { Router } from 'express';
import { taskInstanceController } from '../controllers/task-instance.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { checkPermission } from '../../../middleware/permission.middleware';
import { Module, Permission } from '../../../models/permission.model';
import {
  validate,
  stringValidation,
  optionalStringValidation,
  dateValidation,
} from '../../../utils/validators';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task Instance validation rules
const createTaskInstanceValidation = [
  stringValidation('taskMasterId', 1),
  dateValidation('scheduledDate'),
  dateValidation('dueDate'),
];

const updateTaskInstanceValidation = [
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('status must be pending, in-progress, completed, or cancelled'),
  optionalStringValidation('notes', 2000),
  body('actualDuration').optional().isInt().withMessage('actualDuration must be a number'),
  body('completedAt').optional().isISO8601().withMessage('completedAt must be a valid ISO 8601 date'),
];

// Routes
router.post(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(createTaskInstanceValidation),
  taskInstanceController.createTaskInstance.bind(taskInstanceController)
);

router.get(
  '/my-tasks',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskInstanceController.getMyTasks.bind(taskInstanceController)
);

router.get(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskInstanceController.getTaskInstances.bind(taskInstanceController)
);

router.get(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskInstanceController.getTaskInstance.bind(taskInstanceController)
);

router.put(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(updateTaskInstanceValidation),
  taskInstanceController.updateTaskInstance.bind(taskInstanceController)
);

router.delete(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.DELETE),
  taskInstanceController.deleteTaskInstance.bind(taskInstanceController)
);

router.post(
  '/generate',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  taskInstanceController.generateTasks.bind(taskInstanceController)
);

export default router;
