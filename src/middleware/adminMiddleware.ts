import { Response, NextFunction } from 'express';
import { CustomRequest } from './authMiddleware';
import { errorResponse } from '../utils/response';

export const AdminMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
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
      return errorResponse(res, "Authentication required", {}, 401);
    }

    const userRole = req.user.role;
    console.log("User role:", userRole);
    
    if (!['admin', 'super_admin'].includes(userRole)) {
      console.log("❌ User role not admin:", userRole);
      return errorResponse(res, "Admin access required. Current role: " + userRole, {}, 403);
    }

    console.log("✅ Admin access granted");
    next();
  } catch (error: any) {
    console.error("Admin middleware error:", error);
    return errorResponse(res, "Authorization error", { error: error.message }, 500);
  }
};