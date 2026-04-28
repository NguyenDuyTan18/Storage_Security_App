const AuthService = require('../services/AuthService');

/**
 * Register new user
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email ) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = await AuthService.register({ username, email, password });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await AuthService.login(username, password, req);
        //res.json(result);

        // Set cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS khi deploy
            maxAge: 3600000 // 1 giờ
        });

        return res.redirect('/dashboard');
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};