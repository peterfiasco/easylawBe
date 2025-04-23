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
exports.SubscriptionController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const SubscriptionPlan_1 = __importDefault(require("../../models/SubscriptionPlan"));
const UserSubscription_1 = __importDefault(require("../../models/UserSubscription"));
const mongoose_1 = __importDefault(require("mongoose"));
class SubscriptionController {
}
exports.SubscriptionController = SubscriptionController;
_a = SubscriptionController;
// Subscription Plans Management
SubscriptionController.getAllPlans = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriptionPlans = yield SubscriptionPlan_1.default.find().sort({ price: 1 });
    res.status(200).json({
        success: true,
        data: subscriptionPlans
    });
}));
SubscriptionController.getPlanById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription plan ID format'
        });
        return;
    }
    const plan = yield SubscriptionPlan_1.default.findById(id);
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
}));
SubscriptionController.createPlan = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const existingPlan = yield SubscriptionPlan_1.default.findOne({ name });
    if (existingPlan) {
        res.status(400).json({
            success: false,
            message: 'A subscription plan with this name already exists'
        });
        return;
    }
    const newPlan = yield SubscriptionPlan_1.default.create({
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
}));
SubscriptionController.updatePlan = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price, duration, features, is_active } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription plan ID format'
        });
        return;
    }
    // Check if the plan exists
    const plan = yield SubscriptionPlan_1.default.findById(id);
    if (!plan) {
        res.status(404).json({
            success: false,
            message: 'Subscription plan not found'
        });
        return;
    }
    // If the name is being changed, check that it doesn't conflict with another plan
    if (name && name !== plan.name) {
        const existingPlan = yield SubscriptionPlan_1.default.findOne({ name });
        if (existingPlan && existingPlan._id.toString() !== plan._id.toString()) {
            res.status(400).json({
                success: false,
                message: 'A subscription plan with this name already exists'
            });
            return;
        }
    }
    const updatedPlan = yield SubscriptionPlan_1.default.findByIdAndUpdate(id, {
        name: name || plan.name,
        description: description || plan.description,
        price: price !== undefined ? price : plan.price,
        duration: duration || plan.duration,
        features: features || plan.features,
        is_active: is_active !== undefined ? is_active : plan.is_active,
        updated_at: new Date()
    }, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        message: 'Subscription plan updated successfully',
        data: updatedPlan
    });
}));
SubscriptionController.deletePlan = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription plan ID format'
        });
        return;
    }
    // Check if there are any active subscriptions for this plan
    const activeSubscriptions = yield UserSubscription_1.default.countDocuments({
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
    const deletedPlan = yield SubscriptionPlan_1.default.findByIdAndDelete(id);
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
}));
// User Subscriptions Management
SubscriptionController.getAllUserSubscriptions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Populate user and plan details for admin view
    const subscriptions = yield UserSubscription_1.default.find()
        .populate('user_id', 'name email')
        .populate('plan_id', 'name price duration')
        .sort({ created_at: -1 });
    res.status(200).json({
        success: true,
        data: subscriptions
    });
}));
SubscriptionController.getUserSubscriptionById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription ID format'
        });
        return;
    }
    const subscription = yield UserSubscription_1.default.findById(id)
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
}));
SubscriptionController.createUserSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!mongoose_1.default.Types.ObjectId.isValid(user_id) || !mongoose_1.default.Types.ObjectId.isValid(plan_id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid user ID or plan ID format'
        });
        return;
    }
    // Check if the plan exists
    const plan = yield SubscriptionPlan_1.default.findById(plan_id);
    if (!plan) {
        res.status(404).json({
            success: false,
            message: 'Subscription plan not found'
        });
        return;
    }
    // Check if the user already has an active subscription of this plan
    const existingSubscription = yield UserSubscription_1.default.findOne({
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
    const newSubscription = yield UserSubscription_1.default.create({
        user_id,
        plan_id,
        start_date: start_date || new Date(),
        end_date,
        payment_reference: payment_reference || '',
        amount_paid: amount_paid || plan.price,
        status: 'active'
    });
    // Populate user and plan details for the response
    const populatedSubscription = yield UserSubscription_1.default.findById(newSubscription._id)
        .populate('user_id', 'name email')
        .populate('plan_id');
    res.status(201).json({
        success: true,
        message: 'User subscription created successfully',
        data: populatedSubscription
    });
}));
SubscriptionController.updateUserSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { end_date, status, payment_reference, amount_paid } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription ID format'
        });
        return;
    }
    // Check if the subscription exists
    const subscription = yield UserSubscription_1.default.findById(id);
    if (!subscription) {
        res.status(404).json({
            success: false,
            message: 'Subscription not found'
        });
        return;
    }
    // Update the subscription
    const updatedSubscription = yield UserSubscription_1.default.findByIdAndUpdate(id, {
        end_date: end_date || subscription.end_date,
        status: status || subscription.status,
        payment_reference: payment_reference || subscription.payment_reference,
        amount_paid: amount_paid || subscription.amount_paid,
        updated_at: new Date()
    }, { new: true, runValidators: true }).populate('user_id', 'name email')
        .populate('plan_id');
    res.status(200).json({
        success: true,
        message: 'Subscription updated successfully',
        data: updatedSubscription
    });
}));
SubscriptionController.cancelUserSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid subscription ID format'
        });
        return;
    }
    // Check if the subscription exists
    const subscription = yield UserSubscription_1.default.findById(id);
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
    const cancelledSubscription = yield UserSubscription_1.default.findByIdAndUpdate(id, {
        status: 'cancelled',
        updated_at: new Date()
    }, { new: true }).populate('user_id', 'name email')
        .populate('plan_id');
    res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: cancelledSubscription
    });
}));
// Dashboard summary for subscriptions
SubscriptionController.getSubscriptionStats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Count active subscriptions
    const activeSubscriptions = yield UserSubscription_1.default.countDocuments({ status: 'active' });
    // Calculate total revenue
    const revenue = yield UserSubscription_1.default.aggregate([
        { $match: { status: { $in: ['active', 'expired'] } } },
        { $group: { _id: null, total: { $sum: '$amount_paid' } } }
    ]);
    // Count by plan
    const subscriptionsByPlan = yield UserSubscription_1.default.aggregate([
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
    const recentSubscriptions = yield UserSubscription_1.default.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('user_id', 'name email')
        .populate('plan_id', 'name price');
    // Expiring soon (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoon = yield UserSubscription_1.default.find({
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
}));
