"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelServiceSchema = exports.AddDocumentSchema = exports.UpdateServiceStatusSchema = exports.UpdatePaymentStatusSchema = exports.DueDiligenceSchema = exports.BusinessRegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.BusinessRegistrationSchema = joi_1.default.object({
    clientInfo: joi_1.default.object({
        fullName: joi_1.default.string().required().trim().min(2).max(100),
        email: joi_1.default.string().email().required().trim(),
        phone: joi_1.default.string().required().trim().min(10).max(15),
        address: joi_1.default.string().required().trim().min(10).max(500)
    }).required(),
    businessDetails: joi_1.default.object({
        businessName: joi_1.default.string().required().trim().min(2).max(200),
        businessType: joi_1.default.string().required().valid('private_limited', 'public_limited', 'partnership', 'sole_proprietorship', 'ngo', 'cooperative'),
        businessAddress: joi_1.default.string().required().trim().min(10).max(500),
        businessObjects: joi_1.default.string().required().trim().min(20).max(2000)
    }).required(),
    directors: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required().trim().min(2).max(100),
        email: joi_1.default.string().email().required().trim(),
        phone: joi_1.default.string().required().trim().min(10).max(15),
        address: joi_1.default.string().required().trim().min(10).max(500),
        nationality: joi_1.default.string().required().trim().min(2).max(50),
        occupation: joi_1.default.string().required().trim().min(2).max(100)
    })).min(1).max(10).required(),
    shareholders: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required().trim().min(2).max(100),
        email: joi_1.default.string().email().required().trim(),
        shares: joi_1.default.number().integer().min(1).required(),
        percentage: joi_1.default.number().min(0.01).max(100).required()
    })).min(1).max(50).required(),
    priority: joi_1.default.string().valid('standard', 'express', 'urgent').default('standard'),
    additionalRequirements: joi_1.default.string().allow('').max(1000)
});
exports.DueDiligenceSchema = joi_1.default.object({
    clientInfo: joi_1.default.object({
        fullName: joi_1.default.string().required().trim().min(2).max(100),
        email: joi_1.default.string().email().required().trim(),
        phone: joi_1.default.string().required().trim().min(10).max(15),
        company: joi_1.default.string().allow('').trim().max(200),
        address: joi_1.default.string().required().trim().min(10).max(500)
    }).required(),
    investigationDetails: joi_1.default.object({
        investigationType: joi_1.default.string().required().valid('individual', 'company', 'asset'),
        subjectName: joi_1.default.string().required().trim().min(2).max(200),
        subjectDetails: joi_1.default.string().required().trim().min(10).max(1000),
        investigationScope: joi_1.default.array().items(joi_1.default.string().valid('background_check', 'financial_verification', 'criminal_records', 'employment_history', 'asset_verification', 'business_registration', 'litigation_history', 'credit_check', 'reference_verification', 'social_media_analysis')).min(1).max(10).required(),
        urgencyLevel: joi_1.default.string().required().valid('low', 'medium', 'high', 'critical'),
        timeframe: joi_1.default.string().allow('').max(200),
        specificRequests: joi_1.default.string().allow('').max(1000)
    }).required(),
    priority: joi_1.default.string().valid('standard', 'express', 'urgent').default('standard'),
    additionalRequirements: joi_1.default.string().allow('').max(1000)
});
exports.UpdatePaymentStatusSchema = joi_1.default.object({
    service_id: joi_1.default.string().required().length(24), // MongoDB ObjectId length
    transaction_id: joi_1.default.string().required().length(24),
    payment_status: joi_1.default.string().valid('pending', 'paid', 'failed', 'refunded').required(),
    transaction_reference: joi_1.default.string().required().trim().min(5).max(100)
});
exports.UpdateServiceStatusSchema = joi_1.default.object({
    status: joi_1.default.string().valid('submitted', 'pending', 'processing', 'review', 'under_review', 'approved', 'completed', 'failed', 'rejected').optional(),
    progress_percentage: joi_1.default.number().min(0).max(100).optional(),
    status_message: joi_1.default.string().trim().max(500).optional(),
    estimated_completion: joi_1.default.date().iso().optional(),
    actual_completion: joi_1.default.date().iso().optional(),
    assigned_staff: joi_1.default.string().length(24).optional(), // MongoDB ObjectId
    internal_notes: joi_1.default.string().trim().max(2000).optional()
}).min(1); // At least one field must be provided
exports.AddDocumentSchema = joi_1.default.object({
    name: joi_1.default.string().required().trim().min(1).max(200),
    type: joi_1.default.string().required().trim().min(1).max(50),
    url: joi_1.default.string().uri().required(),
    download_url: joi_1.default.string().uri().required(),
    preview_url: joi_1.default.string().uri().allow('').optional(),
    size: joi_1.default.string().trim().max(20).optional()
});
exports.CancelServiceSchema = joi_1.default.object({
    reason: joi_1.default.string().required().trim().min(5).max(500)
});
