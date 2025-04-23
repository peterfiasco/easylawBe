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
const express_1 = require("express");
const RegisterController_1 = require("../../controllers/Auth/RegisterController");
const User_1 = __importDefault(require("../../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authRouter = (0, express_1.Router)();
// Regular user login
authRouter.post('/login', RegisterController_1.Login);
// Admin login endpoint
authRouter.post('/admin-login', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Find user by email
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
        return; // Use return without the response object
    }
    // Verify password
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
        return;
    }
    // Check if user is an admin
    if (user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
        return;
    }
    // Generate token
    const token = jsonwebtoken_1.default.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET || "GAPtLWo8YJGYMre1CTXMa7tdcny9ED84h2qA/e/v+nw=", { expiresIn: '24h' });
    res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
            token,
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                verified: user.verified
            }
        }
    });
})));
exports.default = authRouter;
