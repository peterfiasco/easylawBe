import { Router } from "express";
import { DocumentsController } from "../../controllers/DocumentsController";
import { authMiddleware } from "../../middleware/authMiddleware";

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
  
  next();
});

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Document routes stay the same
router.get("/", DocumentsController.getAllDocuments);
router.post("/save", DocumentsController.saveDocument);
router.post("/export", DocumentsController.exportDocument);
router.get("/:id", DocumentsController.getDocumentById);
router.delete("/:id", DocumentsController.deleteDocument);

export default router;
