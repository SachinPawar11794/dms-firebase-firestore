import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task validation rules
const createTaskValidation = [
  stringValidation('title', 1, 200),
  stringValidation('description', 1, 1000),
  stringValidation('assignedTo', 1),
  stringValidation('assignedBy', 1),
  enumValidation('priority', ['low', 'medium', 'high', 'urgent']),
  dateValidation('dueDate'),
  optionalStringValidation('tags'),
];

const updateTaskValidation = [
  optionalStringValidation('title', 200),
  optionalStringValidation('description', 1000),
  optionalStringValidation('assignedTo'),
  enumValidation('status', ['pending', 'in-progress', 'completed', 'cancelled']).optional(),
  enumValidation('priority', ['low', 'medium', 'high', 'urgent']).optional(),
  dateValidation('dueDate').optional(),
];

// Routes
router.post(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(createTaskValidation),
  taskController.createTask.bind(taskController)
);

router.get(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskController.getTasks.bind(taskController)
);

router.get(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  taskController.getTask.bind(taskController)
);

router.put(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(updateTaskValidation),
  taskController.updateTask.bind(taskController)
);

router.patch(
  '/:id/status',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate([enumValidation('status', ['pending', 'in-progress', 'completed', 'cancelled'])]),
  taskController.updateTaskStatus.bind(taskController)
);

router.delete(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.DELETE),
  taskController.deleteTask.bind(taskController)
);

export default router;
