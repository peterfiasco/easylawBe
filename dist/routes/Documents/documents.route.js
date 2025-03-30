"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentsController_1 = require("../../controllers/DocumentsController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
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
    next();
});
// Apply authMiddleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Document routes stay the same
router.get("/", DocumentsController_1.DocumentsController.getAllDocuments);
router.post("/save", DocumentsController_1.DocumentsController.saveDocument);
router.post("/export", DocumentsController_1.DocumentsController.exportDocument);
router.get("/:id", DocumentsController_1.DocumentsController.getDocumentById);
router.delete("/:id", DocumentsController_1.DocumentsController.deleteDocument);
exports.default = router;
