"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USE_SANDBOX = exports.MAILGUN_DOMAIN = void 0;
const form_data_1 = __importDefault(require("form-data"));
const mailgun_js_1 = __importDefault(require("mailgun.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailgun = new mailgun_js_1.default(form_data_1.default);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
});
exports.default = mg;
// Use real domain if available, fallback to sandbox
exports.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_SANDBOX_DOMAIN;
// Check if we should use sandbox mode
exports.USE_SANDBOX = process.env.NODE_ENV !== 'production' || !process.env.MAILGUN_DOMAIN;
