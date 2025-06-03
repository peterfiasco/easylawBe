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
exports.DocumentUploadService = exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const Document_js_1 = __importDefault(require("../models/Document.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure Cloudinary Storage for Multer
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'easylaw/business-services',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
        resource_type: 'auto',
        public_id: (req, file) => {
            const timestamp = Date.now();
            const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            return `${req.user.user_id}_${timestamp}_${sanitizedFileName}`;
        },
        transformation: [
            {
                if: "w_gt_2000_or_h_gt_2000",
                width: 2000,
                height: 2000,
                crop: "limit",
                quality: "auto:good",
                format: "auto"
            }
        ]
    },
});
// File filter for security
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
};
// Configure multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per upload
    }
});
// Document upload service functions
class DocumentUploadService {
    // Save document metadata to database
    static saveDocumentMetadata(uploadData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceRequestId, userId, documentType, documentCategory, file, uploadedBy, description, tags, accessLevel } = uploadData;
                const document = new Document_js_1.default({
                    service_request_id: serviceRequestId,
                    user_id: userId,
                    document_type: documentType || 'upload',
                    document_category: documentCategory,
                    file_name: file.originalname,
                    file_size: file.size,
                    file_type: file.mimetype,
                    cloudinary_public_id: file.public_id,
                    cloudinary_url: file.path,
                    secure_url: file.secure_url,
                    is_confidential: true,
                    access_level: accessLevel || 'client_only',
                    uploaded_by: uploadedBy,
                    description: description || '',
                    tags: tags || [],
                    version: 1
                });
                yield document.save();
                return document;
            }
            catch (error) {
                console.error('Error saving document metadata:', error);
                throw error;
            }
        });
    }
    // Get documents for a service request
    static getServiceDocuments(serviceRequestId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documents = yield Document_js_1.default.find({
                    service_request_id: serviceRequestId,
                    $or: [
                        { user_id: userId },
                        { access_level: { $in: ['public', 'client_only'] } }
                    ]
                }).sort({ created_at: -1 });
                return documents;
            }
            catch (error) {
                console.error('Error fetching service documents:', error);
                throw error;
            }
        });
    }
    // Delete document from Cloudinary and database
    static deleteDocument(documentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const document = yield Document_js_1.default.findOne({
                    _id: documentId,
                    $or: [
                        { user_id: userId },
                        { uploaded_by: userId }
                    ]
                });
                if (!document) {
                    throw new Error('Document not found or access denied');
                }
                // Delete from Cloudinary
                yield cloudinary_1.v2.uploader.destroy(document.cloudinary_public_id);
                // Delete from database
                yield Document_js_1.default.findByIdAndDelete(documentId);
                return { message: 'Document deleted successfully' };
            }
            catch (error) {
                console.error('Error deleting document:', error);
                throw error;
            }
        });
    }
    // Generate secure download URL
    static generateSecureUrl(publicId, expirationTime = 3600) {
        try {
            const secureUrl = cloudinary_1.v2.utils.private_download_url(publicId, 'pdf', {
                resource_type: 'auto',
                expires_at: Math.floor(Date.now() / 1000) + expirationTime
            });
            return secureUrl;
        }
        catch (error) {
            console.error('Error generating secure URL:', error);
            throw error;
        }
    }
    // Create document version
    static createDocumentVersion(originalDocumentId, newFile, uploadedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const originalDoc = yield Document_js_1.default.findById(originalDocumentId);
                if (!originalDoc) {
                    throw new Error('Original document not found');
                }
                const newVersion = new Document_js_1.default({
                    service_request_id: originalDoc.service_request_id,
                    user_id: originalDoc.user_id,
                    document_type: 'upload',
                    document_category: originalDoc.document_category,
                    file_name: newFile.originalname,
                    file_size: newFile.size,
                    file_type: newFile.mimetype,
                    cloudinary_public_id: newFile.public_id,
                    cloudinary_url: newFile.path,
                    secure_url: newFile.secure_url,
                    is_confidential: originalDoc.is_confidential,
                    access_level: originalDoc.access_level,
                    uploaded_by: uploadedBy,
                    description: `Updated version of ${originalDoc.file_name}`,
                    tags: originalDoc.tags,
                    version: originalDoc.version + 1,
                    parent_document_id: originalDocumentId
                });
                yield newVersion.save();
                return newVersion;
            }
            catch (error) {
                console.error('Error creating document version:', error);
                throw error;
            }
        });
    }
}
exports.DocumentUploadService = DocumentUploadService;
exports.default = DocumentUploadService;
