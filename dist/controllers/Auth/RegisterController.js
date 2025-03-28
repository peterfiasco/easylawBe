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
exports.Login = exports.Register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../../utils/response");
const AuthValidator_1 = require("./AuthValidator");
const User_1 = __importDefault(require("../../models/User"));
const Register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, email, company_name, phone_number, website, business_type, address, password, confirm_password, } = req.body;
        const { error } = AuthValidator_1.RegisterSchema.validate(req.body);
        if (error)
            return (0, response_1.errorResponse)(res, `Validation error: ${error.details[0].message}`, { error: error.details[0].message }, 400);
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return (0, response_1.errorResponse)(res, "Account already exists. Please log in.", {}, 400);
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create new user
        // In the Register function, modify the newUser creation:
        // Create new user with conditional fields
        const newUser = new User_1.default(Object.assign(Object.assign(Object.assign(Object.assign({ first_name,
            last_name,
            email,
            phone_number, password: hashedPassword }, (company_name && { company_name })), (website && { website })), (business_type && { business_type })), (address && { address })));
        yield newUser.save();
        return (0, response_1.successResponse)(res, "User registered successfully", { user: newUser }, 201);
    }
    catch (error) {
        console.error("Register Error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.Register = Register;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { error } = AuthValidator_1.LoginSchema.validate(req.body);
        if (error)
            return (0, response_1.errorResponse)(res, `Validation error: ${error.details[0].message}`, { error: error.details[0].message }, 400);
        // Check if user exists in the database
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return (0, response_1.errorResponse)(res, "Invalid account, Please create an account", {}, 401);
        }
        // Compare the entered password with the stored hashed password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return (0, response_1.errorResponse)(res, "Invalid password, Please try again", {}, 401);
        }
        const token = jsonwebtoken_1.default.sign({ user_id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3h" } // Token valid for 7 days
        );
        return (0, response_1.successResponse)(res, 'Login successful', { token, user }, 200);
    }
    catch (error) {
        // console.error("Register Error:", error);
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.Login = Login;
