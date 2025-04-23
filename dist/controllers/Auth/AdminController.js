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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProfile = exports.AdminLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../../utils/response");
const User_1 = __importDefault(require("../../models/User"));
const AdminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return (0, response_1.errorResponse)(res, "Email and password are required", {}, 400);
        }
        // Find the user
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return (0, response_1.errorResponse)(res, "Invalid credentials", {}, 401);
        }
        // Check if user is an admin
        if (user.role !== 'admin') {
            return (0, response_1.errorResponse)(res, "Access denied. Admin privileges required.", {}, 403);
        }
        // Verify password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return (0, response_1.errorResponse)(res, "Invalid credentials", {}, 401);
        }
        // Create token with admin role explicitly set
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            email: user.email,
            role: 'admin' // Explicitly set role to admin
        }, process.env.JWT_SECRET, { expiresIn: "3h" });
        return (0, response_1.successResponse)(res, 'Admin login successful', { token, user }, 200);
    }
    catch (error) {
        console.error("Admin Login Error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.AdminLogin = AdminLogin;
const AdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user from middleware - will only reach here if admin middleware passed
        const user = req.user;
        // Fetch full user data from DB if needed
        const adminUser = yield User_1.default.findById(user._id || user.user_id).select('-password');
        if (!adminUser) {
            return (0, response_1.errorResponse)(res, "Admin not found", {}, 404);
        }
        return (0, response_1.successResponse)(res, "Admin profile retrieved", { user: adminUser }, 200);
    }
    catch (error) {
        console.error("Admin Profile Error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.AdminProfile = AdminProfile;
