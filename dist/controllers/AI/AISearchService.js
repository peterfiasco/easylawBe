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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatTitle = exports.GenerateLegalAdvise = void 0;
const openai_1 = require("openai");
require("dotenv").config();
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const GenerateLegalAdvise = (query, chatHistory) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Format chat history to match OpenAI's message structure
    const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
    // Include the latest user query
    formattedHistory.push({ role: "user", content: query });
    const response = yield openai.chat.completions.create({
        model: "o3-mini-2025-01-31",
        messages: [
            {
                role: "system",
                content: "You are a helpful AI legal assistant for Nigeria. Provide general legal guidance for Nigeria only.",
            },
            // { role: "user", content: query },
            ...formattedHistory,
        ],
    });
    const aiResponse = ((_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) ||
        "Sorry, I couldn't process your request.";
    return aiResponse;
});
exports.GenerateLegalAdvise = GenerateLegalAdvise;
const generateChatTitle = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const response = yield openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `Generate a short, concise title for the following conversation: "${query}". Keep it brief.`,
            },
        ],
        max_tokens: 10,
    });
    const aiResponse = ((_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) ||
        "Sorry, I couldn't process your request.";
    return aiResponse;
});
exports.generateChatTitle = generateChatTitle;
