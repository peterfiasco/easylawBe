"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.RegisterSchema = joi_1.default.object({
    first_name: joi_1.default.string().max(20).required(),
    last_name: joi_1.default.string().max(20).required(),
    email: joi_1.default.string().required(),
    phone_number: joi_1.default.number().required(),
    password: joi_1.default.string().min(6).required(),
    confirm_password: joi_1.default.string()
        .valid(joi_1.default.ref('password'))
        .required()
        .messages({ 'any.only': 'Confirm password must match password' }),
    // Make company-related fields optional
    company_name: joi_1.default.string().optional(),
    website: joi_1.default.string().optional().allow('', null),
    business_type: joi_1.default.string()
        .valid('llc', 'corporation', 'partnership', 'sole-proprietorship', 'Individual')
        .optional(),
    address: joi_1.default.string().optional(),
    // Better approach for agree_with_terms that handles multiple possible values
    agree_with_terms: joi_1.default.alternatives()
        .try(joi_1.default.boolean().valid(true), joi_1.default.string().valid('true', 'on', '1'))
        .required()
        .messages({
        'any.only': 'You must agree to the terms and conditions',
        'any.required': 'Agreement to terms is required'
    })
});
exports.LoginSchema = joi_1.default.object({
    email: joi_1.default.string().required(),
    password: joi_1.default.string().min(6).required(),
});
