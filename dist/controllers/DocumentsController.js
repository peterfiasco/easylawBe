"use strict";
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
exports.DocumentsController = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const docx_1 = require("docx");
const Document_1 = __importDefault(require("../models/Document"));
const GeneratedDocument_1 = __importDefault(require("../models/GeneratedDocument"));
class DocumentsController {
    // ✅ FIX: Move intelligentPlaceholderReplacement to DocumentsController
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
    // ✅ FIX: Make escapeRegExp a static method
    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
exports.DocumentsController = DocumentsController;
_a = DocumentsController;
// GET /api/documents
DocumentsController.getAllDocuments = (req, res, next) => {
    const fetchDocuments = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // ✅ FIX: Fetch both uploaded and generated documents
            const [uploadedDocs, generatedDocs] = yield Promise.all([
                Document_1.default.find({ user_id: userId }).sort({ createdAt: -1 }),
                GeneratedDocument_1.default.find({ userId }).sort({ createdAt: -1 })
            ]);
            // Combine and format documents
            const documents = [
                ...uploadedDocs.map(doc => ({
                    _id: doc._id,
                    title: doc.file_name || 'Uploaded Document',
                    type: 'uploaded',
                    createdAt: doc.createdAt,
                    content: null
                })),
                ...generatedDocs.map(doc => ({
                    _id: doc._id,
                    title: doc.title,
                    type: 'generated',
                    createdAt: doc.createdAt,
                    content: doc.content,
                    status: doc.status
                }))
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            res.status(200).json({ success: true, data: documents });
        }
        catch (error) {
            console.error("Error fetching documents:", error);
            res.status(500).json({ message: "Server error fetching documents." });
        }
    });
    fetchDocuments();
};
// POST /api/documents/save
DocumentsController.saveDocument = (req, res, next) => {
    const saveDoc = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            const { title, content, templateId, formData, status } = req.body;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!title || !content) {
                res.status(400).json({ message: "Missing title or content" });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // ✅ FIX: Save as GeneratedDocument
            const newDoc = yield GeneratedDocument_1.default.create({
                title,
                content,
                userId,
                templateId,
                formData: formData || {},
                status: status || 'draft'
            });
            res.status(201).json({
                success: true,
                message: "Document saved successfully",
                document: newDoc,
            });
        }
        catch (error) {
            console.error("Error saving document:", error);
            res.status(500).json({ message: "Server error saving document" });
        }
    });
    saveDoc();
};
// PUT /api/documents/:id
DocumentsController.updateDocument = (req, res, next) => {
    const updateDoc = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            const documentId = req.params.id;
            const { title, content, status } = req.body;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // ✅ FIX: Update GeneratedDocument
            const existingDoc = yield GeneratedDocument_1.default.findOne({ _id: documentId, userId });
            if (!existingDoc) {
                res.status(404).json({ message: "Document not found or you don't have permission to update it" });
                return;
            }
            const updatedDoc = yield GeneratedDocument_1.default.findByIdAndUpdate(documentId, {
                title: title || existingDoc.title,
                content: content || existingDoc.content,
                status: status || existingDoc.status
            }, { new: true });
            res.status(200).json({
                success: true,
                message: "Document updated successfully",
                document: updatedDoc,
            });
        }
        catch (error) {
            console.error("Error updating document:", error);
            res.status(500).json({ message: "Server error updating document." });
        }
    });
    updateDoc();
};
// POST /api/documents/export
DocumentsController.exportDocument = (req, res, next) => {
    const exportDoc = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            const { format, content, title, documentId } = req.body;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!format || !content) {
                res.status(400).json({ message: "Missing format or content" });
                return;
            }
            // ✅ FIX: Update document status to exported
            if (userId && documentId) {
                try {
                    yield GeneratedDocument_1.default.findOneAndUpdate({ _id: documentId, userId }, { status: 'exported' }, { new: true });
                }
                catch (updateErr) {
                    console.error("Error updating document status:", updateErr);
                }
            }
            if (format === "pdf") {
                const doc = new pdfkit_1.default();
                res.setHeader("Content-Disposition", `attachment; filename="${title || 'document'}.pdf"`);
                res.setHeader("Content-Type", "application/pdf");
                doc.pipe(res);
                doc.fontSize(14).text(content);
                doc.end();
            }
            else if (format === "word") {
                if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
                    const htmlToDocx = require('html-to-docx');
                    const buffer = yield htmlToDocx(content, {
                        title: title || 'Document',
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    });
                    res.setHeader("Content-Disposition", `attachment; filename="${title || 'document'}.docx"`);
                    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                    res.status(200).send(buffer);
                }
                else {
                    const doc = new docx_1.Document({
                        sections: [
                            {
                                children: [
                                    new docx_1.Paragraph({
                                        children: [new docx_1.TextRun(content)],
                                    }),
                                ],
                            },
                        ],
                    });
                    const buffer = yield docx_1.Packer.toBuffer(doc);
                    res.setHeader("Content-Disposition", `attachment; filename="${title || 'document'}.docx"`);
                    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                    res.status(200).send(buffer);
                }
            }
            else {
                res.status(400).json({ message: "Unsupported format" });
            }
        }
        catch (error) {
            console.error("Error exporting document:", error);
            res.status(500).json({ message: "Server error generating file" });
        }
    });
    exportDoc();
};
// DELETE /api/documents/:id
DocumentsController.deleteDocument = (req, res, next) => {
    const deleteDoc = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            const documentId = req.params.id;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // Try to delete from both collections
            let deleted = false;
            // Try GeneratedDocument first
            const generatedDoc = yield GeneratedDocument_1.default.findOne({ _id: documentId, userId });
            if (generatedDoc) {
                yield GeneratedDocument_1.default.findByIdAndDelete(documentId);
                deleted = true;
            }
            else {
                // Try regular Document
                const uploadedDoc = yield Document_1.default.findOne({ _id: documentId, user_id: userId });
                if (uploadedDoc) {
                    yield Document_1.default.findByIdAndDelete(documentId);
                    deleted = true;
                }
            }
            if (!deleted) {
                res.status(404).json({ message: "Document not found or you don't have permission to delete it" });
                return;
            }
            res.status(200).json({ success: true, message: "Document deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting document:", error);
            res.status(500).json({ message: "Server error deleting document." });
        }
    });
    deleteDoc();
};
// GET /api/documents/:id
DocumentsController.getDocumentById = (req, res, next) => {
    const fetchDocument = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            const documentId = req.params.id;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // Try both document types
            let document = yield GeneratedDocument_1.default.findOne({ _id: documentId, userId });
            if (!document) {
                document = yield Document_1.default.findOne({ _id: documentId, user_id: userId });
            }
            if (!document) {
                res.status(404).json({ message: "Document not found" });
                return;
            }
            res.status(200).json({ success: true, data: document });
        }
        catch (error) {
            console.error("Error fetching document:", error);
            res.status(500).json({ message: "Server error fetching document." });
        }
    });
    fetchDocument();
};
DocumentsController.replacePlaceholders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, placeholders, enhancedReplacement, intelligentMatching } = req.body;
        if (!content) {
            res.status(400).json({
                success: false,
                message: 'Content is required'
            });
            return;
        }
        if (!placeholders || Object.keys(placeholders).length === 0) {
            res.status(400).json({
                success: false,
                message: 'Placeholders object is required'
            });
            return;
        }
        console.log('🔄 [ENHANCED REPLACEMENT] Request:', {
            contentLength: content.length,
            placeholderCount: Object.keys(placeholders).length,
            enhancedReplacement,
            intelligentMatching
        });
        let processedContent = content;
        let replacementsMade = 0;
        let unmatchedPlaceholders = [];
        if (intelligentMatching) {
            // Use intelligent replacement
            const result = _a.intelligentPlaceholderReplacement(content, placeholders);
            processedContent = result.content;
            replacementsMade = result.replacementsMade;
            unmatchedPlaceholders = result.unmatchedPlaceholders;
        }
        else {
            // Use simple replacement (existing logic)
            Object.entries(placeholders).forEach(([key, value]) => {
                const patterns = [
                    new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'gi'),
                    new RegExp(`\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}`, 'gi'),
                    new RegExp(`\\[\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\]`, 'gi')
                ];
                patterns.forEach(pattern => {
                    if (pattern.test(processedContent)) {
                        processedContent = processedContent.replace(pattern, value);
                        replacementsMade++;
                    }
                });
            });
        }
        console.log('✅ [REPLACEMENT COMPLETE]:', {
            originalLength: content.length,
            processedLength: processedContent.length,
            replacementsMade,
            unmatchedCount: unmatchedPlaceholders.length
        });
        res.json({
            success: true,
            data: {
                content: processedContent,
                metadata: {
                    originalLength: content.length,
                    processedLength: processedContent.length,
                    replacementsMade,
                    unmatchedPlaceholders,
                    processingMethod: intelligentMatching ? 'intelligent' : 'simple'
                }
            }
        });
    }
    catch (error) {
        console.error('❌ [REPLACEMENT ERROR]:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to replace placeholders',
            error: error.message
        });
    }
});
