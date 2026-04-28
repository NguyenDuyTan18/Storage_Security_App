const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Protected routes
router.get('/profile', require('../middleware/auth').authenticate, authController.getProfile);

module.exports = router;