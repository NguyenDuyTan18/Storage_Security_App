const mysql = require('mysql2/promise');

/**
 * Database Configuration
 * Use environment variables in production
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'securesystem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

/**
 * Create connection pool to MySQL
 * Pool reuses connections for better performance
 */
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
}

/**
 * Execute SQL with parameterized queries to prevent SQL injection
 */
async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ SQL Error:', error.message);
        throw error;
    }
}

/**
 * Close all connections in the pool
 */
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Database pool closed');
    } catch (error) {
        console.error('❌ Error closing pool:', error.message);
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    closePool
};