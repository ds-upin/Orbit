import express from 'express';
import { getModel, getModels, addModel } from '../controllers/busServiceControllers/modelController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = express.Router();

router.get('/list/:skip/:limit', authenticateAdmin, getModels);
router.get('/:id', authenticateAdmin, getModel);
router.post('/', authenticateAdmin, addModel);

export default router;