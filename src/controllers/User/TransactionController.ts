import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserSubscription from '../../models/UserSubscription';
import { CustomRequest } from '../../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

export class UserTransactionController {
  // Get user's transaction history
  static getUserTransactions = asyncHandler(async (req: CustomRequest, res: Response) => {
    // Check both _id and user_id fields
    const userId = req.user?._id || req.user?.user_id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return; // Don't return the response object
    }
    
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;
      
    try {
      // Find all subscriptions for this user
      const subscriptions = await UserSubscription.find({ user_id: userObjectId })
        .populate('plan_id', 'name price billing_period')
        .sort({ created_at: -1 });
      
      // Map subscriptions to transaction format
      const transactions = subscriptions.map(sub => {
        // Type assertion to handle populated field
        const planId = sub.plan_id as any;
        
        return {
          _id: sub._id,
          reason: `Subscription: ${planId.name || 'Unknown Plan'}`,
          created_at: sub.created_at,
          amount: sub.amount_paid,
          status: sub.status === 'active' ? 'paid' : sub.status,
          transactionRef: sub.payment_reference || 'N/A',
          paymentmethod: 'Card', // Default
        };
      });
      
      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transaction history',
        error: error.message
      });
    }
  });

  // Get invoice for a specific transaction
  static getTransactionInvoice = asyncHandler(async (req: CustomRequest, res: Response) => {
    // Check both _id and user_id fields
    const userId = req.user?._id || req.user?.user_id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return; // Don't return the response object
    }
    
    const transactionId = req.params.id;
    
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;
      
    try {
      // Verify transaction belongs to user
      const subscription = await UserSubscription.findOne({
        _id: transactionId,
        user_id: userObjectId
      }).populate('plan_id', 'name price billing_period');
      
      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return; // Don't return the response object
      }
      
      // Type assertion to handle populated field
      const planId = subscription.plan_id as any;
      
      // In a real implementation, you would generate a PDF invoice here
      // For now, we'll just return transaction details
      res.status(200).json({
        success: true,
        message: 'Invoice details retrieved',
        data: {
          id: subscription._id,
          plan: planId.name || 'Unknown Plan',
          amount: subscription.amount_paid,
          date: subscription.created_at,
          status: subscription.status,
          reference: subscription.payment_reference || 'N/A'
        }
      });
    } catch (error) {
      console.error('Error fetching transaction invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice',
        error: error.message
      });
    }
  });
}
