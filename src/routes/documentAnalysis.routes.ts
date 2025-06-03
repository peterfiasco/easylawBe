import express from 'express';
import { DocumentAnalysisController } from '../controllers/DocumentAnalysis/DocumentAnalysisController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadDocumentForAnalysis, handleMulterError } from '../middleware/fileUpload.middleware';

const router = express.Router();

// Analyze document (existing)
router.post('/analyze', 
  authMiddleware, 
  uploadDocumentForAnalysis, 
  handleMulterError, 
  DocumentAnalysisController.analyzeDocument
);

// 🆕 Get user's analysis history
router.get('/history', 
  authMiddleware, 
  DocumentAnalysisController.getUserAnalysisHistory
);

// 🆕 Get specific analysis by ID
router.get('/:analysisId', 
  authMiddleware, 
  DocumentAnalysisController.getAnalysisById
);

// 🆕 Delete analysis
router.delete('/:analysisId', 
  authMiddleware, 
  DocumentAnalysisController.deleteAnalysis
);

// 🆕 Improve document
router.post('/improve', 
  authMiddleware, 
  uploadDocumentForAnalysis, 
  handleMulterError, 
  DocumentAnalysisController.improveDocument
);

export default router;