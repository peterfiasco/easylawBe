"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChatGptController_1 = require("../controllers/ChatGptController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// ✅ FIX: Add multer middleware to handle FormData
router.post('/generate', authMiddleware_1.UserMiddleware, ChatGptController_1.ChatGptController.uploadMiddleware, // Add this line
ChatGptController_1.ChatGptController.generateDocument);
router.post('/improve-document', authMiddleware_1.UserMiddleware, ChatGptController_1.ChatGptController.uploadMiddleware, // Add this line  
ChatGptController_1.ChatGptController.improveDocument);
router.post('/check-legal-query', authMiddleware_1.UserMiddleware, ChatGptController_1.ChatGptController.checkLegalQuery);
router.post('/chat', authMiddleware_1.UserMiddleware, ChatGptController_1.ChatGptController.handleChatQuery);
// ✅ ADD: Template verification route
router.get('/verify-template/:templateId', authMiddleware_1.UserMiddleware, ChatGptController_1.ChatGptController.verifyTemplateContent);
exports.default = router;
