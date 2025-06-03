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
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = exports.requireBusinessServiceAccess = exports.requireOwnership = exports.requirePermission = exports.requireRole = void 0;
const response_1 = require("../utils/response");
// Define role hierarchy
const ROLE_HIERARCHY = {
    super_admin: 4,
    admin: 3,
    staff: 2,
    user: 1,
    guest: 0
};
// Define permissions for each role
const ROLE_PERMISSIONS = {
    super_admin: [
        'users:read', 'users:write', 'users:delete',
        'admin:read', 'admin:write', 'admin:delete',
        'business_services:read', 'business_services:write', 'business_services:delete',
        'consultations:read', 'consultations:write', 'consultations:delete',
        'payments:read', 'payments:write', 'payments:refund',
        'templates:read', 'templates:write', 'templates:delete',
        'analytics:read', 'system:manage'
    ],
    admin: [
        'users:read', 'users:write',
        'business_services:read', 'business_services:write',
        'consultations:read', 'consultations:write',
        'payments:read', 'payments:write',
        'templates:read', 'templates:write',
        'analytics:read'
    ],
    staff: [
        'business_services:read', 'business_services:write',
        'consultations:read', 'consultations:write',
        'templates:read'
    ],
    user: [
        'profile:read', 'profile:write',
        'business_services:create', 'business_services:read_own',
        'consultations:create', 'consultations:read_own',
        'payments:create', 'payments:read_own'
    ]
};
// Middleware to check if user has required role
const requireRole = (minRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Authentication required", {}, 401);
            }
            const userRole = req.user.role || 'user';
            const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
            const requiredRoleLevel = ROLE_HIERARCHY[minRole] || 0;
            if (userRoleLevel < requiredRoleLevel) {
                return (0, response_1.errorResponse)(res, "Insufficient permissions", {
                    required: minRole,
                    current: userRole,
                    message: `This action requires ${minRole} role or higher`
                }, 403);
            }
            next();
        }
        catch (error) {
            return (0, response_1.errorResponse)(res, "Authorization error", { error: error.message }, 500);
        }
    };
};
exports.requireRole = requireRole;
// Middleware to check specific permissions
const requirePermission = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Authentication required", {}, 401);
            }
            const userRole = req.user.role || 'user';
            const userPermissions = ROLE_PERMISSIONS[userRole] || [];
            if (!userPermissions.includes(permission)) {
                return (0, response_1.errorResponse)(res, "Permission denied", {
                    required_permission: permission,
                    user_role: userRole,
                    message: `This action requires '${permission}' permission`
                }, 403);
            }
            next();
        }
        catch (error) {
            return (0, response_1.errorResponse)(res, "Authorization error", { error: error.message }, 500);
        }
    };
};
exports.requirePermission = requirePermission;
// Middleware to check resource ownership
const requireOwnership = (resourceIdParam = 'id') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Authentication required", {}, 401);
            }
            const userRole = req.user.role || 'user';
            // Admins and super_admins can access any resource
            if (['admin', 'super_admin'].includes(userRole)) {
                next();
                return;
            }
            // For regular users, check ownership
            const resourceUserId = req.params[resourceIdParam] || req.body.user_id || req.query.user_id;
            const currentUserId = req.user._id || req.user.user_id;
            if (resourceUserId && resourceUserId !== currentUserId.toString()) {
                return (0, response_1.errorResponse)(res, "Access denied", {
                    message: "You can only access your own resources"
                }, 403);
            }
            next();
        }
        catch (error) {
            return (0, response_1.errorResponse)(res, "Authorization error", { error: error.message }, 500);
        }
    };
};
exports.requireOwnership = requireOwnership;
// Middleware for business services access control
const requireBusinessServiceAccess = () => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Authentication required", {}, 401);
            }
            const userRole = req.user.role || 'user';
            // Admins can access all business services
            if (['admin', 'super_admin'].includes(userRole)) {
                next();
                return;
            }
            // For regular users accessing specific service
            if (req.params.referenceNumber) {
                const BusinessService = require('../models/BusinessService').default;
                const service = yield BusinessService.findOne({
                    reference_number: req.params.referenceNumber
                });
                if (!service) {
                    return (0, response_1.errorResponse)(res, "Service not found", {}, 404);
                }
                // Check if user owns this service
                const currentUserId = req.user._id || req.user.user_id;
                if (service.user_id.toString() !== currentUserId.toString()) {
                    return (0, response_1.errorResponse)(res, "Access denied", { message: "You can only access your own services" }, 403);
                }
            }
            next();
        }
        catch (error) {
            return (0, response_1.errorResponse)(res, "Authorization error", { error: error.message }, 500);
        }
    });
};
exports.requireBusinessServiceAccess = requireBusinessServiceAccess;
// Audit logging middleware
const auditLog = (action) => {
    return (req, res, next) => {
        try {
            const originalSend = res.send;
            res.send = function (data) {
                var _a, _b;
                // Log the action
                console.log(`[AUDIT] ${new Date().toISOString()} - User: ${((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || 'Anonymous'} (${((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'unknown'}) - Action: ${action} - IP: ${req.ip} - Status: ${res.statusCode}`);
                // Call original send
                return originalSend.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error('Audit logging error:', error);
            next(); // Continue even if audit fails
        }
    };
};
exports.auditLog = auditLog;
exports.default = {
    requireRole: exports.requireRole,
    requirePermission: exports.requirePermission,
    requireOwnership: exports.requireOwnership,
    requireBusinessServiceAccess: exports.requireBusinessServiceAccess,
    auditLog: exports.auditLog
};
