const FileService = require('../services/FileService');

/**
 * Upload a file
 */
exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await FileService.uploadFile(req.file, req.user.id, req);
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Download a file
 */
exports.download = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await FileService.downloadFile(id, userId, req);

        res.setHeader('Content-Type', result.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.data);
    } catch (error) {
        if (error.status === 403) {
            const statusCode = error.status || 500; 
            res.status(statusCode).json({ error: error.message });
        }
    };
}

/**
 * Delete a file
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await FileService.deleteFile(id, req.user.id, req);
        res.redirect('/dashboard');
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

/**
 * Get all user files
 */
exports.getAll = async (req, res) => {
    try {
        const files = await FileService.getUserFiles(req.user.id);
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};