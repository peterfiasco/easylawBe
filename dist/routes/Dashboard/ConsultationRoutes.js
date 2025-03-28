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
const Consultationrouter = express_1.default.Router();
Consultationrouter.post('/book-consultation', authMiddleware_1.UserMiddleware, ConsultationController_1.BookConsultation);
Consultationrouter.post('/check-cac', authMiddleware_1.UserMiddleware, BusinessVerifyController_1.BusinessVerify);
Consultationrouter.post('/ai-chat/:chat_id?', authMiddleware_1.UserMiddleware, AlSearchController_1.AIRequestControl);
Consultationrouter.get('/get-aichat-history', authMiddleware_1.UserMiddleware, AlSearchController_1.AIGetAllHistory);
Consultationrouter.get('/get-aichat-messagehistory/:chat_id', authMiddleware_1.UserMiddleware, AlSearchController_1.AIGetChatHistory);
exports.default = Consultationrouter;
