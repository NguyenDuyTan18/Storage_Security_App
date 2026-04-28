const { pool } = require('../config/database');

class UserModel {
    /**
     * Create a new user
     */
    static async create(userData) {
        const { username, email, password_hash, role = 'user' } = userData;
        const sql = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(sql, [username, email, password_hash, role]);
        return result.insertId;
    }

    /**
     * Find user by username
     */
    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await pool.execute(sql, [username]);
        return rows[0];
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute(sql, [email]);
        return rows[0];
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const sql = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    }

    /**
     * Get all users (admin only)
     */
    static async getAll() {
        const sql = 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC';
        const [rows] = await pool.execute(sql);
        return rows;
    }

    /**
     * Update user
     */
    static async update(id, userData) {
        const { email, role } = userData;
        const sql = 'UPDATE users SET email = ?, role = ? WHERE id = ?';
        const [result] = await pool.execute(sql, [email, role, id]);
        return result.affectedRows;
    }

    /**
     * Delete user
     */
    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = UserModel;