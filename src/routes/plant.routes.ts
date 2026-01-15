import { Router } from 'express';
import plantController from '../controllers/plant.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/permission.middleware';
import { validate, validatePlant } from '../utils/validators';

const router = Router();

// All plant routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all plants (paginated)
router.get('/', plantController.getAllPlants);

// Get active plants (for dropdowns)
router.get('/active', plantController.getActivePlants);

// Get plant by ID
router.get('/:id', plantController.getPlantById);

// Create plant
router.post('/', validate(validatePlant), plantController.createPlant);

// Update plant
router.put('/:id', validate(validatePlant), plantController.updatePlant);

// Delete plant
router.delete('/:id', plantController.deletePlant);

export default router;
