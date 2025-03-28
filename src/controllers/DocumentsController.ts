import { Request, Response, NextFunction } from "express";
import PDFDocument from "pdfkit";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import Document from "../models/Document";
import { CustomRequest } from "../middleware/authMiddleware";

type ExpressHandler = (req: Request, res: Response, next: NextFunction) => void;

export class DocumentsController {
  // GET /api/documents
  public static getAllDocuments: ExpressHandler = (req, res, next) => {
    const fetchDocuments = async () => {
      try {
        // Get userId from authenticated user in request
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }

        // Fetch documents belonging to the user
        const documents = await Document.find({ userId }).sort({ createdAt: -1 });
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
        const { title, finalDoc } = req.body;
        // Get userId from authenticated user
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!title || !finalDoc) {
          res.status(400).json({ message: "Missing title or finalDoc" });
          return;
        }
        
        if (!userId) {
          res.status(401).json({ message: "Authentication required" });
          return;
        }

        // Create new document in MongoDB
        const newDoc = await Document.create({
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
      } catch (error) {
        console.error("Error saving document:", error);
        res.status(500).json({ message: "Server error saving document" });
      }
    };

    saveDoc();
  };
 
  // POST /api/documents/export
  public static exportDocument: ExpressHandler = (req, res, next) => {
    const exportDoc = async () => {
      try {
        const { format, content, title } = req.body;
        const userId = (req as CustomRequest).user?._id || (req as CustomRequest).user?.user_id;
        
        if (!format || !content) {
          res.status(400).json({ message: "Missing format or content" });
          return;
        }

        // Save document if authenticated
        if (userId && title) {
          try {
            await Document.findOneAndUpdate(
              { userId, title },
              { content, format },
              { upsert: true, new: true }
            );
          } catch (saveErr) {
            console.error("Error saving document during export:", saveErr);
            // Continue with export even if save fails
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

        // Ensure the document belongs to the user
        const document = await Document.findOne({
          _id: documentId,
          userId
        });

        if (!document) {
          res.status(404).json({ message: "Document not found or you don't have permission to delete it" });
          return;
        }

        // Delete the document
        await Document.findByIdAndDelete(documentId);

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

        const document = await Document.findOne({
          _id: documentId,
          userId
        });

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
}
