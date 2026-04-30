const multer = require('multer');
const crypto = require('crypto');
const config = require('../config/app');
const FileType = require('file-type');
const ClamScan = require('clamscan');
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
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',                                          
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const secureUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            console.error('No file uploaded', req.file); ;
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const buffer = req.file.buffer;

        // 1. Check magic number
        const type = await FileType.fromBuffer(buffer);
        if (!type) throw new Error('Unknown file type');

        // // 2. Scan virus
        // const clamscan = await new ClamScan().init();
        // const { isInfected } = await clamscan.scanBuffer(buffer);

        // if (isInfected) {
        //     throw new Error('Virus detected');
        // }

        // 3. Optional content check
        const content = buffer.toString('utf-8');
        if (content.includes('<script>')) {
            throw new Error('Malicious content');
        }

        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.maxFileSize,
        fieldSize: 50 * 1024 * 1024
    },
    fileFilter: fileFilter
});

module.exports = {
    single: (fieldName) => upload.single(fieldName), // Trả về function của multer
    secureUpload: secureUpload
};