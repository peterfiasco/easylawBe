"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const SubscriptionController_1 = require("../../controllers/User/SubscriptionController");
const TransactionController_1 = require("../../controllers/User/TransactionController");
const router = express_1.default.Router();
// Add other existing user routes...
// Subscription routes for users
router.get('/subscription', authMiddleware_1.authMiddleware, SubscriptionController_1.UserSubscriptionController.getUserSubscription);
router.get('/subscription/plans', SubscriptionController_1.UserSubscriptionController.getSubscriptionPlans);
router.post('/subscription', authMiddleware_1.authMiddleware, SubscriptionController_1.UserSubscriptionController.createSubscription);
router.put('/subscription/:id/activate', authMiddleware_1.authMiddleware, SubscriptionController_1.UserSubscriptionController.activateSubscription);
router.post('/subscription/direct', SubscriptionController_1.UserSubscriptionController.createDirectSubscription);
router.post('/subscription/cancel', authMiddleware_1.authMiddleware, SubscriptionController_1.UserSubscriptionController.cancelSubscription);
// Transaction routes
router.get('/transactions', authMiddleware_1.authMiddleware, TransactionController_1.UserTransactionController.getUserTransactions);
router.get('/transactions/:id/invoice', authMiddleware_1.authMiddleware, TransactionController_1.UserTransactionController.getTransactionInvoice);
exports.default = router;
