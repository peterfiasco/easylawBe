"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const DocumentSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    format: {
        type: String,
        default: 'html'
    },
    service_request_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'Service request ID is required']
    },
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    document_type: {
        type: String,
        enum: ['upload', 'generated', 'certificate', 'report'],
        required: [true, 'Document type is required']
    },
    document_category: {
        type: String,
        required: [true, 'Document category is required'],
        trim: true
    },
    file_name: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    file_size: {
        type: Number,
        required: [true, 'File size is required'],
        min: 0
    },
    file_type: {
        type: String,
        required: [true, 'File type is required'],
        trim: true
    },
    cloudinary_public_id: {
        type: String,
        required: [true, 'Cloudinary public ID is required'],
        trim: true
    },
    cloudinary_url: {
        type: String,
        required: [true, 'Cloudinary URL is required'],
        trim: true
    },
    secure_url: {
        type: String,
        required: [true, 'Secure URL is required'],
        trim: true
    },
    is_confidential: {
        type: Boolean,
        default: true
    },
    access_level: {
        type: String,
        enum: ['public', 'client_only', 'internal_only', 'restricted'],
        default: 'client_only'
    },
    uploaded_by: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Uploaded by is required']
    },
    description: {
        type: String,
        trim: true
    },
    tags: [{
            type: String,
            trim: true
        }],
    version: {
        type: Number,
        default: 1,
        min: 1
    },
    parent_document_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Document'
    },
    expiry_date: {
        type: Date
    }
}, {
    timestamps: true // This creates createdAt and updatedAt automatically
});
exports.default = mongoose_1.default.model('Document', DocumentSchema);
