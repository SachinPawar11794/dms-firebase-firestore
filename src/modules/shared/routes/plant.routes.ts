import { Router } from 'express';
import { plantController } from '../controllers/plant.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { checkPermission } from '../../../middleware/permission.middleware';
import { Module, Permission } from '../../../models/permission.model';
import {
  validate,
  stringValidation,
  optionalStringValidation,
} from '../../../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Plant validation rules
const createPlantValidation = [
  stringValidation('name', 1, 200),
  stringValidation('code', 1, 50),
];

const updatePlantValidation = [
  optionalStringValidation('name', 200),
  optionalStringValidation('code', 50),
];

// Routes
router.post(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(createPlantValidation),
  plantController.createPlant.bind(plantController)
);

router.get(
  '/',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  plantController.getAllPlants.bind(plantController)
);

router.get(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.READ),
  plantController.getPlant.bind(plantController)
);

router.put(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.WRITE),
  validate(updatePlantValidation),
  plantController.updatePlant.bind(plantController)
);

router.delete(
  '/:id',
  checkPermission(Module.EMPLOYEE_TASK_MANAGER, Permission.DELETE),
  plantController.deletePlant.bind(plantController)
);

export default router;
