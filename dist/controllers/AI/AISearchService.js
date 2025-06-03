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
    var _a, _b;
    try {
        console.log("[AI SERVICE] Processing query:", {
            query: query.substring(0, 50) + "...",
            historyLength: chatHistory.length
        });
        // Format chat history to match OpenAI's message structure
        const formattedHistory = chatHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
        // Include the latest user query
        formattedHistory.push({ role: "user", content: query });
        const response = yield openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI legal assistant for Nigeria. Provide general legal guidance for Nigeria only. Always recommend consulting with a qualified Nigerian lawyer for specific legal advice.",
                },
                ...formattedHistory,
            ],
            max_completion_tokens: 1200,
            temperature: 0.6
        });
        const aiResponse = ((_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "Sorry, I couldn't process your request.";
        console.log("[AI SERVICE] Response generated successfully:", {
            responseLength: aiResponse.length,
            tokensUsed: ((_b = response.usage) === null || _b === void 0 ? void 0 : _b.total_tokens) || 0
        });
        return aiResponse;
    }
    catch (error) {
        console.error("[AI SERVICE] Error:", error);
        throw error;
    }
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
        max_completion_tokens: 10,
    });
    const aiResponse = ((_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) ||
        "Sorry, I couldn't process your request.";
    return aiResponse;
});
exports.generateChatTitle = generateChatTitle;
