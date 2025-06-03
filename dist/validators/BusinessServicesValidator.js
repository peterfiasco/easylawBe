"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUpdateSchema = exports.DocumentUploadSchema = exports.IPProtectionSchema = exports.DueDiligenceSchema = exports.BusinessRegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Business Registration Validation
exports.BusinessRegistrationSchema = joi_1.default.object({
    business_name: joi_1.default.string().min(2).max(100).required()
        .messages({
        'string.empty': 'Business name is required',
        'string.min': 'Business name must be at least 2 characters',
        'string.max': 'Business name cannot exceed 100 characters'
    }),
    business_type: joi_1.default.string()
        .valid('limited_liability', 'public_company', 'private_company', 'partnership', 'sole_proprietorship')
        .required()
        .messages({
        'any.only': 'Invalid business type',
        'any.required': 'Business type is required'
    }),
    registration_type: joi_1.default.string()
        .valid('incorporation', 'annual_filing', 'change_of_directors', 'change_of_address')
        .required()
        .messages({
        'any.only': 'Invalid registration type',
        'any.required': 'Registration type is required'
    }),
    proposed_names: joi_1.default.array().items(joi_1.default.string().max(100)).max(3)
        .messages({
        'array.max': 'Maximum 3 proposed names allowed'
    }),
    business_address: joi_1.default.object({
        street: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        postal_code: joi_1.default.string(),
        country: joi_1.default.string().default('Nigeria')
    }).required(),
    directors: joi_1.default.array().items(joi_1.default.object({
        full_name: joi_1.default.string().required(),
        nationality: joi_1.default.string().required(),
        address: joi_1.default.string().required(),
        phone: joi_1.default.string(),
        email: joi_1.default.string().email()
    })),
    shareholders: joi_1.default.array().items(joi_1.default.object({
        full_name: joi_1.default.string().required(),
        shares: joi_1.default.number().positive().required(),
        share_type: joi_1.default.string().default('ordinary')
    })),
    business_objectives: joi_1.default.array().items(joi_1.default.string()),
    authorized_share_capital: joi_1.default.number().positive().default(100000)
        .messages({
        'number.positive': 'Authorized share capital must be a positive number'
    }),
    issued_share_capital: joi_1.default.number().positive().default(100000)
        .messages({
        'number.positive': 'Issued share capital must be a positive number'
    }),
    priority: joi_1.default.string().valid('standard', 'express', 'urgent').default('standard')
        .messages({
        'any.only': 'Priority must be standard, express, or urgent'
    })
});
// Due Diligence Validation
exports.DueDiligenceSchema = joi_1.default.object({
    investigation_type: joi_1.default.string()
        .valid('land_title', 'corporate_records', 'investment_check', 'comprehensive')
        .required()
        .messages({
        'any.only': 'Invalid investigation type',
        'any.required': 'Investigation type is required'
    }),
    subject_details: joi_1.default.object({
        name: joi_1.default.string().required()
            .messages({
            'string.empty': 'Subject name is required'
        }),
        type: joi_1.default.string().valid('individual', 'company', 'property').required(),
        registration_number: joi_1.default.string().when('type', {
            is: 'company',
            then: joi_1.default.required(),
            otherwise: joi_1.default.optional()
        }),
        address: joi_1.default.string(),
        additional_info: joi_1.default.string()
    }).required(),
    investigation_scope: joi_1.default.array().items(joi_1.default.string().valid('financial_records', 'legal_compliance', 'ownership_verification', 'litigation_history', 'asset_verification', 'reputation_check')),
    priority: joi_1.default.string().valid('standard', 'express', 'urgent').default('standard')
});
// IP Protection Validation
exports.IPProtectionSchema = joi_1.default.object({
    protection_type: joi_1.default.string()
        .valid('trademark', 'copyright', 'patent', 'industrial_design', 'dispute_resolution')
        .required()
        .messages({
        'any.only': 'Invalid protection type',
        'any.required': 'Protection type is required'
    }),
    application_details: joi_1.default.object({
        title: joi_1.default.string().required()
            .messages({
            'string.empty': 'Application title is required'
        }),
        description: joi_1.default.string().required(),
        classification: joi_1.default.string(),
        priority_claim: joi_1.default.boolean().default(false)
    }).required(),
    applicant_info: joi_1.default.object({
        name: joi_1.default.string().required(),
        address: joi_1.default.string().required(),
        nationality: joi_1.default.string().required(),
        entity_type: joi_1.default.string().valid('individual', 'company').required()
    }).required(),
    trademark_details: joi_1.default.when('protection_type', {
        is: 'trademark',
        then: joi_1.default.object({
            mark_type: joi_1.default.string().valid('word', 'logo', 'combined').required(),
            classes: joi_1.default.array().items(joi_1.default.number().min(1).max(45)).required(),
            goods_services: joi_1.default.string().required(),
            first_use_date: joi_1.default.date(),
            logo_file: joi_1.default.string()
        }),
        otherwise: joi_1.default.optional()
    }),
    patent_details: joi_1.default.when('protection_type', {
        is: 'patent',
        then: joi_1.default.object({
            invention_type: joi_1.default.string().valid('utility', 'design', 'plant').required(),
            technical_field: joi_1.default.string().required(),
            background_art: joi_1.default.string(),
            invention_summary: joi_1.default.string().required(),
            claims: joi_1.default.array().items(joi_1.default.string()).required()
        }),
        otherwise: joi_1.default.optional()
    }),
    copyright_details: joi_1.default.when('protection_type', {
        is: 'copyright',
        then: joi_1.default.object({
            work_type: joi_1.default.string().valid('literary', 'artistic', 'musical', 'software').required(),
            creation_date: joi_1.default.date().required(),
            publication_date: joi_1.default.date(),
            authors: joi_1.default.array().items(joi_1.default.string()).required()
        }),
        otherwise: joi_1.default.optional()
    }),
    dispute_details: joi_1.default.when('protection_type', {
        is: 'dispute_resolution',
        then: joi_1.default.object({
            dispute_type: joi_1.default.string().valid('infringement', 'opposition', 'invalidation').required(),
            opposing_party: joi_1.default.string().required(),
            case_summary: joi_1.default.string().required(),
            evidence_available: joi_1.default.boolean().default(false)
        }),
        otherwise: joi_1.default.optional()
    }),
    priority: joi_1.default.string().valid('standard', 'express', 'urgent').default('standard')
});
// Document Upload Validation
exports.DocumentUploadSchema = joi_1.default.object({
    document_category: joi_1.default.string()
        .valid('incorporation_docs', 'financial_records', 'legal_docs', 'identity_docs', 'supporting_docs')
        .default('general'),
    description: joi_1.default.string().max(500)
        .messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    tags: joi_1.default.array().items(joi_1.default.string()).max(10)
        .messages({
        'array.max': 'Maximum 10 tags allowed'
    }),
    access_level: joi_1.default.string()
        .valid('public', 'client_only', 'admin_only', 'restricted')
        .default('client_only')
});
// Service Request Update Validation
exports.ServiceUpdateSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid('submitted', 'in_review', 'in_progress', 'requires_action', 'completed', 'cancelled'),
    priority: joi_1.default.string().valid('standard', 'express', 'urgent'),
    notes: joi_1.default.string().max(1000),
    estimated_completion: joi_1.default.date().min('now')
        .messages({
        'date.min': 'Estimated completion date cannot be in the past'
    })
});
