import multer from 'multer';
import path from 'path';

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Create template file upload middleware
export const templateFileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only doc, docx, and pdf files
    const allowedTypes = ['.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .doc, .docx, and .pdf files are allowed'));
    }
  }
}).single('templateFile');
