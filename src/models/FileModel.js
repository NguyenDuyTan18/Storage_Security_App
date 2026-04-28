const { pool } = require('../config/database');

class FileModel {
    /**
     * Create a new file record
     */
    static async create(fileData) {
        const {
            user_id,
            filename,
            original_name,
            file_path,
            file_size,
            mime_type,
            encryption_iv,
            encryption_key_hash
        } = fileData;

        const sql = `
            INSERT INTO files (
                user_id, filename, original_name, file_path, file_size,
                mime_type, encryption_iv, encryption_key_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            user_id, filename, original_name, file_path, file_size,
            mime_type, encryption_iv, encryption_key_hash
        ]);

        return result.insertId;
    }

    /**
     * Find file by ID
     */
    static async findById(id) {
        const sql = 'SELECT * FROM files WHERE id = ?';
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    }

    /**
     * Get all files for a user
     */
    static async getByUserId(userId) {
        const sql = `
            SELECT id, original_name, file_path, file_size, mime_type,
                   encryption_iv, created_at
            FROM files
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    }

    /**
     * Get all files (admin only)
     */
    static async getAll() {
        const sql = `
            SELECT f.*, u.username
            FROM files f
            JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `;
        const [rows] = await pool.execute(sql);
        return rows;
    }

    /**
     * Delete file by ID
     */
    static async delete(id, userId) {
        const sql = 'DELETE FROM files WHERE id = ? AND user_id = ?';
        const [result] = await pool.execute(sql, [id, userId]);
        return result.affectedRows;
    }

    /**
     * Get file count for a user
     */
    static async getUserFileCount(userId) {
        const sql = 'SELECT COUNT(*) as count FROM files WHERE user_id = ?';
        const [rows] = await pool.execute(sql, [userId]);
        return rows[0].count;
    }
}

module.exports = FileModel;