"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const AvailabilityController_1 = require("../../controllers/Admin/AvailabilityController");
const DocumentTemplateController_1 = require("../../controllers/Admin/DocumentTemplateController");
const User_1 = __importDefault(require("../../models/User"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const fileUploadMiddleware_1 = require("../../middleware/fileUploadMiddleware");
const ConsultationController_1 = require("../../controllers/Admin/ConsultationController");
const SubscriptionController_1 = require("../../controllers/Admin/SubscriptionController");
const AdminBusinessServicesController_1 = require("../../controllers/Admin/AdminBusinessServicesController");
const AdminDueDiligenceController_1 = require("../../controllers/Admin/AdminDueDiligenceController");
const router = express_1.default.Router();
// Initialize controllers
const templateController = new DocumentTemplateController_1.DocumentTemplateController();
const categoryController = new DocumentTemplateController_1.DocumentCategoryController();
// Admin profile endpoint
router.get('/profile', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
        return;
    }
    const user = yield User_1.default.findById(userId).select('-password');
    if (!user) {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: { user }
    });
})));
// User management endpoints
router.get('/users', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find().select('-password');
    res.status(200).json({
        success: true,
        data: users
    });
})));
router.put('/users/:id/role', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
        res.status(400).json({
            success: false,
            message: 'Invalid role. Must be "user" or "admin"'
        });
        return;
    }
    const updatedUser = yield User_1.default.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select('-password');
    if (!updatedUser) {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
        return;
    }
    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser
    });
})));
router.delete('/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedUser = yield User_1.default.findByIdAndDelete(id);
    if (!deletedUser) {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
        return;
    }
    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
})));
// Template routes
router.get('/templates', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.getAllTemplates);
router.get('/templates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.getTemplateById);
router.post('/templates', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, fileUploadMiddleware_1.templateFileUpload, templateController.createTemplate);
router.put('/templates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, fileUploadMiddleware_1.templateFileUpload, templateController.updateTemplate);
router.delete('/templates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.deleteTemplate);
router.get('/templates/:id/download', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.downloadTemplateFile);
// Category routes
router.get('/categories', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.getAllCategories);
router.post('/categories', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.deleteCategory);
// Consultation routes
router.get('/consult/types', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.getConsultationTypes);
router.post('/consult/types', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.createConsultationType);
router.put('/consult/types/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.updateConsultationType);
router.delete('/consult/types/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.deleteConsultationType);
router.get('/consult/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.getConsultationBookings);
router.get('/consult/time-slots', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.getAllTimeSlots);
router.post('/consult/time-slots', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.createTimeSlot);
router.put('/consult/time-slots/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.updateTimeSlot);
router.delete('/consult/time-slots/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.deleteTimeSlot);
router.get('/consult/blocked-dates', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.getBlockedDates);
router.post('/consult/block-date', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.blockDate);
router.delete('/consult/blocked-dates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.unblockDate);
router.delete('/consult/bookings/:id', ConsultationController_1.AdminConsultationController.deleteConsultationBooking);
router.patch('/consult/bookings/:id/status', ConsultationController_1.AdminConsultationController.updateConsultationStatus);
// ==================== BUSINESS SERVICES ADMIN ROUTES ====================
// IMPORTANT: Specific routes MUST come before dynamic routes to avoid conflicts
// Business Services Routes - SPECIFIC ROUTES FIRST
router.get('/business-services/analytics/overview', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getAnalytics);
router.get('/business-services/analytics/revenue', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getRevenueAnalytics);
router.get('/business-services/analytics/performance', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getPerformanceAnalytics);
router.get('/business-services/pricing/admin', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getAllPricing);
router.post('/business-services/pricing/admin', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.createPricing);
router.get('/business-services/staff', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getAllStaff);
// DYNAMIC ROUTES LAST
router.get('/business-services', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getAllServices);
router.get('/business-services/:referenceNumber', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.getServiceDetails);
router.put('/business-services/:referenceNumber/status', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.updateServiceStatus);
router.post('/business-services/:referenceNumber/documents', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, fileUploadMiddleware_1.businessDocumentUpload, AdminBusinessServicesController_1.AdminBusinessServicesController.addDocument);
router.put('/business-services/:referenceNumber/assign', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.assignStaff);
router.delete('/business-services/:referenceNumber', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminBusinessServicesController_1.AdminBusinessServicesController.deleteService);
// ==================== END BUSINESS SERVICES ROUTES ====================
// ==================== DUE DILIGENCE ADMIN ROUTES ====================
// Due Diligence Management
router.get('/due-diligence/investigations', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getAllInvestigations);
router.get('/due-diligence/investigation/:referenceNumber', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getInvestigationDetails);
router.put('/due-diligence/investigation/:referenceNumber/status', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.updateInvestigationStatus);
router.post('/due-diligence/investigation/:referenceNumber/documents', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, fileUploadMiddleware_1.businessDocumentUpload, AdminDueDiligenceController_1.AdminDueDiligenceController.addDocument);
router.delete('/due-diligence/investigation/:referenceNumber', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.deleteInvestigation);
// Due Diligence Analytics and Pricing
router.get('/due-diligence/analytics', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getPricingAnalytics);
router.get('/due-diligence/pricing', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.getAllPricing);
router.post('/due-diligence/pricing', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.createPricing);
router.put('/due-diligence/pricing/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.updatePricing);
router.delete('/due-diligence/pricing/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AdminDueDiligenceController_1.AdminDueDiligenceController.deletePricing);
// ==================== END DUE DILIGENCE ROUTES ====================
// Subscription routes
router.get('/subscription/plans', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getAllPlans);
router.get('/subscription/plans/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getPlanById);
router.post('/subscription/plans', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.createPlan);
router.put('/subscription/plans/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.updatePlan);
router.delete('/subscription/plans/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.deletePlan);
router.get('/subscription/users', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getAllUserSubscriptions);
router.get('/subscription/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getUserSubscriptionById);
router.post('/subscription/users', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.createUserSubscription);
router.put('/subscription/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.updateUserSubscription);
router.put('/subscription/users/:id/cancel', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.cancelUserSubscription);
// Subscription Stats
router.get('/subscription/stats', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getSubscriptionStats);
exports.default = router;
