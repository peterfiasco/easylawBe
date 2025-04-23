import { Router } from 'express';
import { ChatGptController } from '../controllers/ChatGptController';

const router = Router();

// POST /api/chatgpt/generate
// Passing the static arrow function directly is fine now
router.post('/generate', ChatGptController.generateDocument);
// Add this new route
router.post('/check-legal-query', ChatGptController.checkLegalQuery);


export default router;