const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const LogModel = require('../models/LogModel');
const config = require('../config/app');

class AuthService {
    /**
     * Register a new user
     */
    static async register(userData) {
        const { username, email, password } = userData;

        // Check if username exists
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Check if email exists
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const userId = await UserModel.create({
            username,
            email,
            password_hash,
            role: 'user'
        });

        return { id: userId, username, email };
    }

    /**
     * Login user
     */
    static async login(username, password, req = null) {
        // Find user
        const user = await UserModel.findByUsername(username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            // Log failed login attempt
            await LogModel.log('login_failed', 'user', user.id, { username }, req);
            throw new Error('Invalid username or password');
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpire }
        );

        // Log successful login
        await LogModel.log('login_success', 'user', user.id, {}, req);

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
    }

    /**
     * Verify JWT token
     */
    static verifyToken(token) {
        try {
            console.log('Verifying token:', token); 
            return jwt.verify(token, config.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = AuthService;