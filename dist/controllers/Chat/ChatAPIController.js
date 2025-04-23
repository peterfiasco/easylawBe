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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAPIController = void 0;
const Chat_1 = __importDefault(require("../../models/Chat"));
const mongoose_1 = __importDefault(require("mongoose"));
class ChatAPIController {
}
exports.ChatAPIController = ChatAPIController;
_a = ChatAPIController;
// Get all chats for the current user
ChatAPIController.getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Verify valid user ID
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }
        // Get chats for this user only
        const chats = yield Chat_1.default.find({ user_id: userId })
            .sort({ createdAt: -1 }) // Most recent first
            .select('title messages createdAt'); // Only select needed fields
        return res.status(200).json({
            success: true,
            data: chats,
        });
    }
    catch (error) {
        console.error('Error fetching user chats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching chats',
        });
    }
});
// Create a new chat
ChatAPIController.createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { title, messages } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Chat title is required',
            });
        }
        const newChat = new Chat_1.default({
            user_id: userId,
            title,
            messages: messages || [],
            createdAt: new Date(),
        });
        yield newChat.save();
        return res.status(201).json({
            success: true,
            data: newChat,
        });
    }
    catch (error) {
        console.error('Error creating chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating chat',
        });
    }
});
// Update an existing chat
ChatAPIController.updateChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const chatId = req.params.id;
        const { title, messages } = req.body;
        // Find chat and verify ownership
        const chat = yield Chat_1.default.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }
        // Security check - ensure user only updates their own chats
        if (chat.user_id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - you can only update your own chats',
            });
        }
        // Update the chat
        if (title)
            chat.title = title;
        if (messages)
            chat.messages = messages;
        yield chat.save();
        return res.status(200).json({
            success: true,
            data: chat,
        });
    }
    catch (error) {
        console.error('Error updating chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating chat',
        });
    }
});
// Delete a chat
ChatAPIController.deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const chatId = req.params.id;
        // Find chat and verify ownership
        const chat = yield Chat_1.default.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }
        // Security check - ensure user only deletes their own chats
        if (chat.user_id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - you can only delete your own chats',
            });
        }
        yield Chat_1.default.findByIdAndDelete(chatId);
        return res.status(200).json({
            success: true,
            message: 'Chat deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting chat',
        });
    }
});
