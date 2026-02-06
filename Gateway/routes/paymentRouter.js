const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authenticateUser')

const router = express.Router();

router.post('/create-intent',authenticateUser, createPaymentIntent);

module.exports = router;