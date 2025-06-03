import express, { Response } from 'express';
import { adminMiddleware, authMiddleware, CustomRequest } from '../../middleware/authMiddleware';
import { AvailabilityController } from '../../controllers/Admin/AvailabilityController';
import {
  DocumentTemplateController,
  DocumentCategoryController
} from '../../controllers/Admin/DocumentTemplateController';
import User from '../../models/User';
import asyncHandler from 'express-async-handler';
import { templateFileUpload, businessDocumentUpload } from '../../middleware/fileUploadMiddleware';
import { AdminConsultationController } from '../../controllers/Admin/ConsultationController';
import { SubscriptionController } from '../../controllers/Admin/SubscriptionController';
import { AdminBusinessServicesController } from '../../controllers/Admin/AdminBusinessServicesController';
import { AdminDueDiligenceController } from '../../controllers/Admin/AdminDueDiligenceController';

const router = express.Router();

// Initialize controllers
const templateController = new DocumentTemplateController();
const categoryController = new DocumentCategoryController();

// Admin profile endpoint
router.get('/profile', authMiddleware, adminMiddleware, asyncHandler(async (req: CustomRequest, res: Response) => {
  const userId = req.user?._id || req.user?.user_id;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
    return;
  }
  
  const user = await User.findById(userId).select('-password');
  
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
}));

// User management endpoints
router.get('/users', authMiddleware, adminMiddleware, asyncHandler(async (req: CustomRequest, res: Response) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    data: users
  });
}));

router.put('/users/:id/role', authMiddleware, adminMiddleware, asyncHandler(async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['user', 'admin'].includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role. Must be "user" or "admin"'
    });
    return;
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
  
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
}));

router.delete('/users/:id', authMiddleware, adminMiddleware, asyncHandler(async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);
  
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
}));

// Template routes
router.get('/templates', authMiddleware, adminMiddleware, templateController.getAllTemplates);
router.get('/templates/:id', authMiddleware, adminMiddleware, templateController.getTemplateById);
router.post('/templates', authMiddleware, adminMiddleware, templateFileUpload, templateController.createTemplate);
router.put('/templates/:id', authMiddleware, adminMiddleware, templateFileUpload, templateController.updateTemplate);
router.delete('/templates/:id', authMiddleware, adminMiddleware, templateController.deleteTemplate);
router.get('/templates/:id/download', authMiddleware, adminMiddleware, templateController.downloadTemplateFile);

