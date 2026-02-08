const { loginUser, registerUser, getUserProfile, verifyUser, loginAdmin } = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authenticateUser');
const express = require('express');
const router = express.Router();

router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.post('/register', registerUser);
router.post('/verify', verifyUser);
router.get('/profile', authenticateUser, getUserProfile);

module.exports = router;