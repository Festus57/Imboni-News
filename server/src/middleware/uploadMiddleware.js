import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Local disk storage (simple — no Cloudinary API key needed) ───
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// ─── Upload middleware — uses local disk storage ───
export const uploadImage = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export const uploadVideo = multer({
  storage: localStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

export const uploadAudio = multer({
  storage: localStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// General file upload — accepts any type (images, videos, audio)
export const uploadAny = multer({
  storage: localStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});
