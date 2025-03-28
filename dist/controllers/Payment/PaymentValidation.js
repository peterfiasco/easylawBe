"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.PaymentValidationSchema = joi_1.default.object({
    reason: joi_1.default.string().valid('subscription', 'consultation').required(),
    transactionRef: joi_1.default.string().required(),
    consultation_id: joi_1.default.string().when('reason', {
        is: 'consultation',
        then: joi_1.default.required(),
        otherwise: joi_1.default.forbidden(),
    }),
});
