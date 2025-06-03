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
const DueDiligenceSchema = new mongoose_1.Schema({
    service_request_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'Service request ID is required']
    },
    investigation_type: {
        type: String,
        enum: ['land_title', 'corporate_records', 'investment_check', 'comprehensive'],
        required: [true, 'Investigation type is required']
    },
    subject_details: {
        type: {
            type: String,
            enum: ['individual', 'company', 'property'],
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        registration_number: {
            type: String,
            trim: true
        },
        property_address: {
            type: String,
            trim: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    investigation_scope: [{
            type: String,
            trim: true
        }],
    findings: [{
            category: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
            risk_level: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                required: true
            },
            evidence_url: { type: String, trim: true },
            date_discovered: { type: Date, default: Date.now }
        }],
    red_flags: [{
            description: { type: String, required: true, trim: true },
            severity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                required: true
            },
            recommendation: { type: String, required: true, trim: true },
            evidence_url: { type: String, trim: true }
        }],
    final_report_url: {
        type: String,
        trim: true
    },
    investigator_notes: {
        type: String,
        trim: true
    },
    client_briefing_scheduled: {
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
DueDiligenceSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model('DueDiligence', DueDiligenceSchema);
