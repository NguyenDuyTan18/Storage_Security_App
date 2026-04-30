const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// File CRUD operations
router.post('/upload', upload.single('file'), upload.secureUpload, fileController.upload);
router.get('/', fileController.getAll);
router.get('/:id/download', fileController.download);
router.delete('/:id', fileController.delete);

module.exports = router;