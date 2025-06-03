import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

// Enhanced rate limiting for different endpoints
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      error: 'Rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      return errorResponse(res, message, { retryAfter: Math.round(windowMs / 1000) }, 429);
    }
  });
};

// Different rate limits for different actions
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts. Please try again in 15 minutes.'
);

export const businessServiceRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 submissions per hour
  'Too many business service submissions. Please try again later.'
);

export const fileUploadRateLimit = createRateLimit(
  10 * 60 * 1000, // 10 minutes
  20, // 20 uploads per 10 minutes
  'Too many file uploads. Please try again in 10 minutes.'
);

export const consultationRateLimit = createRateLimit(
  24 * 60 * 60 * 1000, // 24 hours
  5, // 5 consultations per day
  'Too many consultation bookings today. Please try again tomorrow.'
);

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    return errorResponse(res, "Input validation error", { error: "Invalid input detected" }, 400);
  }
};

// Helper function to sanitize object recursively
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
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
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

// Security headers middleware
export const securityHeaders = helmet({
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
export const adminIPWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip IP checking in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // If no whitelist is configured, allow all
    if (allowedIPs.length === 0) {
      return next();
    }
    
    if (!allowedIPs.includes(clientIP as string)) {
      console.warn(`Unauthorized admin access attempt from IP: ${clientIP}`);
      return errorResponse(
        res, 
        "Access denied from this location", 
        { ip: clientIP }, 
        403
      );
    }
    
    next();
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: (req as any).user?.email || 'anonymous'
    };
    
    // Log to console (in production, you might want to use a proper logging service)
    console.log(`[REQUEST] ${JSON.stringify(log)}`);
  });
  
  next();
};

export default {
  createRateLimit,
  authRateLimit,
  businessServiceRateLimit,
  fileUploadRateLimit,
  consultationRateLimit,
  sanitizeInput,
  securityHeaders,
  adminIPWhitelist,
  requestLogger
};