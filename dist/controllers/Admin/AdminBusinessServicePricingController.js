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
exports.AdminBusinessServicePricingController = void 0;
const response_1 = require("../../utils/response");
const BusinessServicePricing_1 = __importDefault(require("../../models/BusinessServicePricing"));
class AdminBusinessServicePricingController {
    // Get all pricing configurations
    static getAllPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { service_type, is_active } = req.query;
                // Build query
                const query = {};
                if (service_type && service_type !== 'all')
                    query.service_type = service_type;
                if (is_active !== undefined)
                    query.is_active = is_active === 'true';
                const pricing = yield BusinessServicePricing_1.default.find(query)
                    .populate('created_by', 'first_name last_name email')
                    .populate('updated_by', 'first_name last_name email')
                    .sort({ service_type: 1, priority: 1 });
                // Group by service type for better organization
                const groupedPricing = pricing.reduce((acc, item) => {
                    if (!acc[item.service_type]) {
                        acc[item.service_type] = {};
                    }
                    acc[item.service_type][item.priority] = {
                        id: item._id,
                        price: item.price,
                        duration: item.duration,
                        description: item.description,
                        is_active: item.is_active,
                        created_by: item.created_by,
                        updated_by: item.updated_by,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    };
                    return acc;
                }, {});
                return (0, response_1.successResponse)(res, "Pricing configurations retrieved successfully", {
                    pricing: groupedPricing,
                    raw_pricing: pricing
                }, 200);
            }
            catch (error) {
                console.error('Get all pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get pricing for a specific service type
    static getPricingByServiceType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceType } = req.params;
                const pricing = yield BusinessServicePricing_1.default.find({
                    service_type: serviceType,
                    is_active: true
                }).sort({ priority: 1 });
                if (pricing.length === 0) {
                    return (0, response_1.errorResponse)(res, "No pricing found for this service type", {}, 404);
                }
                // Format response
                const formattedPricing = pricing.reduce((acc, item) => {
                    acc[item.priority] = {
                        price: item.price,
                        duration: item.duration,
                        description: item.description
                    };
                    return acc;
                }, {});
                return (0, response_1.successResponse)(res, "Pricing retrieved successfully", formattedPricing, 200);
            }
            catch (error) {
                console.error('Get pricing by service type error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Create new pricing configuration
    static createPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { service_type, priority, price, duration, description } = req.body;
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
                if (!service_type || !priority || !price || !duration) {
                    return (0, response_1.errorResponse)(res, "Missing required fields", { error: "service_type, priority, price, and duration are required" }, 400);
                }
                // Check if pricing already exists for this service_type + priority combination
                const existingPricing = yield BusinessServicePricing_1.default.findOne({
                    service_type,
                    priority
                });
                if (existingPricing) {
                    return (0, response_1.errorResponse)(res, "Pricing already exists for this service type and priority", { error: "Use update endpoint to modify existing pricing" }, 409);
                }
                const newPricing = new BusinessServicePricing_1.default({
                    service_type,
                    priority,
                    price: Number(price),
                    duration,
                    description,
                    created_by: userId
                });
                yield newPricing.save();
                return (0, response_1.successResponse)(res, "Pricing configuration created successfully", newPricing, 201);
            }
            catch (error) {
                console.error('Create pricing error:', error);
                if (error.code === 11000) {
                    return (0, response_1.errorResponse)(res, "Pricing already exists for this service type and priority", { error: "Duplicate pricing configuration" }, 409);
                }
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Update pricing configuration
    static updatePricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                const { price, duration, description, is_active } = req.body;
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
                const pricing = yield BusinessServicePricing_1.default.findById(id);
                if (!pricing) {
                    return (0, response_1.errorResponse)(res, "Pricing configuration not found", {}, 404);
                }
                // Update fields
                if (price !== undefined)
                    pricing.price = Number(price);
                if (duration !== undefined)
                    pricing.duration = duration;
                if (description !== undefined)
                    pricing.description = description;
                if (is_active !== undefined)
                    pricing.is_active = is_active;
                pricing.updated_by = userId;
                yield pricing.save();
                return (0, response_1.successResponse)(res, "Pricing configuration updated successfully", pricing, 200);
            }
            catch (error) {
                console.error('Update pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Delete pricing configuration
    static deletePricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const pricing = yield BusinessServicePricing_1.default.findById(id);
                if (!pricing) {
                    return (0, response_1.errorResponse)(res, "Pricing configuration not found", {}, 404);
                }
                yield BusinessServicePricing_1.default.findByIdAndDelete(id);
                return (0, response_1.successResponse)(res, "Pricing configuration deleted successfully", {}, 200);
            }
            catch (error) {
                console.error('Delete pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Bulk update pricing
    static bulkUpdatePricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { pricing_updates } = req.body;
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
                if (!Array.isArray(pricing_updates) || pricing_updates.length === 0) {
                    return (0, response_1.errorResponse)(res, "Invalid pricing updates format", { error: "pricing_updates must be a non-empty array" }, 400);
                }
                const updatePromises = pricing_updates.map((update) => __awaiter(this, void 0, void 0, function* () {
                    const { service_type, priority, price, duration, description } = update;
                    return BusinessServicePricing_1.default.findOneAndUpdate({ service_type, priority }, {
                        price: Number(price),
                        duration,
                        description,
                        updated_by: userId
                    }, {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    });
                }));
                const results = yield Promise.allSettled(updatePromises);
                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;
                return (0, response_1.successResponse)(res, "Bulk pricing update completed", {
                    successful_updates: successful,
                    failed_updates: failed,
                    total_updates: pricing_updates.length
                }, 200);
            }
            catch (error) {
                console.error('Bulk update pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get public pricing (for frontend form)
    static getPublicPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pricing = yield BusinessServicePricing_1.default.find({
                    is_active: true
                }).select('service_type priority price duration description');
                // Group by service type for easier frontend consumption
                const groupedPricing = pricing.reduce((acc, item) => {
                    if (!acc[item.service_type]) {
                        acc[item.service_type] = {};
                    }
                    acc[item.service_type][item.priority] = {
                        price: item.price,
                        duration: item.duration,
                        description: item.description
                    };
                    return acc;
                }, {});
                return (0, response_1.successResponse)(res, "Public pricing retrieved successfully", groupedPricing, 200);
            }
            catch (error) {
                console.error('Get public pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.AdminBusinessServicePricingController = AdminBusinessServicePricingController;
