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
        var _b;
        try {
            // Type assertion is needed here to satisfy TypeScript
            const typedReq = req;
            const userId = (_b = typedReq.user) === null || _b === void 0 ? void 0 : _b._id;
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
        var _b;
        try {
            const { title, finalDoc } = req.body;
            // Type assertion is needed here
            const typedReq = req;
            const userId = (_b = typedReq.user) === null || _b === void 0 ? void 0 : _b._id;
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
// POST /api/documents/export
DocumentsController.exportDocument = (req, res, next) => {
    const exportDoc = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const { format, content, title } = req.body;
            // Type assertion
            const typedReq = req;
            const userId = (_b = typedReq.user) === null || _b === void 0 ? void 0 : _b._id;
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
        var _b;
        try {
            const documentId = req.params.id;
            // Type assertion
            const typedReq = req;
            const userId = (_b = typedReq.user) === null || _b === void 0 ? void 0 : _b._id;
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
// GET /api/documents/:id
DocumentsController.getDocumentById = (req, res, next) => {
    const fetchDocument = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const documentId = req.params.id;
            // Type assertion
            const typedReq = req;
            const userId = (_b = typedReq.user) === null || _b === void 0 ? void 0 : _b._id;
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
