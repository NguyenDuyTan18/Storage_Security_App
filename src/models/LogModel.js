const { pool } = require('../config/database');

class LogModel {
    /**
     * Create a new log entry
     */
    static async create(logData) {
        const {
            user_id,
            action,
            target_type,
            target_id,
            ip_address,
            user_agent,
            details
        } = logData;

        const sql = `
            INSERT INTO logs (
                user_id, action, target_type, target_id,
                ip_address, user_agent, details
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            user_id, action, target_type, target_id,
            ip_address, user_agent, details
        ]);

        return result.insertId;
    }

    /**
     * Get logs for a user
     */
    static async getByUserId(userId, limit = 50) {
        const sql = `
            SELECT * FROM logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `;
        const [rows] = await pool.execute(sql, [userId, limit]);
        return rows;
    }

    /**
     * Get all logs (admin only)
     */
    static async getAll(limit = 100) {
        const sql = `
            SELECT l.*, u.username
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT ?
        `;
        const [rows] = await pool.execute(sql, [limit]);
        return rows;
    }

    /**
     * Get logs by action type
     */
    static async getByAction(action, limit = 50) {
        const sql = `
            SELECT l.*, u.username
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.action = ?
            ORDER BY l.created_at DESC
            LIMIT ?
        `;
        const [rows] = await pool.execute(sql, [action, limit]);
        return rows;
    }

    /**
     * Log helper - create and forget
     */
    static async log(action, targetType, targetId, userId, details = {}, req = null) {
        try {
            await this.create({
                user_id: userId,
                action: action,
                target_type: targetType,
                target_id: targetId,
                ip_address: req ? req.ip : null,
                user_agent: req ? req.get('User-Agent') : null,
                details: JSON.stringify(details)
            });
        } catch (error) {
            // Silent fail for logging
            console.error('Log error:', error.message);
        }
    }
}

module.exports = LogModel;