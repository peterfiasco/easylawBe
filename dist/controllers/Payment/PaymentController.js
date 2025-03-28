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
exports.VerifyVpayPayment = void 0;
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
        //verify if amount is paid is the amount to be paid, will do this part as it's not yet confirmed
        // check for the reason which will determine where to check for time
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
        let expectedAmount = 0;
        if (reason === "consultation") {
            const consult = yield Consultation_1.default.findById(consultation_id);
            if (!consult) {
                return (0, response_1.errorResponse)(res, "Consultation not found", {}, 404);
            }
            // Determine expected amount based on call type
            expectedAmount =
                consult.call_type === "video"
                    ? 200
                    : consult.call_type === "audio"
                        ? 100
                        : 0;
            // Compare the expected amount with the paid amount
            if (verify.data.orderamount !== expectedAmount) {
                return (0, response_1.errorResponse)(res, "Incorrect payment amount", { transaction }, 400);
            }
            // Object to store user updates
            const userConsult = {};
            if (transaction)
                userConsult.payment_status = transaction.status;
            if (transaction)
                userConsult.transaction_id = transaction._id;
            yield Consultation_1.default.findOneAndUpdate({ user_id }, { $set: userConsult }, { new: true, upsert: true });
        }
        return (0, response_1.successResponse)(res, "Payment successful", { transaction }, 200);
        //what ever the status of the payment is send to db and frontend back
    }
    catch (error) {
        console.log("Payment Verify Error", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.VerifyVpayPayment = VerifyVpayPayment;
