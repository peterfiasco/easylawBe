import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { BookConsultation, GetConsultationTypes } from '../../controllers/Dashboard/ConsultationController';
import { BusinessVerify } from '../../controllers/Dashboard/BusinessVerifyController';
import { AIGetAllHistory, AIGetChatHistory, AIRequestControl } from '../../controllers/AI/AlSearchController';
import { PublicAvailabilityController } from '../../controllers/Consultation/AvailabilityController';
const Consultationrouter = express.Router();

// Public endpoint for consultation types - no middleware
Consultationrouter.get('/types', GetConsultationTypes);

Consultationrouter.post('/book-consultation', UserMiddleware, BookConsultation);
Consultationrouter.post('/check-cac', UserMiddleware, BusinessVerify);
Consultationrouter.post('/ai-chat/:chat_id?', UserMiddleware, AIRequestControl);
Consultationrouter.get('/get-aichat-history', UserMiddleware, AIGetAllHistory);
Consultationrouter.get('/get-aichat-messagehistory/:chat_id', UserMiddleware, AIGetChatHistory);

Consultationrouter.get('/available-time-slots', PublicAvailabilityController.getAvailableTimeSlots);
Consultationrouter.get('/check-date-availability/:date', PublicAvailabilityController.checkDateAvailability);
Consultationrouter.get('/unavailable-time-slots/:date', PublicAvailabilityController.getUnavailableTimeSlots);

export default Consultationrouter;
