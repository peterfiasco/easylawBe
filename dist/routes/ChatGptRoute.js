"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChatGptController_1 = require("../controllers/ChatGptController");
const router = (0, express_1.Router)();
// POST /api/chatgpt/generate
// Passing the static arrow function directly is fine now
router.post('/generate', ChatGptController_1.ChatGptController.generateDocument);
// Add this new route
router.post('/check-legal-query', ChatGptController_1.ChatGptController.checkLegalQuery);
exports.default = router;
