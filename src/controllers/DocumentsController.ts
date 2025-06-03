import { Request, Response, NextFunction } from "express";
import PDFDocument from "pdfkit";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import Document, { IDocument } from "../models/Document";
import GeneratedDocument, { IGeneratedDocument } from "../models/GeneratedDocument";
import { CustomRequest } from "../middleware/authMiddleware";

type ExpressHandler = (req: Request, res: Response, next: NextFunction) => void;

export class DocumentsController {
  // GET /api/documents
  public static getAllDocuments: ExpressHandler = (req, res, next) => {
    const fetchDocuments = async () => {
      try {
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }
        
        // ✅ FIX: Fetch both uploaded and generated documents
        const [uploadedDocs, generatedDocs] = await Promise.all([
          Document.find({ user_id: userId }).sort({ createdAt: -1 }),
          GeneratedDocument.find({ userId }).sort({ createdAt: -1 })
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
      } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Server error fetching documents." });
      }
    };
    fetchDocuments();
  };

  // POST /api/documents/save
  public static saveDocument: ExpressHandler = (req, res, next) => {
    const saveDoc = async () => {
      try {
        const { title, content, templateId, formData, status } = req.body;
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!title || !content) {
          res.status(400).json({ message: "Missing title or content" });
          return;
        }
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }
        
        // ✅ FIX: Save as GeneratedDocument
        const newDoc = await GeneratedDocument.create({
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
      } catch (error) {
        console.error("Error saving document:", error);
        res.status(500).json({ message: "Server error saving document" });
      }
    };
    saveDoc();
  };
  
