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
const ServiceRequestSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    service_type: {
        type: String,
        enum: ['business_registration', 'due_diligence', 'ip_protection', 'document_management', 'consultation'],
        required: [true, 'Service type is required']
    },
    service_subtype: {
        type: String,
        required: [true, 'Service subtype is required'],
        trim: true
    },
    reference_number: {
        type: String,
        required: [true, 'Reference number is required'],
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['submitted', 'in_progress', 'requires_action', 'completed', 'cancelled'],
        default: 'submitted'
    },
    priority: {
        type: String,
        enum: ['standard', 'express', 'urgent'],
        default: 'standard'
    },
    estimated_completion: {
        type: Date,
        required: [true, 'Estimated completion date is required']
    },
    actual_completion: {
        type: Date
    },
    total_amount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    paid_amount: {
        type: Number,
        default: 0,
        min: [0, 'Paid amount cannot be negative']
    },
    payment_status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    documents: [{
            name: { type: String, required: true, trim: true },
            url: { type: String, trim: true }, // Make optional
            upload_date: { type: Date, default: Date.now },
            document_type: { type: String, required: true, trim: true },
            // ✅ ADD: File storage fields
            file_buffer: { type: Buffer, required: true },
            file_size: { type: Number, required: true, min: 0 },
            mime_type: { type: String, required: true, trim: true },
            // Keep existing optional fields
            description: { type: String, trim: true },
            file_path: { type: String, trim: true },
            uploaded_by: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            download_url: { type: String, trim: true }
        }],
    notes: [{
            message: { type: String, required: true, trim: true },
            added_by: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
            date: { type: Date, default: Date.now },
            type: { type: String, enum: ['system', 'admin', 'user'], default: 'system' }
        }],
    // Investigation details for due diligence services
    investigation_details: {
        investigation_type: { type: String, trim: true },
        subject_name: { type: String, trim: true },
        subject_type: { type: String, trim: true },
        company_registration_number: { type: String, trim: true },
        subject_address: { type: String, trim: true },
        investigation_scope: { type: String, trim: true },
        specific_requirements: { type: String, trim: true },
        contact_information: {
            phone: { type: String, trim: true },
            email: { type: String, trim: true },
            preferred_contact_method: { type: String, trim: true }
        },
        urgency_reason: { type: String, trim: true },
        background_information: { type: String, trim: true },
        supporting_documents: [{ type: mongoose_1.default.Schema.Types.Mixed }]
    },
    // Business details for business registration services
    business_details: {
        business_name: { type: String, trim: true },
        business_type: { type: String, trim: true },
        registration_type: { type: String, trim: true },
        proposed_names: [{ type: String, trim: true }],
        business_address: { type: String, trim: true },
        directors: [{ type: mongoose_1.default.Schema.Types.Mixed }],
        shareholders: [{ type: mongoose_1.default.Schema.Types.Mixed }],
        business_objectives: [{ type: String, trim: true }],
        authorized_share_capital: { type: Number, min: 0 },
        issued_share_capital: { type: Number, min: 0 }
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});
// Update the updated_at field on save
ServiceRequestSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});
// Add indexes for better performance
ServiceRequestSchema.index({ user_id: 1, service_type: 1 });
ServiceRequestSchema.index({ reference_number: 1 });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ created_at: -1 });
exports.default = mongoose_1.default.model('ServiceRequest', ServiceRequestSchema);
