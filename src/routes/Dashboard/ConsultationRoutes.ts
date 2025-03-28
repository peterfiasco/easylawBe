import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { BookConsultation } from '../../controllers/Dashboard/ConsultationController';
import { BusinessVerify } from '../../controllers/Dashboard/BusinessVerifyController';
import { AIGetAllHistory, AIGetChatHistory, AIRequestControl } from '../../controllers/AI/AlSearchController';

const Consultationrouter = express.Router();

Consultationrouter.post('/book-consultation',UserMiddleware, BookConsultation ); 
Consultationrouter.post('/check-cac',UserMiddleware, BusinessVerify );
Consultationrouter.post('/ai-chat/:chat_id?',UserMiddleware, AIRequestControl );
Consultationrouter.get('/get-aichat-history',UserMiddleware, AIGetAllHistory );
Consultationrouter.get('/get-aichat-messagehistory/:chat_id',UserMiddleware, AIGetChatHistory );

export default Consultationrouter
