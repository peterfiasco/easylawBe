"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const ConsultationController_1 = require("../../controllers/Dashboard/ConsultationController");
const BusinessVerifyController_1 = require("../../controllers/Dashboard/BusinessVerifyController");
const AlSearchController_1 = require("../../controllers/AI/AlSearchController");
const AvailabilityController_1 = require("../../controllers/Consultation/AvailabilityController");
const Consultationrouter = express_1.default.Router();
// Public endpoint for consultation types - no middleware
Consultationrouter.get('/types', ConsultationController_1.GetConsultationTypes);
// ✅ FIXED - Change route to match frontend expectation
Consultationrouter.post('/book', authMiddleware_1.authMiddleware, ConsultationController_1.BookConsultation); // Changed from '/book-consultation'
Consultationrouter.post('/send-confirmation', authMiddleware_1.authMiddleware, ConsultationController_1.SendBookingConfirmation);
// Existing endpoints
Consultationrouter.post('/check-cac', authMiddleware_1.authMiddleware, BusinessVerifyController_1.BusinessVerify);
Consultationrouter.post('/ai-chat/:chat_id?', authMiddleware_1.authMiddleware, AlSearchController_1.AIRequestControl);
Consultationrouter.get('/get-aichat-history', authMiddleware_1.authMiddleware, AlSearchController_1.AIGetAllHistory);
Consultationrouter.get('/get-aichat-messagehistory/:chat_id', authMiddleware_1.authMiddleware, AlSearchController_1.AIGetChatHistory);
// Availability endpoints
Consultationrouter.get('/available-time-slots', AvailabilityController_1.PublicAvailabilityController.getAvailableTimeSlots);
Consultationrouter.get('/check-date-availability/:date', AvailabilityController_1.PublicAvailabilityController.checkDateAvailability);
Consultationrouter.get('/unavailable-time-slots/:date', AvailabilityController_1.PublicAvailabilityController.getUnavailableTimeSlots);
exports.default = Consultationrouter;
