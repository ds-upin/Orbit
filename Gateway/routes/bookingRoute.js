const express = require('express');
const { initiateBooking } = require('../controllers/bookingController');

const router = express.Router();

router.post('/',initiateBooking);

module.exports = router;