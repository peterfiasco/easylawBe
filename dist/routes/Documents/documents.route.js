"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentsController_1 = require("../../controllers/DocumentsController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authMiddleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Document routes
router.get("/", DocumentsController_1.DocumentsController.getAllDocuments);
router.post("/save", DocumentsController_1.DocumentsController.saveDocument);
router.post("/export", DocumentsController_1.DocumentsController.exportDocument);
router.get("/:id", DocumentsController_1.DocumentsController.getDocumentById);
router.delete("/:id", DocumentsController_1.DocumentsController.deleteDocument);
exports.default = router;
