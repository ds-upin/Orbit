const express = require('express');
const { authenticateAdmin } = require('../middleware/authenticateAdmin');

const {
    getSchedule,
    getSchedules,
    getScheduledBuses,
    getScheduledBusesByRoute,
    updateSchedule,
    deleteSchedule,
} = require('../controllers/busServiceControllers/scheduleController');

const router = express.Router();
``
router.get('/list', getSchedules);
router.get('/buses', getScheduledBuses);
router.get('/buses/route', getScheduledBusesByRoute);

router.get('/:id', getSchedule);
router.put('/', authenticateAdmin, updateSchedule);
router.delete('/:id', authenticateAdmin, deleteSchedule);

module.exports = router;
