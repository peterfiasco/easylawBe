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
exports.IPProtectionController = void 0;
const response_1 = require("../../utils/response");
const ServiceRequest_1 = __importDefault(require("../../models/ServiceRequest"));
const IPProtection_1 = __importDefault(require("../../models/IPProtection"));
const helpers_1 = require("../../utils/helpers");
const business_email_service_1 = require("../../services/business-email.service");
const User_1 = __importDefault(require("../../models/User"));
class IPProtectionController {
    // Submit IP protection request
    static submitIPProtectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.user;
                const { protection_type, application_details, applicant_info, trademark_details, patent_details, copyright_details, dispute_details, priority = 'standard' } = req.body;
                // Validate required fields
                if (!protection_type || !application_details || !applicant_info) {
                    return (0, response_1.errorResponse)(res, "Missing required fields", { error: "Protection type, application details, and applicant info are required" }, 400);
                }
                // Calculate pricing based on protection type and priority
                const basePrices = {
                    trademark: 50000,
                    copyright: 30000,
                    patent: 150000,
                    industrial_design: 40000,
                    dispute_resolution: 80000
                };
                const priorityMultipliers = {
                    standard: 1,
                    express: 1.5,
                    urgent: 2
                };
                const baseAmount = basePrices[protection_type] || 50000;
                const totalAmount = baseAmount * priorityMultipliers[priority];
                // Calculate estimated completion date
                const completionDays = {
                    standard: { trademark: 90, copyright: 30, patent: 180, industrial_design: 60, dispute_resolution: 120 },
                    express: { trademark: 60, copyright: 21, patent: 120, industrial_design: 45, dispute_resolution: 90 },
                    urgent: { trademark: 30, copyright: 14, patent: 90, industrial_design: 30, dispute_resolution: 60 }
                };
                const daysToComplete = completionDays[priority][protection_type] || 90;
                const estimatedCompletion = new Date();
                estimatedCompletion.setDate(estimatedCompletion.getDate() + daysToComplete);
                // Generate reference number
                const referenceNumber = `IP${Date.now()}${(0, helpers_1.generateAlphanumeric)(6)}`;
                // Create service request
                const serviceRequest = new ServiceRequest_1.default({
                    user_id,
                    service_type: 'ip_protection',
                    service_subtype: protection_type,
                    reference_number: referenceNumber,
                    status: 'submitted',
                    priority,
                    estimated_completion: estimatedCompletion,
                    total_amount: totalAmount,
                    paid_amount: 0,
                    payment_status: 'pending'
                });
                yield serviceRequest.save();
                // Create IP protection details
                const ipProtection = new IPProtection_1.default({
                    service_request_id: serviceRequest._id,
                    protection_type,
                    application_details,
                    applicant_info,
                    trademark_details: protection_type === 'trademark' ? trademark_details : undefined,
                    patent_details: protection_type === 'patent' ? patent_details : undefined,
                    copyright_details: protection_type === 'copyright' ? copyright_details : undefined,
                    dispute_details: protection_type === 'dispute_resolution' ? dispute_details : undefined,
                    filing_status: 'not_filed'
                });
                yield ipProtection.save();
                // Get user details for email
                const user = yield User_1.default.findById(user_id);
                if (user) {
                    yield (0, business_email_service_1.sendIPProtectionConfirmation)(user.email, user.first_name, {
                        referenceNumber,
                        protectionType: protection_type.replace('_', ' ').toUpperCase(),
                        applicationTitle: application_details.title,
                        estimatedCompletion: estimatedCompletion.toLocaleDateString(),
                        amount: totalAmount
                    });
                }
                return (0, response_1.successResponse)(res, "IP protection request submitted successfully", {
                    service_request: serviceRequest,
                    ip_protection: ipProtection,
                    reference_number: referenceNumber,
                    total_amount: totalAmount,
                    estimated_completion: estimatedCompletion
                }, 201);
            }
            catch (error) {
                console.error('Error submitting IP protection request:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get IP protection details
    static getIPProtectionDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.user;
                const { reference_number } = req.params;
                const serviceRequest = yield ServiceRequest_1.default.findOne({
                    reference_number,
                    user_id,
                    service_type: 'ip_protection'
                });
                if (!serviceRequest) {
                    return (0, response_1.errorResponse)(res, "IP protection request not found", {}, 404);
                }
                const ipProtection = yield IPProtection_1.default.findOne({
                    service_request_id: serviceRequest._id
                });
                return (0, response_1.successResponse)(res, "IP protection details retrieved successfully", {
                    service_request: serviceRequest,
                    ip_protection: ipProtection
                }, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get user's IP protection requests
    static getUserIPProtectionRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.user;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const serviceRequests = yield ServiceRequest_1.default.find({
                    user_id,
                    service_type: 'ip_protection'
                })
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit);
                const total = yield ServiceRequest_1.default.countDocuments({
                    user_id,
                    service_type: 'ip_protection'
                });
                const requestsWithDetails = yield Promise.all(serviceRequests.map((request) => __awaiter(this, void 0, void 0, function* () {
                    const ipProtection = yield IPProtection_1.default.findOne({
                        service_request_id: request._id
                    });
                    return {
                        service_request: request,
                        ip_protection: ipProtection
                    };
                })));
                return (0, response_1.successResponse)(res, "IP protection requests retrieved successfully", {
                    requests: requestsWithDetails,
                    pagination: {
                        current_page: page,
                        total_pages: Math.ceil(total / limit),
                        total_records: total,
                        has_next: page * limit < total,
                        has_prev: page > 1
                    }
                }, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.IPProtectionController = IPProtectionController;
