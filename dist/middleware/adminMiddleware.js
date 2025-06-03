"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMiddleware = void 0;
const response_1 = require("../utils/response");
const AdminMiddleware = (req, res, next) => {
    console.log("=== ADMIN MIDDLEWARE DEBUG ===");
    console.log("Request URL:", req.url);
    console.log("User from auth middleware:", req.user ? {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role
    } : 'null');
    try {
        if (!req.user) {
            console.log("❌ No user found in request");
            return (0, response_1.errorResponse)(res, "Authentication required", {}, 401);
        }
        const userRole = req.user.role;
        console.log("User role:", userRole);
        if (!['admin', 'super_admin'].includes(userRole)) {
            console.log("❌ User role not admin:", userRole);
            return (0, response_1.errorResponse)(res, "Admin access required. Current role: " + userRole, {}, 403);
        }
        console.log("✅ Admin access granted");
        next();
    }
    catch (error) {
        console.error("Admin middleware error:", error);
        return (0, response_1.errorResponse)(res, "Authorization error", { error: error.message }, 500);
    }
};
exports.AdminMiddleware = AdminMiddleware;
