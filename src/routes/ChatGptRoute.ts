import { Router } from 'express';
import { ChatGptController } from '../controllers/ChatGptController';
import { UserMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ✅ FIX: Add multer middleware to handle FormData
router.post('/generate', 
  UserMiddleware, 
  ChatGptController.uploadMiddleware,  // Add this line
  ChatGptController.generateDocument
);

router.post('/improve-document', 
  UserMiddleware, 
  ChatGptController.uploadMiddleware,  // Add this line  
  ChatGptController.improveDocument
);

router.post('/check-legal-query', UserMiddleware, ChatGptController.checkLegalQuery);
router.post('/chat', UserMiddleware, ChatGptController.handleChatQuery);

// ✅ ADD: Template verification route
router.get('/verify-template/:templateId', UserMiddleware, ChatGptController.verifyTemplateContent);

export default router;
