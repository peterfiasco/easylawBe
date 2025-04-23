import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { UserSubscriptionController } from '../../controllers/User/SubscriptionController';
import { UserTransactionController } from '../../controllers/User/TransactionController';

const router = express.Router();

// Add other existing user routes...

// Subscription routes for users
router.get('/subscription', authMiddleware, UserSubscriptionController.getUserSubscription);
router.get('/subscription/plans', UserSubscriptionController.getSubscriptionPlans);
router.post('/subscription', authMiddleware, UserSubscriptionController.createSubscription);
router.put('/subscription/:id/activate', authMiddleware, UserSubscriptionController.activateSubscription);
router.post('/subscription/direct', UserSubscriptionController.createDirectSubscription);
router.post('/subscription/cancel', authMiddleware, UserSubscriptionController.cancelSubscription);

// Transaction routes
router.get('/transactions', authMiddleware, UserTransactionController.getUserTransactions);
router.get('/transactions/:id/invoice', authMiddleware, UserTransactionController.getTransactionInvoice);

export default router;
