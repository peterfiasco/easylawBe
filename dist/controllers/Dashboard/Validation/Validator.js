"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSchema = exports.BookConsultationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.BookConsultationSchema = joi_1.default.object({
    call_type: joi_1.default.string().valid('video', 'phone').required(),
    date: joi_1.default.date().required(),
    time: joi_1.default.string().required()
});
exports.BusinessSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    business: joi_1.default.string().required()
});
