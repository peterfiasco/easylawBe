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
exports.ChatController = void 0;
const AISearchService_1 = require("../AI/AISearchService");
const Chat_1 = __importDefault(require("../../models/Chat"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class ChatController {
    constructor(io) {
        this.initializeConnection = (socket) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log("Initialize the socket");
            // Get user from token
            let userId = null;
            const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (token) {
                try {
                    // Type cast to our custom payload type
                    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
                    // Use either user_id or _id, whichever is available
                    userId = ((_b = (decoded.user_id || decoded._id)) === null || _b === void 0 ? void 0 : _b.toString()) || null;
                    if (userId) {
                        console.log(`Authenticated socket connection for user ${userId}`);
                    }
                    else {
                        console.warn("Token verified but no user ID found in payload");
                    }
                }
                catch (error) {
                    console.error("Token verification failed:", error);
                }
            }
            // Listen for the 'searchquery' event
            socket.on("searchquery", (_a) => __awaiter(this, [_a], void 0, function* ({ query, model, chatId, chatHistory = [] }) {
                try {
                    console.log("searchquery event triggered. query:", query, "model:", model);
                    const response = yield (0, AISearchService_1.GenerateLegalAdvise)(query, chatHistory);
                    // If we have a user ID and chat ID, save this interaction to the database
                    if (userId && chatId) {
                        try {
                            // Find the chat
                            const chat = yield Chat_1.default.findById(chatId);
                            // Only update if the chat belongs to this user
                            if (chat && chat.user_id.toString() === userId) {
                                // Create a properly typed message object that matches your schema
                                // Here we're assuming your IMessage schema has these fields
                                chat.messages.push({
                                    role: 'assistant',
                                    content: response,
                                    timestamp: new Date()
                                }); // Using 'as any' as a temporary workaround
                                yield chat.save();
                                console.log(`Saved AI response to chat ${chatId}`);
                            }
                        }
                        catch (error) {
                            console.error("Error saving chat message:", error);
                        }
                    }
                    // Emit 'queryResult' back to the client
                    socket.emit("queryResult", {
                        success: true,
                        response,
                        message: "Query Result",
                        chatId // Send back the chat ID for client reference
                    });
                }
                catch (error) {
                    console.error("Error in searchquery event:", error);
                    socket.emit("queryResult", {
                        success: false,
                        response: "",
                        message: "Error occurred while processing query",
                        chatId
                    });
                }
            }));
            // Handle socket disconnection
            socket.on("disconnect", () => {
                console.log(`User disconnected`);
            });
        });
        this.io = io;
    }
}
exports.ChatController = ChatController;
