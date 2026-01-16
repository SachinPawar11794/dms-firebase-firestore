import { Router } from 'express';
import { appSettingsController, upload } from '../controllers/app-settings.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { checkPermission } from '../../../middleware/permission.middleware';
import { Module, Permission } from '../../../models/permission.model';
import {
  validate,
  optionalStringValidation,
} from '../../../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// App settings validation rules
const updateAppSettingsValidation = [
  optionalStringValidation('companyLogoUrl', 500),
  optionalStringValidation('companyName', 200),
  optionalStringValidation('appNameShort', 50),
  optionalStringValidation('appNameLong', 200),
];

// Routes
router.get(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ), // Use existing permission check
  appSettingsController.getAppSettings.bind(appSettingsController)
);

router.put(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(updateAppSettingsValidation),
  appSettingsController.updateAppSettings.bind(appSettingsController)
);

router.post(
  '/logo',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  upload.single('logo'),
  (req, res, next) => {
    // Handle multer errors
    const fileValidationError = (req as any).fileValidationError;
    if (fileValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: fileValidationError,
        },
      });
    }
    return next();
  },
  appSettingsController.uploadLogo.bind(appSettingsController)
);

router.delete(
  '/logo',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  appSettingsController.deleteLogo.bind(appSettingsController)
);

export default router;
