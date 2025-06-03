"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryPublicId = exports.deleteCloudinaryFile = exports.handleFileUploadError = exports.documentUpload = exports.profileImageUpload = exports.singleBusinessDocumentUpload = exports.businessDocumentUpload = exports.templateFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
// Configure Cloudinary
cloudinary_1.v2.config({
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
    images: 5 * 1024 * 1024, // 5MB
    templates: 15 * 1024 * 1024, // 15MB
    business_docs: 20 * 1024 * 1024 // 20MB
};
// Create file filter function
const createFileFilter = (category) => {
    return (req, file, cb) => {
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        const allowedTypes = allowedFileTypes[category];
        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
        }
    };
};
// Create Cloudinary storage configuration
const createCloudinaryStorage = (folder) => {
    return new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            folder: `easylaw/${folder}`,
            allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'odt'],
            resource_type: 'auto',
            public_id: (req, file) => {
                const timestamp = Date.now();
                const fileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
                return `${fileName}_${timestamp}`;
            },
        },
    });
};
// Template file upload middleware
exports.templateFileUpload = (0, multer_1.default)({
    storage: createCloudinaryStorage('templates'),
    fileFilter: createFileFilter('templates'),
    limits: {
        fileSize: fileSizeLimits.templates,
        files: 1
    }
}).single('template_file');
// Business document upload middleware (multiple files)
exports.businessDocumentUpload = (0, multer_1.default)({
    storage: createCloudinaryStorage('business_documents'),
    fileFilter: createFileFilter('business_docs'),
    limits: {
        fileSize: fileSizeLimits.business_docs,
        files: 10 // Allow up to 10 files
    }
}).array('documents', 10);
// Single business document upload
exports.singleBusinessDocumentUpload = (0, multer_1.default)({
    storage: createCloudinaryStorage('business_documents'),
    fileFilter: createFileFilter('business_docs'),
    limits: {
        fileSize: fileSizeLimits.business_docs,
        files: 1
    }
}).single('document');
// Profile image upload middleware
exports.profileImageUpload = (0, multer_1.default)({
    storage: createCloudinaryStorage('profiles'),
    fileFilter: createFileFilter('images'),
    limits: {
        fileSize: fileSizeLimits.images,
        files: 1
    }
}).single('profile_image');
// General document upload middleware
exports.documentUpload = (0, multer_1.default)({
    storage: createCloudinaryStorage('documents'),
    fileFilter: createFileFilter('documents'),
    limits: {
        fileSize: fileSizeLimits.documents,
        files: 5
    }
}).array('files', 5);
// Error handling middleware for file uploads
const handleFileUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.handleFileUploadError = handleFileUploadError;
// Utility function to delete file from Cloudinary
const deleteCloudinaryFile = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        return result.result === 'ok';
    }
    catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return false;
    }
});
exports.deleteCloudinaryFile = deleteCloudinaryFile;
// Utility function to get file info from Cloudinary URL
const getCloudinaryPublicId = (url) => {
    try {
        const regex = /\/easylaw\/.*\/([^\/]+)\./;
        const match = url.match(regex);
        return match ? `easylaw/${match[1]}` : null;
    }
    catch (error) {
        console.error('Error extracting public ID from URL:', error);
        return null;
    }
};
exports.getCloudinaryPublicId = getCloudinaryPublicId;
exports.default = {
    templateFileUpload: exports.templateFileUpload,
    businessDocumentUpload: exports.businessDocumentUpload,
    singleBusinessDocumentUpload: exports.singleBusinessDocumentUpload,
    profileImageUpload: exports.profileImageUpload,
    documentUpload: exports.documentUpload,
    handleFileUploadError: exports.handleFileUploadError,
    deleteCloudinaryFile: exports.deleteCloudinaryFile,
    getCloudinaryPublicId: exports.getCloudinaryPublicId
};