  // PUT /api/documents/:id
  public static updateDocument: ExpressHandler = (req, res, next) => {
    const updateDoc = async () => {
      try {
        const documentId = req.params.id;
        const { title, content, status } = req.body;
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }
        
        // ✅ FIX: Update GeneratedDocument
        const existingDoc = await GeneratedDocument.findOne({ _id: documentId, userId });
        if (!existingDoc) {
          res.status(404).json({ message: "Document not found or you don't have permission to update it" });
          return;
        }
        
        const updatedDoc = await GeneratedDocument.findByIdAndUpdate(
          documentId,
          { 
            title: title || existingDoc.title,
            content: content || existingDoc.content,
            status: status || existingDoc.status
          },
          { new: true }
        );
        
        res.status(200).json({
          success: true,
          message: "Document updated successfully",
          document: updatedDoc,
        });
      } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({ message: "Server error updating document." });
      }
    };
    updateDoc();
  };

  // POST /api/documents/export
  public static exportDocument: ExpressHandler = (req, res, next) => {
    const exportDoc = async () => {
      try {
        const { format, content, title, documentId } = req.body;
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!format || !content) {
          res.status(400).json({ message: "Missing format or content" });
          return;
        }
  
        // ✅ FIX: Update document status to exported
        if (userId && documentId) {
          try {
            await GeneratedDocument.findOneAndUpdate(
              { _id: documentId, userId },
              { status: 'exported' },
              { new: true }
            );
          } catch (updateErr) {
            console.error("Error updating document status:", updateErr);
          }
        }
  
        if (format === "pdf") {
          const doc = new PDFDocument();
          res.setHeader("Content-Disposition", `attachment; filename="${title || 'document'}.pdf"`);
          res.setHeader("Content-Type", "application/pdf");
          doc.pipe(res);
          doc.fontSize(14).text(content);
          doc.end();
        } else if (format === "word") {
          if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
            const htmlToDocx = require('html-to-docx');
            
            const buffer = await htmlToDocx(content, {
              title: title || 'Document',
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            });
            
            res.setHeader("Content-Disposition", `attachment; filename="${title || 'document'}.docx"`);
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );
            res.status(200).send(buffer);
          } else {
            const doc = new DocxDocument({
              sections: [
                {
                  children: [
                    new Paragraph({
                      children: [new TextRun(content)],
                    }),
                  ],
                },
              ],
            });
            const buffer = await Packer.toBuffer(doc);
            res.setHeader("Content-Disposition", `attachment; filename="${title || 'document'}.docx"`);
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );
            res.status(200).send(buffer);
          }
        } else {
          res.status(400).json({ message: "Unsupported format" });
        }
      } catch (error) {
        console.error("Error exporting document:", error);
        res.status(500).json({ message: "Server error generating file" });
      }
    };
  
    exportDoc();
  };

  // DELETE /api/documents/:id
  public static deleteDocument: ExpressHandler = (req, res, next) => {
    const deleteDoc = async () => {
      try {
        const documentId = req.params.id;
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }
        
        // Try to delete from both collections
        let deleted = false;
        
        // Try GeneratedDocument first
        const generatedDoc = await GeneratedDocument.findOne({ _id: documentId, userId });
        if (generatedDoc) {
          await GeneratedDocument.findByIdAndDelete(documentId);
          deleted = true;
        } else {
          // Try regular Document
          const uploadedDoc = await Document.findOne({ _id: documentId, user_id: userId });
          if (uploadedDoc) {
            await Document.findByIdAndDelete(documentId);
            deleted = true;
          }
        }
        
        if (!deleted) {
          res.status(404).json({ message: "Document not found or you don't have permission to delete it" });
          return;
        }
        
        res.status(200).json({ success: true, message: "Document deleted successfully" });
      } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Server error deleting document." });
      }
    };
    deleteDoc();
  };

  // GET /api/documents/:id
  public static getDocumentById: ExpressHandler = (req, res, next) => {
    const fetchDocument = async () => {
      try {
        const documentId = req.params.id;
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }
        
        // Try both document types
        let document = await GeneratedDocument.findOne({ _id: documentId, userId });
        
        if (!document) {
          document = await Document.findOne({ _id: documentId, user_id: userId });
        }
        
        if (!document) {
          res.status(404).json({ message: "Document not found" });
          return;
        }
        
        res.status(200).json({ success: true, data: document });
      } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ message: "Server error fetching document." });
      }
    };
    fetchDocument();
  };

  // ✅ FIX: Move intelligentPlaceholderReplacement to DocumentsController
  private static intelligentPlaceholderReplacement(content: string, placeholders: Record<string, string>): {
    content: string;
    replacementsMade: number;
    unmatchedPlaceholders: string[];
  } {
    let processedContent = content;
    let replacementsMade = 0;
    const unmatchedPlaceholders: string[] = [];
    
    // ✅ FIX: Properly type the documentPlaceholders array
    const placeholderMatches = content.match(/\{\{[^}]+\}\}/g);
    const documentPlaceholders: string[] = placeholderMatches ? placeholderMatches : [];
    
    console.log('🔍 [INTELLIGENT REPLACEMENT] Analysis:', {
      documentPlaceholders: documentPlaceholders.length,
      availableReplacements: Object.keys(placeholders).length,
      documentPlaceholdersList: documentPlaceholders,
      availableKeys: Object.keys(placeholders)
    });
    
    // For each placeholder in the document, try to find a match
    documentPlaceholders.forEach((placeholder: string) => {
      const cleanPlaceholder = placeholder.replace(/\{\{|\}\}/g, '').trim();
      let replacementValue: string | null = null;
      
      // Try exact match first
      if (placeholders[placeholder]) {
        replacementValue = placeholders[placeholder];
      } else {
        // Try intelligent matching
        const possibleMatches = Object.keys(placeholders).filter((key: string) => {
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
      } else {
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

  public static replacePlaceholders = async (req: Request, res: Response): Promise<void> => {
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
      let unmatchedPlaceholders: string[] = [];
      
      if (intelligentMatching) {
        // Use intelligent replacement
        const result = DocumentsController.intelligentPlaceholderReplacement(content, placeholders);
        processedContent = result.content;
        replacementsMade = result.replacementsMade;
        unmatchedPlaceholders = result.unmatchedPlaceholders;
      } else {
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
      
    } catch (error: any) {
      console.error('❌ [REPLACEMENT ERROR]:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to replace placeholders',
        error: error.message
      });
    }
  };

  // ✅ FIX: Make escapeRegExp a static method
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}