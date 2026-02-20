import express from 'express';
import { getRoute, addRoute } from '../controllers/busServiceControllers/routeController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = express.Router();

router.get('/:route_id', getRoute);
router.post('/', authenticateAdmin, addRoute);

export default router;