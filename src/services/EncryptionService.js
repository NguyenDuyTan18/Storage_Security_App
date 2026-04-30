const crypto = require('crypto');

class EncryptionService {
    /**
     * Helper: Tạo IV ngẫu nhiên
     */
    static generateIV() {
        return crypto.randomBytes(16);
    }

    /**
     * Helper: Tạo Key ngẫu nhiên cho file
     */
    static generateKey() {
        return crypto.randomBytes(32);
    }

    /**
     * Mã hóa dữ liệu File (Sử dụng AES-256-CTR cho hiệu năng tốt)
     */
    static encryptFile(buffer, key) {
        // Thay 'this' bằng 'EncryptionService' hoặc gọi trực tiếp crypto
        const iv = EncryptionService.generateIV();
        const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
        
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        
        return {
            data: encrypted,
            iv: iv.toString('hex')
        };
    }

    /**
     * Giải mã dữ liệu File
     */
    static decryptFile(buffer, key, ivHex) {
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
        
        const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
        return decrypted;
    }

    /**
     * Mã hóa File Key bằng Master Key (từ .env)
     * Đây là hàm bạn cần dùng khi Upload
     */
    static wrapKey(fileKey) {
        const masterKeyHex = process.env.MASTER_KEY;
        if (!masterKeyHex) throw new Error("MASTER_KEY not found in .env");

        const masterKey = Buffer.from(masterKeyHex, 'hex');
        const iv = EncryptionService.generateIV();
        
        const cipher = crypto.createCipheriv('aes-256-cbc', masterKey, iv);
        
        let encryptedKey = cipher.update(fileKey);
        encryptedKey = Buffer.concat([encryptedKey, cipher.final()]);
        
        return {
            encryptedKey: encryptedKey.toString('hex'),
            keyIv: iv.toString('hex')
        };
    }

    /**
     * Giải mã File Key bằng Master Key (từ .env)
     * Đây là hàm bạn cần dùng khi Download
     */
    static unwrapKey(encryptedKeyHex, ivHex) {
        const masterKeyHex = process.env.MASTER_KEY;
        if (!masterKeyHex) throw new Error("MASTER_KEY not found in .env");

        const masterKey = Buffer.from(masterKeyHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedKey = Buffer.from(encryptedKeyHex, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', masterKey, iv);
        
        let decryptedKey = decipher.update(encryptedKey);
        decryptedKey = Buffer.concat([decryptedKey, decipher.final()]);
        
        return decryptedKey; 
    }

    /**
     * Các hàm bổ sung cho PBKDF2 (Nếu bạn vẫn muốn giữ)
     */
    static generateSalt() {
        return crypto.randomBytes(32);
    }

    static deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    }
}

module.exports = EncryptionService;