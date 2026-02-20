import express from 'express';
import { initiateBooking } from '../controllers/bookingController.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const router = express.Router();

router.post('/', authenticateUser, initiateBooking);

export default router;