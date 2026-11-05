import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(__dirname, '../../public/uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg',
  'application/pdf',
]);

const extensionByMime = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp', 'image/avif': '.avif',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
  'audio/mpeg': '.mp3', 'audio/mp4': '.m4a', 'audio/wav': '.wav', 'audio/ogg': '.ogg',
  'application/pdf': '.pdf',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  filename: (_req, file, cb) => {
    const extension = extensionByMime[file.mimetype] || '.bin';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname.replace(/[^a-z0-9_-]/gi, '')}-${unique}${extension}`);
  },
});

const filterAllowed = (_req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported file type. Upload an image, video, audio file or PDF.'));
};

const createUpload = (maxFileSize) => multer({
  storage,
  limits: { fileSize: maxFileSize, files: 1 },
  fileFilter: filterAllowed,
});

export const uploadImage = createUpload(10 * 1024 * 1024);
export const uploadVideo = createUpload(250 * 1024 * 1024);
export const uploadAudio = createUpload(50 * 1024 * 1024);
export const uploadAny = createUpload(250 * 1024 * 1024);
