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
// Import the Admin Consultation Controller
const ConsultationController_1 = require("../../controllers/Admin/ConsultationController");
// Import the Subscription Controller
const SubscriptionController_1 = require("../../controllers/Admin/SubscriptionController");
const router = express_1.default.Router();
// Initialize controllers
const templateController = new DocumentTemplateController_1.DocumentTemplateController();
const categoryController = new DocumentTemplateController_1.DocumentCategoryController();
// Admin profile endpoint - Apply authMiddleware FIRST, then adminMiddleware
router.get('/profile', authMiddleware_1.authMiddleware, // Verify token is valid first
authMiddleware_1.adminMiddleware, // Then check admin role
(0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id); // Handle both ID formats
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
        data: {
            user
        }
    });
})));
// User management endpoints - Apply both middlewares in correct order
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
// Template routes (adding authMiddleware before adminMiddleware)
router.get('/templates', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.getAllTemplates);
router.get('/templates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.getTemplateById);
// Add file upload middleware for template creation
router.post('/templates', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, fileUploadMiddleware_1.templateFileUpload, templateController.createTemplate);
// Add file upload middleware for template update
router.put('/templates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, fileUploadMiddleware_1.templateFileUpload, templateController.updateTemplate);
router.delete('/templates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.deleteTemplate);
// Add new route for downloading template files
router.get('/templates/:id/download', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, templateController.downloadTemplateFile);
// Category routes (adding authMiddleware before adminMiddleware)
router.get('/categories', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.getAllCategories);
router.post('/categories', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, categoryController.deleteCategory);
router.get('/consult/types', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.getConsultationTypes);
router.post('/consult/types', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.createConsultationType);
router.put('/consult/types/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.updateConsultationType);
router.delete('/consult/types/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.deleteConsultationType);
// Consultation Bookings Routes
router.get('/consult/bookings', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, ConsultationController_1.AdminConsultationController.getConsultationBookings);
router.get('/consult/time-slots', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.getAllTimeSlots);
router.post('/consult/time-slots', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.createTimeSlot);
router.put('/consult/time-slots/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.updateTimeSlot);
router.delete('/consult/time-slots/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.deleteTimeSlot);
// Blocked dates management
router.get('/consult/blocked-dates', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.getBlockedDates);
router.post('/consult/block-date', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.blockDate);
router.delete('/consult/blocked-dates/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, AvailabilityController_1.AvailabilityController.unblockDate);
// Subscription Plans Routes
router.get('/subscription/plans', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getAllPlans);
router.get('/subscription/plans/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getPlanById);
router.post('/subscription/plans', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.createPlan);
router.put('/subscription/plans/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.updatePlan);
router.delete('/subscription/plans/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.deletePlan);
// User Subscriptions Routes
router.get('/subscription/users', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getAllUserSubscriptions);
router.get('/subscription/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getUserSubscriptionById);
router.post('/subscription/users', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.createUserSubscription);
router.put('/subscription/users/:id', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.updateUserSubscription);
router.put('/subscription/users/:id/cancel', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.cancelUserSubscription);
// Subscription Stats
router.get('/subscription/stats', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, SubscriptionController_1.SubscriptionController.getSubscriptionStats);
exports.default = router;
