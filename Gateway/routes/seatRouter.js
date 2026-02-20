import express from 'express';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import { addSeat, deleteSeat } from '../controllers/busServiceControllers/seatController.js';

const router = express.Router();

router.post('/', authenticateAdmin, addSeat);
router.delete('/', authenticateAdmin, deleteSeat);

export default router;