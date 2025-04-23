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
    var _a;
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Request path:", req.path);
    console.log("Auth header received:", req.headers.authorization ?
        `${req.headers.authorization.substring(0, 20)}...` : 'none');
    console.log("User from session:", ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) ? 'exists' : 'none');
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
        console.log("Decoded payload:", JSON.stringify({
            _id: decoded._id,
            user_id: decoded.user_id,
            role: decoded.role,
            email: decoded.email
        }, null, 2));
        // Set user to request object - use type assertion to avoid type checking
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
        // Use double type assertion to bypass TypeScript's structural checking
        const customReq = req;
        middlewareFn(customReq, res, next);
    };
}
// Define your middleware functions
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
        // Verify and decode the token
        const verified = jwt.verify(token, secretKey);
        // Debug log the decoded token
        console.log("Decoded token payload:", JSON.stringify({
            _id: verified._id,
            user_id: verified.user_id,
            role: verified.role,
            email: verified.email
        }, null, 2));
        // Handle both _id and user_id formats - ensure one valid ID is available
        if (!verified._id && verified.user_id) {
            verified._id = verified.user_id; // Use user_id as _id if available
        }
        // Now check that we have an ID and other required fields
        if (!verified._id && !verified.user_id) {
            console.error("Invalid token structure. Missing user ID:", verified);
            return (0, response_1.errorResponse)(res, "Invalid token structure", {}, 401);
        }
        if (!verified.role || !verified.email) {
            console.error("Invalid token structure. Missing required fields:", verified);
            return (0, response_1.errorResponse)(res, "Invalid token structure", {}, 401);
        }
        // Check role
        if (verified.role !== "user") {
            return (0, response_1.errorResponse)(res, "Access denied. Customers only", {}, 403);
        }
        // Assign the verified user to req.user
        req.user = verified;
        next();
    }
    catch (err) {
        console.error("Token verification error:", err);
        return (0, response_1.errorResponse)(res, "Invalid or expired token", { err }, 400);
    }
};
exports.userMiddlewareImpl = userMiddlewareImpl;
const adminMiddlewareImpl = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        // Debug log the user object
        console.log("Admin check for user:", JSON.stringify({
            _id: user._id,
            role: user.role,
            email: user.email
        }, null, 2));
        if (user.role !== 'admin') {
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
