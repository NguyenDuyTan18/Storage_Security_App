// Import hàm executeQuery từ file cấu hình database của bạn
const { executeQuery } = require('../config/database'); 

class FileModel {
    /**
     * Tạo bản ghi file mới
     */
    static async create(data) {
        const sql = `
            INSERT INTO files (
                user_id, filename, original_name, file_path, file_size,
                mime_type, encryption_iv, encrypted_file_key, key_wrap_iv
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.user_id,
            data.filename,
            data.original_name,
            data.file_path,
            data.file_size ?? 0,
            data.mime_type ?? 'application/octet-stream',
            data.encryption_iv,
            data.encrypted_file_key,
            data.key_wrap_iv
        ];

        // Sử dụng executeQuery đã được bọc sẵn try/catch
        const result = await executeQuery(sql, params);
        return result.insertId;
    }

    /**
     * Tìm file theo ID để giải mã
     */
    static async findById(id) {
        const sql = 'SELECT * FROM files WHERE id = ?';
        const rows = await executeQuery(sql, [id]);
        return rows[0]; // Trả về bản ghi đầu tiên
    }

    /**
     * Lấy danh sách file của một User cụ thể
     */
    static async getByUserId(userId) {
        const sql = `
            SELECT id, original_name, file_size, mime_type, created_at 
            FROM files 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        return await executeQuery(sql, [userId]);
    }

    /**
     * Lấy tất cả file kèm tên User (Dành cho Admin)
     */
    static async getAll() {
        const sql = `
            SELECT f.*, u.username 
            FROM files f
            JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `;
        return await executeQuery(sql);
    }

    /**
     * Xóa file khỏi database
     */
    static async delete(id, userId) {
        const sql = 'DELETE FROM files WHERE id = ? AND user_id = ?';
        const result = await executeQuery(sql, [id, userId]);
        return result.affectedRows;
    }

    /**
     * Đếm tổng số file của User
     */
    static async getUserFileCount(userId) {
        const sql = 'SELECT COUNT(*) as count FROM files WHERE user_id = ?';
        const rows = await executeQuery(sql, [userId]);
        return rows[0]?.count || 0;
    }
}

module.exports = FileModel;