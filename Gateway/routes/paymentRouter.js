import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const router = express.Router();

router.post('/create-intent', authenticateUser, createPaymentIntent);

export default router;