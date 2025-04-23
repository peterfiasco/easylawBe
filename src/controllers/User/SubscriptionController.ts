import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import SubscriptionPlan from '../../models/SubscriptionPlan';
import UserSubscription from '../../models/UserSubscription';
import mongoose from 'mongoose';
import { CustomRequest } from '../../middleware/authMiddleware';

export class UserSubscriptionController {
  // Get all active subscription plans for users
  static getSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
    // Only fetch active plans and sort by price
    const subscriptionPlans = await SubscriptionPlan.find({ is_active: true }).sort({ price: 1 });
    
    res.status(200).json({
      success: true,
      data: subscriptionPlans
    });
  });

  // Create a new subscription (initial state is 'pending')
  static createSubscription = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { planId, amount } = req.body;
    
    // Debug check - what's in the req.user object?
    console.log('User object in request:', req.user);
    
    // Check both _id and user_id fields
    const userId = req.user?._id || req.user?.user_id;
    console.log('User ID from request:', userId);
    
    // Make sure we have a valid user ID
    if (!req.user || !userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }
    
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    if (!planId) {
      res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
      return;
    }
    
    // Verify that the plan exists
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
      return;
    }
    
    // Calculate end date based on plan duration (assuming duration is in days)
    let endDate = new Date();
    
    // Handle duration as a number (days)
    if (plan.duration) {
      // Add the specified number of days to the current date
      endDate.setDate(endDate.getDate() + plan.duration);
    } else {
      // Default to 30 days if no duration specified
      endDate.setDate(endDate.getDate() + 30);
    }
    
    try {
      console.log('Creating subscription with user ID:', userObjectId);
      
      // Create the subscription with explicit ObjectId
      const subscription = await UserSubscription.create({
        user_id: userObjectId,
        plan_id: new mongoose.Types.ObjectId(planId),
        start_date: new Date(),
        end_date: endDate,
        amount_paid: amount || plan.price,
        status: 'pending',
        metadata: {} // Initialize empty metadata
      });
      
      res.status(201).json({
        success: true,
        data: {
          subscriptionId: subscription._id
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      console.error('Attempted with user ID:', userObjectId);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: error.message
      });
    }
  });

  // Temporary direct subscription creation endpoint
  static createDirectSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { planId, amount, userId } = req.body;
    
    // Validate required fields
    if (!planId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Plan ID and User ID are required'
      });
      return;
    }
    
    // Verify that the plan exists
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
      return;
    }
    
    // Calculate end date based on plan duration
    let endDate = new Date();
    
    // Handle duration as a number (days)
    if (plan.duration) {
      // Add the specified number of days to the current date
      endDate.setDate(endDate.getDate() + plan.duration);
    } else {
      // Default to 30 days if no duration specified
      endDate.setDate(endDate.getDate() + 30);
    }
    
    try {
      console.log('Creating direct subscription with user ID:', userId);
      
      // Create the subscription with explicit ObjectId
      const subscription = await UserSubscription.create({
        user_id: new mongoose.Types.ObjectId(userId),
        plan_id: new mongoose.Types.ObjectId(planId),
        start_date: new Date(),
        end_date: endDate,
        amount_paid: amount || plan.price,
        status: 'pending',
        metadata: {} // Initialize empty metadata
      });
      
      res.status(201).json({
        success: true,
        data: {
          subscriptionId: subscription._id
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: error.message
      });
    }
  });

  // Get current user's subscription information
  static getUserSubscription = asyncHandler(async (req: CustomRequest, res: Response) => {
    // Check both _id and user_id fields
    const userId = req.user?._id || req.user?.user_id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }
    
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    try {
      // Find the user's active subscription
      const subscription = await UserSubscription.findOne({
        user_id: userObjectId,
        status: 'active',
        end_date: { $gt: new Date() } // Not expired
      }).populate('plan_id');
      
      if (!subscription) {
        // Remove the "return" keyword here
        res.status(200).json({
          success: true,
          data: {
            isSubscribed: false,
            plan: null,
            expiresAt: null
          }
        });
        return; // Just return without returning the response object
      }
      
      // Return subscription details
      res.status(200).json({
        success: true,
        data: {
          isSubscribed: true,
          plan: subscription.plan_id,
          expiresAt: subscription.end_date,
          metadata: subscription.metadata || {} // Include metadata in response
        }
      });
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve subscription information',
        error: error.message
      });
    }
  });

  // Track subscription usage
  static trackSubscriptionUsage = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { action, format } = req.body;
    const userId = req.user?._id || req.user?.user_id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }
    
    try {
      // Get the user's active subscription
      const userObjectId = typeof userId === 'string'
        ? new mongoose.Types.ObjectId(userId)
        : userId;
      
      // Fully populate the plan_id field
      const subscription = await UserSubscription.findOne({
        user_id: userObjectId,
        status: 'active',
        end_date: { $gt: new Date() }
      }).populate('plan_id');
      
      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
        return;
      }
      
      // Ensure plan_id is populated and not an ObjectId
      if (!subscription.plan_id || subscription.plan_id instanceof mongoose.Types.ObjectId) {
        res.status(400).json({
          success: false,
          message: 'Subscription plan details not available'
        });
        return;
      }
      
      // Now plan is the populated object with name and type properties
      const plan = subscription.plan_id as any; // Type assertion to avoid TypeScript errors
      
      // Only track usage for one-time plans
      if (plan.name === 'One Time' || plan.type === 'one-time') {
        // Initialize metadata if it doesn't exist
        if (!subscription.metadata) {
          subscription.metadata = {};
        }
        
        // Update the subscription to mark it as used
        subscription.metadata = {
          ...subscription.metadata,
          downloadUsed: true,
          downloadDate: new Date(),
          downloadFormat: format
        };
        
        await subscription.save();
      }
      
      res.status(200).json({
        success: true,
        message: 'Subscription usage tracked successfully'
      });
    } catch (error) {
      console.error('Error tracking subscription usage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track subscription usage',
        error: error.message
      });
    }
  });
// Add this method to the UserSubscriptionController class

// Add this method to the UserSubscriptionController class at the end

// Cancel a user's subscription
static cancelSubscription = asyncHandler(async (req: CustomRequest, res: Response) => {
  // Check both _id and user_id fields
  const userId = req.user?._id || req.user?.user_id;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
    return;
  }
  
  // Convert to ObjectId if it's a string
  const userObjectId = typeof userId === 'string'
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  try {
    // Find the user's active subscription
    const subscription = await UserSubscription.findOne({
      user_id: userObjectId,
      status: 'active'
    });
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
      return;
    }
    
    // Update subscription status to cancelled
    subscription.status = 'cancelled';
    subscription.updated_at = new Date();
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});


  // Activate a subscription after successful payment
  static activateSubscription = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    
    // Check both _id and user_id fields
    const userId = req.user?._id || req.user?.user_id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription ID format'
      });
      return;
    }
    
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    // Find the subscription
    const subscription = await UserSubscription.findOne({
      _id: id,
      user_id: userObjectId
    });
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    // Update the subscription status
    subscription.status = 'active';
    subscription.updated_at = new Date();
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      data: subscription
    });
  });
}
