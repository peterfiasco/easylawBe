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
exports.PublicAvailabilityController = void 0;
const response_1 = require("../../utils/response");
const ConsultationTimeSlot_1 = __importDefault(require("../../models/ConsultationTimeSlot"));
const BlockedDate_1 = __importDefault(require("../../models/BlockedDate"));
const Consultation_1 = __importDefault(require("../../models/Consultation"));
class PublicAvailabilityController {
    // Get all active time slots for bookings
    static getAvailableTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeSlots = yield ConsultationTimeSlot_1.default.find({ is_active: true })
                    .sort({ start_time: 1 });
                return (0, response_1.successResponse)(res, "Available time slots retrieved successfully", timeSlots, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Check if a specific date is available
    static checkDateAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date } = req.params;
                if (!date) {
                    return (0, response_1.errorResponse)(res, "Date parameter is required", {}, 400);
                }
                // Format the date to match MongoDB date format (start of day)
                const requestedDate = new Date(date);
                requestedDate.setHours(0, 0, 0, 0);
                // Check if date is blocked
                const isBlocked = yield BlockedDate_1.default.findOne({
                    date: {
                        $gte: requestedDate,
                        $lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)
                    }
                });
                if (isBlocked) {
                    return (0, response_1.successResponse)(res, "Date availability checked", {
                        available: false,
                        reason: isBlocked.reason || "This date is not available for booking"
                    }, 200);
                }
                // If not blocked, it's available
                return (0, response_1.successResponse)(res, "Date availability checked", { available: true }, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Get unavailable time slots for a specific date (already booked)
    static getUnavailableTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date } = req.params;
                if (!date) {
                    return (0, response_1.errorResponse)(res, "Date parameter is required", {}, 400);
                }
                // Format the date to match MongoDB date format
                const requestedDate = new Date(date);
                requestedDate.setHours(0, 0, 0, 0);
                const nextDay = new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000);
                // Find bookings for this date
                const bookings = yield Consultation_1.default.find({
                    date: {
                        $gte: requestedDate,
                        $lt: nextDay
                    },
                    status: { $ne: 'cancelled' } // Ignore cancelled bookings
                });
                // Extract booked time slots
                const bookedTimeSlots = bookings.map(booking => booking.time);
                return (0, response_1.successResponse)(res, "Unavailable time slots retrieved", bookedTimeSlots, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.PublicAvailabilityController = PublicAvailabilityController;
