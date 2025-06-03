import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { AdminMiddleware } from '../../middleware/adminMiddleware';
import { DueDiligenceController } from '../../controllers/BusinessServices/DueDiligenceController';
import { AdminDueDiligenceController } from '../../controllers/Admin/AdminDueDiligenceController';
// ✅ ADD: Import file upload middleware
import { uploadDueDiligenceDocuments, handleMulterError } from '../../middleware/fileUpload.middleware';

const DueDiligenceRouter = express.Router();

// Public routes (no authentication required)
DueDiligenceRouter.get('/pricing', AdminDueDiligenceController.getPublicPricing);

// User routes (authentication required)
// ✅ UPDATE: Add file upload middleware to submit route
DueDiligenceRouter.post('/submit', 
  UserMiddleware, 
  uploadDueDiligenceDocuments, 
  handleMulterError,
  DueDiligenceController.submitDueDiligenceRequest
);
DueDiligenceRouter.get('/user-investigations', UserMiddleware, DueDiligenceController.getUserInvestigations);
DueDiligenceRouter.get('/status/:reference_number', UserMiddleware, DueDiligenceController.getInvestigationStatus);

// Admin routes (admin authentication required)
DueDiligenceRouter.get('/admin/pricing', AdminMiddleware, AdminDueDiligenceController.getAllPricing);
DueDiligenceRouter.post('/admin/pricing', AdminMiddleware, AdminDueDiligenceController.createPricing);
DueDiligenceRouter.put('/admin/pricing/:id', AdminMiddleware, AdminDueDiligenceController.updatePricing);
DueDiligenceRouter.delete('/admin/pricing/:id', AdminMiddleware, AdminDueDiligenceController.deletePricing);
DueDiligenceRouter.get('/admin/analytics', AdminMiddleware, AdminDueDiligenceController.getPricingAnalytics);
DueDiligenceRouter.get('/admin/all-investigations', AdminMiddleware, AdminDueDiligenceController.getAllInvestigations);
DueDiligenceRouter.put('/admin/update-status/:reference_number', AdminMiddleware, AdminDueDiligenceController.updateInvestigationStatus);

export default DueDiligenceRouter;
