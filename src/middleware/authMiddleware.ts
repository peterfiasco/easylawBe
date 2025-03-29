import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { errorResponse } from "../utils/response";

// Import jsonwebtoken using require to bypass TypeScript checks
const jwt = require('jsonwebtoken');


dotenv.config();

// Define a custom JWT payload type with required properties
interface CustomJwtPayload {
  _id: string;
  user_id?: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Express's `Request` type to include `user`
export interface CustomRequest extends Request {
  user?: CustomJwtPayload;
}

// Create the missing authMiddleware function
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
    
    // Set user to request object using type assertion
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
    // Call the middleware and handle its return value
    const result = middlewareFn(req as CustomRequest, res, next);
    // Don't return anything from the wrapper function
  };
}

// Define your middleware functions - export them directly instead of redeclaring
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
    // Explicitly cast `jwt.verify()` result to `CustomJwtPayload`
    const verified = jwt.verify(token, secretKey) as CustomJwtPayload;

    // Ensure the payload has the expected fields
    // Update the check for user fields
if ((!verified._id && !verified.user_id) || !verified.role || !verified.email) {
  return errorResponse(res, "Invalid token structure", {}, 401);
}

    if (verified.role !== "user") {
      return errorResponse(res, "Access denied. Customers only", {}, 403);
    }

    req.user = verified;
    next();
  } catch (err) {
    console.error(err)
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
    
    if (!user || user.role !== 'admin') {
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
