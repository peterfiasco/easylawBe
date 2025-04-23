import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import SubscriptionPlan from '../../models/SubscriptionPlan';
import UserSubscription from '../../models/UserSubscription';
import mongoose from 'mongoose';

export class SubscriptionController {
  // Subscription Plans Management
  static getAllPlans = asyncHandler(async (req: Request, res: Response) => {
    const subscriptionPlans = await SubscriptionPlan.find().sort({ price: 1 });
    
    res.status(200).json({
      success: true,
      data: subscriptionPlans
    });
  });

  static getPlanById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription plan ID format'
      });
      return;
    }
    
    const plan = await SubscriptionPlan.findById(id);
    
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  });

  static createPlan = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, duration, features, is_active } = req.body;
    
    // Basic validation
    if (!name || !description || price === undefined || !duration) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, duration'
      });
      return;
    }
    
    // Check if a plan with the same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      res.status(400).json({
        success: false,
        message: 'A subscription plan with this name already exists'
      });
      return;
    }
    
    const newPlan = await SubscriptionPlan.create({
      name,
      description,
      price,
      duration,
      features: features || [],
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: newPlan
    });
  });

  static updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price, duration, features, is_active } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription plan ID format'
      });
      return;
    }
    
    // Check if the plan exists
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
      return;
    }
    
    // If the name is being changed, check that it doesn't conflict with another plan
    if (name && name !== plan.name) {
      const existingPlan = await SubscriptionPlan.findOne({ name });
      if (existingPlan && existingPlan._id.toString() !== plan._id.toString()) {

        res.status(400).json({
          success: false,
          message: 'A subscription plan with this name already exists'
        });
        return;
      }
    }
    
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        name: name || plan.name,
        description: description || plan.description,
        price: price !== undefined ? price : plan.price,
        duration: duration || plan.duration,
        features: features || plan.features,
        is_active: is_active !== undefined ? is_active : plan.is_active,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: updatedPlan
    });
  });

  static deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription plan ID format'
      });
      return;
    }
    
    // Check if there are any active subscriptions for this plan
    const activeSubscriptions = await UserSubscription.countDocuments({
      plan_id: id,
      status: 'active'
    });
    
    if (activeSubscriptions > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete this plan: ${activeSubscriptions} active subscriptions exist`
      });
      return;
    }
    
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  });

  // User Subscriptions Management
  static getAllUserSubscriptions = asyncHandler(async (req: Request, res: Response) => {
    // Populate user and plan details for admin view
    const subscriptions = await UserSubscription.find()
      .populate('user_id', 'name email')
      .populate('plan_id', 'name price duration')
      .sort({ created_at: -1 });
    
    res.status(200).json({
      success: true,
      data: subscriptions
    });
  });

  static getUserSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription ID format'
      });
      return;
    }
    
    const subscription = await UserSubscription.findById(id)
      .populate('user_id', 'name email')
      .populate('plan_id');
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  });

  static createUserSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { user_id, plan_id, start_date, end_date, payment_reference, amount_paid } = req.body;
    
    // Validate required fields
    if (!user_id || !plan_id || !end_date) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: user_id, plan_id, end_date'
      });
      return;
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(plan_id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID or plan ID format'
      });
      return;
    }
    
    // Check if the plan exists
    const plan = await SubscriptionPlan.findById(plan_id);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
      return;
    }
    
    // Check if the user already has an active subscription of this plan
    const existingSubscription = await UserSubscription.findOne({
      user_id,
      plan_id,
      status: 'active'
    });
    
    if (existingSubscription) {
      res.status(400).json({
        success: false,
        message: 'User already has an active subscription to this plan'
      });
      return;
    }
    
    // Create the new subscription
    const newSubscription = await UserSubscription.create({
      user_id,
      plan_id,
      start_date: start_date || new Date(),
      end_date,
      payment_reference: payment_reference || '',
      amount_paid: amount_paid || plan.price,
      status: 'active'
    });
    
    // Populate user and plan details for the response
    const populatedSubscription = await UserSubscription.findById(newSubscription._id)
      .populate('user_id', 'name email')
      .populate('plan_id');
    
    res.status(201).json({
      success: true,
      message: 'User subscription created successfully',
      data: populatedSubscription
    });
  });

  static updateUserSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { end_date, status, payment_reference, amount_paid } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription ID format'
      });
      return;
    }
    
    // Check if the subscription exists
    const subscription = await UserSubscription.findById(id);
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    // Update the subscription
    const updatedSubscription = await UserSubscription.findByIdAndUpdate(
      id,
      {
        end_date: end_date || subscription.end_date,
        status: status || subscription.status,
        payment_reference: payment_reference || subscription.payment_reference,
        amount_paid: amount_paid || subscription.amount_paid,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user_id', 'name email')
     .populate('plan_id');
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription
    });
  });

  static cancelUserSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription ID format'
      });
      return;
    }
    
    // Check if the subscription exists
    const subscription = await UserSubscription.findById(id);
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    // If already cancelled, return
    if (subscription.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
      return;
    }
    
    // Update status to cancelled
    const cancelledSubscription = await UserSubscription.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        updated_at: new Date()
      },
      { new: true }
    ).populate('user_id', 'name email')
     .populate('plan_id');
    
    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: cancelledSubscription
    });
  });

  // Dashboard summary for subscriptions
  static getSubscriptionStats = asyncHandler(async (req: Request, res: Response) => {
    // Count active subscriptions
    const activeSubscriptions = await UserSubscription.countDocuments({ status: 'active' });
    
    // Calculate total revenue
    const revenue = await UserSubscription.aggregate([
      { $match: { status: { $in: ['active', 'expired'] } } },
      { $group: { _id: null, total: { $sum: '$amount_paid' } } }
    ]);
    
    // Count by plan
    const subscriptionsByPlan = await UserSubscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan_id', count: { $sum: 1 } } },
      { $lookup: {
          from: 'subscriptionplans',
          localField: '_id',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: '$plan' },
      { $project: {
          _id: 1,
          plan_name: '$plan.name',
          count: 1
        }
      }
    ]);
    
    // Get recent subscriptions
    const recentSubscriptions = await UserSubscription.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate('user_id', 'name email')
      .populate('plan_id', 'name price');
    
    // Expiring soon (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSoon = await UserSubscription.find({
      status: 'active',
      end_date: { $lte: sevenDaysFromNow, $gte: new Date() }
    }).populate('user_id', 'name email')
      .populate('plan_id', 'name')
      .sort({ end_date: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        activeSubscriptions,
        totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
        subscriptionsByPlan,
        recentSubscriptions,
        expiringSoon
      }
    });
  });
}