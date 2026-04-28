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
        // Generate unique filename
        const fileId = crypto.randomUUID();
        const ext = path.extname(file.originalname);
        const filename = `${fileId}${ext}`;
        const filePath = path.join(config.uploadDir, filename);

        // Generate encryption key for this file
        const encryptionKey = EncryptionService.generateKey();

        // Read file buffer
        const fileBuffer = file.buffer;

        // Encrypt file
        const { data: encryptedData, iv } = EncryptionService.encryptFile(fileBuffer, encryptionKey);

        // Save encrypted file
        fs.writeFileSync(filePath, encryptedData);

        // Hash the encryption key for storage (to verify later)
        const encryptionKeyHash = EncryptionService.hashKey(encryptionKey);

        // Save file record to database
        const savedFileId = await FileModel.create({
            user_id: userId,
            filename: filename,
            original_name: file.originalname,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.mimetype,
            encryption_iv: iv,
            encryption_key_hash: encryptionKeyHash
        });

        // Log the upload
        await LogModel.log('file_upload', 'file', savedFileId, { 
            original_name: file.originalname, 
            size: file.size 
        }, req);

        return {
            id: savedFileId,
            filename: file.originalname,
            size: file.size,
            created_at: new Date()
        };
    }

    /**
     * Download and decrypt a file
     */
    static async downloadFile(fileId, userId, req = null) {
        // Get file record
        const file = await FileModel.findById(fileId);
        
        if (!file) {
            throw new Error('File not found');
        }

        // Check ownership (admin can access any file)
        if (file.user_id !== userId && req?.user?.role !== 'admin') {
            throw new Error('Access denied');
        }

        // Read encrypted file
        const encryptedData = fs.readFileSync(file.file_path);

        // For demo purposes, we use a derived key
        // In production, you would store the encrypted key per file
        const derivedKey = crypto.scryptSync(userId.toString(), 'salt', 32);

        // Decrypt file
        const decryptedData = EncryptionService.decryptFile(
            encryptedData, 
            derivedKey, 
            file.encryption_iv
        );

        // Log the download
        await LogModel.log('file_download', 'file', fileId, {
            original_name: file.original_name
        }, req);

        return {
            data: decryptedData,
            filename: file.original_name,
            mime_type: file.mime_type
        };
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