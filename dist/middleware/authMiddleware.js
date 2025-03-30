"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.UserMiddleware = exports.adminMiddlewareImpl = exports.userMiddlewareImpl = exports.authMiddleware = void 0;
exports.createMiddleware = createMiddleware;
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("../utils/response");
// Import jsonwebtoken using require to bypass TypeScript checks
const jwt = require('jsonwebtoken');
dotenv_1.default.config();
// Create the missing authMiddleware function
const authMiddleware = (req, res, next) => {
    console.log("Auth header received:", req.headers.authorization);
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("No authorization header found");
            res.status(401).json({ message: "No authorization header found" });
            return;
        }
        // Ensure proper format and extract token
        let token;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else {
            // Try to use the entire header as token if no Bearer prefix
            token = authHeader;
        }
        console.log("Extracted token:", token ? `${token.substring(0, 15)}...` : 'none');
        if (!token || token.trim() === '') {
            console.log("No token provided or token is empty");
            res.status(401).json({ message: "No token provided" });
            return;
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        console.log("Token decoded successfully:", decoded.email);
        // Set user to request object using type assertion
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Auth middleware error details:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
// Create a wrapper function that makes middleware TypeScript-compatible
function createMiddleware(middlewareFn) {
    return (req, res, next) => {
        // Call the middleware and handle its return value
        const result = middlewareFn(req, res, next);
        // Don't return anything from the wrapper function
    };
}
// Define your middleware functions - export them directly instead of redeclaring
const userMiddlewareImpl = (req, res, next) => {
    var _a;
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return (0, response_1.errorResponse)(res, "Access denied: No authorization header", {}, 401);
    }
    // Extract token with or without Bearer prefix
    let token;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else {
        token = authHeader;
    }
    if (!token || token.trim() === '') {
        return (0, response_1.errorResponse)(res, "Access denied: No token provided", {}, 401);
    }
    try {
        const secretKey = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "GAPtLWo8YJGYMre1CTXMa7tdcny9ED84h2qA/e/v+nw=";
        // Explicitly cast `jwt.verify()` result to `CustomJwtPayload`
        const verified = jwt.verify(token, secretKey);
        // Ensure the payload has the expected fields
        // Update the check for user fields
        if ((!verified._id && !verified.user_id) || !verified.role || !verified.email) {
            return (0, response_1.errorResponse)(res, "Invalid token structure", {}, 401);
        }
        if (verified.role !== "user") {
            return (0, response_1.errorResponse)(res, "Access denied. Customers only", {}, 403);
        }
        req.user = verified;
        next();
    }
    catch (err) {
        console.error(err);
        return (0, response_1.errorResponse)(res, "Invalid or expired token", { err }, 400);
    }
};
exports.userMiddlewareImpl = userMiddlewareImpl;
const adminMiddlewareImpl = (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.adminMiddlewareImpl = adminMiddlewareImpl;
// Export the wrapped middleware functions
exports.UserMiddleware = createMiddleware(exports.userMiddlewareImpl);
exports.adminMiddleware = createMiddleware(exports.adminMiddlewareImpl);
