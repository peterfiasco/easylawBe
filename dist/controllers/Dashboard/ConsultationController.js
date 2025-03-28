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
exports.BookConsultation = void 0;
const response_1 = require("../../utils/response");
const Validator_1 = require("./Validation/Validator");
const Consultation_1 = __importDefault(require("../../models/Consultation"));
const BookConsultation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { call_type, date, time } = req.body;
        const { error } = Validator_1.BookConsultationSchema.validate(req.body);
        if (error)
            return (0, response_1.errorResponse)(res, `Validation error: ${error.details[0].message}`, { error: error.details[0].message }, 400);
        const { user_id } = req.user;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "user Id is required", {}, 400);
        }
        const newbooking = new Consultation_1.default({
            user_id,
            call_type,
            date,
            time,
        });
        yield newbooking.save();
        var amount;
        if (call_type == "video") {
            amount = 200;
        }
        else {
            amount = 100;
        }
        return (0, response_1.successResponse)(res, "Consultation reservation made, please proceed to payment to confirm reservation", { amount, newbooking }, 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.BookConsultation = BookConsultation;
