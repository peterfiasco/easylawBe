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
exports.SendBookingConfirmation = exports.GetConsultationTypes = exports.BookConsultation = void 0;
const email_service_1 = require("../../services/email.service");
const User_1 = __importDefault(require("../../models/User")); // ✅ ADD USER MODEL IMPORT
const response_1 = require("../../utils/response");
const Consultation_1 = __importDefault(require("../../models/Consultation"));
const ConsultationType_1 = __importDefault(require("../../models/ConsultationType"));
const BookConsultation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { date, time, reason } = req.body;
        if (!date || !time || !reason) {
            return (0, response_1.errorResponse)(res, "Validation error: date, time, and reason are required", { error: "Missing required fields" }, 400);
        }
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
        if (!userId) {
            return (0, response_1.errorResponse)(res, "User authentication required", {}, 401);
        }
        // ✅ FETCH USER FROM DATABASE FOR EMAIL
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return (0, response_1.errorResponse)(res, "User not found", {}, 404);
        }
        const consultationType = yield ConsultationType_1.default.findOne().sort({ created_at: 1 });
        if (!consultationType) {
            return (0, response_1.errorResponse)(res, "No consultation type available", {}, 400);
        }
        const newbooking = new Consultation_1.default({
            user_id: userId,
            consultation_type_id: consultationType._id,
            date: new Date(date),
            time,
            reason,
            status: "pending"
        });
        yield newbooking.save();
        // ✅ SEND EMAIL WITH DATABASE USER DATA
        try {
            yield (0, email_service_1.sendConsultationBookingConfirmation)(user.email, // ✅ From database
            `${user.first_name} ${user.last_name}`, // ✅ From database - will show "Jonathan DiCaprio"
            {
                consultationType: consultationType.name,
                date: new Date(date),
                time: time,
                referenceNumber: newbooking._id.toString(),
                amount: consultationType.price
            });
            console.log('✅ Consultation confirmation email sent successfully');
        }
        catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError);
            // Don't fail the booking if email fails - just log it
        }
        return (0, response_1.successResponse)(res, "Consultation reservation made, please proceed to payment to confirm reservation", {
            amount: consultationType.price,
            newbooking: {
                id: newbooking._id,
                consultation_type: {
                    name: consultationType.name,
                    price: consultationType.price,
                    duration: consultationType.duration
                },
                date: newbooking.date,
                time: newbooking.time,
                reason: newbooking.reason,
                status: newbooking.status
            }
        }, 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.BookConsultation = BookConsultation;
// Get the single consultation type (simplified endpoint)
const GetConsultationTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Since we only have one type, return it directly
        const type = yield ConsultationType_1.default.findOne().sort({ created_at: 1 });
        if (!type) {
            return (0, response_1.errorResponse)(res, "No consultation type found", {}, 404);
        }
        // Return as array for compatibility with existing frontend
        const formattedType = {
            _id: type._id,
            id: type._id,
            name: type.name,
            description: type.description,
            call_type: type.call_type,
            price: type.price,
            duration: type.duration
        };
        return (0, response_1.successResponse)(res, "Consultation type retrieved successfully", [formattedType], // Return as array for compatibility
        200);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.GetConsultationTypes = GetConsultationTypes;
// 🆕 NEW: Send booking confirmation email after payment
const SendBookingConfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { consultation_id } = req.body;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.user_id);
        if (!consultation_id) {
            return (0, response_1.errorResponse)(res, "Consultation ID is required", {}, 400);
        }
        const consultation = yield Consultation_1.default.findById(consultation_id)
            .populate('user_id', 'first_name last_name email')
            .populate('consultation_type_id', 'name price duration');
        if (!consultation) {
            return (0, response_1.errorResponse)(res, "Consultation not found", {}, 404);
        }
        if (consultation.user_id._id.toString() !== userId.toString()) {
            return (0, response_1.errorResponse)(res, "Unauthorized access", {}, 403);
        }
        const user = consultation.user_id;
        const consultationType = consultation.consultation_type_id;
        // ✅ FIXED - Use correct parameters for your email service
        yield (0, email_service_1.sendConsultationBookingConfirmation)(user.email, `${user.first_name} ${user.last_name}`, {
            consultationType: consultationType.name,
            date: consultation.date,
            time: consultation.time,
            referenceNumber: consultation._id.toString(),
            amount: consultationType.price
        });
        return (0, response_1.successResponse)(res, "Booking confirmation email sent successfully", {}, 200);
    }
    catch (error) {
        console.error('Error sending booking confirmation:', error);
        return (0, response_1.errorResponse)(res, "Failed to send confirmation email", { error: error.message }, 500);
    }
});
exports.SendBookingConfirmation = SendBookingConfirmation;
