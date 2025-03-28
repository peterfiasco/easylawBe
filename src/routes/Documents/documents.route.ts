import { Router } from "express";
import { DocumentsController } from "../../controllers/DocumentsController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Document routes
router.get("/", DocumentsController.getAllDocuments);
router.post("/save", DocumentsController.saveDocument);
router.post("/export", DocumentsController.exportDocument);
router.get("/:id", DocumentsController.getDocumentById);
router.delete("/:id", DocumentsController.deleteDocument);

export default router;
