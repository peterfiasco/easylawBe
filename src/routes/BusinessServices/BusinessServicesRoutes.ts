import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { BusinessServicesController } from '../../controllers/BusinessServices/BusinessServicesController';
import { AdminBusinessServicesController } from '../../controllers/Admin/AdminBusinessServicesController';
import { AdminMiddleware } from '../../middleware/adminMiddleware';

const BusinessServicesRouter = express.Router();

// Public routes (no authentication required)
// Remove individual pricing routes since they're handled in specific service routes
BusinessServicesRouter.get('/pricing', BusinessServicesController.getPricing); // General pricing overview if needed

// User routes (authentication required) - Only keep general/combined endpoints here
BusinessServicesRouter.get('/user-services', UserMiddleware, BusinessServicesController.getUserServices); // Combined services
BusinessServicesRouter.get('/status/:referenceNumber', UserMiddleware, BusinessServicesController.getServiceStatus); // General status check
BusinessServicesRouter.put('/update-payment', UserMiddleware, BusinessServicesController.updatePaymentStatus);
BusinessServicesRouter.delete('/cancel/:referenceNumber', UserMiddleware, BusinessServicesController.cancelService);

// Remove specific service submission routes since they're handled in individual service routes
// BusinessServicesRouter.post('/register-business', UserMiddleware, BusinessServicesController.submitBusinessRegistration); // Remove
// BusinessServicesRouter.post('/due-diligence', UserMiddleware, BusinessServicesController.submitDueDiligence); // Remove
BusinessServicesRouter.post('/register-business-service', UserMiddleware, BusinessServicesController.submitBusinessService); // Remove

// Admin routes (admin authentication required) - Only general admin endpoints
BusinessServicesRouter.get('/admin/all-services', AdminMiddleware, AdminBusinessServicesController.getAllServices);
BusinessServicesRouter.get('/admin/service/:referenceNumber', AdminMiddleware, AdminBusinessServicesController.getServiceDetails);
BusinessServicesRouter.put('/admin/update-status/:referenceNumber', AdminMiddleware, AdminBusinessServicesController.updateServiceStatus);
BusinessServicesRouter.post('/admin/add-document/:referenceNumber', AdminMiddleware, AdminBusinessServicesController.addDocument);
BusinessServicesRouter.delete('/admin/delete-service/:referenceNumber', AdminMiddleware, AdminBusinessServicesController.deleteService);
BusinessServicesRouter.get('/admin/analytics', AdminMiddleware, AdminBusinessServicesController.getAnalytics);

export default BusinessServicesRouter;