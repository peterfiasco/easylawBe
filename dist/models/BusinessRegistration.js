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
const BusinessRegistrationSchema = new mongoose_1.Schema({
    service_request_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'Service request ID is required']
    },
    business_name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    business_type: {
        type: String,
        enum: ['limited_company', 'business_name', 'incorporated_trustee', 'partnership'],
        required: [true, 'Business type is required']
    },
    registration_type: {
        type: String,
        enum: ['incorporation', 'annual_filing', 'change_of_directors', 'change_of_address'],
        required: [true, 'Registration type is required']
    },
    proposed_names: [{
            type: String,
            trim: true
        }],
    business_address: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        postal_code: { type: String, trim: true }
    },
    directors: [{
            full_name: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            address: { type: String, required: true, trim: true },
            nationality: { type: String, required: true, trim: true },
            occupation: { type: String, required: true, trim: true }
        }],
    shareholders: [{
            full_name: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            address: { type: String, required: true, trim: true },
            nationality: { type: String, required: true, trim: true },
            shares: { type: Number, required: true, min: 1 },
            share_percentage: { type: Number, required: true, min: 0, max: 100 }
        }],
    business_objectives: [{ type: String, trim: true }],
    authorized_share_capital: {
        type: Number,
        required: [true, 'Authorized share capital is required'],
        min: 10000
    },
    issued_share_capital: {
        type: Number,
        required: [true, 'Issued share capital is required'],
        min: 10000
    },
    memorandum_articles: {
        type: String,
        trim: true
    },
    cac_status: {
        type: String,
        enum: ['not_submitted', 'submitted', 'approved', 'rejected'],
        default: 'not_submitted'
    },
    cac_reference: {
        type: String,
        trim: true
    },
    registration_number: {
        type: String,
        trim: true
    },
    certificate_url: {
        type: String,
        trim: true
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
BusinessRegistrationSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model('BusinessRegistration', BusinessRegistrationSchema);
