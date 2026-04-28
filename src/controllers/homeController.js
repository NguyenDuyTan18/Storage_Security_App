const FileModel = require('../models/FileModel');
const UserModel = require('../models/UserModel');
/**
 * Render login page
 */
exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
};

/**
 * Render register page
 */
exports.getRegister = (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null });
};

/**
 * Render dashboard with user files
 */
exports.getDashboard = async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    try {
        const user = await UserModel.findById(req.user.id);
        const files = await FileModel.getByUserId(req.user.id);
        res.render('dashboard', { user: user, files: files });
    } catch (error) {
        console.error('Error loading files:', error.message);
        res.render('dashboard', { user: req.user, files: [] });
    }
};

/**
 * Handle logout
 */
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};

/**
 * Home redirect
 */
exports.home = (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
};