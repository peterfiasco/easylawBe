import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './authMiddleware';
import { errorResponse } from '../utils/response';

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
export const requireRole = (minRole: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(res, "Authentication required", {}, 401);
      }

      const userRole = req.user.role || 'user';
      const userRoleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[minRole as keyof typeof ROLE_HIERARCHY] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return errorResponse(
          res, 
          "Insufficient permissions", 
          { 
            required: minRole, 
            current: userRole,
            message: `This action requires ${minRole} role or higher`
          }, 
          403
        );
      }

      next();
    } catch (error: any) {
      return errorResponse(res, "Authorization error", { error: error.message }, 500);
    }
  };
};

// Middleware to check specific permissions
export const requirePermission = (permission: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(res, "Authentication required", {}, 401);
      }

      const userRole = req.user.role || 'user';
      const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];

      if (!userPermissions.includes(permission)) {
        return errorResponse(
          res, 
          "Permission denied", 
          { 
            required_permission: permission,
            user_role: userRole,
            message: `This action requires '${permission}' permission`
          }, 
          403
        );
      }

      next();
    } catch (error: any) {
      return errorResponse(res, "Authorization error", { error: error.message }, 500);
    }
  };
};

// Middleware to check resource ownership
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(res, "Authentication required", {}, 401);
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
        return errorResponse(
          res, 
          "Access denied", 
          { 
            message: "You can only access your own resources"
          }, 
          403
        );
      }

      next();
    } catch (error: any) {
      return errorResponse(res, "Authorization error", { error: error.message }, 500);
    }
  };
};

// Middleware for business services access control
export const requireBusinessServiceAccess = () => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return errorResponse(res, "Authentication required", {}, 401);
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
        const service = await BusinessService.findOne({ 
          reference_number: req.params.referenceNumber 
        });

        if (!service) {
          return errorResponse(res, "Service not found", {}, 404);
        }

        // Check if user owns this service
        const currentUserId = req.user._id || req.user.user_id;
        if (service.user_id.toString() !== currentUserId.toString()) {
          return errorResponse(
            res, 
            "Access denied", 
            { message: "You can only access your own services" }, 
            403
          );
        }
      }

      next();
    } catch (error: any) {
      return errorResponse(res, "Authorization error", { error: error.message }, 500);
    }
  };
};

// Audit logging middleware
export const auditLog = (action: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const originalSend = res.send;
      
      res.send = function(data): Response {
  // Log the action
  console.log(`[AUDIT] ${new Date().toISOString()} - User: ${req.user?.email || 'Anonymous'} (${req.user?.role || 'unknown'}) - Action: ${action} - IP: ${req.ip} - Status: ${res.statusCode}`);
  
  // Call original send
  return originalSend.call(this, data);
};


      next();
    } catch (error: any) {
      console.error('Audit logging error:', error);
      next(); // Continue even if audit fails
    }
  };
};

export default {
  requireRole,
  requirePermission,
  requireOwnership,
  requireBusinessServiceAccess,
  auditLog
};