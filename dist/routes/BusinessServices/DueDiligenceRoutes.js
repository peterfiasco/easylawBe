"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const adminMiddleware_1 = require("../../middleware/adminMiddleware");
const DueDiligenceController_1 = require("../../controllers/BusinessServices/DueDiligenceController");
const AdminDueDiligenceController_1 = require("../../controllers/Admin/AdminDueDiligenceController");
// ✅ ADD: Import file upload middleware
const fileUpload_middleware_1 = require("../../middleware/fileUpload.middleware");
const DueDiligenceRouter = express_1.default.Router();
// Public routes (no authentication required)
DueDiligenceRouter.get('/pricing', AdminDueDiligenceController_1.AdminDueDiligenceController.getPublicPricing);
// User routes (authentication required)
// ✅ UPDATE: Add file upload middleware to submit route
DueDiligenceRouter.post('/submit', authMiddleware_1.UserMiddleware, fileUpload_middleware_1.uploadDueDiligenceDocuments, fileUpload_middleware_1.handleMulterError, DueDiligenceController_1.DueDiligenceController.submitDueDiligenceRequest);
DueDiligenceRouter.get('/user-investigations', authMiddleware_1.UserMiddleware, DueDiligenceController_1.DueDiligenceController.getUserInvestigations);
DueDiligenceRouter.get('/status/:reference_number', authMiddleware_1.UserMiddleware, DueDiligenceController_1.DueDiligenceController.getInvestigationStatus);
// Admin routes (admin authentication required)
DueDiligenceRouter.get('/admin/pricing', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getAllPricing);
DueDiligenceRouter.post('/admin/pricing', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.createPricing);
DueDiligenceRouter.put('/admin/pricing/:id', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.updatePricing);
DueDiligenceRouter.delete('/admin/pricing/:id', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.deletePricing);
DueDiligenceRouter.get('/admin/analytics', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getPricingAnalytics);
DueDiligenceRouter.get('/admin/all-investigations', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getAllInvestigations);
DueDiligenceRouter.put('/admin/update-status/:reference_number', adminMiddleware_1.AdminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.updateInvestigationStatus);
exports.default = DueDiligenceRouter;
