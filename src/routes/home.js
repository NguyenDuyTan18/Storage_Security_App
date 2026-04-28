const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Public routes
router.get('/', homeController.home);
router.get('/login', homeController.getLogin);
router.get('/register', homeController.getRegister);
router.get('/dashboard', homeController.getDashboard);
router.get('/logout', homeController.logout);
module.exports = router;
