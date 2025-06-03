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
exports.ChatGptController = void 0;
const openai_1 = __importDefault(require("openai"));
const DocumentTemplate_1 = __importDefault(require("../models/DocumentTemplate"));
const mammoth = __importStar(require("mammoth"));
const multer_1 = __importDefault(require("multer"));
// Configure multer for handling FormData
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        fieldSize: 1024 * 1024
    }
});
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class ChatGptController {
    // Helper method to truncate content while preserving structure
    static truncateContent(content, maxLength = 15000) {
        if (content.length <= maxLength)
            return content;
        console.log(`⚠️ [TEMPLATE DEBUG] Truncating content from ${content.length} to ${maxLength} characters`);
        // Try to truncate at a paragraph boundary
        const truncated = content.substring(0, maxLength);
        const lastParagraph = truncated.lastIndexOf('\n\n');
        if (lastParagraph > maxLength * 0.8) {
            return truncated.substring(0, lastParagraph) + '\n\n[Content truncated for processing]';
        }
        return truncated + '\n\n[Content truncated for processing]';
    }
    // Helper method to get optimal model based on content length
    static getOptimalModel(contentLength) {
        // Estimate tokens (roughly 4 characters per token)
        const estimatedTokens = Math.ceil(contentLength / 4);
        console.log(`📊 [TOKEN DEBUG] Content length: ${contentLength}, Estimated tokens: ${estimatedTokens}`);
        // Use different models based on content size
        if (estimatedTokens > 4000) {
            return "gpt-4o"; // 128k context
        }
        else if (estimatedTokens > 2000) {
            return "gpt-4"; // 8k context  
        }
        else {
            return "gpt-4o-mini"; // 128k context
        }
    }
    static intelligentPlaceholderReplacement(content, placeholders) {
        let processedContent = content;
        let replacementsMade = 0;
        const unmatchedPlaceholders = [];
        // ✅ FIX: Properly type the documentPlaceholders array
        const placeholderMatches = content.match(/\{\{[^}]+\}\}/g);
        const documentPlaceholders = placeholderMatches ? placeholderMatches : [];
        console.log('🔍 [INTELLIGENT REPLACEMENT] Analysis:', {
            documentPlaceholders: documentPlaceholders.length,
            availableReplacements: Object.keys(placeholders).length,
            documentPlaceholdersList: documentPlaceholders,
            availableKeys: Object.keys(placeholders)
        });
        // For each placeholder in the document, try to find a match
        documentPlaceholders.forEach((placeholder) => {
            const cleanPlaceholder = placeholder.replace(/\{\{|\}\}/g, '').trim();
            let replacementValue = null;
            // Try exact match first
            if (placeholders[placeholder]) {
                replacementValue = placeholders[placeholder];
            }
            else {
                // Try intelligent matching
                const possibleMatches = Object.keys(placeholders).filter((key) => {
                    const cleanKey = key.replace(/\{\{|\}\}/g, '').trim();
                    return cleanKey.toLowerCase() === cleanPlaceholder.toLowerCase() ||
                        cleanKey.replace(/\s+/g, '').toLowerCase() === cleanPlaceholder.replace(/\s+/g, '').toLowerCase() ||
                        cleanKey.replace(/\s+/g, '_').toLowerCase() === cleanPlaceholder.replace(/\s+/g, '_').toLowerCase();
                });
                if (possibleMatches.length > 0) {
                    replacementValue = placeholders[possibleMatches[0]];
                }
            }
            if (replacementValue) {
                // Use global replace to replace all instances
                const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedPlaceholder, 'g');
                const beforeLength = processedContent.length;
                processedContent = processedContent.replace(regex, replacementValue);
                const afterLength = processedContent.length;
                if (beforeLength !== afterLength || !processedContent.includes(placeholder)) {
                    replacementsMade++;
                    console.log(`✅ [REPLACEMENT] ${placeholder} → ${replacementValue}`);
                }
            }
            else {
                unmatchedPlaceholders.push(placeholder);
                console.log(`⚠️ [UNMATCHED] ${placeholder}`);
            }
        });
        return {
            content: processedContent,
            replacementsMade,
            unmatchedPlaceholders
        };
    }
    /**
     * Get multer middleware for file uploads (alternative method)
     */
    static getUploadMiddleware() {
        return upload.single('templateFile');
    }
}
exports.ChatGptController = ChatGptController;
_a = ChatGptController;
/**
 * Generate a legal document with enhanced template debugging
 */
