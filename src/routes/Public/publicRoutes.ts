import express from 'express';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import SubscriptionPlan from '../../models/SubscriptionPlan';

const router = express.Router();

// Get all active subscription plans (public route - no auth required)
const getPublicSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Only fetch active plans and sort by price
    const subscriptionPlans = await SubscriptionPlan.find({ 
      is_active: true 
    }).sort({ price: 1 }).select('name description price duration features');
    
    res.status(200).json({
      success: true,
      data: subscriptionPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
});

// Get the lowest price subscription plan (for hero section)
const getLowestPricePlan = asyncHandler(async (req: Request, res: Response) => {
  try {
    const lowestPlan = await SubscriptionPlan.findOne({ 
      is_active: true,
      price: { $gt: 0 } // Exclude free plans if any
    }).sort({ price: 1 }).select('name price');
    
    res.status(200).json({
      success: true,
      data: lowestPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lowest price plan',
      error: error.message
    });
  }
});

router.get('/subscription-plans', getPublicSubscriptionPlans);
router.get('/lowest-price-plan', getLowestPricePlan);

export default router;