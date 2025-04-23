import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { errorResponse } from "../utils/response";
import mongoose from 'mongoose';

// Import jsonwebtoken using require to bypass TypeScript checks
const jwt = require('jsonwebtoken');
dotenv.config();

// Define our payload type for JWT
interface CustomJwtPayload {
  _id: string | mongoose.Types.ObjectId;
  user_id?: string | mongoose.Types.ObjectId;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
  [key: string]: any; // For any additional fields
}

// Use type assertion to fix incompatibility while preserving behavior
// This approach allows us to define CustomRequest without TypeScript's strict type checking
// complaining about the ObjectId type
export interface CustomRequest extends Omit<Request, 'user'> {
  user?: any; // Use any here to bypass type checking, but we'll control the actual type in implementation
}

// Create the missing authMiddleware function
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("=== AUTH MIDDLEWARE DEBUG ===");
  console.log("Request path:", req.path);
  console.log("Auth header received:", req.headers.authorization ?
    `${req.headers.authorization.substring(0, 20)}...` : 'none');
  console.log("User from session:", (req as any).session?.user ? 'exists' : 'none');
  
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
    } else {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as CustomJwtPayload;
    
    console.log("Token decoded successfully:", decoded.email);
    console.log("Decoded payload:", JSON.stringify({
      _id: decoded._id,
      user_id: decoded.user_id,
      role: decoded.role,
      email: decoded.email
    }, null, 2));
    
    // Set user to request object - use type assertion to avoid type checking
    (req as CustomRequest).user = decoded;
    
    next();
  } catch (error) {
    console.error("Auth middleware error details:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Create a wrapper function that makes middleware TypeScript-compatible
export function createMiddleware(
  middlewareFn: (req: CustomRequest, res: Response, next: NextFunction) => any
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use double type assertion to bypass TypeScript's structural checking
    const customReq = req as any as CustomRequest;
    middlewareFn(customReq, res, next);
  }
}

// Define your middleware functions
export const userMiddlewareImpl = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return errorResponse(res, "Access denied: No authorization header", {}, 401);
  }
  
  // Extract token with or without Bearer prefix
  let token;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = authHeader;
  }
  
  if (!token || token.trim() === '') {
    return errorResponse(res, "Access denied: No token provided", {}, 401);
  }
  
  try {
    const secretKey = process.env.JWT_SECRET ?? "GAPtLWo8YJGYMre1CTXMa7tdcny9ED84h2qA/e/v+nw=";
    
    // Verify and decode the token
    const verified = jwt.verify(token, secretKey) as CustomJwtPayload;
    
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
      return errorResponse(res, "Invalid token structure", {}, 401);
    }
    
    if (!verified.role || !verified.email) {
      console.error("Invalid token structure. Missing required fields:", verified);
      return errorResponse(res, "Invalid token structure", {}, 401);
    }
    
    // Check role
    if (verified.role !== "user") {
      return errorResponse(res, "Access denied. Customers only", {}, 403);
    }
    
    // Assign the verified user to req.user
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return errorResponse(res, "Invalid or expired token", { err }, 400);
  }
};

export const adminMiddlewareImpl = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export the wrapped middleware functions
export const UserMiddleware = createMiddleware(userMiddlewareImpl);
export const adminMiddleware = createMiddleware(adminMiddlewareImpl);
