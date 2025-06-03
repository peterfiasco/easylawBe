"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTitleCase = exports.capitalizeFirst = exports.deepClone = exports.calculatePercentage = exports.sanitizeFilename = exports.hashData = exports.generateSecureToken = exports.isValidEmail = exports.formatCurrency = exports.addBusinessDays = exports.generateReferenceNumber = exports.generateAlphanumeric = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Generate alphanumeric string
const generateAlphanumeric = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateAlphanumeric = generateAlphanumeric;
// Generate reference number with prefix
const generateReferenceNumber = (prefix) => {
    const timestamp = Date.now().toString();
    const random = (0, exports.generateAlphanumeric)(6);
    return `${prefix}${timestamp}${random}`;
};
exports.generateReferenceNumber = generateReferenceNumber;
// Calculate business days (excluding weekends)
const addBusinessDays = (startDate, businessDays) => {
    const result = new Date(startDate);
    let daysAdded = 0;
    while (daysAdded < businessDays) {
        result.setDate(result.getDate() + 1);
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            daysAdded++;
        }
    }
    return result;
};
exports.addBusinessDays = addBusinessDays;
// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
// Generate secure random token
const generateSecureToken = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
// Hash sensitive data
const hashData = (data) => {
    return crypto_1.default.createHash('sha256').update(data).digest('hex');
};
exports.hashData = hashData;
// Sanitize filename for storage
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
};
exports.sanitizeFilename = sanitizeFilename;
// Calculate percentage
const calculatePercentage = (part, whole) => {
    return whole === 0 ? 0 : (part / whole) * 100;
};
exports.calculatePercentage = calculatePercentage;
// Deep clone object
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
exports.deepClone = deepClone;
// Capitalize first letter
const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
exports.capitalizeFirst = capitalizeFirst;
// Convert string to title case
const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
exports.toTitleCase = toTitleCase;
