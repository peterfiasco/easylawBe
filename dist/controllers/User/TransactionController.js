"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTransactionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSubscription_1 = __importDefault(require("../../models/UserSubscription"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
class UserTransactionController {
}
exports.UserTransactionController = UserTransactionController;
_a = UserTransactionController;
// Get user's transaction history
UserTransactionController.getUserTransactions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    // Check both _id and user_id fields
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User authentication required'
        });
        return; // Don't return the response object
    }
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
        ? new mongoose_1.default.Types.ObjectId(userId)
        : userId;
    try {
        // Find all subscriptions for this user
        const subscriptions = yield UserSubscription_1.default.find({ user_id: userObjectId })
            .populate('plan_id', 'name price billing_period')
            .sort({ created_at: -1 });
        // Map subscriptions to transaction format
        const transactions = subscriptions.map(sub => {
            // Type assertion to handle populated field
            const planId = sub.plan_id;
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
    }
    catch (error) {
        console.error('Error fetching user transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history',
            error: error.message
        });
    }
}));
// Get invoice for a specific transaction
UserTransactionController.getTransactionInvoice = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    // Check both _id and user_id fields
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
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
        ? new mongoose_1.default.Types.ObjectId(userId)
        : userId;
    try {
        // Verify transaction belongs to user
        const subscription = yield UserSubscription_1.default.findOne({
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
        const planId = subscription.plan_id;
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
    }
    catch (error) {
        console.error('Error fetching transaction invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice',
            error: error.message
        });
    }
}));
