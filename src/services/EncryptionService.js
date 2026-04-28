const crypto = require('crypto');
const config = require('../config/app');

class EncryptionService {
    /**
     * Generate a random encryption key (32 bytes for AES-256)
     */
    static generateKey() {
        return crypto.randomBytes(32);
    }

    /**
     * Generate a random IV (16 bytes for AES-256-CBC)
     */
    static generateIV() {
        return crypto.randomBytes(16);
    }

    /**
     * Encrypt data using AES-256-CBC
     */
    static encrypt(data, key, iv) {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return encrypted;
    }

    /**
     * Decrypt data using AES-256-CBC
     */
    static decrypt(encryptedData, key, iv) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Encrypt file buffer
     */
    static encryptFile(buffer, key) {
        const iv = this.generateIV();
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        const encrypted = Buffer.concat([
            cipher.update(buffer),
            cipher.final()
        ]);
        
        return {
            data: encrypted,
            iv: iv.toString('hex')
        };
    }

    /**
     * Decrypt file buffer
     */
    static decryptFile(encryptedBuffer, key, ivHex) {
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        return Buffer.concat([
            decipher.update(encryptedBuffer),
            decipher.final()
        ]);
    }

    /**
     * Hash a key for storage (not the same as encrypting)
     */
    static hashKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
}

module.exports = EncryptionService;