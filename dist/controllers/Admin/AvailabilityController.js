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
exports.AvailabilityController = void 0;
const response_1 = require("../../utils/response");
const ConsultationTimeSlot_1 = __importDefault(require("../../models/ConsultationTimeSlot"));
const BlockedDate_1 = __importDefault(require("../../models/BlockedDate"));
class AvailabilityController {
    // Time Slots Management
    static getAllTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeSlots = yield ConsultationTimeSlot_1.default.find().sort({ start_time: 1 });
                return (0, response_1.successResponse)(res, "Time slots retrieved successfully", timeSlots, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    static createTimeSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { start_time, end_time } = req.body;
                if (!start_time) {
                    return (0, response_1.errorResponse)(res, "Start time is required", {}, 400);
                }
                // Check if time slot already exists
                const existingSlot = yield ConsultationTimeSlot_1.default.findOne({ start_time });
                if (existingSlot) {
                    return (0, response_1.errorResponse)(res, "Time slot already exists", {}, 400);
                }
                const newTimeSlot = new ConsultationTimeSlot_1.default({
                    start_time,
                    end_time,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                yield newTimeSlot.save();
                return (0, response_1.successResponse)(res, "Time slot created successfully", newTimeSlot, 201);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    static updateTimeSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { start_time, end_time, is_active } = req.body;
                const timeSlot = yield ConsultationTimeSlot_1.default.findById(id);
                if (!timeSlot) {
                    return (0, response_1.errorResponse)(res, "Time slot not found", {}, 404);
                }
                timeSlot.start_time = start_time || timeSlot.start_time;
                timeSlot.end_time = end_time || timeSlot.end_time;
                timeSlot.is_active = is_active !== undefined ? is_active : timeSlot.is_active;
                timeSlot.updated_at = new Date();
                yield timeSlot.save();
                return (0, response_1.successResponse)(res, "Time slot updated successfully", timeSlot, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    static deleteTimeSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deletedTimeSlot = yield ConsultationTimeSlot_1.default.findByIdAndDelete(id);
                if (!deletedTimeSlot) {
                    return (0, response_1.errorResponse)(res, "Time slot not found", {}, 404);
                }
                return (0, response_1.successResponse)(res, "Time slot deleted successfully", {}, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    // Blocked Dates Management
    static getBlockedDates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockedDates = yield BlockedDate_1.default.find().sort({ date: 1 });
                return (0, response_1.successResponse)(res, "Blocked dates retrieved successfully", blockedDates, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    static blockDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { date, reason } = req.body;
                if (!date) {
                    return (0, response_1.errorResponse)(res, "Date is required", {}, 400);
                }
                // Check if date is already blocked
                const existingBlock = yield BlockedDate_1.default.findOne({
                    date: new Date(date)
                });
                if (existingBlock) {
                    return (0, response_1.errorResponse)(res, "This date is already blocked", {}, 400);
                }
                const newBlockedDate = new BlockedDate_1.default({
                    date: new Date(date),
                    reason,
                    created_by: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                yield newBlockedDate.save();
                return (0, response_1.successResponse)(res, "Date blocked successfully", newBlockedDate, 201);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
    static unblockDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deletedBlock = yield BlockedDate_1.default.findByIdAndDelete(id);
                if (!deletedBlock) {
                    return (0, response_1.errorResponse)(res, "Blocked date not found", {}, 404);
                }
                return (0, response_1.successResponse)(res, "Date unblocked successfully", {}, 200);
            }
            catch (error) {
                return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
            }
        });
    }
}
exports.AvailabilityController = AvailabilityController;
