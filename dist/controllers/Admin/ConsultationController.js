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
exports.AdminConsultationController = void 0;
const response_1 = require("../../utils/response");
const ConsultationType_1 = __importDefault(require("../../models/ConsultationType"));
const Consultation_1 = __importDefault(require("../../models/Consultation"));
class AdminConsultationController {
    // Get all consultation types
    static getConsultationTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const types = yield ConsultationType_1.default.find().sort({ created_at: -1 });
                // Make sure we return valid ID for frontend
                const formattedTypes = types.map(type => ({
                    id: type._id,
                    name: type.name,
                    description: type.description,
                    call_type: type.call_type,
                    price: type.price,
                    duration: type.duration,
                    created_at: type.created_at,
                    updated_at: type.updated_at
                }));
                return (0, response_1.successResponse)(res, "Consultation types retrieved successfully", formattedTypes, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Create a new consultation type
    static createConsultationType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description, call_type, price, duration } = req.body;
                // Validate input
                if (!name || !description || !call_type || !price) {
                    return (0, response_1.errorResponse)(res, "Missing required fields", { error: "All fields are required" }, 400);
                }
                // Create new consultation type
                const newType = new ConsultationType_1.default({
                    name,
                    description,
                    call_type,
                    price: Number(price),
                    duration: Number(duration) || 30,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                yield newType.save();
                // Format response with id field
                const formatted = {
                    id: newType._id,
                    name: newType.name,
                    description: newType.description,
                    call_type: newType.call_type,
                    price: newType.price,
                    duration: newType.duration,
                    created_at: newType.created_at,
                    updated_at: newType.updated_at
                };
                return (0, response_1.successResponse)(res, "Consultation type created successfully", formatted, 201);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Update a consultation type
    static updateConsultationType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return (0, response_1.errorResponse)(res, "Missing ID parameter", { error: "Consultation type ID is required" }, 400);
                }
                const { name, description, call_type, price, duration } = req.body;
                // Find and update the consultation type
                const updatedType = yield ConsultationType_1.default.findByIdAndUpdate(id, {
                    name,
                    description,
                    call_type,
                    price: Number(price),
                    duration: Number(duration) || 30,
                    updated_at: new Date()
                }, { new: true, runValidators: true });
                if (!updatedType) {
                    return (0, response_1.errorResponse)(res, "Consultation type not found", {}, 404);
                }
                // Format response with id field
                const formatted = {
                    id: updatedType._id,
                    name: updatedType.name,
                    description: updatedType.description,
                    call_type: updatedType.call_type,
                    price: updatedType.price,
                    duration: updatedType.duration,
                    created_at: updatedType.created_at,
                    updated_at: updatedType.updated_at
                };
                return (0, response_1.successResponse)(res, "Consultation type updated successfully", formatted, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Delete a consultation type
    static deleteConsultationType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return (0, response_1.errorResponse)(res, "Missing ID parameter", { error: "Consultation type ID is required" }, 400);
                }
                // Check if type is in use
                const inUse = yield Consultation_1.default.findOne({ call_type: id });
                if (inUse) {
                    return (0, response_1.errorResponse)(res, "Cannot delete: this consultation type is in use by existing bookings", {}, 400);
                }
                // Delete the consultation type
                const deletedType = yield ConsultationType_1.default.findByIdAndDelete(id);
                if (!deletedType) {
                    return (0, response_1.errorResponse)(res, "Consultation type not found", {}, 404);
                }
                return (0, response_1.successResponse)(res, "Consultation type deleted successfully", {}, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get all consultation bookings with user details
    static getConsultationBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield Consultation_1.default.find()
                    .populate('user_id', 'first_name last_name email phone_number')
                    .sort({ createdAt: -1 });
                // Transform to match frontend expectations based on actual data structure
                const formattedBookings = bookings.map((booking) => {
                    var _a;
                    // Skip if user_id is missing
                    if (!booking || !booking.user_id) {
                        console.log('Missing user data:', booking);
                        return null;
                    }
                    // Create formatted booking with available fields
                    return {
                        id: booking._id,
                        user: {
                            id: booking.user_id._id,
                            name: `${booking.user_id.first_name} ${booking.user_id.last_name}`,
                            email: booking.user_id.email,
                            phone: ((_a = booking.user_id.phone_number) === null || _a === void 0 ? void 0 : _a.toString()) || 'Not provided'
                        },
                        consultation_type: {
                            id: booking._id, // Using booking ID since there's no separate type
                            name: `${booking.call_type === 'video' ? 'Video' : 'Phone'} Consultation`,
                            call_type: booking.call_type,
                            price: 0, // Default value since it's not in your current structure
                            duration: 30 // Default value
                        },
                        date: booking.date,
                        time: booking.time,
                        reason: booking.reason || 'No reason provided',
                        status: booking.status || booking.payment_status || 'pending',
                        created_at: booking.createdAt
                    };
                }).filter(booking => booking !== null);
                return (0, response_1.successResponse)(res, "Consultation bookings retrieved successfully", formattedBookings, 200);
            }
            catch (error) {
                console.error('Error in getConsultationBookings:', error);
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.AdminConsultationController = AdminConsultationController;
