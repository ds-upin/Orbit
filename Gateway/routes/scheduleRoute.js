import express from 'express';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import {
    getSchedule,
    getSchedules,
    getScheduledBuses,
    getScheduledBusesByRoute,
    updateSchedule,
    deleteSchedule,
    addSchedule,
} from '../controllers/busServiceControllers/scheduleController.js';

const router = express.Router();

// Pending work:- Add Schedule
router.get('/list', getSchedules);
router.post('/add', authenticateAdmin, addSchedule);
router.get('/buses', getScheduledBuses);
router.get('/buses/route', getScheduledBusesByRoute);

router.get('/:id', getSchedule);
router.put('/', authenticateAdmin, updateSchedule);
router.delete('/:id', authenticateAdmin, deleteSchedule);

export default router;