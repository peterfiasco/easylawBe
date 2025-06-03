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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentAnalysisController = void 0;
const mammoth = __importStar(require("mammoth"));
const openai_1 = __importDefault(require("openai"));
const DocumentAnalysis_1 = __importDefault(require("../../models/DocumentAnalysis")); // Add this import
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class DocumentAnalysisController {
}
exports.DocumentAnalysisController = DocumentAnalysisController;
_a = DocumentAnalysisController;
// Upload and analyze document
DocumentAnalysisController.analyzeDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        console.log('📄 Document Analysis Request Started');
        console.log('User from request:', req.user);
        console.log('User ID:', (_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
        console.log('File uploaded:', !!req.file);
        // 🚨 IMPORTANT: Check if user exists
        if (!req.user || !req.user._id) {
            console.error('❌ No user found in request or missing user ID');
            res.status(401).json({
                success: false,
                message: 'Authentication required. User not found in request.'
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No document uploaded'
            });
            return;
        }
        // Extract text from document (keeping existing extraction logic)
        let documentText = '';
        const fileType = req.file.mimetype;
        try {
            if (fileType === 'application/pdf') {
                const pdfData = yield (0, pdf_parse_1.default)(req.file.buffer);
                documentText = pdfData.text;
            }
            else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = yield mammoth.extractRawText({ buffer: req.file.buffer });
                documentText = result.value;
            }
            else if (fileType === 'application/msword') {
                documentText = req.file.buffer.toString('utf-8');
            }
            else if (fileType === 'text/plain') {
                documentText = req.file.buffer.toString('utf-8');
            }
            else {
                res.status(400).json({
                    success: false,
                    message: `Unsupported file type: ${fileType}. Please upload PDF, DOC, DOCX, or TXT files.`
                });
                return;
            }
        }
        catch (extractionError) {
            res.status(500).json({
                success: false,
                message: `Failed to extract text from document: ${extractionError.message}`
            });
            return;
        }
        const cleanedText = documentText.trim();
        if (cleanedText.length < 10) {
            res.status(400).json({
                success: false,
                message: `Document appears to be empty or too short for analysis.`
            });
            return;
        }
        console.log('📝 Document text extracted successfully');
        console.log('📝 Text length:', cleanedText.length);
        // Create the analysis prompt (keeping existing logic)
        const documentPreview = cleanedText.substring(0, 2000);
        const exampleJson = `{
  "overall_score": 85,
  "document_type": "Employment Contract",
  "strengths": ["Clear terms", "Well structured"],
  "weaknesses": ["Missing signatures"],
  "legal_compliance_score": 80,
  "clarity_score": 90,
  "specific_improvements": ["Add signature section"],
  "missing_clauses": ["Termination clause"],
  "summary": "Well-drafted document"
}`;
        const analysisPrompt = 'Analyze this legal document and respond with ONLY a JSON object (no other text):\n\n' +
            exampleJson + '\n\n' +
            'Document to analyze: ' + documentPreview;
        console.log('🤖 Calling OpenAI...');
        const response = yield openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a Nigerian legal expert. Respond with ONLY valid JSON.'
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ],
            max_tokens: 800,
            temperature: 0.1
        });
        const analysisText = ((_e = (_d = (_c = response.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) || '';
        console.log('🤖 Raw OpenAI response:', analysisText);
        // 🔧 FIXED: Declare both variables outside try block
        let analysis;
        let cleanedResponse;
        try {
            // 🔧 FIXED: Assign cleanedResponse inside the try block
            cleanedResponse = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
            analysis = JSON.parse(cleanedResponse);
            console.log('✅ Successfully parsed JSON');
        }
        catch (parseError) {
            console.error('❌ Failed to parse JSON, using fallback');
            analysis = {
                overall_score: 75,
                document_type: 'Legal Document',
                strengths: ['Document contains legal content'],
                weaknesses: ['Requires manual review'],
                legal_compliance_score: 70,
                clarity_score: 75,
                specific_improvements: ['Professional review recommended'],
                missing_clauses: ['Standard legal clauses'],
                summary: 'Document processed successfully. Professional review recommended.'
            };
        }
        // 🆕 SAVE TO DATABASE with proper user_id
        const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('💾 Attempting to save to database...');
        console.log('💾 User ID for save:', req.user._id);
        console.log('💾 Analysis ID:', analysisId);
        const documentAnalysis = new DocumentAnalysis_1.default({
            user_id: req.user._id,
            analysis_id: analysisId,
            original_filename: req.file.originalname,
            file_size: req.file.size,
            file_type: fileType,
            document_text: cleanedText,
            analysis: analysis
        });
        yield documentAnalysis.save();
        console.log('💾 Analysis saved to database with ID:', analysisId);
        res.json({
            success: true,
            data: {
                analysis_id: analysisId,
                filename: req.file.originalname,
                analysis: analysis,
                document_length: cleanedText.length,
                created_at: documentAnalysis.created_at
            }
        });
    }
    catch (error) {
        console.error('❌ Document analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze document',
            error: error.message
        });
    }
});
// 🆕 GET USER'S ANALYSIS HISTORY
DocumentAnalysisController.getUserAnalysisHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const analyses = yield DocumentAnalysis_1.default.find({ user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id })
            .select('-document_text') // Exclude full text for performance
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield DocumentAnalysis_1.default.countDocuments({ user_id: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id });
        res.json({
            success: true,
            data: {
                analyses,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_count: total,
                    per_page: limit
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analysis history',
            error: error.message
        });
    }
});
// 🆕 GET SPECIFIC ANALYSIS BY ID
DocumentAnalysisController.getAnalysisById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { analysisId } = req.params;
        const analysis = yield DocumentAnalysis_1.default.findOne({
            analysis_id: analysisId,
            user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
        });
        if (!analysis) {
            res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
            return;
        }
        res.json({
            success: true,
            data: analysis
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analysis',
            error: error.message
        });
    }
});
// 🆕 DELETE ANALYSIS
DocumentAnalysisController.deleteAnalysis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { analysisId } = req.params;
        const result = yield DocumentAnalysis_1.default.findOneAndDelete({
            analysis_id: analysisId,
            user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
        });
        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Analysis deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete analysis',
            error: error.message
        });
    }
});
// 🆕 IMPROVE DOCUMENT METHOD
DocumentAnalysisController.improveDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        console.log('🔧 Document Improvement Request Started');
        console.log('User ID:', (_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
        console.log('Request body:', req.body);
        if (!req.user || !req.user._id) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        let documentText = '';
        const { analysisId, improvementType = 'general' } = req.body;
        // Get document from existing analysis
        if (analysisId) {
            const existingAnalysis = yield DocumentAnalysis_1.default.findOne({
                analysis_id: analysisId,
                user_id: req.user._id
            });
            if (!existingAnalysis) {
                res.status(404).json({
                    success: false,
                    message: 'Analysis not found'
                });
                return;
            }
            documentText = existingAnalysis.document_text;
        }
        // Get document from uploaded file
        else if (req.file) {
            const fileType = req.file.mimetype;
            try {
                if (fileType === 'application/pdf') {
                    const pdfData = yield (0, pdf_parse_1.default)(req.file.buffer);
                    documentText = pdfData.text;
                }
                else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const result = yield mammoth.extractRawText({ buffer: req.file.buffer });
                    documentText = result.value;
                }
                else if (fileType === 'application/msword') {
                    documentText = req.file.buffer.toString('utf-8');
                }
                else if (fileType === 'text/plain') {
                    documentText = req.file.buffer.toString('utf-8');
                }
            }
            catch (extractionError) {
                res.status(500).json({
                    success: false,
                    message: `Failed to extract text: ${extractionError.message}`
                });
                return;
            }
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Either analysisId or document file is required'
            });
            return;
        }
        if (!documentText || documentText.trim().length < 10) {
            res.status(400).json({
                success: false,
                message: 'Document text is too short for improvement'
            });
            return;
        }
        // Create improvement prompt
        // Replace the promptMap in improveDocument method (around line 300):
        const promptMap = {
            legal_compliance: `Improve this legal document's compliance with Nigerian law. Focus on legal clauses, regulatory compliance, and proper terminology. Return only the improved document:

${documentText}`,
            clarity: `Improve this document's clarity and readability. Focus on simplifying language and better organization. Return only the improved document:

${documentText}`,
            completeness: `Make this document more complete by adding missing sections and clauses. Return only the improved document:

${documentText}`,
            general: `Improve this legal document comprehensively for Nigerian law compliance, clarity, and completeness. Return only the improved document:

${documentText}`
        };
        const improvementPrompt = promptMap[improvementType] || promptMap.general;
        console.log('🤖 Calling OpenAI for document improvement...');
        // Replace the OpenAI call parameters in improveDocument method:
        const response = yield openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a Nigerian legal expert. Return only the improved document text without explanations.'
                },
                {
                    role: 'user',
                    content: improvementPrompt
                }
            ],
            max_tokens: 4000, // Increased from 2000
            temperature: 0.3
        });
        const improvedText = ((_e = (_d = (_c = response.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) || '';
        if (!improvedText) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate improved document'
            });
            return;
        }
        console.log('✅ Document improvement completed');
        res.json({
            success: true,
            data: {
                original_length: documentText.length,
                improved_length: improvedText.length,
                improvement_type: improvementType,
                improved_document: improvedText,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('❌ Document improvement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to improve document',
            error: error.message
        });
    }
});
