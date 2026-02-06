const express = require('express');
const { authenticateAdmin } = require('../middleware/authenticateAdmin')
const { addSeat, deleteSeat } = require('../controllers/busServiceControllers/seatController')
router = express.Router();

router.post('/', authenticateAdmin, addSeat);
router.delete('/', authenticateAdmin, deleteSeat);

module.exports = router;