const express = require('express');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

const uploadLimit = 5 * 1024 * 1024;

const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return midnight - now;
};

const uploadLimiter = rateLimit({
    windowMs: getTimeUntilMidnight(),
    max: 20, 
    message: { error: 'You have exceeded the 20 uploads per day limit!' },
    handler: (req, res, next, options) => {
        if (options.current === 1) {
            options.windowMs = getTimeUntilMidnight(); 
        }
        res.status(options.statusCode).json(options.message);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: uploadLimit }, 
});


app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', uploadLimiter, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.json({ error: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ file_url: fileUrl });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
