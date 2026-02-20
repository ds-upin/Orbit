import express from 'express';
import { authenticateUser } from '../middleware/authenticateUser.js';
import { handleWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/', authenticateUser, handleWebhook);

export default router;