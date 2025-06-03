"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.uploadDocumentForAnalysis = exports.uploadDueDiligenceDocuments = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer for memory storage (like DocumentTemplateAdmin)
const storage = multer_1.default.memoryStorage();
// ✅ YOUR EXISTING FILE FILTER (UNCHANGED)
const fileFilter = (req, file, cb) => {
    // Allow document types and images (NO VIDEOS)
    const allowedTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp'
        // ❌ NO VIDEO TYPES ALLOWED
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT and image files (JPG, PNG, GIF, BMP, WEBP) are allowed. Videos are not permitted.'));
    }
};
// ✅ YOUR EXISTING MULTER CONFIG (UNCHANGED)
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 10 // Maximum 10 files
    }
});
// ✅ YOUR EXISTING EXPORT (UNCHANGED)
exports.uploadDueDiligenceDocuments = upload.array('supporting_documents', 10);
// ✅ NEW ADDITION - Document Analysis File Filter
const documentFileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed for document analysis.'));
    }
};
// ✅ NEW ADDITION - Document Upload Config
const documentUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
        files: 1 // Single file only
    }
});
// ✅ NEW EXPORT (ADDITION, NOT REPLACEMENT)
exports.uploadDocumentForAnalysis = documentUpload.single('document');
// ✅ YOUR EXISTING ERROR HANDLER (ENHANCED BUT NOT REPLACED)
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 15MB for document analysis, 10MB for other uploads.' // Enhanced message
            });
            return;
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed for due diligence, 1 file for document analysis.' // Enhanced message
            });
            return;
        }
    }
    if (error.message.includes('Invalid file type')) {
        res.status(400).json({
            success: false,
            message: error.message
        });
        return;
    }
    next(error);
};
exports.handleMulterError = handleMulterError;
