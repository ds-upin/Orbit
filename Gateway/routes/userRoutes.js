const {loginUser, registerUser, getUserProfile, verifyUser} = require('../controllers/userController');
const authenticateUser = require('../middleware/authenticateUser');
const express = require('express');
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify', verifyUser);
router.get('/profile',  authenticateUser, getUserProfile);

module.exports = router;