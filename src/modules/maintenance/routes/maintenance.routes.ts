import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';
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

router.use(authenticate);

// Maintenance Requests
router.post(
  '/requests',
  checkPermission(Module.MAINTENANCE, Permission.WRITE),
  validate([
    stringValidation('title', 1, 200),
    stringValidation('description', 1, 1000),
    stringValidation('equipmentId', 1),
    stringValidation('equipmentName', 1, 200),
    enumValidation('priority', ['low', 'medium', 'high', 'urgent']),
    dateValidation('scheduledDate').optional(),
    optionalStringValidation('notes', 1000),
  ]),
  maintenanceController.createMaintenanceRequest.bind(maintenanceController)
);

router.get(
  '/requests',
  checkPermission(Module.MAINTENANCE, Permission.READ),
  maintenanceController.getMaintenanceRequests.bind(maintenanceController)
);

router.get(
  '/requests/:id',
  checkPermission(Module.MAINTENANCE, Permission.READ),
  maintenanceController.getMaintenanceRequest.bind(maintenanceController)
);

router.put(
  '/requests/:id',
  checkPermission(Module.MAINTENANCE, Permission.WRITE),
  maintenanceController.updateMaintenanceRequest.bind(maintenanceController)
);

router.delete(
  '/requests/:id',
  checkPermission(Module.MAINTENANCE, Permission.DELETE),
  maintenanceController.deleteMaintenanceRequest.bind(maintenanceController)
);

// Equipment
router.post(
  '/equipment',
  checkPermission(Module.MAINTENANCE, Permission.WRITE),
  validate([
    stringValidation('name', 1, 200),
    stringValidation('type', 1, 100),
    stringValidation('serialNumber', 1, 100),
    stringValidation('location', 1, 200),
    dateValidation('warrantyExpiry').optional(),
  ]),
  maintenanceController.createEquipment.bind(maintenanceController)
);

router.get(
  '/equipment',
  checkPermission(Module.MAINTENANCE, Permission.READ),
  maintenanceController.getAllEquipment.bind(maintenanceController)
);

router.get(
  '/equipment/:id',
  checkPermission(Module.MAINTENANCE, Permission.READ),
  maintenanceController.getEquipment.bind(maintenanceController)
);

router.put(
  '/equipment/:id',
  checkPermission(Module.MAINTENANCE, Permission.WRITE),
  maintenanceController.updateEquipment.bind(maintenanceController)
);

router.delete(
  '/equipment/:id',
  checkPermission(Module.MAINTENANCE, Permission.DELETE),
  maintenanceController.deleteEquipment.bind(maintenanceController)
);

export default router;
