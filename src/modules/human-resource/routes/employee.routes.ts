import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
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

router.post(
  '/',
  checkPermission(Module.HUMAN_RESOURCE, Permission.WRITE),
  validate([
    stringValidation('employeeId', 1, 50),
    stringValidation('personalInfo.firstName', 1, 100),
    stringValidation('personalInfo.lastName', 1, 100),
    stringValidation('personalInfo.email', 1),
    stringValidation('personalInfo.phone', 1, 20),
    dateValidation('personalInfo.dateOfBirth'),
    stringValidation('employmentInfo.department', 1, 100),
    stringValidation('employmentInfo.position', 1, 100),
    dateValidation('employmentInfo.hireDate'),
    numberValidation('employmentInfo.salary', 0),
    enumValidation('employmentInfo.employmentType', ['full-time', 'part-time', 'contract']),
  ]),
  employeeController.createEmployee.bind(employeeController)
);

router.get(
  '/',
  checkPermission(Module.HUMAN_RESOURCE, Permission.READ),
  employeeController.getEmployees.bind(employeeController)
);

router.get(
  '/:id',
  checkPermission(Module.HUMAN_RESOURCE, Permission.READ),
  employeeController.getEmployee.bind(employeeController)
);

router.put(
  '/:id',
  checkPermission(Module.HUMAN_RESOURCE, Permission.WRITE),
  employeeController.updateEmployee.bind(employeeController)
);

router.delete(
  '/:id',
  checkPermission(Module.HUMAN_RESOURCE, Permission.DELETE),
  employeeController.deleteEmployee.bind(employeeController)
);

router.post(
  '/attendance',
  checkPermission(Module.HUMAN_RESOURCE, Permission.WRITE),
  validate([
    stringValidation('employeeId', 1),
    dateValidation('date'),
    enumValidation('status', ['present', 'absent', 'leave', 'half-day']),
    optionalStringValidation('notes', 500),
  ]),
  employeeController.createAttendance.bind(employeeController)
);

router.get(
  '/attendance/:employeeId',
  checkPermission(Module.HUMAN_RESOURCE, Permission.READ),
  employeeController.getAttendance.bind(employeeController)
);

export default router;
