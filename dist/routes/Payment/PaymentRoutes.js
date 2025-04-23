"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const PaymentController_1 = require("../../controllers/Payment/PaymentController");
const PaymentRouter = express_1.default.Router();
// Keep the original verification endpoint for backward compatibility
PaymentRouter.post('/verify-payment', authMiddleware_1.UserMiddleware, PaymentController_1.VerifyVpayPayment);
// Add the simplified payment recording endpoint
PaymentRouter.post('/record-payment', authMiddleware_1.UserMiddleware, PaymentController_1.RecordPayment);
// Add webhook route - no auth middleware needed for external webhooks
PaymentRouter.post('/webhook', PaymentController_1.HandleVpayWebhook);
exports.default = PaymentRouter;
