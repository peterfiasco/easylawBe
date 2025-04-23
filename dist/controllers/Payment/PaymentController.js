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
exports.RecordPayment = exports.HandleVpayWebhook = exports.VerifyVpayPayment = void 0;
const response_1 = require("../../utils/response");
const PaymentValidation_1 = require("./PaymentValidation");
const VpayService_1 = require("./VpayService");
const Consultation_1 = __importDefault(require("../../models/Consultation"));
const Transaction_1 = __importDefault(require("../../models/Transaction"));
const VerifyVpayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionRef, reason, consultation_id } = req.body;
        const { error } = PaymentValidation_1.PaymentValidationSchema.validate(req.body);
        if (error)
            return (0, response_1.errorResponse)(res, `Validation error: ${error.details[0].message}`, { error: error.details[0].message }, 400);
        const { user_id } = req.user;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "user Id is required", {}, 400);
        }
        //call the verify payment service
        const verify = yield (0, VpayService_1.VerifyPayment)(transactionRef);
        console.log("verify", verify);
        if (!verify || !verify.data || verify.data.paymentstatus !== "paid") {
            return (0, response_1.errorResponse)(res, "Payment not completed", {}, 400);
        }
        // Save transaction details
        const transaction = new Transaction_1.default({
            user_id,
            transactionRef,
            paymentmethod: verify.data.paymentmethod,
            status: verify.data.paymentstatus,
            amount: verify.data.orderamount,
            reversed: verify.data.reversed,
        });
        yield transaction.save();
        // Retrieve consultation details if reason is "consultation"
        if (reason === "consultation") {
            // Retrieve the consultation with its type information
            const consult = yield Consultation_1.default.findById(consultation_id).populate('consultation_type_id');
            if (!consult) {
                return (0, response_1.errorResponse)(res, "Consultation not found", {}, 404);
            }
            if (!consult.consultation_type_id) {
                return (0, response_1.errorResponse)(res, "Consultation type not found", {}, 404);
            }
            // Get the price from the consultation type
            const expectedAmount = consult.consultation_type_id.price;
            // Compare the expected amount with the paid amount
            if (verify.data.orderamount !== expectedAmount) {
                return (0, response_1.errorResponse)(res, "Incorrect payment amount", { transaction }, 400);
            }
            // Update consultation payment status
            yield Consultation_1.default.findByIdAndUpdate(consultation_id, {
                status: "paid",
                transaction_id: transaction._id
            }, { new: true });
        }
        return (0, response_1.successResponse)(res, "Payment successful", { transaction }, 200);
    }
    catch (error) {
        console.log("Payment Verify Error", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.VerifyVpayPayment = VerifyVpayPayment;
// Add this new controller function
const HandleVpayWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Webhook received from VPay:", req.body);
        // Verify the webhook data (you might want to validate a signature)
        const { transactionRef, status, amount } = req.body;
        if (!transactionRef) {
            return (0, response_1.errorResponse)(res, "Invalid webhook data", {}, 400);
        }
        // Find related transaction or consultation and update its status
        // This depends on your application logic
        // Always respond with 200 to webhooks even if you encounter non-critical errors
        // This prevents the payment provider from retrying unnecessarily
        return (0, response_1.successResponse)(res, "Webhook received successfully", {}, 200);
    }
    catch (error) {
        console.error("Webhook handling error:", error);
        // Still return 200 to prevent retries
        return (0, response_1.successResponse)(res, "Webhook processed", {}, 200);
    }
});
exports.HandleVpayWebhook = HandleVpayWebhook;
// Add this new controller function
const RecordPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionRef, reason, consultation_id, paymentStatus, paymentMethod, amount, metadata } = req.body;
        const { user_id } = req.user;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "User ID is required", {}, 400);
        }
        // Save transaction details directly
        const transaction = new Transaction_1.default({
            user_id,
            transactionRef,
            paymentmethod: paymentMethod || 'card',
            status: paymentStatus || 'paid',
            amount: amount,
            metadata: metadata || '',
            reversed: false,
        });
        yield transaction.save();
        // If this is a consultation payment, update the consultation status
        if (reason === "consultation" && consultation_id) {
            // Update consultation payment status
            yield Consultation_1.default.findByIdAndUpdate(consultation_id, {
                status: "paid",
                transaction_id: transaction._id
            }, { new: true });
        }
        return (0, response_1.successResponse)(res, "Payment recorded successfully", { transaction }, 200);
    }
    catch (error) {
        console.log("Payment recording error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.RecordPayment = RecordPayment;
