"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.adminIPWhitelist = exports.securityHeaders = exports.sanitizeInput = exports.consultationRateLimit = exports.fileUploadRateLimit = exports.businessServiceRateLimit = exports.authRateLimit = exports.createRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const response_1 = require("../utils/response");
// Enhanced rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            message,
            error: 'Rate limit exceeded'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            return (0, response_1.errorResponse)(res, message, { retryAfter: Math.round(windowMs / 1000) }, 429);
        }
    });
};
exports.createRateLimit = createRateLimit;
// Different rate limits for different actions
exports.authRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, // 15 minutes
5, // 5 attempts
'Too many authentication attempts. Please try again in 15 minutes.');
exports.businessServiceRateLimit = (0, exports.createRateLimit)(60 * 60 * 1000, // 1 hour
10, // 10 submissions per hour
'Too many business service submissions. Please try again later.');
exports.fileUploadRateLimit = (0, exports.createRateLimit)(10 * 60 * 1000, // 10 minutes
20, // 20 uploads per 10 minutes
'Too many file uploads. Please try again in 10 minutes.');
exports.consultationRateLimit = (0, exports.createRateLimit)(24 * 60 * 60 * 1000, // 24 hours
5, // 5 consultations per day
'Too many consultation bookings today. Please try again tomorrow.');
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }
        // Sanitize query parameters
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }
        // Sanitize URL parameters
        if (req.params) {
            req.params = sanitizeObject(req.params);
        }
        next();
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Input validation error", { error: "Invalid input detected" }, 400);
    }
};
exports.sanitizeInput = sanitizeInput;
// Helper function to sanitize object recursively
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const sanitizedKey = sanitizeString(key);
                sanitized[sanitizedKey] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    return obj;
};
// String sanitization function
const sanitizeString = (str) => {
    if (typeof str !== 'string')
        return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
};
// Security headers middleware
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.vpay.africa", "https://dropin-sandbox.vpay.africa"]
        }
    },
    crossOriginEmbedderPolicy: false // Allow embedding for VPay
});
// IP whitelist middleware for admin actions
const adminIPWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        // Skip IP checking in development
        if (process.env.NODE_ENV === 'development') {
            return next();
        }
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        // If no whitelist is configured, allow all
        if (allowedIPs.length === 0) {
            return next();
        }
        if (!allowedIPs.includes(clientIP)) {
            console.warn(`Unauthorized admin access attempt from IP: ${clientIP}`);
            return (0, response_1.errorResponse)(res, "Access denied from this location", { ip: clientIP }, 403);
        }
        next();
    };
};
exports.adminIPWhitelist = adminIPWhitelist;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        var _a;
        const duration = Date.now() - start;
        const log = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            user: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || 'anonymous'
        };
        // Log to console (in production, you might want to use a proper logging service)
        console.log(`[REQUEST] ${JSON.stringify(log)}`);
    });
    next();
};
exports.requestLogger = requestLogger;
exports.default = {
    createRateLimit: exports.createRateLimit,
    authRateLimit: exports.authRateLimit,
    businessServiceRateLimit: exports.businessServiceRateLimit,
    fileUploadRateLimit: exports.fileUploadRateLimit,
    consultationRateLimit: exports.consultationRateLimit,
    sanitizeInput: exports.sanitizeInput,
    securityHeaders: exports.securityHeaders,
    adminIPWhitelist: exports.adminIPWhitelist,
    requestLogger: exports.requestLogger
};
