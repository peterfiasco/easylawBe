"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentsController_1 = require("../../controllers/DocumentsController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
// Import the models
const DocumentTemplate_1 = __importDefault(require("../../models/DocumentTemplate"));
const DocumentCategory_1 = __importDefault(require("../../models/DocumentCategory"));
const router = (0, express_1.Router)();
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
router.use(authMiddleware_1.authMiddleware);
// IMPORTANT: Define specific routes BEFORE wildcard routes
// Template routes must come before /:id route
router.get("/templates", (req, res) => {
    // Use a non-async wrapper to satisfy TypeScript
    DocumentTemplate_1.default.find({ isActive: true })
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
router.get("/templates/:id", (req, res) => {
    DocumentTemplate_1.default.findById(req.params.id)
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
router.get("/templates/:id/document", (req, res) => {
    DocumentTemplate_1.default.findById(req.params.id)
        .then(template => {
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        // Check if template has a templateFile field
        if (template.templateFile) {
            return res.json({ success: true, data: { content: template.templateFile } });
        }
        else {
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
router.get("/template-categories", (req, res) => {
    // Use a non-async wrapper to satisfy TypeScript
    DocumentCategory_1.default.find({ isActive: true })
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
router.get("/", DocumentsController_1.DocumentsController.getAllDocuments);
router.post("/", DocumentsController_1.DocumentsController.saveDocument); // Changed from /save to / for RESTful convention
router.put("/:id", DocumentsController_1.DocumentsController.updateDocument); // Add update route
router.post("/export", DocumentsController_1.DocumentsController.exportDocument);
router.post("/replace-placeholders", DocumentsController_1.DocumentsController.replacePlaceholders); // Use the controller method
// Add this new route to download templates for regular logged-in users
router.get("/templates/:id/download", (req, res) => {
    DocumentTemplate_1.default.findById(req.params.id)
        .then(template => {
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        // If the template has a file, send it as a response
        if (template.templateFile) {
            // You might need to handle the file format based on your storage mechanism
            // If it's stored as a binary buffer:
            return res.send(template.templateFile);
        }
        else {
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
// AI improvement route (pass-through to AI service)
router.post("/improve", (req, res) => {
    // This just forwards to the ChatGPT controller, but keeping it in the documents namespace
    // Forward to the ChatGPT controller or implement here
    console.log("Document improvement request received:", req.body);
    // If you have a separate controller, you can forward to it:
    // return ChatGPTController.improveDocument(req, res);
    // For now, just pass through the request to the chatgpt endpoint
    res.redirect(307, '/chatgpt/improve-document');
});
// IMPORTANT: This wildcard route must come AFTER all specific routes
router.get("/:id", DocumentsController_1.DocumentsController.getDocumentById);
router.delete("/:id", DocumentsController_1.DocumentsController.deleteDocument);
exports.default = router;
