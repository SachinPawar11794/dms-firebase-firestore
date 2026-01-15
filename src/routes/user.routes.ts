import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { Module, Permission } from '../models/permission.model';
import {
  validate,
  emailValidation,
  stringValidation,
  optionalStringValidation,
  enumValidation,
} from '../utils/validators';

const router = Router();

// Get current user (no permission check needed - user can see their own data)
router.get('/me', authenticate, userController.getCurrentUser.bind(userController));

// All other routes require authentication
router.use(authenticate);

router.post(
  '/',
  checkPermission(Module.HUMAN_RESOURCE, Permission.WRITE),
  validate([
    emailValidation,
    stringValidation('displayName', 1, 100),
    enumValidation('role', ['admin', 'manager', 'employee', 'guest']),
  ]),
  userController.createUser.bind(userController)
);

router.get(
  '/',
  checkPermission(Module.HUMAN_RESOURCE, Permission.READ),
  userController.getUsers.bind(userController)
);

router.get(
  '/:id',
  checkPermission(Module.HUMAN_RESOURCE, Permission.READ),
  userController.getUser.bind(userController)
);

router.put(
  '/:id',
  checkPermission(Module.HUMAN_RESOURCE, Permission.WRITE),
  validate([
    optionalStringValidation('displayName', 100),
    enumValidation('role', ['admin', 'manager', 'employee', 'guest']).optional(),
  ]),
  userController.updateUser.bind(userController)
);

router.delete(
  '/:id',
  checkPermission(Module.HUMAN_RESOURCE, Permission.DELETE),
  userController.deleteUser.bind(userController)
);

router.put(
  '/:id/permissions',
  checkPermission(Module.HUMAN_RESOURCE, Permission.WRITE),
  validate([
    stringValidation('module', 1),
    // permissions should be an array
  ]),
  userController.updateUserPermissions.bind(userController)
);

router.get(
  '/:id/permissions',
  checkPermission(Module.HUMAN_RESOURCE, Permission.READ),
  userController.getUserPermissions.bind(userController)
);

export default router;
