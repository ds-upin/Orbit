const express = require('express');
const { initiateBooking } = require('../controllers/bookingController');
const { authenticateUser } = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, initiateBooking);

module.exports = router;