// ✅ UPDATE: Fix the generateDocument method with content management
ChatGptController.generateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        console.log('🚀 [TEMPLATE DEBUG] Generate Document Request Started:', {
            hasTemplateFile: !!req.file,
            bodyKeys: Object.keys(req.body),
            templateType: req.body.templateType,
            hasPlaceholders: !!req.body.placeholders,
            title: req.body.title,
            templateId: req.body.templateId,
            timestamp: new Date().toISOString()
        });
        // Extract fields from FormData
        const templateType = req.body.templateType || req.body.templateCategory;
        const title = req.body.title || req.body.documentTitle;
        const templateId = req.body.templateId;
        // ✅ CHANGE: Parse placeholders but only extract FIELD NAMES, not values
        let placeholderFields = {};
        try {
            if (typeof req.body.placeholders === 'string') {
                const userPlaceholders = JSON.parse(req.body.placeholders);
                // Only extract field names/keys, not the user values
                Object.keys(userPlaceholders).forEach(key => {
                    placeholderFields[key] = `{{${key}}}`; // Create placeholder format
                });
            }
        }
        catch (parseError) {
            console.error('❌ [TEMPLATE DEBUG] Error parsing placeholders:', parseError);
            placeholderFields = {};
        }
        // Get template content
        let finalTemplateContent = '';
        let templateInfo = {
            source: 'none',
            contentLength: 0,
            fileName: null,
            fileType: null,
            processingMethod: null
        };
        if (templateId) {
            try {
                console.log('🔍 [TEMPLATE DEBUG] Fetching template from MongoDB:', {
                    templateId,
                    timestamp: new Date().toISOString()
                });
                const template = yield DocumentTemplate_1.default.findById(templateId);
                if (template) {
                    console.log('📄 [TEMPLATE DEBUG] Template found in database:', {
                        templateId: template._id,
                        templateName: template.name,
                        hasTemplateFile: !!template.templateFile,
                        templateFileType: template.templateFileType,
                        templateFileSize: template.templateFile ? template.templateFile.length : 0,
                        category: template.category,
                        fields: ((_b = template.fields) === null || _b === void 0 ? void 0 : _b.length) || 0
                    });
                    if (template.templateFile) {
                        templateInfo.source = 'mongodb';
                        templateInfo.fileName = template.name;
                        templateInfo.fileType = template.templateFileType;
                        if (template.templateFileType === 'docx') {
                            console.log('📝 [TEMPLATE DEBUG] Processing DOCX template from MongoDB...');
                            templateInfo.processingMethod = 'mammoth-docx';
                            try {
                                const result = yield mammoth.extractRawText({
                                    buffer: template.templateFile
                                });
                                finalTemplateContent = result.value;
                                templateInfo.contentLength = finalTemplateContent.length;
                                console.log('✅ [TEMPLATE DEBUG] DOCX processed successfully:', {
                                    originalLength: template.templateFile.length,
                                    extractedLength: finalTemplateContent.length,
                                    preview: finalTemplateContent.substring(0, 200) + '...'
                                });
                            }
                            catch (mammothError) {
                                console.error('❌ [TEMPLATE DEBUG] Mammoth processing failed:', mammothError);
                                throw new Error(`Failed to process DOCX template: ${mammothError.message}`);
                            }
                        }
                        else {
                            console.log('📝 [TEMPLATE DEBUG] Processing text template from MongoDB...');
                            templateInfo.processingMethod = 'direct-text';
                            finalTemplateContent = template.templateFile.toString('utf-8');
                            templateInfo.contentLength = finalTemplateContent.length;
                        }
                    }
                    else {
                        console.warn('⚠️ [TEMPLATE DEBUG] Template found but no templateFile field');
                        throw new Error('Template found but contains no content');
                    }
                }
                else {
                    console.error('❌ [TEMPLATE DEBUG] Template not found in database:', templateId);
                    throw new Error('Template not found');
                }
            }
            catch (dbError) {
                console.error('❌ [TEMPLATE DEBUG] Database error:', dbError);
                throw new Error(`Database error: ${dbError.message}`);
            }
        }
        else if (req.file) {
            console.log('📁 [TEMPLATE DEBUG] Processing uploaded file:', {
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
            templateInfo.source = 'upload';
            templateInfo.fileName = req.file.originalname;
            templateInfo.fileType = req.file.mimetype;
            if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                console.log('📝 [TEMPLATE DEBUG] Processing uploaded DOCX file...');
                templateInfo.processingMethod = 'mammoth-upload';
                try {
                    const result = yield mammoth.extractRawText({ buffer: req.file.buffer });
                    finalTemplateContent = result.value;
                    templateInfo.contentLength = finalTemplateContent.length;
                    console.log('✅ [TEMPLATE DEBUG] Uploaded DOCX processed:', {
                        extractedLength: finalTemplateContent.length,
                        preview: finalTemplateContent.substring(0, 200) + '...'
                    });
                }
                catch (mammothError) {
                    console.error('❌ [TEMPLATE DEBUG] Failed to process uploaded DOCX:', mammothError);
                    throw new Error(`Failed to process uploaded DOCX: ${mammothError.message}`);
                }
            }
            else {
                console.log('📝 [TEMPLATE DEBUG] Processing uploaded text file...');
                templateInfo.processingMethod = 'buffer-text';
                finalTemplateContent = req.file.buffer.toString('utf-8');
                templateInfo.contentLength = finalTemplateContent.length;
            }
        }
        else {
            console.error('❌ [TEMPLATE DEBUG] No template provided');
            res.status(400).json({
                success: false,
                message: 'No template provided (either templateId or file upload required)',
                error: 'MISSING_TEMPLATE'
            });
            return;
        }
        // Validate template content
        if (!finalTemplateContent || finalTemplateContent.trim().length === 0) {
            console.error('❌ [TEMPLATE DEBUG] Empty template content');
            res.status(400).json({
                success: false,
                message: 'Template content is empty',
                error: 'EMPTY_TEMPLATE',
                templateInfo
            });
            return;
        }
        // ✅ FIX: Content management
        const maxContentLength = 30000;
        let processedContent = finalTemplateContent;
        if (finalTemplateContent.length > maxContentLength) {
            processedContent = _a.truncateContent(finalTemplateContent, maxContentLength);
            console.log(`📏 [CONTENT DEBUG] Content truncated: ${finalTemplateContent.length} → ${processedContent.length}`);
        }
        const optimalModel = _a.getOptimalModel(processedContent.length);
        console.log('📊 [TEMPLATE DEBUG] Final template processing summary:', Object.assign(Object.assign({}, templateInfo), { placeholdersCount: Object.keys(placeholderFields).length, placeholderKeys: Object.keys(placeholderFields), hasValidContent: processedContent.length > 0, selectedModel: optimalModel, contentTruncated: processedContent.length < finalTemplateContent.length }));
        // ✅ FIX: Updated system prompt - Generate template with placeholders, NO user data
        const messages = [
            {
                role: "system",
                content: `You are a professional legal document generator specializing in Nigerian law. Your task is to:

1. Generate a complete, professional legal document template based on the provided template
2. Create intelligent placeholders for user information using double curly braces: {{Field Name}}
3. Ensure proper legal language and formatting for Nigerian jurisdiction
4. Maintain document structure and add necessary legal clauses
5. Use plain text formatting without markdown symbols (**, *, etc.)
6. Use CAPS for titles and headers, not markdown formatting
7. Create placeholders that correspond to the form fields provided

Document Type: ${templateType || 'Legal Document'}
Available Form Fields: ${Object.keys(placeholderFields).join(', ')}

IMPORTANT: Do NOT include any actual personal information. Only create placeholders in {{Field Name}} format where user information should go.

Output: Return ONLY the completed document template with intelligent placeholders.`
            },
            {
                role: "user",
                content: `Create a complete ${templateType || 'legal'} document template using this base template:

TEMPLATE CONTENT:
${processedContent}

REQUIRED PLACEHOLDERS TO INCLUDE:
${Object.keys(placeholderFields).map(field => `{{${field}}}`).join('\n')}

DOCUMENT TITLE: ${title || 'Legal Document'}

Generate a complete, professional document template with intelligent placeholders for all the required fields. Use {{Field Name}} format for placeholders. Do not include any actual personal information - only create placeholders where user information should go. Use plain text only - no markdown formatting like ** or * symbols. Use CAPS for headers and proper paragraph spacing.

Ensure the document is legally sound for Nigerian jurisdiction and includes all necessary clauses and sections.`
            }
        ];
        console.log('🤖 [OPENAI DEBUG] Sending template generation request (NO USER DATA):', {
            messagesCount: messages.length,
            templateLength: processedContent.length,
            placeholderFieldsCount: Object.keys(placeholderFields).length,
            fieldsToReplace: Object.keys(placeholderFields),
            model: optimalModel
        });
        // ✅ FIX: Update the OpenAI call with proper token limits
        const completion = yield openai.chat.completions.create({
            model: optimalModel,
            messages: messages,
            max_completion_tokens: Math.min(2000, optimalModel.includes('gpt-4o') ? 4000 : 1500), // Reduced limits
            temperature: 0.3
        });
        const generatedContent = (_d = (_c = completion.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
        if (!generatedContent) {
            console.error('❌ [OPENAI DEBUG] No content generated');
            throw new Error('No content generated by OpenAI');
        }
        console.log('✅ [OPENAI DEBUG] Template generated successfully:', {
            originalLength: finalTemplateContent.length,
            generatedLength: generatedContent.length,
            tokensUsed: ((_e = completion.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0,
            placeholdersInResult: (generatedContent.match(/\{\{[^}]+\}\}/g) || []).length,
            model: optimalModel
        });
        res.json({
            success: true,
            message: 'Document template generated successfully',
            data: {
                generatedDocument: generatedContent,
                templateInfo,
                metadata: {
                    title: title || 'Generated Legal Document',
                    templateType: templateType || 'General',
                    generatedAt: new Date().toISOString(),
                    tokensUsed: ((_f = completion.usage) === null || _f === void 0 ? void 0 : _f.total_tokens) || 0,
                    placeholderFields: Object.keys(placeholderFields),
                    placeholdersInDocument: (generatedContent.match(/\{\{[^}]+\}\}/g) || []).length,
                    model: optimalModel,
                    contentTruncated: processedContent.length < finalTemplateContent.length
                }
            }
        });
    }
    catch (error) {
        console.error('❌ [TEMPLATE DEBUG] Document generation failed:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to generate document template',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                timestamp: new Date().toISOString()
            } : undefined
        });
    }
});
/**
 * Chat with AI for legal advice
 */
