const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FileModel = require('../models/FileModel');
const EncryptionService = require('./EncryptionService');
const LogModel = require('../models/LogModel');
const config = require('../config/app');

class FileService {
    /**
     * Upload and encrypt a file
     */
    static async uploadFile(file, userId, req = null) {
        const fileId = crypto.randomUUID();
        const filePath = path.join(config.uploadDir, `${fileId}${path.extname(file.originalname)}`);

        // 1. Tạo key ngẫu nhiên cho file này
        const fileKey = crypto.randomBytes(32); 

        // 2. Mã hóa file bằng fileKey
        const { data: encryptedData, iv: fileIv } = EncryptionService.encryptFile(file.buffer, fileKey);
        fs.writeFileSync(filePath, encryptedData);

        // 3. MÃ HÓA CÁI KEY bằng Master Key (Key Wrap)
        const { encryptedKey, keyIv } = EncryptionService.wrapKey(fileKey);

        // console.log("DEBUG VALUES:", {
        //     userId,
        //     fileIv,
        //     encryptedKey,
        //     keyIv,
        //     size: file.size,
        //     mime: file.mimetype
        // });

        // 4. Lưu vào DB
        const savedFileId = await FileModel.create({
            user_id: userId,
            filename: `${fileId}${path.extname(file.originalname)}`,
            original_name: file.originalname,
            file_path: filePath,
            
            // BỔ SUNG 2 DÒNG NÀY:
            file_size: file.size,        // Phải đúng tên 'file_size' như Model mong đợi
            mime_type: file.mimetype,    // Phải đúng tên 'mime_type' như Model mong đợi
            
            encryption_iv: fileIv,
            encrypted_file_key: encryptedKey,
            key_wrap_iv: keyIv
        });

        return { id: savedFileId, filename: file.originalname };
}

    /**
     * Download and decrypt a file
     */
    static async downloadFile(fileId, userId, req = null) {
        const file = await FileModel.findById(fileId);
        if (!file) throw new Error('File not found');
        // Tránh IDOR 
        const isOwner = await FileModel.findUserFileById(fileId) === userId;
        if (!isOwner){ 
            const error = new Error('Access denied');
            error.status = 403; // Gán mã lỗi trực tiếp vào object error
            throw error; 
        }
        // 1. Dùng Master Key từ .env để giải mã lấy lại File Key gốc
        const originalFileKey = EncryptionService.unwrapKey(
            file.encrypted_file_key, 
            file.key_wrap_iv
        );

        // 2. Đọc file đã mã hóa từ ổ cứng
        const encryptedData = fs.readFileSync(file.file_path);

        // 3. Giải mã file bằng key gốc đã lấy lại được
        const decryptedData = EncryptionService.decryptFile(
            encryptedData, 
            originalFileKey, 
            file.encryption_iv
        );

        return { data: decryptedData, filename: file.original_name, mime_type: file.mime_type };
}

    /**
     * Delete a file
     */
    static async deleteFile(fileId, userId, req = null) {
        // Get file record
        const file = await FileModel.findById(fileId);
        
        if (!file) {
            throw new Error('File not found');
        }

        // Check ownership
        if (file.user_id !== userId) {
            throw new Error('Access denied');
        }

        // Delete physical file
        if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
        }

        // Delete database record
        await FileModel.delete(fileId, userId);

        // Log the deletion
        await LogModel.log('file_delete', 'file', fileId, {
            original_name: file.original_name
        }, req);

        return true;
    }

    /**
     * Get all files for a user
     */
    static async getUserFiles(userId) {
        return await FileModel.getByUserId(userId);
    }

    /**
     * Get all files (admin only)
     */
    static async getAllFiles() {
        return await FileModel.getAll();
    }
}

module.exports = FileService;