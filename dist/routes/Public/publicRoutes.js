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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const SubscriptionPlan_1 = __importDefault(require("../../models/SubscriptionPlan"));
const router = express_1.default.Router();
// Get all active subscription plans (public route - no auth required)
const getPublicSubscriptionPlans = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only fetch active plans and sort by price
        const subscriptionPlans = yield SubscriptionPlan_1.default.find({
            is_active: true
        }).sort({ price: 1 }).select('name description price duration features');
        res.status(200).json({
            success: true,
            data: subscriptionPlans
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans',
            error: error.message
        });
    }
}));
// Get the lowest price subscription plan (for hero section)
const getLowestPricePlan = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lowestPlan = yield SubscriptionPlan_1.default.findOne({
            is_active: true,
            price: { $gt: 0 } // Exclude free plans if any
        }).sort({ price: 1 }).select('name price');
        res.status(200).json({
            success: true,
            data: lowestPlan
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lowest price plan',
            error: error.message
        });
    }
}));
router.get('/subscription-plans', getPublicSubscriptionPlans);
router.get('/lowest-price-plan', getLowestPricePlan);
exports.default = router;
