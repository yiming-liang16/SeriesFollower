import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/posters';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `poster_${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!ok.includes(file.mimetype)) {
    return cb(new Error('Only png/jpg/jpeg/webp images are allowed'));
  }
  cb(null, true);
}

export const uploadPoster = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
