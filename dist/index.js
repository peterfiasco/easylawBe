"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = require("dotenv");
const body_parser_1 = __importDefault(require("body-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const helmet = require('helmet');
const morgan = require('morgan');
const db_1 = __importDefault(require("./config/db"));
const auth_route_1 = __importDefault(require("./routes/Auth/auth.route"));
const SettingRoutes_1 = __importDefault(require("./routes/Dashboard/SettingRoutes"));
const ConsultationRoutes_1 = __importDefault(require("./routes/Dashboard/ConsultationRoutes"));
const PaymentRoutes_1 = __importDefault(require("./routes/Payment/PaymentRoutes"));
const ChatController_1 = require("./controllers/Chat/ChatController");
const AdminRoutes_1 = __importDefault(require("./routes/Admin/AdminRoutes"));
const ChatGptRoute_1 = __importDefault(require("./routes/ChatGptRoute"));
const documents_route_1 = __importDefault(require("./routes/Documents/documents.route"));
const UserRoutes_1 = __importDefault(require("./routes/User/UserRoutes"));
const documentAnalysis_routes_1 = __importDefault(require("./routes/documentAnalysis.routes"));
// 🔥 Import Business Services Routes
const BusinessServicesRoutes_1 = __importDefault(require("./routes/BusinessServices/BusinessServicesRoutes"));
const DueDiligenceRoutes_1 = __importDefault(require("./routes/BusinessServices/DueDiligenceRoutes"));
const businessRegistrationRoutes_1 = __importDefault(require("./routes/BusinessServices/businessRegistrationRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/Public/publicRoutes"));
const registerRoute = require("./routes/Auth/RegisterRoute");
const cors = require("cors");
dotenv.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// ✅ Trust the proxy BEFORE middleware
app.set("trust proxy", 1);
console.log("Trust proxy is set:", app.get("trust proxy"));
// 🔒 Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.vpay.africa"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.vpay.africa", "https://dropin-sandbox.vpay.africa"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://js.vpay.africa"]
        },
    },
}));
// Connect to database (only once)
(0, db_1.default)();
// CORS configuration
const corsOptions = {
    origin: [
        process.env.CORS_ORIGIN || 'https://easylawsolution.com',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'Pragma',
        'Expires',
        'Last-Modified',
        'If-Modified-Since'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(body_parser_1.default.json({ limit: '10mb' }));
// Logging middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}
// Create different rate limiters for different routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login attempts, please try again after 15 minutes"
});
// More generous limiter for general API requests
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
});
// 🔥 Business services specific rate limiter
const businessServicesLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour for business services
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many business service requests, please try again later"
});
// 🔥 Due diligence specific rate limiter
const dueDiligenceLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 requests per hour for due diligence
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many due diligence requests, please try again later"
});
// File upload rate limiter
const fileUploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // 30 file uploads per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many file uploads, please try again later"
});
// Consultation booking rate limiter
const consultationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // 10 consultation bookings per day
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many consultation bookings today, please try again tomorrow"
});
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Input validation error",
            error: "Invalid input detected"
        });
        return;
    }
};
// Helper function to sanitize object recursively
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object') {
        const sanitized = {};
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
const sanitizeString = (str) => {
    if (typeof str !== 'string')
        return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
};
app.use(sanitizeInput);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EasyLaw API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: "connected",
            email: "active",
            file_upload: "active",
            payment: "active",
            business_services: "active",
            due_diligence: "active"
        }
    });
});
// 🔍 DEBUG: Check imports
console.log('🔍 Checking imports...');
console.log('✅ businessRegistrationRoutes imported:', typeof businessRegistrationRoutes_1.default);
console.log('✅ DueDiligenceRouter imported:', typeof DueDiligenceRoutes_1.default);
console.log('✅ BusinessServicesRouter imported:', typeof BusinessServicesRoutes_1.default);
// 🛣️ ROUTE SETUP
console.log('🚀 Setting up routes...');
// Apply rate limiters to specific routes BEFORE mounting routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/business-services", businessServicesLimiter);
app.use("/api/business-registration", businessServicesLimiter);
app.use("/api/due-diligence", dueDiligenceLimiter);
app.use("/api/consult/book-consultation", consultationLimiter);
app.use("/api/admin/templates", fileUploadLimiter);
app.use("/api", apiLimiter);
app.use("/api/public", publicRoutes_1.default);
console.log('✅ Public routes mounted at /api/public');
// 🔥 MOUNT ALL ROUTES (Order matters!)
// Authentication routes
app.use("/api/register", registerRoute);
app.use("/api/auth", auth_route_1.default);
console.log('✅ Auth routes mounted');
// Dashboard routes
app.use("/api/dashboard", SettingRoutes_1.default);
console.log('✅ Dashboard routes mounted');
// Consultation routes
app.use("/api/consult", ConsultationRoutes_1.default);
console.log('✅ Consultation routes mounted');
// Payment routes
app.use("/api/pay", PaymentRoutes_1.default);
console.log('✅ Payment routes mounted');
// Admin routes
app.use("/api/admin", AdminRoutes_1.default);
console.log('✅ Admin routes mounted');
// ChatGPT routes
app.use('/api/chatgpt', ChatGptRoute_1.default);
console.log('✅ ChatGPT routes mounted');
// Document routes
app.use("/api/documents", documents_route_1.default);
console.log('✅ Document routes mounted');
app.use('/api/document-analysis', documentAnalysis_routes_1.default);
// User routes
app.use('/api/users', UserRoutes_1.default);
console.log('✅ User routes mounted');
// 🔥 BUSINESS SERVICES ROUTES (Mount in correct order)
// 1. Business Registration (specific) - MOUNT FIRST
console.log('🔍 Mounting business registration routes...');
try {
    app.use("/api/business-registration", businessRegistrationRoutes_1.default);
    console.log('✅ Business registration routes mounted at /api/business-registration');
}
catch (error) {
    console.error('❌ Error mounting business registration routes:', error);
}
// 2. Due Diligence (specific)
console.log('🔍 Mounting due diligence routes...');
app.use("/api/due-diligence", DueDiligenceRoutes_1.default);
console.log('✅ Due diligence routes mounted at /api/due-diligence');
// 3. Business Services (general) - MOUNT LAST to avoid conflicts
console.log('🔍 Mounting business services routes...');
app.use("/api/business-services", BusinessServicesRoutes_1.default);
console.log('✅ Business services routes mounted at /api/business-services');
console.log('✅ All routes setup complete');
// Add test route to verify business registration is working
app.get('/api/business-registration-test', (req, res) => {
    res.json({
        message: 'Business registration routes are accessible!',
        timestamp: new Date().toISOString()
    });
});
// Socket.IO configuration
const io = new socket_io_1.Server(server, {
    cors: {
        origin: corsOptions.origin,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Socket middleware
const socketController = new ChatController_1.ChatController(io);
io.on('connection', (socket) => {
    socketController.initializeConnection(socket);
    socket.on('connect_error', (err) => {
        console.log(`Connection error: ${err.message}`);
    });
});
// Default route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to EasyLaw API!",
        version: "2.0.0",
        documentation: "/api/health",
        services: [
            "Legal Consultations",
            "Business Registration",
            "Due Diligence",
            "IP Protection",
            "Document Management",
            "CAC Search",
            "Trademark Services"
        ]
    });
});
// 404 handler (MUST be after all route definitions)
app.use('*', (req, res) => {
    console.log(`🚫 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requested_url: req.originalUrl,
        available_endpoints: [
            '/api/health',
            '/api/auth',
            '/api/consult',
            '/api/business-services',
            '/api/business-registration',
            '/api/due-diligence',
            '/api/pay',
            '/api/admin'
        ]
    });
});
// Global error handler (MUST be last)
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
        });
        return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 5 files allowed.'
        });
        return;
    }
    // Validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map((e) => e.message)
        });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
        return;
    }
    // MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
        return;
    }
    // Default error
    res.status(err.status || 500).json(Object.assign({ success: false, message: err.message || 'Internal Server Error' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
});
// ✅ Port configuration - SINGLE DECLARATION
const PORT = parseInt(process.env.PORT || '5000', 10);
// ✅ For Render deployment, always start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EasyLaw API Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🌍 External URL: https://easylaw-backend.onrender.com`);
});
// ✅ Export app as default for Vercel compatibility
exports.default = app;
