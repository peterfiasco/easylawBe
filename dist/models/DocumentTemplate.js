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
const FieldSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'currency'],
    },
    required: { type: Boolean, default: false },
    options: [String],
    placeholder: String,
    description: String
});
const DocumentTemplateSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'DocumentCategory', required: true },
    fields: [FieldSchema],
    isActive: { type: Boolean, default: true },
    // Changed the templateFile to Buffer type to store binary data
    templateFile: { type: Buffer, required: true },
    templateFileName: { type: String, required: true },
    templateFileType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('DocumentTemplate', DocumentTemplateSchema);
