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
class DocumentsController {
}
exports.DocumentsController = DocumentsController;
_a = DocumentsController;
// GET /api/documents
DocumentsController.getAllDocuments = (req, res, next) => {
    const fetchDocuments = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        try {
            // Get userId from authenticated user in request
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // Fetch documents belonging to the user
            const documents = yield Document_1.default.find({ userId }).sort({ createdAt: -1 });
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
            const { title, finalDoc } = req.body;
            // Get userId from authenticated user
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!title || !finalDoc) {
                res.status(400).json({ message: "Missing title or finalDoc" });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // Create new document in MongoDB
            const newDoc = yield Document_1.default.create({
                title,
                content: finalDoc,
                userId,
                createdAt: new Date()
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
            const { title, content } = req.body;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!userId) {
                res.status(401).json({ message: "Authentication required" });
                return;
            }
            // Check if document exists and belongs to user
            const existingDoc = yield Document_1.default.findOne({ _id: documentId, userId });
            if (!existingDoc) {
                res.status(404).json({ message: "Document not found or you don't have permission to update it" });
                return;
            }
            // Update the document
            const updatedDoc = yield Document_1.default.findByIdAndUpdate(documentId, {
                title: title || existingDoc.title,
                content: content || existingDoc.content,
                updatedAt: new Date()
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
            const { format, content, title } = req.body;
            const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
            if (!format || !content) {
                res.status(400).json({ message: "Missing format or content" });
                return;
            }
            // Save document if authenticated
            if (userId && title) {
                try {
                    yield Document_1.default.findOneAndUpdate({ userId, title }, { content, format }, { upsert: true, new: true });
                }
                catch (saveErr) {
                    console.error("Error saving document during export:", saveErr);
                    // Continue with export even if save fails
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
                // Check if content is HTML
                if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
                    const htmlToDocx = require('html-to-docx');
                    // Convert HTML to DOCX buffer
                    const buffer = yield htmlToDocx(content, {
                        title: title || 'Document',
                        margin: {
                            top: 1440, // 1 inch in twip
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
                    // For plain text content, use the existing docx package approach
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
            // Ensure the document belongs to the user
            const document = yield Document_1.default.findOne({
                _id: documentId,
                userId
            });
            if (!document) {
                res.status(404).json({ message: "Document not found or you don't have permission to delete it" });
                return;
            }
            // Delete the document
            yield Document_1.default.findByIdAndDelete(documentId);
            res.status(200).json({ success: true, message: "Document deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting document:", error);
            res.status(500).json({ message: "Server error deleting document." });
        }
    });
    deleteDoc();
};
// Add this method to your DocumentsController class:
// Update the replacePlaceholders method to follow the same pattern as your other methods
DocumentsController.replacePlaceholders = (req, res, next) => {
    // Using a wrapper function to ensure consistent pattern
    const replacePlaceholders = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { content, placeholders } = req.body;
            if (!content || !placeholders) {
                res.status(400).json({
                    success: false,
                    message: 'Missing content or placeholders in request'
                });
                return;
            }
            let replacedContent = content;
            // Replace placeholders in {{placeholder}} format
            Object.entries(placeholders).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                replacedContent = replacedContent.replace(regex, value);
            });
            res.json({
                success: true,
                content: replacedContent
            });
        }
        catch (error) {
            console.error('Error replacing placeholders:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to replace placeholders'
            });
        }
    });
    replacePlaceholders();
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
            const document = yield Document_1.default.findOne({
                _id: documentId,
                userId
            });
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
