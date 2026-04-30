const AuthService = require('../services/AuthService');

/**
 * Middleware to verify JWT token
 */
// const authenticate = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
        
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({ error: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];
//         const decoded = AuthService.verifyToken(token);
//         console.log('Decoded token:', decoded);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(401).json({ error: 'Invalid token' });
//     }
// };

const authenticate = (req, res, next) => {
    try {
        // Ưu tiên lấy token từ Cookie (cho trình duyệt) hoặc Header (cho API/Postman)
        const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);

        if (!token) {
            // Nếu request đòi hỏi JSON (từ fetch/axios/postman)
            if (req.xhr || req.headers.accept?.includes('json')) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            // Nếu là trình duyệt truy cập trực tiếp
            return res.redirect('/login');
        }

        const decoded = AuthService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        // Token sai hoặc hết hạn -> Xóa cookie và bắt login lại
        res.clearCookie('token');
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(401).json({ error: 'Session expired' });
        }
        return res.redirect('/login');
    }
};

/**
 * Middleware to check admin role
 */
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = {
    authenticate,
    requireAdmin
};