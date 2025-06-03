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
const DocumentAnalysisSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    analysis_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    original_filename: {
        type: String,
        required: true
    },
    file_size: {
        type: Number,
        required: true
    },
    file_type: {
        type: String,
        required: true
    },
    document_text: {
        type: String,
        required: true
    },
    analysis: {
        overall_score: { type: Number, required: true },
        document_type: { type: String, required: true },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        legal_compliance_score: { type: Number, required: true },
        clarity_score: { type: Number, required: true },
        specific_improvements: [{ type: String }],
        missing_clauses: [{ type: String }],
        summary: { type: String, required: true }
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
// Indexes for better query performance
DocumentAnalysisSchema.index({ user_id: 1, created_at: -1 });
DocumentAnalysisSchema.index({ 'analysis.document_type': 1 });
DocumentAnalysisSchema.index({ 'analysis.overall_score': 1 });
exports.default = mongoose_1.default.model('DocumentAnalysis', DocumentAnalysisSchema);
