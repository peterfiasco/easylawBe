"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.UserMiddleware = exports.adminMiddlewareImpl = exports.userMiddlewareImpl = exports.authMiddleware = void 0;
exports.createMiddleware = createMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("../utils/response");
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    var _a;
    try {
        // Get token from header
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "No token, authorization denied" });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        // Set user to request object using type assertion
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
const userMiddlewareImpl = (req, res, next) => {
    var _a;
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return (0, response_1.errorResponse)(res, "Access denied", {}, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
        return (0, response_1.errorResponse)(res, "Access denied", {}, 401);
    }
    try {
        const secretKey = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "GAPtLWo8YJGYMre1CTXMa7tdcny9ED84h2qA/e/v+nw=";
        const verified = jsonwebtoken_1.default.verify(token, secretKey);
        if (!verified.user_id || !verified.role || !verified.email) {
            return (0, response_1.errorResponse)(res, "Invalid token structure", {}, 401);
        }
        if (verified.role !== "user") {
            return (0, response_1.errorResponse)(res, "Access denied. Customers only", {}, 403);
        }
        // Ensure verified has an _id property (required by our interface)
        const userWithId = Object.assign(Object.assign({}, verified), { _id: verified._id || verified.user_id // Use _id if exists, otherwise use user_id
         });
        // Use type assertion to set the user property
        req.user = userWithId;
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
        // Use type assertion to get the user property
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
function createMiddleware(middlewareFn) {
    return (req, res, next) => {
        middlewareFn(req, res, next);
    };
}
exports.UserMiddleware = createMiddleware(exports.userMiddlewareImpl);
exports.adminMiddleware = createMiddleware(exports.adminMiddlewareImpl);
