"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const BusinessServicesController_1 = require("../../controllers/BusinessServices/BusinessServicesController");
const AdminBusinessServicesController_1 = require("../../controllers/Admin/AdminBusinessServicesController");
const adminMiddleware_1 = require("../../middleware/adminMiddleware");
const BusinessServicesRouter = express_1.default.Router();
// Public routes (no authentication required)
// Remove individual pricing routes since they're handled in specific service routes
BusinessServicesRouter.get('/pricing', BusinessServicesController_1.BusinessServicesController.getPricing); // General pricing overview if needed
// User routes (authentication required) - Only keep general/combined endpoints here
BusinessServicesRouter.get('/user-services', authMiddleware_1.UserMiddleware, BusinessServicesController_1.BusinessServicesController.getUserServices); // Combined services
BusinessServicesRouter.get('/status/:referenceNumber', authMiddleware_1.UserMiddleware, BusinessServicesController_1.BusinessServicesController.getServiceStatus); // General status check
BusinessServicesRouter.put('/update-payment', authMiddleware_1.UserMiddleware, BusinessServicesController_1.BusinessServicesController.updatePaymentStatus);
BusinessServicesRouter.delete('/cancel/:referenceNumber', authMiddleware_1.UserMiddleware, BusinessServicesController_1.BusinessServicesController.cancelService);
// Remove specific service submission routes since they're handled in individual service routes
// BusinessServicesRouter.post('/register-business', UserMiddleware, BusinessServicesController.submitBusinessRegistration); // Remove
// BusinessServicesRouter.post('/due-diligence', UserMiddleware, BusinessServicesController.submitDueDiligence); // Remove
BusinessServicesRouter.post('/register-business-service', authMiddleware_1.UserMiddleware, BusinessServicesController_1.BusinessServicesController.submitBusinessService); // Remove
// Admin routes (admin authentication required) - Only general admin endpoints
BusinessServicesRouter.get('/admin/all-services', adminMiddleware_1.AdminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getAllServices);
BusinessServicesRouter.get('/admin/service/:referenceNumber', adminMiddleware_1.AdminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getServiceDetails);
BusinessServicesRouter.put('/admin/update-status/:referenceNumber', adminMiddleware_1.AdminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.updateServiceStatus);
BusinessServicesRouter.post('/admin/add-document/:referenceNumber', adminMiddleware_1.AdminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.addDocument);
BusinessServicesRouter.delete('/admin/delete-service/:referenceNumber', adminMiddleware_1.AdminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.deleteService);
BusinessServicesRouter.get('/admin/analytics', adminMiddleware_1.AdminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getAnalytics);
exports.default = BusinessServicesRouter;
