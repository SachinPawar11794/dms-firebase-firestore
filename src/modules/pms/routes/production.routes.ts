import { Router } from 'express';
import { productionController } from '../controllers/production.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { checkPermission } from '../../../middleware/permission.middleware';
import { Module, Permission } from '../../../models/permission.model';
import {
  validate,
  stringValidation,
  optionalStringValidation,
  numberValidation,
  enumValidation,
  dateValidation,
} from '../../../utils/validators';

const router = Router();

router.use(authenticate);

const createProductionValidation = [
  stringValidation('productName', 1, 200),
  numberValidation('quantity', 1),
  stringValidation('unit', 1, 50),
  dateValidation('productionDate'),
  optionalStringValidation('notes', 1000),
];

const updateProductionValidation = [
  optionalStringValidation('productName', 200),
  numberValidation('quantity', 1).optional(),
  optionalStringValidation('unit', 50),
  dateValidation('productionDate').optional(),
  enumValidation('status', ['planned', 'in-progress', 'completed', 'on-hold']).optional(),
];

router.post(
  '/',
  checkPermission(Module.PMS, Permission.WRITE),
  validate(createProductionValidation),
  productionController.createProduction.bind(productionController)
);

router.get(
  '/',
  checkPermission(Module.PMS, Permission.READ),
  productionController.getProductions.bind(productionController)
);

router.get(
  '/:id',
  checkPermission(Module.PMS, Permission.READ),
  productionController.getProduction.bind(productionController)
);

router.put(
  '/:id',
  checkPermission(Module.PMS, Permission.WRITE),
  validate(updateProductionValidation),
  productionController.updateProduction.bind(productionController)
);

router.delete(
  '/:id',
  checkPermission(Module.PMS, Permission.DELETE),
  productionController.deleteProduction.bind(productionController)
);

export default router;
