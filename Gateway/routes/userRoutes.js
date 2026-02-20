import express from 'express';
import {
    loginUser,
    registerUser,
    getUserProfile,
    verifyUser,
    loginAdmin
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.post('/register', registerUser);
router.post('/verify', verifyUser);
router.get('/profile', authenticateUser, getUserProfile);

export default router;