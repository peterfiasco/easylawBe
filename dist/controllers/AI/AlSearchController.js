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
exports.AIGetChatHistory = exports.AIGetAllHistory = exports.AIRequestControl = void 0;
const response_1 = require("../../utils/response");
const joi_1 = __importDefault(require("joi"));
const AISearchService_1 = require("./AISearchService");
const Chat_1 = __importDefault(require("../../models/Chat"));
const AISchema = joi_1.default.object({
    query: joi_1.default.string().required(),
});
const AIRequestControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        const { user_id } = req.user;
        const { chat_id } = req.params;
        const { error } = AISchema.validate(req.body);
        if (error)
            return (0, response_1.errorResponse)(res, `Validation error: ${error.details[0].message}`, { error: error.details[0].message }, 400);
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "user details is required", {}, 400);
        }
        let chat;
        if (chat_id) {
            chat = yield Chat_1.default.findById(chat_id);
            if (!chat) {
                return (0, response_1.errorResponse)(res, "Chat not found", {}, 404);
            }
            chat.messages.push({
                role: "user",
                content: query,
                timestamp: new Date(),
            });
        }
        else {
            const title = yield (0, AISearchService_1.generateChatTitle)(query);
            chat = new Chat_1.default({
                user_id: user_id,
                title,
                messages: [
                    { role: "user", content: query, timestamp: new Date() },
                ],
            });
            yield chat.save();
        }
        const trimmedMessages = chat.messages.slice(-30);
        const response = yield (0, AISearchService_1.GenerateLegalAdvise)(query, trimmedMessages);
        // Add AI response using Mongoose Schema
        chat.messages.push({
            role: "assistant",
            content: response,
            timestamp: new Date(),
        });
        yield chat.save();
        return (0, response_1.successResponse)(res, "AI response generated", { chat_id: chat._id, title: chat.title, response }, 200);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.AIRequestControl = AIRequestControl;
const AIGetAllHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.user;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "user details is required", {}, 400);
        }
        const chat = yield Chat_1.default.find({ user_id });
        return (0, response_1.successResponse)(res, "Chat History", { chat }, 200);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.AIGetAllHistory = AIGetAllHistory;
const AIGetChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.user;
        const { chat_id } = req.params;
        if (!user_id) {
            return (0, response_1.errorResponse)(res, "user details is required", {}, 400);
        }
        const chat = yield Chat_1.default.find({ user_id, _id: chat_id });
        return (0, response_1.successResponse)(res, "Chat History", { chat }, 200);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.AIGetChatHistory = AIGetChatHistory;
