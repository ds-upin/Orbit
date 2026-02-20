import express from 'express';
import { getBus, getBuses, addBus, updateBus, deleteBus } from '../controllers/busServiceControllers/busController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = express.Router();

router.get('/list', getBuses);
router.get('/', getBus);
router.post('/', authenticateAdmin, addBus);
router.put('/', authenticateAdmin, updateBus);
router.delete('/:id', authenticateAdmin, deleteBus);

export default router;