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
exports.UserSubscriptionController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const SubscriptionPlan_1 = __importDefault(require("../../models/SubscriptionPlan"));
const UserSubscription_1 = __importDefault(require("../../models/UserSubscription"));
const mongoose_1 = __importDefault(require("mongoose"));
class UserSubscriptionController {
}
exports.UserSubscriptionController = UserSubscriptionController;
_a = UserSubscriptionController;
// Get all active subscription plans for users
UserSubscriptionController.getSubscriptionPlans = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Only fetch active plans and sort by price
    const subscriptionPlans = yield SubscriptionPlan_1.default.find({ is_active: true }).sort({ price: 1 });
    res.status(200).json({
        success: true,
        data: subscriptionPlans
    });
}));
// Create a new subscription (initial state is 'pending')
UserSubscriptionController.createSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { planId, amount } = req.body;
    // Debug check - what's in the req.user object?
    console.log('User object in request:', req.user);
    // Check both _id and user_id fields
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
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
        ? new mongoose_1.default.Types.ObjectId(userId)
        : userId;
    if (!planId) {
        res.status(400).json({
            success: false,
            message: 'Plan ID is required'
        });
        return;
    }
    // Verify that the plan exists
    const plan = yield SubscriptionPlan_1.default.findById(planId);
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
    }
    else {
        // Default to 30 days if no duration specified
        endDate.setDate(endDate.getDate() + 30);
    }
    try {
        console.log('Creating subscription with user ID:', userObjectId);
        // Create the subscription with explicit ObjectId
        const subscription = yield UserSubscription_1.default.create({
            user_id: userObjectId,
            plan_id: new mongoose_1.default.Types.ObjectId(planId),
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
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        console.error('Attempted with user ID:', userObjectId);
        res.status(500).json({
            success: false,
            message: 'Failed to create subscription',
            error: error.message
        });
    }
}));
// Temporary direct subscription creation endpoint
UserSubscriptionController.createDirectSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const plan = yield SubscriptionPlan_1.default.findById(planId);
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
    }
    else {
        // Default to 30 days if no duration specified
        endDate.setDate(endDate.getDate() + 30);
    }
    try {
        console.log('Creating direct subscription with user ID:', userId);
        // Create the subscription with explicit ObjectId
        const subscription = yield UserSubscription_1.default.create({
            user_id: new mongoose_1.default.Types.ObjectId(userId),
            plan_id: new mongoose_1.default.Types.ObjectId(planId),
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
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subscription',
            error: error.message
        });
    }
}));
// Get current user's subscription information
UserSubscriptionController.getUserSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    // Check both _id and user_id fields
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User authentication required'
        });
        return;
    }
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
        ? new mongoose_1.default.Types.ObjectId(userId)
        : userId;
    try {
        // Find the user's active subscription with populated plan details
        const subscription = yield UserSubscription_1.default.findOne({
            user_id: userObjectId,
            status: 'active',
            end_date: { $gt: new Date() } // Not expired
        }).populate('plan_id');
        console.log('🔍 Subscription query result:', {
            userId: userObjectId,
            foundSubscription: !!subscription,
            subscriptionStatus: subscription === null || subscription === void 0 ? void 0 : subscription.status,
            endDate: subscription === null || subscription === void 0 ? void 0 : subscription.end_date,
            planDetails: subscription === null || subscription === void 0 ? void 0 : subscription.plan_id
        });
        if (!subscription) {
            // ✅ FIX: Return consistent structure for no subscription
            res.status(200).json({
                success: true,
                data: {
                    isSubscribed: false,
                    plan: null,
                    expiresAt: null,
                    planType: null,
                    planName: null,
                    metadata: {}
                }
            });
            return;
        }
        // ✅ FIX: Enhanced response with better plan information
        const planData = subscription.plan_id;
        res.status(200).json({
            success: true,
            data: {
                isSubscribed: true,
                plan: planData,
                expiresAt: subscription.end_date,
                planType: (planData === null || planData === void 0 ? void 0 : planData.type) || ((_d = planData === null || planData === void 0 ? void 0 : planData.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().replace(' ', '-')) || 'unknown',
                planName: (planData === null || planData === void 0 ? void 0 : planData.name) || 'Unknown Plan',
                metadata: subscription.metadata || {},
                subscriptionId: subscription._id,
                startDate: subscription.start_date,
                amountPaid: subscription.amount_paid,
                status: subscription.status
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching user subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve subscription information',
            error: error.message
        });
    }
}));
// Track subscription usage
UserSubscriptionController.trackSubscriptionUsage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { action, format } = req.body;
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
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
            ? new mongoose_1.default.Types.ObjectId(userId)
            : userId;
        // Fully populate the plan_id field
        const subscription = yield UserSubscription_1.default.findOne({
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
        if (!subscription.plan_id || subscription.plan_id instanceof mongoose_1.default.Types.ObjectId) {
            res.status(400).json({
                success: false,
                message: 'Subscription plan details not available'
            });
            return;
        }
        // Now plan is the populated object with name and type properties
        const plan = subscription.plan_id; // Type assertion to avoid TypeScript errors
        // Only track usage for one-time plans
        if (plan.name === 'One Time' || plan.type === 'one-time') {
            // Initialize metadata if it doesn't exist
            if (!subscription.metadata) {
                subscription.metadata = {};
            }
            // Update the subscription to mark it as used
            subscription.metadata = Object.assign(Object.assign({}, subscription.metadata), { downloadUsed: true, downloadDate: new Date(), downloadFormat: format });
            yield subscription.save();
        }
        res.status(200).json({
            success: true,
            message: 'Subscription usage tracked successfully'
        });
    }
    catch (error) {
        console.error('Error tracking subscription usage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track subscription usage',
            error: error.message
        });
    }
}));
// Add this method to the UserSubscriptionController class
// Add this method to the UserSubscriptionController class at the end
// Cancel a user's subscription
UserSubscriptionController.cancelSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    // Check both _id and user_id fields
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User authentication required'
        });
        return;
    }
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
        ? new mongoose_1.default.Types.ObjectId(userId)
        : userId;
    try {
        // Find the user's active subscription
        const subscription = yield UserSubscription_1.default.findOne({
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
        yield subscription.save();
        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    }
    catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription',
            error: error.message
        });
    }
}));
// Activate a subscription after successful payment
UserSubscriptionController.activateSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { id } = req.params;
    // Check both _id and user_id fields
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.user_id);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User authentication required'
        });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription ID format'
        });
        return;
    }
    // Convert to ObjectId if it's a string
    const userObjectId = typeof userId === 'string'
        ? new mongoose_1.default.Types.ObjectId(userId)
        : userId;
    // Find the subscription
    const subscription = yield UserSubscription_1.default.findOne({
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
    yield subscription.save();
    res.status(200).json({
        success: true,
        message: 'Subscription activated successfully',
        data: subscription
    });
}));
