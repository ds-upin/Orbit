const express = require('express');
const { addSeat, deleteSeat } = require('../controllers/busServiceControllers/seatController')
router = express.Router();

router.post('/',addSeat);
router.delete('/',deleteSeat);

module.exports = router;