require('dotenv').config();

module.exports = {
    port: process.env.PORT ,
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '24h',
    uploadDir: process.env.UPLOAD_DIR || './src/uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
    encryptionAlgorithm: 'aes-256-cbc'
};