ChatGptController.chatWithAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    try {
        const { message, conversationHistory = [] } = req.body;
        if (!message) {
            res.status(400).json({
                success: false,
                message: 'Message is required'
            });
            return;
        }
        // ✅ FIX: Proper message format for OpenAI
        const messages = [
            {
                role: "system",
                content: `You are a professional legal AI assistant. Provide helpful, accurate legal information while:
1. Never giving specific legal advice
2. Always recommending consulting with a qualified lawyer for specific cases
3. Focusing on general legal information and education
4. Being clear about limitations of AI legal assistance
5. Maintaining a professional, helpful tone`
            },
            // Add conversation history
            ...conversationHistory.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            // Add current message
            {
                role: "user",
                content: message
            }
        ];
        // ✅ FIX: Updated to use max_completion_tokens instead of deprecated max_tokens
        const completion = yield openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4",
            messages: messages,
            max_completion_tokens: 1000,
            temperature: 0.7
        });
        const reply = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!reply) {
            throw new Error('No response generated');
        }
        res.json({
            success: true,
            message: 'Response generated successfully',
            data: {
                reply,
                conversationId: Date.now().toString(),
                timestamp: new Date().toISOString(),
                tokensUsed: ((_d = completion.usage) === null || _d === void 0 ? void 0 : _d.total_tokens) || 0
            }
        });
    }
    catch (error) {
        console.error('❌ Chat AI error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI response',
            error: error.message
        });
    }
});
// ✅ FIX: Improve document method with updated parameters
ChatGptController.improveDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        const { documentContent, improvementRequest, templateType } = req.body;
        if (!documentContent) {
            res.status(400).json({
                success: false,
                message: 'Document content is required.'
            });
            return;
        }
        console.log('[DEBUG] 📈 Improving document:', {
            contentLength: documentContent.length,
            hasImprovementRequest: !!improvementRequest,
            templateType: templateType || 'unknown'
        });
        const messages = [
            {
                role: "system",
                content: `You are a legal document improvement assistant specializing in Nigerian law. Improve legal documents while maintaining legal accuracy, Nigerian law compliance, and professional formatting. Focus on clarity, legal soundness, and proper structure.`
            },
            {
                role: "user",
                content: `Please improve this ${templateType || 'legal'} document${improvementRequest ? ` focusing on: ${improvementRequest}` : ''}. Maintain all placeholders in {{placeholder_name}} format:\n\n${documentContent}`
            }
        ];
        // ✅ FIX: Updated to use max_completion_tokens
        const response = yield openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: messages,
            max_completion_tokens: 4000,
            temperature: 0.1,
        });
        const improvedDocument = ((_d = (_c = (_b = response.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '';
        if (!improvedDocument) {
            throw new Error('No improved content generated');
        }
        console.log('✅ [IMPROVEMENT DEBUG] Document improved successfully:', {
            originalLength: documentContent.length,
            improvedLength: improvedDocument.length,
            tokensUsed: ((_e = response.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0
        });
        res.json({
            success: true,
            message: 'Document improved successfully',
            data: {
                improvedDocument,
                metadata: {
                    templateType: templateType || 'legal',
                    improvementRequest: improvementRequest || 'General improvement',
                    improvedAt: new Date().toISOString(),
                    tokensUsed: ((_f = response.usage) === null || _f === void 0 ? void 0 : _f.total_tokens) || 0,
                    originalLength: documentContent.length,
                    improvedLength: improvedDocument.length
                }
            }
        });
    }
    catch (error) {
        console.error('❌ [IMPROVEMENT DEBUG] Document improvement failed:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to improve document',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                timestamp: new Date().toISOString()
            } : undefined
        });
    }
});
// ✅ FIX: Legal query check method with updated parameters
ChatGptController.checkLegalQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        const { query, context } = req.body;
        if (!query) {
            res.status(400).json({
                success: false,
                message: 'Query is required'
            });
            return;
        }
        console.log('[DEBUG] ⚖️ Processing legal query:', {
            queryLength: query.length,
            hasContext: !!context,
            timestamp: new Date().toISOString()
        });
        const messages = [
            {
                role: "system",
                content: `You are a legal information assistant for Nigerian law. Provide helpful legal information while:
1. Never giving specific legal advice - always recommend consulting a qualified Nigerian lawyer
2. Focusing on general legal principles and information
3. Being clear about limitations and the need for professional legal counsel
4. Referencing relevant Nigerian laws when applicable
5. Maintaining a helpful but cautious tone about legal matters`
            },
            {
                role: "user",
                content: `Legal query: ${query}${context ? `\n\nContext: ${context}` : ''}`
            }
        ];
        // ✅ FIX: Updated to use max_completion_tokens
        const completion = yield openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4",
            messages: messages,
            max_completion_tokens: 800,
            temperature: 0.5
        });
        const response = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!response) {
            throw new Error('No response generated for legal query');
        }
        console.log('✅ [LEGAL QUERY DEBUG] Legal query processed successfully:', {
            queryLength: query.length,
            responseLength: response.length,
            tokensUsed: ((_d = completion.usage) === null || _d === void 0 ? void 0 : _d.total_tokens) || 0
        });
        res.json({
            success: true,
            message: 'Legal query processed successfully',
            data: {
                response,
                metadata: {
                    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
                    hasContext: !!context,
                    processedAt: new Date().toISOString(),
                    tokensUsed: ((_e = completion.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0,
                    disclaimer: 'This is general legal information only. Consult a qualified Nigerian lawyer for specific legal advice.'
                }
            }
        });
    }
    catch (error) {
        console.error('❌ [LEGAL QUERY DEBUG] Legal query processing failed:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to process legal query',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                timestamp: new Date().toISOString()
            } : undefined
        });
    }
});
// ✅ FIX: Handle chat query method with updated parameters
ChatGptController.handleChatQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        const { message, conversationHistory = [], context } = req.body;
        if (!message) {
            res.status(400).json({
                success: false,
                message: 'Message is required'
            });
            return;
        }
        console.log('[DEBUG] 💬 Processing chat query:', {
            messageLength: message.length,
            historyLength: conversationHistory.length,
            hasContext: !!context,
            timestamp: new Date().toISOString()
        });
        // Build conversation messages
        const messages = [
            {
                role: "system",
                content: `You are EasyLaw AI, a helpful legal information assistant specializing in Nigerian law. You help users understand legal concepts, procedures, and requirements in Nigeria. 

Guidelines:
- Provide accurate general legal information about Nigerian law
- Always recommend consulting with a qualified Nigerian lawyer for specific legal advice
- Be helpful, professional, and clear in explanations
- Reference relevant Nigerian laws, acts, and regulations when applicable
- Clarify that you provide information, not legal advice
- Be empathetic to users' legal concerns while maintaining professional boundaries

${context ? `\nContext for this conversation: ${context}` : ''}`
            },
            // Add conversation history
            ...conversationHistory.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            // Add current message
            {
                role: "user",
                content: message
            }
        ];
        // ✅ FIX: Updated to use max_completion_tokens
        const completion = yield openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4",
            messages: messages,
            max_completion_tokens: 1200,
            temperature: 0.6
        });
        const reply = (_c = (_b = completion.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!reply) {
            throw new Error('No response generated for chat query');
        }
        console.log('✅ [CHAT DEBUG] Chat query processed successfully:', {
            messageLength: message.length,
            replyLength: reply.length,
            tokensUsed: ((_d = completion.usage) === null || _d === void 0 ? void 0 : _d.total_tokens) || 0,
            conversationLength: conversationHistory.length
        });
        res.json({
            success: true,
            message: 'Chat response generated successfully',
            data: {
                reply,
                conversationId: req.body.conversationId || Date.now().toString(),
                metadata: {
                    timestamp: new Date().toISOString(),
                    tokensUsed: ((_e = completion.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0,
                    messageCount: conversationHistory.length + 1,
                    hasContext: !!context,
                    disclaimer: 'This is general legal information. For specific legal advice, please consult a qualified Nigerian lawyer.'
                }
            }
        });
    }
    catch (error) {
        console.error('❌ [CHAT DEBUG] Chat query processing failed:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            success: false,
            message: 'Failed to process chat query',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                timestamp: new Date().toISOString()
            } : undefined
        });
    }
});
/**
 * Multer middleware for file uploads
 */
ChatGptController.uploadMiddleware = upload.single('templateFile');
// ✅ ADD: Template verification method
ChatGptController.verifyTemplateContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateId } = req.params;
        if (!templateId) {
            res.status(400).json({
                success: false,
                message: 'Template ID is required'
            });
            return;
        }
        const template = yield DocumentTemplate_1.default.findById(templateId);
        if (!template) {
            res.status(404).json({
                success: false,
                message: 'Template not found'
            });
            return;
        }
        let templateContent = '';
        if (template.templateFile) {
            if (template.templateFileType === 'docx') {
                const result = yield mammoth.extractRawText({
                    buffer: template.templateFile
                });
                templateContent = result.value;
            }
            else {
                templateContent = template.templateFile.toString('utf-8');
            }
        }
        const placeholders = templateContent.match(/\{\{[^}]+\}\}/g) || [];
        res.json({
            success: true,
            data: {
                templateId: template._id,
                templateName: template.name,
                hasContent: !!templateContent,
                contentLength: templateContent.length,
                placeholdersFound: placeholders.length,
                placeholders: placeholders,
                fields: template.fields || []
            }
        });
    }
    catch (error) {
        console.error('❌ Template verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify template',
            error: error.message
        });
    }
});
