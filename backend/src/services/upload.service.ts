import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const filename = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// o filtro de arquivo 
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedExtensions = ['.mp3', '.mp4', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.mov', '.avi'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true); // Aceita o arquivo
  } else {
    cb(new Error('Formato de arquivo inválido.'), false); // Rejeita o arquivo
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB limite
  fileFilter
});
