// Create this new file for public routes
import express from 'express';
import { AdminBusinessServicePricingController } from '../controllers/Admin/AdminBusinessServicePricingController';

const router = express.Router();

// Public pricing endpoint (no auth required)
router.get('/business-services/pricing', AdminBusinessServicePricingController.getPublicPricing);

export default router;