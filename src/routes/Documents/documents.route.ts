import { Router, Request, Response, NextFunction } from "express";
import { DocumentsController } from "../../controllers/DocumentsController";
import { ChatGptController } from "../../controllers/ChatGptController"; // ✅ ADD: Import ChatGPT controller
import { authMiddleware } from "../../middleware/authMiddleware";
// Import the models
import DocumentTemplate from "../../models/DocumentTemplate";
import DocumentCategory from "../../models/DocumentCategory";

const router = Router();

// Add debugging middleware before authentication
router.use((req, res, next) => {
  console.log("📝 Documents API Request:");
  console.log("  Method:", req.method);
  console.log("  Path:", req.path);
  console.log("  Headers:", JSON.stringify({
    authorization: req.headers.authorization ?
      `${req.headers.authorization.substring(0, 15)}...` : 'none',
    'content-type': req.headers['content-type']
  }));
  console.log("  Body:", req.method !== 'GET' ? JSON.stringify(req.body, null, 2).substring(0, 200) + '...' : 'N/A');
  next();
});

// Apply authMiddleware to all routes
router.use(authMiddleware);

// IMPORTANT: Define specific routes BEFORE wildcard routes
// Template routes must come before /:id route
router.get("/templates", (req: Request, res: Response) => {
  DocumentTemplate.find({ isActive: true })
    .populate('category')
    .then(templates => {
      console.log(`Found ${templates.length} templates`);
      res.json({ success: true, data: templates });
    })
    .catch(error => {
      console.error('Error fetching templates:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    });
});

// Get a specific template by ID
router.get("/templates/:id", (req: Request, res: Response) => {
  DocumentTemplate.findById(req.params.id)
    .populate('category')
    .then(template => {
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      res.json({ success: true, data: template });
    })
    .catch(error => {
      console.error(`Error fetching template ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to fetch template' });
    });
});

// Get template document content by template ID
router.get("/templates/:id/document", (req: Request, res: Response) => {
  DocumentTemplate.findById(req.params.id)
    .then(template => {
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      
      if (template.templateFile) {
        return res.json({ success: true, data: { content: template.templateFile } });
      } else {
        return res.status(404).json({
          success: false,
          message: 'No document content found for this template'
        });
      }
    })
    .catch(error => {
      console.error(`Error fetching template document ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to fetch template document' });
    });
});

router.get("/template-categories", (req: Request, res: Response) => {
  DocumentCategory.find({ isActive: true })
    .then(categories => {
      console.log(`Found ${categories.length} categories`);
      res.json({ success: true, data: categories });
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    });
});

// Standard document routes
router.get("/", DocumentsController.getAllDocuments);
router.post("/", DocumentsController.saveDocument);
router.put("/:id", DocumentsController.updateDocument);
router.post("/export", DocumentsController.exportDocument); // ✅ ADD: Export route
router.post("/replace-placeholders", DocumentsController.replacePlaceholders);

// ✅ ADD: ChatGPT document generation with file upload support
router.post("/generate", 
  ChatGptController.uploadMiddleware, 
  ChatGptController.generateDocument
);

// Template download route
router.get("/templates/:id/download", (req: Request, res: Response) => {
  DocumentTemplate.findById(req.params.id)
    .then(template => {
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      
      if (template.templateFile) {
        return res.send(template.templateFile);
      } else {
        return res.status(404).json({
          success: false,
          message: 'No template file found for this template'
        });
      }
    })
    .catch(error => {
      console.error(`Error downloading template ${req.params.id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to download template' });
    });
});

// AI improvement route
router.post("/improve", (req: Request, res: Response) => {
  console.log("Document improvement request received:", req.body);
  res.redirect(307, '/chatgpt/improve-document');
});

// IMPORTANT: This wildcard route must come AFTER all specific routes
router.get("/:id", DocumentsController.getDocumentById);
router.delete("/:id", DocumentsController.deleteDocument);

export default router;
