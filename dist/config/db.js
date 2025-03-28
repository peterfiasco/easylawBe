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
const mongoose_1 = __importDefault(require("mongoose"));
require('dotenv').config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Removed useNewUrlParser and useUnifiedTopology options
        yield mongoose_1.default.connect(process.env.MONGODB_CONNECTION_LINK || 'mongodb+srv://developer:efE7i6q68w7d6kE7@easylaw.7kmf3.mongodb.net/?retryWrites=true&w=majority&appName=easylaw', {
        // Other options if needed
        });
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
exports.default = connectDB;
