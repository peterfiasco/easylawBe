import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Document from '../models/Document.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
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
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// Document upload service functions
export class DocumentUploadService {
  // Save document metadata to database
  static async saveDocumentMetadata(uploadData) {
    try {
      const {
        serviceRequestId,
        userId,
        documentType,
        documentCategory,
        file,
        uploadedBy,
        description,
        tags,
        accessLevel
      } = uploadData;

      const document = new Document({
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

      await document.save();
      return document;
    } catch (error) {
      console.error('Error saving document metadata:', error);
      throw error;
    }
  }

  // Get documents for a service request
  static async getServiceDocuments(serviceRequestId, userId) {
    try {
      const documents = await Document.find({
        service_request_id: serviceRequestId,
        $or: [
          { user_id: userId },
          { access_level: { $in: ['public', 'client_only'] } }
        ]
      }).sort({ created_at: -1 });

      return documents;
    } catch (error) {
      console.error('Error fetching service documents:', error);
      throw error;
    }
  }

  // Delete document from Cloudinary and database
  static async deleteDocument(documentId, userId) {
    try {
      const document = await Document.findOne({
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
      await cloudinary.uploader.destroy(document.cloudinary_public_id);

      // Delete from database
      await Document.findByIdAndDelete(documentId);

      return { message: 'Document deleted successfully' };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Generate secure download URL
  static generateSecureUrl(publicId, expirationTime = 3600) {
    try {
      const secureUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
        resource_type: 'auto',
        expires_at: Math.floor(Date.now() / 1000) + expirationTime
      });

      return secureUrl;
    } catch (error) {
      console.error('Error generating secure URL:', error);
      throw error;
    }
  }

  // Create document version
  static async createDocumentVersion(originalDocumentId, newFile, uploadedBy) {
    try {
      const originalDoc = await Document.findById(originalDocumentId);
      if (!originalDoc) {
        throw new Error('Original document not found');
      }

      const newVersion = new Document({
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

      await newVersion.save();
      return newVersion;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw error;
    }
  }
}

export default DocumentUploadService;