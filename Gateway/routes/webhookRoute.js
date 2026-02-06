const express = require('express');
const { authenticateUser } = require('../middleware/authenticateUser');
const { handleWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/', authenticateUser, handleWebhook);

module.exports = router;