const multer = require('multer');
const crypto = require('crypto');
const config = require('../config/app');

/**
 * Configure multer for file upload
 * Stores files in memory (for encryption)
 */
const storage = multer.memoryStorage();

/**
 * File filter - allow only safe file types
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.maxFileSize
    },
    fileFilter: fileFilter
});

module.exports = upload;