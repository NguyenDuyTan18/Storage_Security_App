const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config/app');
const { testConnection } = require('./config/database');

// Import routes (API)
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const homeRoutes = require('./routes/home');
// Import models
const UserModel = require('./models/UserModel');
const FileModel = require('./models/FileModel');
const LogModel = require('./models/LogModel');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session middleware (simple token-based)
app.use(async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, config.jwtSecret);
            req.user = decoded;
            res.locals.user = decoded;
        } catch (err) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
});

// ==================== FORM HANDLERS ====================

// Handle login form
// app.post('/auth/login', async (req, res) => {
//     const { username, password } = req.body;
    
//     try {
//         const AuthService = require('./services/AuthService');
//         const result = await AuthService.login(username, password, req);
        
//         // Set cookie
//         res.cookie('token', result.token, { 
//             httpOnly: true, 
//             maxAge: 24 * 60 * 60 * 1000 // 24 hours
//         });
        
//         res.redirect('/dashboard');
//     } catch (error) {
//         res.render('login', { error: error.message });
//     }
// });

// Handle register form
// app.post('/auth/register', async (req, res) => {
//     const { username, email, password, confirmPassword } = req.body;
    
//     // Validate
//     if (password !== confirmPassword) {
//         return res.render('register', { error: 'Mật khẩu không khớp' });
//     }
    
//     if (password.length < 6) {
//         return res.render('register', { error: 'Mật khẩu phải có ít nhất 6 ký tự' });
//     }
    
//     try {
//         const AuthService = require('./services/AuthService');
//         await AuthService.register({ username, email, password });
        
//         res.redirect('/auth/login?registered=true');
//     } catch (error) {
//         res.render('register', { error: error.message });
//     }
// });

// Handle file upload form
// app.post('/files/upload', async (req, res) => {
//     if (!req.user) {
//         return res.redirect('/auth/login');
//     }
    
//     // Multer middleware will handle the file
//     const upload = require('./middleware/upload');
    
//     upload.single('file')(req, res, async (err) => {
//         if (err) {
//             return res.redirect('/dashboard?error=' + encodeURIComponent(err.message));
//         }
        
//         if (!req.file) {
//             return res.redirect('/dashboard?error=Không có file được chọn');
//         }
        
//         try {
//             const FileService = require('./services/FileService');
//             await FileService.uploadFile(req.file, req.user.id, req);
//             res.redirect('/dashboard?success=Upload thành công');
//         } catch (error) {
//             res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
//         }
//     });
// });

// Handle file download
// app.get('/files/download/:id', async (req, res) => {
//     if (!req.user) {
//         return res.redirect('/auth/login');
//     }
    
//     try {
//         const FileService = require('./services/FileService');
//         const result = await FileService.downloadFile(req.params.id, req.user.id, req);
        
//         res.setHeader('Content-Type', result.mime_type);
//         res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
//         res.send(result.data);
//     } catch (error) {
//         res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
//     }
// });

// Handle file delete
// app.get('/files/delete/:id', async (req, res) => {
//     if (!req.user) {
//         return res.redirect('/auth/login');
//     }
    
//     try {
//         const FileService = require('./services/FileService');
//         await FileService.deleteFile(req.params.id, req.user.id, req);
//         res.redirect('/dashboard?success=Xóa thành công');
//     } catch (error) {
//         res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
//     }
// });

// ==================== API ROUTES ====================

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/', homeRoutes);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
    try {
        await testConnection();
        
        app.listen(config.port, () => {
            console.log(`🚀 Server running on http://localhost:${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;