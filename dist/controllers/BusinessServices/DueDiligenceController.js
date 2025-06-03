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
exports.DueDiligenceController = void 0;
const response_1 = require("../../utils/response");
const ServiceRequest_1 = __importDefault(require("../../models/ServiceRequest"));
const DueDiligencePricing_1 = __importDefault(require("../../models/DueDiligencePricing"));
class DueDiligenceController {
    // Get public pricing for due diligence services
    static getPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Fetching due diligence pricing...');
                const pricing = yield DueDiligencePricing_1.default.find({ is_active: true })
                    .select('investigation_type priority price duration description features')
                    .sort({ investigation_type: 1, priority: 1 });
                if (!pricing || pricing.length === 0) {
                    console.log('⚠️ No pricing found, returning fallback pricing');
                    // Fallback pricing if none exists in database
                    const fallbackPricing = {
                        individual: {
                            standard: { price: 15000, duration: '3-5 business days', features: ['Identity verification', 'Employment history', 'Criminal background check'] },
                            express: { price: 18750, duration: '2-3 business days', features: ['Priority processing', 'Identity verification', 'Employment history', 'Criminal background check'] },
                            urgent: { price: 22500, duration: '1-2 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
                        },
                        company: {
                            standard: { price: 35000, duration: '5-7 business days', features: ['Corporate verification', 'Financial standing', 'Legal compliance check'] },
                            express: { price: 43750, duration: '3-5 business days', features: ['Priority processing', 'All standard features'] },
                            urgent: { price: 52500, duration: '2-3 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
                        },
                        asset: {
                            standard: { price: 25000, duration: '3-5 business days', features: ['Property verification', 'Ownership check', 'Encumbrance status'] },
                            express: { price: 31250, duration: '2-3 business days', features: ['Priority processing', 'All standard features'] },
                            urgent: { price: 37500, duration: '1-2 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
                        },
                        comprehensive: {
                            standard: { price: 60000, duration: '7-10 business days', features: ['Complete investigation', 'All verification types', 'Detailed report'] },
                            express: { price: 75000, duration: '5-7 business days', features: ['Priority processing', 'All standard features'] },
                            urgent: { price: 90000, duration: '3-5 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
                        }
                    };
                    return (0, response_1.successResponse)(res, "Due diligence pricing retrieved successfully (fallback)", fallbackPricing, 200);
                }
                // Convert array to grouped object
                const groupedPricing = {};
                pricing.forEach(item => {
                    if (!groupedPricing[item.investigation_type]) {
                        groupedPricing[item.investigation_type] = {};
                    }
                    groupedPricing[item.investigation_type][item.priority] = {
                        price: item.price,
                        duration: item.duration,
                        description: item.description,
                        features: item.features || []
                    };
                });
                console.log('✅ Due diligence pricing fetched successfully');
                return (0, response_1.successResponse)(res, "Due diligence pricing retrieved successfully", groupedPricing, 200);
            }
            catch (error) {
                console.error('❌ Error fetching due diligence pricing:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Submit due diligence request
    static submitDueDiligenceRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                // ✅ FIX: Get user ID from the correct field (_id, not userId)
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
                console.log('🔍 Due Diligence Auth Debug:', {
                    userExists: !!req.user,
                    userId: userId,
                    userRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
                    userEmail: (_d = req.user) === null || _d === void 0 ? void 0 : _d.email
                });
                if (!userId) {
                    console.log('❌ User not authenticated - no user ID found');
                    return (0, response_1.errorResponse)(res, "User not authenticated", {}, 401);
                }
                // ✅ ADD: Check if user is regular user (not admin)
                if (((_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== 'user') {
                    console.log('❌ Access denied - only regular users can submit due diligence requests');
                    return (0, response_1.errorResponse)(res, "Access denied. Only regular users can submit due diligence requests.", {}, 403);
                }
                const { investigation_type, subject_name, subject_type, priority = 'standard', contact_information, company_registration_number, subject_address, investigation_scope, specific_requirements, background_information, urgency_reason } = req.body;
                console.log('📝 Form data received:', {
                    investigation_type,
                    subject_name,
                    subject_type,
                    priority,
                    hasContactInfo: !!contact_information
                });
                // Parse contact_information if it's a string
                let parsedContactInfo;
                try {
                    parsedContactInfo = typeof contact_information === 'string'
                        ? JSON.parse(contact_information)
                        : contact_information;
                }
                catch (error) {
                    console.log('❌ Invalid contact information format');
                    return (0, response_1.errorResponse)(res, "Invalid contact information format", { error: "Contact information must be valid JSON" }, 400);
                }
                // Validation
                if (!investigation_type || !subject_name || !investigation_scope) {
                    console.log('❌ Missing required fields');
                    return (0, response_1.errorResponse)(res, "Missing required fields", { error: "Investigation type, subject name, and investigation scope are required" }, 400);
                }
                if (!(parsedContactInfo === null || parsedContactInfo === void 0 ? void 0 : parsedContactInfo.phone) || !(parsedContactInfo === null || parsedContactInfo === void 0 ? void 0 : parsedContactInfo.email)) {
                    console.log('❌ Missing contact information');
                    return (0, response_1.errorResponse)(res, "Missing contact information", { error: "Phone and email are required" }, 400);
                }
                // Validate company registration for company types
                if ((investigation_type === 'company' || subject_type === 'company') && !company_registration_number) {
                    console.log('❌ Missing company registration number');
                    return (0, response_1.errorResponse)(res, "Company registration number required", { error: "Company registration number is required for corporate investigations" }, 400);
                }
                // ✅ ADD: Process uploaded files (like DocumentTemplateAdmin)
                let processedDocuments = [];
                if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                    console.log(`📎 Processing ${req.files.length} uploaded files`);
                    processedDocuments = req.files.map((file) => ({
                        name: file.originalname,
                        document_type: file.mimetype,
                        file_buffer: file.buffer,
                        file_size: file.size,
                        mime_type: file.mimetype,
                        upload_date: new Date(),
                        uploaded_by: userId
                    }));
                }
                // Get pricing
                const pricing = yield DueDiligencePricing_1.default.findOne({
                    investigation_type,
                    priority
                });
                if (!pricing) {
                    console.log('❌ Pricing not found');
                    return (0, response_1.errorResponse)(res, "Pricing not found", { error: "Pricing information not available for selected options" }, 400);
                }
                // Calculate total amount
                const processingFee = 5000;
                const totalAmount = pricing.price + processingFee;
                // Generate reference number
                const referenceNumber = `DD${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                // Calculate estimated completion
                const estimatedDays = parseInt(pricing.duration.split('-')[0]) || 3;
                const estimatedCompletion = new Date();
                estimatedCompletion.setDate(estimatedCompletion.getDate() + estimatedDays);
                console.log('💰 Creating service request:', {
                    referenceNumber,
                    totalAmount,
                    filesCount: processedDocuments.length
                });
                // Create service request
                const serviceRequest = new ServiceRequest_1.default({
                    user_id: userId,
                    service_type: 'due_diligence',
                    service_subtype: investigation_type,
                    reference_number: referenceNumber,
                    status: 'submitted',
                    priority,
                    estimated_completion: estimatedCompletion,
                    total_amount: totalAmount,
                    paid_amount: 0,
                    payment_status: 'pending',
                    documents: processedDocuments, // ✅ ADD: Processed files with buffers
                    investigation_details: {
                        investigation_type,
                        subject_name,
                        subject_type,
                        company_registration_number,
                        subject_address,
                        investigation_scope,
                        specific_requirements,
                        contact_information: parsedContactInfo,
                        urgency_reason,
                        background_information
                    }
                });
                yield serviceRequest.save();
                // Add system note
                serviceRequest.notes.push({
                    message: `Due diligence investigation request submitted for ${subject_name}`,
                    added_by: userId,
                    date: new Date(),
                    type: 'system'
                });
                yield serviceRequest.save();
                console.log('✅ Due diligence request created successfully:', referenceNumber);
                return (0, response_1.successResponse)(res, "Due diligence request submitted successfully", {
                    service_request: {
                        _id: serviceRequest._id,
                        reference_number: serviceRequest.reference_number,
                        status: serviceRequest.status,
                        priority: serviceRequest.priority,
                        estimated_completion: serviceRequest.estimated_completion,
                        total_amount: serviceRequest.total_amount,
                        investigation_type,
                        subject_name,
                        uploaded_files_count: processedDocuments.length // ✅ ADD: File count info
                    }
                }, 201);
            }
            catch (error) {
                console.error('❌ Error submitting due diligence request:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Add this new method
    static getUserInvestigations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.user;
                console.log('📊 Fetching user due diligence investigations for user:', user_id);
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const skip = (page - 1) * limit;
                const serviceRequests = yield ServiceRequest_1.default.find({
                    user_id,
                    service_type: 'due_diligence'
                })
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit);
                const total = yield ServiceRequest_1.default.countDocuments({
                    user_id,
                    service_type: 'due_diligence'
                });
                console.log('✅ Found', serviceRequests.length, 'due diligence investigations');
                return (0, response_1.successResponse)(res, "User investigations retrieved successfully", serviceRequests, 200);
            }
            catch (error) {
                console.error('❌ Error fetching user investigations:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Add this new method
    static getInvestigationStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.user;
                const { reference_number } = req.params;
                console.log('🔍 Fetching investigation status for:', reference_number);
                const serviceRequest = yield ServiceRequest_1.default.findOne({
                    reference_number,
                    user_id,
                    service_type: 'due_diligence'
                });
                if (!serviceRequest) {
                    return (0, response_1.errorResponse)(res, "Investigation not found", {}, 404);
                }
                console.log('✅ Investigation status retrieved successfully');
                return (0, response_1.successResponse)(res, "Investigation status retrieved successfully", serviceRequest, 200);
            }
            catch (error) {
                console.error('❌ Error fetching investigation status:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Add this new method
    static getInvestigationDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.user;
                const { reference_number } = req.params;
                console.log('🔍 Fetching investigation details for:', reference_number);
                const serviceRequest = yield ServiceRequest_1.default.findOne({
                    reference_number,
                    user_id,
                    service_type: 'due_diligence'
                });
                if (!serviceRequest) {
                    return (0, response_1.errorResponse)(res, "Investigation not found", {}, 404);
                }
                console.log('✅ Investigation details retrieved successfully');
                return (0, response_1.successResponse)(res, "Investigation details retrieved successfully", {
                    service_request: serviceRequest,
                    investigation_details: serviceRequest.investigation_details
                }, 200);
            }
            catch (error) {
                console.error('❌ Error fetching investigation details:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.DueDiligenceController = DueDiligenceController;
