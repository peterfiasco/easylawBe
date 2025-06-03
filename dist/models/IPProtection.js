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
const IPProtectionSchema = new mongoose_1.Schema({
    service_request_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'Service request ID is required']
    },
    protection_type: {
        type: String,
        enum: ['trademark', 'copyright', 'patent', 'industrial_design', 'dispute_resolution'],
        required: [true, 'Protection type is required']
    },
    application_details: {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        classes: [{ type: Number }],
        applicant_type: {
            type: String,
            enum: ['individual', 'company'],
            required: true
        },
        prior_use_date: { type: Date }
    },
    applicant_info: {
        full_name: { type: String, required: true, trim: true },
        company_name: { type: String, trim: true },
        address: { type: String, required: true, trim: true },
        nationality: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
    },
    trademark_details: {
        mark_type: {
            type: String,
            enum: ['word', 'logo', 'combined', 'sound', 'color']
        },
        trademark_text: { type: String, trim: true },
        logo_url: { type: String, trim: true },
        color_codes: [{ type: String, trim: true }],
        goods_services: [{ type: String, trim: true }],
        nice_classification: [{ type: Number }]
    },
    patent_details: {
        invention_title: { type: String, trim: true },
        invention_type: {
            type: String,
            enum: ['utility', 'design', 'plant']
        },
        technical_field: { type: String, trim: true },
        background_art: { type: String, trim: true },
        invention_summary: { type: String, trim: true },
        claims: [{ type: String, trim: true }],
        drawings_url: [{ type: String, trim: true }]
    },
    copyright_details: {
        work_type: {
            type: String,
            enum: ['literary', 'artistic', 'musical', 'dramatic', 'software']
        },
        work_title: { type: String, trim: true },
        creation_date: { type: Date },
        publication_date: { type: Date },
        authors: [{ type: String, trim: true }],
        work_url: { type: String, trim: true }
    },
    dispute_details: {
        dispute_type: {
            type: String,
            enum: ['infringement', 'opposition', 'cancellation', 'enforcement']
        },
        opposing_party: { type: String, trim: true },
        dispute_description: { type: String, trim: true },
        evidence_urls: [{ type: String, trim: true }],
        preferred_resolution: {
            type: String,
            enum: ['negotiation', 'mediation', 'litigation']
        }
    },
    filing_status: {
        type: String,
        enum: ['not_filed', 'filed', 'examination', 'approved', 'rejected', 'published'],
        default: 'not_filed'
    },
    registry_reference: {
        type: String,
        trim: true
    },
    certificate_number: {
        type: String,
        trim: true
    },
    certificate_url: {
        type: String,
        trim: true
    },
    renewal_date: {
        type: Date
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
IPProtectionSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model('IPProtection', IPProtectionSchema);
