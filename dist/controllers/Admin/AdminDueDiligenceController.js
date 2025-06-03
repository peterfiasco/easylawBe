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
exports.AdminDueDiligenceController = void 0;
const response_1 = require("../../utils/response");
const DueDiligencePricing_1 = __importDefault(require("../../models/DueDiligencePricing"));
const ServiceRequest_1 = __importDefault(require("../../models/ServiceRequest")); // Add this import
class AdminDueDiligenceController {
    // Get all pricing configurations (ADMIN)
    static getAllPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Admin fetching all due diligence pricing configurations...');
                const pricing = yield DueDiligencePricing_1.default.find({ is_active: true })
                    .populate('created_by', 'first_name last_name email')
                    .populate('updated_by', 'first_name last_name email')
                    .sort({ investigation_type: 1, priority: 1 });
                console.log('📊 Found pricing records:', pricing.length);
                return (0, response_1.successResponse)(res, "Due diligence pricing configurations retrieved successfully", pricing, 200);
            }
            catch (error) {
                console.error('❌ Get due diligence pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Add these methods to the AdminDueDiligenceController class
    // Get investigation details by reference number
    static getInvestigationDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { referenceNumber } = req.params;
                console.log('🔍 Admin fetching investigation details:', referenceNumber);
                const investigation = yield ServiceRequest_1.default.findOne({
                    reference_number: referenceNumber,
                    service_type: 'due_diligence'
                })
                    .populate('user_id', 'first_name last_name email phone')
                    .populate('assigned_to', 'first_name last_name email');
                if (!investigation) {
                    return (0, response_1.errorResponse)(res, "Investigation not found", {}, 404);
                }
                console.log('✅ Investigation details retrieved successfully');
                return (0, response_1.successResponse)(res, "Investigation details retrieved successfully", investigation, 200);
            }
            catch (error) {
                console.error('❌ Get investigation details error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Delete (cancel) investigation
    static deleteInvestigation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { referenceNumber } = req.params;
                console.log('🗑️ Admin deleting investigation:', referenceNumber);
                const investigation = yield ServiceRequest_1.default.findOneAndUpdate({
                    reference_number: referenceNumber,
                    service_type: 'due_diligence'
                }, {
                    status: 'cancelled',
                    updated_at: new Date(),
                    notes: [
                        ...(((_a = (yield ServiceRequest_1.default.findOne({ reference_number: referenceNumber }))) === null || _a === void 0 ? void 0 : _a.notes) || []),
                        {
                            message: 'Investigation cancelled by admin',
                            added_by: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                            date: new Date(),
                            type: 'admin'
                        }
                    ]
                }, { new: true });
                if (!investigation) {
                    return (0, response_1.errorResponse)(res, "Investigation not found", {}, 404);
                }
                console.log('✅ Investigation cancelled successfully');
                return (0, response_1.successResponse)(res, "Investigation cancelled successfully", { reference_number: referenceNumber }, 200);
            }
            catch (error) {
                console.error('❌ Delete investigation error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Add document to investigation
    static addDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { referenceNumber } = req.params;
                const { document_type, description } = req.body;
                console.log('📄 Admin adding document to investigation:', referenceNumber);
                if (!req.file) {
                    return (0, response_1.errorResponse)(res, "No file uploaded", {}, 400);
                }
                const investigation = yield ServiceRequest_1.default.findOne({
                    reference_number: referenceNumber,
                    service_type: 'due_diligence'
                });
                if (!investigation) {
                    return (0, response_1.errorResponse)(res, "Investigation not found", {}, 404);
                }
                // ✅ FIX: Create document object with required file_buffer
                const newDocument = {
                    name: req.file.originalname, // Required field
                    url: `/uploads/${req.file.filename}`, // Required field  
                    upload_date: new Date(), // Required field
                    document_type: document_type || 'investigation_report', // Required field
                    file_buffer: req.file.buffer, // ✅ ADD: Required file_buffer field
                    file_size: req.file.size, // Required field
                    mime_type: req.file.mimetype, // Required field
                    // Optional additional fields
                    description: description || 'Investigation document',
                    file_path: req.file.path,
                    uploaded_by: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                    download_url: `/uploads/${req.file.filename}`
                };
                investigation.documents.push(newDocument);
                yield investigation.save();
                console.log('✅ Document added successfully');
                return (0, response_1.successResponse)(res, "Document added successfully", newDocument, 201);
            }
            catch (error) {
                console.error('❌ Add document error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get public pricing (no auth required) - ADD THIS METHOD
    static getPublicPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Fetching public due diligence pricing...');
                const pricingRecords = yield DueDiligencePricing_1.default.find({ is_active: true })
                    .select('investigation_type priority price duration description features')
                    .sort({ investigation_type: 1, priority: 1 });
                // Transform to the expected format
                const pricingData = {};
                pricingRecords.forEach(record => {
                    if (!pricingData[record.investigation_type]) {
                        pricingData[record.investigation_type] = {};
                    }
                    pricingData[record.investigation_type][record.priority] = {
                        price: record.price,
                        duration: record.duration,
                        description: record.description,
                        features: record.features || []
                    };
                });
                console.log('📊 Public pricing data formatted:', pricingData);
                return (0, response_1.successResponse)(res, "Due diligence pricing retrieved successfully", pricingData, 200);
            }
            catch (error) {
                console.error('❌ Get public due diligence pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Create new pricing configuration
    static createPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { investigation_type, priority, price, duration, description, features } = req.body;
                // 🔍 DEBUG: Log original values
                console.log('📝 Creating new due diligence pricing:');
                console.log('Original price from request:', price, typeof price);
                console.log('Full request body:', req.body);
                // Validate required fields
                if (!investigation_type || !priority || !price || !duration) {
                    return (0, response_1.errorResponse)(res, "Missing required fields", { error: "investigation_type, priority, price, and duration are required" }, 400);
                }
                // 🔍 DEBUG: Log conversion
                const parsedPrice = parseFloat(price);
                console.log('Parsed price:', parsedPrice, typeof parsedPrice);
                if (isNaN(parsedPrice) || parsedPrice < 0) {
                    return (0, response_1.errorResponse)(res, "Invalid price", { error: "Price must be a valid positive number" }, 400);
                }
                // FIXED: Check if pricing already exists (including inactive records)
                const existingPricing = yield DueDiligencePricing_1.default.findOne({
                    investigation_type,
                    priority
                });
                if (existingPricing) {
                    if (existingPricing.is_active) {
                        return (0, response_1.errorResponse)(res, "Pricing configuration already exists", { error: "An active pricing configuration for this investigation type and priority already exists" }, 400);
                    }
                    else {
                        // Reactivate existing inactive record
                        const updatedPricing = yield DueDiligencePricing_1.default.findByIdAndUpdate(existingPricing._id, {
                            price: parsedPrice, // 🔍 Use parsed price
                            duration,
                            description,
                            features: features || [],
                            is_active: true,
                            updated_by: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                            updated_at: new Date()
                        }, { new: true, runValidators: true }).populate('created_by updated_by', 'first_name last_name email');
                        console.log('✅ Reactivated existing due diligence pricing with price:', updatedPricing === null || updatedPricing === void 0 ? void 0 : updatedPricing.price);
                        return (0, response_1.successResponse)(res, "Due diligence pricing configuration reactivated and updated successfully", updatedPricing, 200);
                    }
                }
                // Create new pricing
                const pricingData = {
                    investigation_type,
                    priority,
                    price: parsedPrice, // 🔍 Use parsed price
                    duration,
                    description,
                    features: features || [],
                    created_by: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                    is_active: true
                };
                // 🔍 DEBUG: Log data before saving
                console.log('Data to be saved:', pricingData);
                const newPricing = new DueDiligencePricing_1.default(pricingData);
                yield newPricing.save();
                // 🔍 DEBUG: Log saved data
                console.log('✅ Created due diligence pricing with price:', newPricing.price);
                const populatedPricing = yield DueDiligencePricing_1.default.findById(newPricing._id)
                    .populate('created_by', 'first_name last_name email');
                // 🔍 DEBUG: Log final result
                console.log('Final populated pricing:', populatedPricing === null || populatedPricing === void 0 ? void 0 : populatedPricing.price);
                return (0, response_1.successResponse)(res, "Due diligence pricing configuration created successfully", populatedPricing, 201);
            }
            catch (error) {
                console.error('❌ Create due diligence pricing error:', error);
                // Handle MongoDB duplicate key error specifically
                if (error.code === 11000) {
                    const duplicateField = ((_c = error.message.match(/dup key: \{ (.+?) \}/)) === null || _c === void 0 ? void 0 : _c[1]) || 'unknown field';
                    return (0, response_1.errorResponse)(res, "Duplicate pricing configuration", {
                        error: "A pricing configuration with these details already exists",
                        details: duplicateField
                    }, 409);
                }
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Update pricing configuration
    static updatePricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { price, duration, description, features, is_active } = req.body;
                console.log('🔄 Updating due diligence pricing:', id);
                // Check if trying to update investigation_type or priority (not allowed)
                if (req.body.investigation_type || req.body.priority) {
                    return (0, response_1.errorResponse)(res, "Invalid update operation", { error: "Investigation type and priority cannot be modified. Create a new pricing configuration instead." }, 400);
                }
                const updatedPricing = yield DueDiligencePricing_1.default.findByIdAndUpdate(id, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (price && { price: Number(price) })), (duration && { duration })), (description !== undefined && { description })), (features && { features })), (is_active !== undefined && { is_active })), { updated_by: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, updated_at: new Date() }), { new: true, runValidators: true }).populate('created_by updated_by', 'first_name last_name email');
                if (!updatedPricing) {
                    return (0, response_1.errorResponse)(res, "Pricing configuration not found", {}, 404);
                }
                console.log('✅ Updated due diligence pricing successfully');
                return (0, response_1.successResponse)(res, "Due diligence pricing configuration updated successfully", updatedPricing, 200);
            }
            catch (error) {
                console.error('❌ Update due diligence pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Delete (deactivate) pricing configuration
    static deletePricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                console.log('🗑️ Deactivating due diligence pricing:', id);
                const updatedPricing = yield DueDiligencePricing_1.default.findByIdAndUpdate(id, {
                    is_active: false,
                    updated_by: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                    updated_at: new Date()
                }, { new: true });
                if (!updatedPricing) {
                    return (0, response_1.errorResponse)(res, "Pricing configuration not found", {}, 404);
                }
                console.log('✅ Deactivated due diligence pricing successfully');
                return (0, response_1.successResponse)(res, "Due diligence pricing configuration deactivated successfully", { id: updatedPricing._id }, 200);
            }
            catch (error) {
                console.error('❌ Delete due diligence pricing error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get pricing analytics
    static getPricingAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📊 Fetching due diligence pricing analytics...');
                const analytics = yield DueDiligencePricing_1.default.aggregate([
                    { $match: { is_active: true } },
                    {
                        $group: {
                            _id: {
                                investigation_type: '$investigation_type',
                                priority: '$priority'
                            },
                            average_price: { $avg: '$price' },
                            min_price: { $min: '$price' },
                            max_price: { $max: '$price' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.investigation_type',
                            pricing_data: {
                                $push: {
                                    priority: '$_id.priority',
                                    average_price: '$average_price',
                                    min_price: '$min_price',
                                    max_price: '$max_price',
                                    count: '$count'
                                }
                            },
                            total_configurations: { $sum: '$count' }
                        }
                    }
                ]);
                return (0, response_1.successResponse)(res, "Due diligence pricing analytics retrieved successfully", analytics, 200);
            }
            catch (error) {
                console.error('❌ Get due diligence pricing analytics error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get all investigations (ADMIN)
    static getAllInvestigations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Admin fetching all due diligence investigations...');
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const skip = (page - 1) * limit;
                const status = req.query.status;
                const priority = req.query.priority;
                // Build filter
                const filter = { service_type: 'due_diligence' };
                if (status)
                    filter.status = status;
                if (priority)
                    filter.priority = priority;
                const investigations = yield ServiceRequest_1.default.find(filter)
                    .populate('user_id', 'first_name last_name email phone')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit);
                const total = yield ServiceRequest_1.default.countDocuments(filter);
                console.log('📊 Found investigations:', investigations.length);
                return (0, response_1.successResponse)(res, "Due diligence investigations retrieved successfully", {
                    investigations,
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
                console.error('❌ Get all investigations error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Update investigation status (ADMIN)
    static updateInvestigationStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { referenceNumber } = req.params; // FIXED: Changed from reference_number to referenceNumber
                const { status, notes } = req.body;
                console.log('🔄 Updating investigation status:', referenceNumber, 'to:', status);
                const validStatuses = ['submitted', 'in_progress', 'requires_action', 'completed', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    return (0, response_1.errorResponse)(res, "Invalid status", { error: "Status must be one of: " + validStatuses.join(', ') }, 400);
                }
                const updateData = {
                    status,
                    updated_at: new Date()
                };
                if (status === 'completed') {
                    updateData.actual_completion = new Date();
                }
                const investigation = yield ServiceRequest_1.default.findOneAndUpdate({ reference_number: referenceNumber, service_type: 'due_diligence' }, // FIXED: Use referenceNumber
                updateData, { new: true, runValidators: true }).populate('user_id', 'first_name last_name email');
                if (!investigation) {
                    return (0, response_1.errorResponse)(res, "Investigation not found", {}, 404);
                }
                // Add admin note if provided
                if (notes) {
                    investigation.notes.push({
                        message: notes,
                        added_by: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                        date: new Date(),
                        type: 'admin'
                    });
                    yield investigation.save();
                }
                console.log('✅ Investigation status updated successfully');
                return (0, response_1.successResponse)(res, "Investigation status updated successfully", investigation, 200);
            }
            catch (error) {
                console.error('❌ Update investigation status error:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.AdminDueDiligenceController = AdminDueDiligenceController;
