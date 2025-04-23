import express, { Response } from 'express';
import { adminMiddleware, authMiddleware, CustomRequest } from '../../middleware/authMiddleware';
import { AvailabilityController } from '../../controllers/Admin/AvailabilityController';
import {
  DocumentTemplateController,
  DocumentCategoryController
} from '../../controllers/Admin/DocumentTemplateController';
import User from '../../models/User';
import asyncHandler from 'express-async-handler';
import { templateFileUpload } from '../../middleware/fileUploadMiddleware';
// Import the Admin Consultation Controller
import { AdminConsultationController } from '../../controllers/Admin/ConsultationController';
// Import the Subscription Controller
import { SubscriptionController } from '../../controllers/Admin/SubscriptionController';

const router = express.Router();

// Initialize controllers
const templateController = new DocumentTemplateController();
const categoryController = new DocumentCategoryController();

// Admin profile endpoint - Apply authMiddleware FIRST, then adminMiddleware
router.get('/profile',
  authMiddleware, // Verify token is valid first
  adminMiddleware, // Then check admin role
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id || req.user?.user_id; // Handle both ID formats
    
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
      data: {
        user
      }
    });
  }));

// User management endpoints - Apply both middlewares in correct order
router.get('/users',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      data: users
    });
  }));

router.put('/users/:id/role',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: CustomRequest, res: Response) => {
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

router.delete('/users/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: CustomRequest, res: Response) => {
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

// Template routes (adding authMiddleware before adminMiddleware)
router.get('/templates', authMiddleware, adminMiddleware, templateController.getAllTemplates);
router.get('/templates/:id', authMiddleware, adminMiddleware, templateController.getTemplateById);
// Add file upload middleware for template creation
router.post('/templates', authMiddleware, adminMiddleware, templateFileUpload, templateController.createTemplate);
// Add file upload middleware for template update
router.put('/templates/:id', authMiddleware, adminMiddleware, templateFileUpload, templateController.updateTemplate);
router.delete('/templates/:id', authMiddleware, adminMiddleware, templateController.deleteTemplate);
// Add new route for downloading template files
router.get('/templates/:id/download', authMiddleware, adminMiddleware, templateController.downloadTemplateFile);

// Category routes (adding authMiddleware before adminMiddleware)
router.get('/categories', authMiddleware, adminMiddleware, categoryController.getAllCategories);
router.post('/categories', authMiddleware, adminMiddleware, categoryController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

router.get('/consult/types', authMiddleware, adminMiddleware, AdminConsultationController.getConsultationTypes);
router.post('/consult/types', authMiddleware, adminMiddleware, AdminConsultationController.createConsultationType);
router.put('/consult/types/:id', authMiddleware, adminMiddleware, AdminConsultationController.updateConsultationType);
router.delete('/consult/types/:id', authMiddleware, adminMiddleware, AdminConsultationController.deleteConsultationType);

// Consultation Bookings Routes
router.get('/consult/bookings', authMiddleware, adminMiddleware, AdminConsultationController.getConsultationBookings);
router.get('/consult/time-slots', authMiddleware, adminMiddleware, AvailabilityController.getAllTimeSlots);
router.post('/consult/time-slots', authMiddleware, adminMiddleware, AvailabilityController.createTimeSlot);
router.put('/consult/time-slots/:id', authMiddleware, adminMiddleware, AvailabilityController.updateTimeSlot);
router.delete('/consult/time-slots/:id', authMiddleware, adminMiddleware, AvailabilityController.deleteTimeSlot);

// Blocked dates management
router.get('/consult/blocked-dates', authMiddleware, adminMiddleware, AvailabilityController.getBlockedDates);
router.post('/consult/block-date', authMiddleware, adminMiddleware, AvailabilityController.blockDate);
router.delete('/consult/blocked-dates/:id', authMiddleware, adminMiddleware, AvailabilityController.unblockDate);

// Subscription Plans Routes
router.get('/subscription/plans', authMiddleware, adminMiddleware, SubscriptionController.getAllPlans);
router.get('/subscription/plans/:id', authMiddleware, adminMiddleware, SubscriptionController.getPlanById);
router.post('/subscription/plans', authMiddleware, adminMiddleware, SubscriptionController.createPlan);
router.put('/subscription/plans/:id', authMiddleware, adminMiddleware, SubscriptionController.updatePlan);
router.delete('/subscription/plans/:id', authMiddleware, adminMiddleware, SubscriptionController.deletePlan);

// User Subscriptions Routes
router.get('/subscription/users', authMiddleware, adminMiddleware, SubscriptionController.getAllUserSubscriptions);
router.get('/subscription/users/:id', authMiddleware, adminMiddleware, SubscriptionController.getUserSubscriptionById);
router.post('/subscription/users', authMiddleware, adminMiddleware, SubscriptionController.createUserSubscription);
router.put('/subscription/users/:id', authMiddleware, adminMiddleware, SubscriptionController.updateUserSubscription);
router.put('/subscription/users/:id/cancel', authMiddleware, adminMiddleware, SubscriptionController.cancelUserSubscription);

// Subscription Stats
router.get('/subscription/stats', authMiddleware, adminMiddleware, SubscriptionController.getSubscriptionStats);

export default router;