// Category routes
router.get('/categories', authMiddleware, adminMiddleware, categoryController.getAllCategories);
router.post('/categories', authMiddleware, adminMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

// Consultation routes
router.get('/consult/types', authMiddleware, adminMiddleware, AdminConsultationController.getConsultationTypes);
router.post('/consult/types', authMiddleware, adminMiddleware, AdminConsultationController.createConsultationType);
router.put('/consult/types/:id', authMiddleware, adminMiddleware, AdminConsultationController.updateConsultationType);
router.delete('/consult/types/:id', authMiddleware, adminMiddleware, AdminConsultationController.deleteConsultationType);

router.get('/consult/bookings', authMiddleware, adminMiddleware, AdminConsultationController.getConsultationBookings);
router.get('/consult/time-slots', authMiddleware, adminMiddleware, AvailabilityController.getAllTimeSlots);
router.post('/consult/time-slots', authMiddleware, adminMiddleware, AvailabilityController.createTimeSlot);
router.put('/consult/time-slots/:id', authMiddleware, adminMiddleware, AvailabilityController.updateTimeSlot);
router.delete('/consult/time-slots/:id', authMiddleware, adminMiddleware, AvailabilityController.deleteTimeSlot);

router.get('/consult/blocked-dates', authMiddleware, adminMiddleware, AvailabilityController.getBlockedDates);
router.post('/consult/block-date', authMiddleware, adminMiddleware, AvailabilityController.blockDate);
router.delete('/consult/blocked-dates/:id', authMiddleware, adminMiddleware, AvailabilityController.unblockDate);

router.delete('/consult/bookings/:id', AdminConsultationController.deleteConsultationBooking);
router.patch('/consult/bookings/:id/status', AdminConsultationController.updateConsultationStatus);

// ==================== BUSINESS SERVICES ADMIN ROUTES ====================
// IMPORTANT: Specific routes MUST come before dynamic routes to avoid conflicts

// Business Services Routes - SPECIFIC ROUTES FIRST
router.get('/business-services/analytics/overview', authMiddleware, adminMiddleware, AdminBusinessServicesController.getAnalytics);
router.get('/business-services/analytics/revenue', authMiddleware, adminMiddleware, AdminBusinessServicesController.getRevenueAnalytics);
router.get('/business-services/analytics/performance', authMiddleware, adminMiddleware, AdminBusinessServicesController.getPerformanceAnalytics);
router.get('/business-services/pricing/admin', authMiddleware, adminMiddleware, AdminBusinessServicesController.getAllPricing);
router.post('/business-services/pricing/admin', authMiddleware, adminMiddleware, AdminBusinessServicesController.createPricing);
router.get('/business-services/staff', authMiddleware, adminMiddleware, AdminBusinessServicesController.getAllStaff);

// DYNAMIC ROUTES LAST
router.get('/business-services', authMiddleware, adminMiddleware, AdminBusinessServicesController.getAllServices);
router.get('/business-services/:referenceNumber', authMiddleware, adminMiddleware, AdminBusinessServicesController.getServiceDetails);
router.put('/business-services/:referenceNumber/status', authMiddleware, adminMiddleware, AdminBusinessServicesController.updateServiceStatus);
router.post('/business-services/:referenceNumber/documents', authMiddleware, adminMiddleware, businessDocumentUpload, AdminBusinessServicesController.addDocument);
router.put('/business-services/:referenceNumber/assign', authMiddleware, adminMiddleware, AdminBusinessServicesController.assignStaff);
router.delete('/business-services/:referenceNumber', authMiddleware, adminMiddleware, AdminBusinessServicesController.deleteService);
// ==================== END BUSINESS SERVICES ROUTES ====================

// ==================== DUE DILIGENCE ADMIN ROUTES ====================
// Due Diligence Management
router.get('/due-diligence/investigations', authMiddleware, adminMiddleware, AdminDueDiligenceController.getAllInvestigations);
router.get('/due-diligence/investigation/:referenceNumber', authMiddleware, adminMiddleware, AdminDueDiligenceController.getInvestigationDetails);
router.put('/due-diligence/investigation/:referenceNumber/status', authMiddleware, adminMiddleware, AdminDueDiligenceController.updateInvestigationStatus);
router.post('/due-diligence/investigation/:referenceNumber/documents', authMiddleware, adminMiddleware, businessDocumentUpload, AdminDueDiligenceController.addDocument);
router.delete('/due-diligence/investigation/:referenceNumber', authMiddleware, adminMiddleware, AdminDueDiligenceController.deleteInvestigation);

// Due Diligence Analytics and Pricing
router.get('/due-diligence/analytics', authMiddleware, adminMiddleware, AdminDueDiligenceController.getPricingAnalytics);
router.get('/due-diligence/pricing', authMiddleware, adminMiddleware, AdminDueDiligenceController.getAllPricing);
router.post('/due-diligence/pricing', authMiddleware, adminMiddleware, AdminDueDiligenceController.createPricing);
router.put('/due-diligence/pricing/:id', authMiddleware, adminMiddleware, AdminDueDiligenceController.updatePricing);
router.delete('/due-diligence/pricing/:id', authMiddleware, adminMiddleware, AdminDueDiligenceController.deletePricing);
// ==================== END DUE DILIGENCE ROUTES ====================

// Subscription routes
router.get('/subscription/plans', authMiddleware, adminMiddleware, SubscriptionController.getAllPlans);
router.get('/subscription/plans/:id', authMiddleware, adminMiddleware, SubscriptionController.getPlanById);
router.post('/subscription/plans', authMiddleware, adminMiddleware, SubscriptionController.createPlan);
router.put('/subscription/plans/:id', authMiddleware, adminMiddleware, SubscriptionController.updatePlan);
router.delete('/subscription/plans/:id', authMiddleware, adminMiddleware, SubscriptionController.deletePlan);

router.get('/subscription/users', authMiddleware, adminMiddleware, SubscriptionController.getAllUserSubscriptions);
router.get('/subscription/users/:id', authMiddleware, adminMiddleware, SubscriptionController.getUserSubscriptionById);
router.post('/subscription/users', authMiddleware, adminMiddleware, SubscriptionController.createUserSubscription);
router.put('/subscription/users/:id', authMiddleware, adminMiddleware, SubscriptionController.updateUserSubscription);
router.put('/subscription/users/:id/cancel', authMiddleware, adminMiddleware, SubscriptionController.cancelUserSubscription);

// Subscription Stats
router.get('/subscription/stats', authMiddleware, adminMiddleware, SubscriptionController.getSubscriptionStats);

export default router;
