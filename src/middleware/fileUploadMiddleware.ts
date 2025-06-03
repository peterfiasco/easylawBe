import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { Request } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File type validation
const allowedFileTypes = {
  documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  templates: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
  business_docs: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt']
};

// File size limits (in bytes)
const fileSizeLimits = {
  documents: 10 * 1024 * 1024, // 10MB
  images: 5 * 1024 * 1024,     // 5MB
  templates: 15 * 1024 * 1024, // 15MB
  business_docs: 20 * 1024 * 1024 // 20MB
};

// Create file filter function
const createFileFilter = (category: keyof typeof allowedFileTypes) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedTypes = allowedFileTypes[category];
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  };
};

// Create Cloudinary storage configuration
const createCloudinaryStorage = (folder: string) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `easylaw/${folder}`,
      allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'odt'],
      resource_type: 'auto',
      public_id: (req: Request, file: Express.Multer.File) => {
        const timestamp = Date.now();
        const fileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
        return `${fileName}_${timestamp}`;
      },
    } as any,
  });
};

// Template file upload middleware
export const templateFileUpload = multer({
  storage: createCloudinaryStorage('templates'),
  fileFilter: createFileFilter('templates'),
  limits: {
    fileSize: fileSizeLimits.templates,
    files: 1
  }
}).single('template_file');

// Business document upload middleware (multiple files)
export const businessDocumentUpload = multer({
  storage: createCloudinaryStorage('business_documents'),
  fileFilter: createFileFilter('business_docs'),
  limits: {
    fileSize: fileSizeLimits.business_docs,
    files: 10 // Allow up to 10 files
  }
}).array('documents', 10);

// Single business document upload
export const singleBusinessDocumentUpload = multer({
  storage: createCloudinaryStorage('business_documents'),
  fileFilter: createFileFilter('business_docs'),
  limits: {
    fileSize: fileSizeLimits.business_docs,
    files: 1
  }
}).single('document');

// Profile image upload middleware
export const profileImageUpload = multer({
  storage: createCloudinaryStorage('profiles'),
  fileFilter: createFileFilter('images'),
  limits: {
    fileSize: fileSizeLimits.images,
    files: 1
  }
}).single('profile_image');

// General document upload middleware
export const documentUpload = multer({
  storage: createCloudinaryStorage('documents'),
  fileFilter: createFileFilter('documents'),
  limits: {
    fileSize: fileSizeLimits.documents,
    files: 5
  }
}).array('files', 5);

// Error handling middleware for file uploads
export const handleFileUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large',
        error: 'Please upload a smaller file'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        error: 'Please upload fewer files'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        error: 'Please check the file field name'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      error: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
};

// Utility function to delete file from Cloudinary
export const deleteCloudinaryFile = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

// Utility function to get file info from Cloudinary URL
export const getCloudinaryPublicId = (url: string): string | null => {
  try {
    const regex = /\/easylaw\/.*\/([^\/]+)\./;
    const match = url.match(regex);
    return match ? `easylaw/${match[1]}` : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

export default {
  templateFileUpload,
  businessDocumentUpload,
  singleBusinessDocumentUpload,
  profileImageUpload,
  documentUpload,
  handleFileUploadError,
  deleteCloudinaryFile,
  getCloudinaryPublicId
};
